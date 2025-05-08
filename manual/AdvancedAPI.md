# Advanced API {#AdvancedAPI}

This section provides information about BNM's advanced API, that requires some knowledge and understating to use.

## Compile time classes {#advanced_CompileTimeClasses}

This is the first step of creating your own classes and modifying existed ones.

It's used to save path to a class at compile time. And BNM will unwind that path at runtime. Because we can't get any class from il2cpp when it's not initialized.

Assume we have such classes structure in app's `Assembly-CSharp.dll`:
```csharp
namespace ExampleNamespace {
    class ExampleClass {
        class ExampleInnerClass {
            class ExampleInnerGenericClass<T1, T2, T3> {

            }
        }
    }
}
```
And we want to get `ExampleInnerGenericClass<int, float, ExampleClass>[]`.

The usage of @ref BNM::CompileTimeClassBuilder will look like this:
```cpp
auto targetClass = 
// ExampleNamespace.ExampleClass
CompileTimeClassBuilder(BNM_OBFUSCATE_TMP("ExampleNamespace"), BNM_OBFUSCATE_TMP("ExampleClass"), BNM_OBFUSCATE_TMP("Assembly-CSharp.dll"))
            // ExampleNamespace.ExampleClass.ExampleInnerClass
            .Class(BNM_OBFUSCATE_TMP("ExampleInnerClass")) 
            // ExampleNamespace.ExampleClass.ExampleInnerClass.ExampleInnerGenericClass<T1, T2, T3>
            .Class(BNM_OBFUSCATE_TMP("ExampleInnerGenericClass`3"))
            // ExampleNamespace.ExampleClass.ExampleInnerClass.ExampleInnerGenericClass<int, float, ExampleNamespace.ExampleClass>
            .Generic({
                BNM::Defaults::Get<int>(),
                BNM::Defaults::Get<float>(),
                CompileTimeClassBuilder(BNM_OBFUSCATE_TMP("ExampleNamespace"), BNM_OBFUSCATE_TMP("ExampleClass")).Build()
            })
            // ExampleNamespace.ExampleClass.ExampleInnerClass.ExampleInnerGenericClass<int, float, ExampleNamespace.ExampleClass>[]
            .Modifier(CompileTimeClass::ModifierType::Array)
            .Build();
```

## Classes management {#advanced_ClassesManagement}

> [!note]
> Requires <em>BNM_CLASSES_MANAGEMENT</em> setting enabled

BNM's powerful high-level system that allows you to:
1. Create your own classes with possibility to override virtual (and non-virtual in some cases) methods.
2. Add methods and fields to the existing classes.
3. Hook methods of the existing classes.

To use it, BNM provides some macros that you can check in [Custom classes macros](@ref CUSTOM_CLASSES_MACRO).

There are some examples of all classes management capabilities.

### Examples

\subsubsection MonoBehaviour_Ex 1. Simple MonoBehaviour class

```cpp
    struct BNM_ExampleObject : public BNM::UnityEngine::MonoBehaviour {
        BNM_CustomClass(BNM_ExampleObject, 
                        BNM::CompileTimeClassBuilder(
                            BNM_OBFUSCATE_TMP("BNM_Example"), 
                            BNM_OBFUSCATE_TMP("BNM_ExampleObject")
                            /*You can skip dll name here, 
                            BNM will add class to Assembly-CSharp.dll*/).Build(),
            BNM::Defaults::Get<BNM::UnityEngine::MonoBehaviour *>(), {});

        // We create constructor to set initial values of fields, for example `veryImportantValue`
        // Otherwise it will have garbage from memory
        void Constructor() {
            BNM::UnityEngine::MonoBehaviour tmp = *this;
            *this = BNM_ExampleObject();
            *((BNM::UnityEngine::MonoBehaviour *)this) = tmp;
        }

        int Value{};
        uintptr_t veryImportantValue{0x424E4D};
        void Start() {
            BNM_LOG_INFO("BNM_ExampleObject::Start! Is veryImportantValue valid: %d", veryImportantValue == 0x424E4D);
        }

        BNM_CustomMethod(Start, false, BNM::Defaults::Get<void>(), "Start");

        BNM_CustomField(Value, BNM::Defaults::Get<int>(), "Value");

        BNM_CustomMethod(Constructor, false, BNM::Defaults::Get<void>(), ".ctor");
    };

    // ...

    // Then you can create new GameObject or use existing
    // And add this class to it like that:
    // AddComponent(gameObject, BNM_ExampleObject::BNMCustomClass.type);
```

\subsubsection addMethods_Ex 2. Add methods to class

The example in game class:
```csharp
    // Let's assume that it is in Assembly-CSharp.dll
    public class SomeObject : MonoBehaviour {
        void Start() { /*CODE*/ }
    }
```
BNM side:
```cpp
    struct SomeObject : public BNM::UnityEngine::MonoBehaviour {
        BNM_CustomClass(BNM_ExampleObject,
                        BNM::CompileTimeClassBuilder({}, 
                            BNM_OBFUSCATE_TMP("SomeObject"), 
                            BNM_OBFUSCATE_TMP("Assembly-CSharp.dll")).Build(),
                        BNM::Defaults::Get<BNM::UnityEngine::MonoBehaviour *>(), {});

        void Update() { /*CODE*/ }

        BNM_CustomMethod(Update, false, BNM::Defaults::Get<void>(), "Update");
    }
```
\subsubsection hookMethods_Ex 3. Hook classes' methods

The example in game class:
```csharp
    // Let's assume that it is in Assembly-CSharp.dll
    public class SomeObject : MonoBehaviour {
        void Start() { /*CODE*/ }
        int CalcSth() { /*CODE*/ }
        virtual float VirtCalcSth(float a, float b) { /*CODE*/ }
        static void StaticSth() { /*CODE*/ }
    }
```
BNM side:
```cpp
    struct SomeObject : public BNM::UnityEngine::MonoBehaviour {
        BNM_CustomClass(BNM_ExampleObject,
                        BNM::CompileTimeClassBuilder({}, 
                            BNM_OBFUSCATE_TMP("SomeObject"), 
                            BNM_OBFUSCATE_TMP("Assembly-CSharp.dll")).Build(),
                        BNM::Defaults::Get<BNM::UnityEngine::MonoBehaviour *>(), {});

        void Start() { BNM_CallCustomMethodOrigin(Start, this); }
        int CalcSth() { return BNM_CallCustomMethodOrigin(CalcSth, this); }
        float VirtCalcSth(float a, float b) { return BNM_CallCustomMethodOrigin(CalcSth, this, a, b); }
        static void StaticSth() { BNM_CallCustomMethodOrigin(StaticSth); }

        BNM_CustomMethod(Start, false, BNM::Defaults::Get<void>(), "Start");
        BNM_CustomMethodMarkAsInvokeHook(Start);
        BNM_CustomMethodSkipTypeMatch(Start);

        BNM_CustomMethod(CalcSth, false, BNM::Defaults::Get<int>(), "CalcSth");
        BNM_CustomMethodMarkAsBasicHook(CalcSth);
        BNM_CustomMethodSkipTypeMatch(CalcSth);

        // Virtual hook is default, if it's not disabled by `BNM_AUTO_HOOK_DISABLE_VIRTUAL_HOOK`
        BNM_CustomMethod(VirtCalcSth, false, BNM::Defaults::Get<float>(), "VirtCalcSth",
            BNM::Defaults::Get<float>(), BNM::Defaults::Get<float>());
            
        // To override virtual methods or replace methods, the types must be exactly the same as method have.
        // You can use BNM_CustomMethodSkipTypeMatch to skip match, but if methods differ only in types, BNM will find the first method with the same parameter count.
        // We skip it in the example because it's faster and in the example class we don't have any other methods rather than our VirtCalcSth.
        BNM_CustomMethodSkipTypeMatch(VirtCalcSth);
        
        BNM_CustomMethod(StaticSth, true, BNM::Defaults::Get<void>(), "StaticSth");
        BNM_CustomMethodMarkAsBasicHook(StaticSth);
        BNM_CustomMethodSkipTypeMatch(StaticSth);
    }
```
\subsubsection override_Ex 4. Override methods
    
The example in game class:
```csharp
    // Let's assume that it is in Assembly-CSharp.dll
    public class SomeObject : MonoBehaviour {
        void Start() { /*CODE*/ }
        virtual float VirtCalcSth(float a, float b) { /*CODE*/ }
    }
```
BNM side:
```cpp
    struct SomeObjectChild : public BNM::UnityEngine::MonoBehaviour {
        BNM_CustomClass(BNM_ExampleObject,
                        BNM::CompileTimeClassBuilder({},
                            BNM_OBFUSCATE_TMP("SomeObjectChild")).Build(),
                        BNM::CompileTimeClassBuilder({}, 
                            BNM_OBFUSCATE_TMP("SomeObject"), 
                            BNM_OBFUSCATE_TMP("Assembly-CSharp.dll")).Build(), {});

        void Start() {
            // This macro will call SomeObject.Start()
            BNM_CallCustomMethodOrigin(Start, this);
        }
        float VirtCalcSth(float a, float b) {
            // This macro  will call SomeObject.VirtCalcSth()
            return BNM_CallCustomMethodOrigin(CalcSth, this, a, b);
        }

        // BNM can redefine any methods even if they are non-virtual.
        // This is useful for unity messages, because unity calls them just by name, without any virtual tables and other OOP stuff
        BNM_CustomMethod(Start, false, BNM::Defaults::Get<void>(), "Start");
        BNM_CustomMethodMarkAsInvokeHook(Start);
        BNM_CustomMethodSkipTypeMatch(Start);

        BNM_CustomMethod(VirtCalcSth, false, BNM::Defaults::Get<float>(), "VirtCalcSth",
            BNM::Defaults::Get<float>(), BNM::Defaults::Get<float>());
        BNM_CustomMethodSkipTypeMatch(VirtCalcSth);
    }
```

As shown in the example, the whole interaction with the app can be done using classes management, instead of basic hooks. This make code cleaner and more readable, because in @ref BNM_CustomClass you can easily see which class you’re currently working with. <br>
Of course this adds some overhead at app's startup, but this is very low-cost.


## Coroutines  {#advanced_Coroutines}

> [!note]
> Requires <em>BNM_CLASSES_MANAGEMENT</em> and <em>BNM_COROUTINE</em> settings enabled

This is the imitation of Unity's coroutines powered by classes management. It uses C++20 coroutine API and translates it to il2cpp's.

You can see a bit more in @ref BNM::Coroutine.

#### Simple coroutine example
```cpp
BNM::Coroutine::IEnumerator Example() {
    BNM_LOG_DEBUG("Coroutine step 1");

    // The code is very similar to the IEnumerator code in C#, but instead of yield return you need to use co_yield
    co_yield BNM::Coroutine::WaitForEndOfFrame();
    BNM_LOG_DEBUG("Coroutine step 2 (WaitForEndOfFrame)");

    co_yield BNM::Coroutine::WaitForFixedUpdate();
    BNM_LOG_DEBUG("Coroutine step 3 (WaitForFixedUpdate)");

    co_yield BNM::Coroutine::WaitForSeconds(2.f);
    BNM_LOG_DEBUG("Coroutine step 4 (WaitForSeconds)");

    co_yield BNM::Coroutine::WaitForSecondsRealtime(1.f);
    BNM_LOG_DEBUG("Coroutine step 5 (WaitForSecondsRealtime)");

    // An analog of WaitWhile, but instead of il2cpp methods it accepts C++ methods
    co_yield BNM::Coroutine::WaitWhile([]() -> bool {
        return false;
    });
    BNM_LOG_DEBUG("Coroutine ended");

    // Unlike C#, it is necessary to call co_return at the end of the code if at least one co_yield was used.
    co_return;
}

// Then you can start it using any MonoBehaviour like this:

// MonoBehaviour.StartCoroutine(IEnumerator routine)
BNM::Method<void *> StartCoroutine;

void Code() {

auto someBehaviourInstance = ...;

// And start it like this:
auto enumerator = Example().Get();
// or
auto enumerator = Example()();

auto r = StartCoroutine[someBehaviourInstance](enumerator);
}
```

Also using classes management you can create custom yield instructions

```cpp
// An example of custom instructions for IEnumerator. For example, let's make an analog of WaitForSecondsRealtime, but using std::chrono
struct CustomYieldInstruction : BNM::IL2CPP::Il2CppObject {
    BNM_CustomClass(CustomYieldInstruction, BNM::CompileTimeClassBuilder({}, "CustomYieldInstruction").Build(), {}, {},
                    BNM::CompileTimeClassBuilder("System.Collections", "IEnumerator", "mscorlib.dll").Build());
    std::chrono::time_point<std::chrono::system_clock> waitUntilTime;
    void Finalize() { this->~CustomYieldInstruction(); }
    bool MoveNext() { return waitUntilTime > std::chrono::system_clock::now(); }
    void Reset() { waitUntilTime = {}; }
    Il2CppObject *Current() { return nullptr; }
    BNM_CustomMethod(Finalize, false, BNM::Defaults::Get<void>(), "Finalize");
    BNM_CustomMethod(MoveNext, false, BNM::Defaults::Get<bool>(), "MoveNext");
    BNM_CustomMethod(Reset, false, BNM::Defaults::Get<void>(), "Reset");
    BNM_CustomMethod(Current, false, BNM::Defaults::Get<BNM::IL2CPP::Il2CppObject *>(), "get_Current");

    void Setup(long long seconds) {
        Reset();
        waitUntilTime = std::chrono::system_clock::now() + std::chrono::seconds(seconds);
    }

    static BNM::IL2CPP::Il2CppObject *New(long long seconds) {
        auto instance = (CustomYieldInstruction *) BNM::Class(BNMCustomClass.myClass).CreateNewInstance();
        instance->Setup(seconds);
        return instance;
    }
};

// And later it can be used in coroutine
BNM::Coroutine::IEnumerator Example() {

    BNM_LOG_DEBUG("Coroutine started waiting for 3s");
    co_yield CustomYieldInstruction::New(3);
    BNM_LOG_DEBUG("Coroutine waited for 3s");

    co_return;
}
```