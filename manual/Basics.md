# Basics {#Basics}

This section provides some basics and information about the most often used BNM's API.

## Main API {#basics_MainApi}

BNM provides some high level API to work with il2cpp.

\subsection image_Basics - @ref BNM::Image

Struct that allows you to find image (dll):
```cpp
auto assemblyCShrap = BNM::Image("Assembly-CShrap.dll");
// or
auto assemblyCShrap = BNM::Image("Assembly-CShrap");
```

\subsection class_Basics - @ref BNM::Class

Struct that allows you to find classes:
```cpp
auto gameObject = BNM::Class("UnityEngine", "GameObject");
// or
auto gameObject = BNM::Class("UnityEngine", "GameObject", BNM::Image("UnityEngine.CoreModule"));
```

\subsection field - @ref BNM::Field

Struct that allows you to get/set instance and static fields:
```cpp
auto someClass = BNM::Class();

// Static field
BNM::Field<int> staticInt = someClass.GetField("staticInt");

// Get
int v = staticInt;
// or
auto v = staticInt();
// or
auto v = staticInt.Get();

// Set
staticInt = v + 1;
// or
staticInt.Set(v + 1);

// Instance field
BNM::Field<int> instanceInt = someClass.GetField("instanceInt");

void *someClassInstance = ...;

// Set instance and get value
auto v = instanceInt[someClassInstance]();
// or
instanceInt.SetInstance(someClassInstance);
auto v = instanceInt();
```

\subsection method_Basics - @ref BNM::Method

Struct that allows you to call instance and static methods.
```cpp
auto someClass = BNM::Class();

// Static method
// int staticMethod(byte a);
BNM::Method<int> staticMethod = someClass.GetMethod("staticMethod", 1);

// Call
auto v = staticMethod((BNM::Types::byte)5);
// or
auto v = staticMethod.Call((uint8_t)5);

// Instance method
// int instanceMethod();
BNM::Method<int> instanceMethod = someClass.GetMethod("instanceMethod");

void *someClassInstance = ...;

// Set instance and call
auto v = instanceMethod[someClassInstance]();
// or
instanceMethod.SetInstance(someClassInstance);
auto v = instanceMethod();
```

\subsection property_Basics - @ref BNM::Property

Struct that allows you to get/set properties.
```cpp
auto someClass = BNM::Class();

// Static property
BNM::Property<int> staticInt = someClass.GetProperty("staticInt");

// Get (call getter)
int v = staticInt;
// or
auto v = staticInt();
// or
auto v = staticInt.Get();

// Set (call setter)
staticInt = v + 1;
// or
staticInt.Set(v + 1);

// Instance property
BNM::Property<int> instanceInt = someClass.GetProperty("instanceInt");

void *someClassInstance = ...;

// Set instance and get value (call getter)
auto v = instanceInt[someClassInstance]();
// or
instanceInt.SetInstance(someClassInstance);
auto v = instanceInt();
```

\subsection defaults_Basics - [BNM::Defaults::Get](@ref BNM::Defaults::Get)

Method for getting some frequently used C# types.

```cpp
// See the method description for full list of the supported types 
auto intType = BNM::Defaults::Get<int>();
auto intClass = intType.ToClass();

// Any pointer (except some) returns System.Object type
auto objectType = BNM::Defaults::Get<void *>();
```

## Unity and mono related structs {#basics_UnityMono}

\subsection unity_UnityMono 1. Unity structures

BNM provides some unity structures that imitate operations similar to those in Unity.

```cpp
// Mathematical structures
Vector2 vector2;
Vector3 vector3;
Vector4 vector4;
Matrix3x3 matrix3x3;
Matrix4x4 matrix4x4;
Quaternion quaternion;

// Structures for Raycast
Ray ray;
RaycastHit raycastHit;
```

\subsection mono_UnityMono 2. Mono structures

BNM provides some mono (C#) structures

\subsubsection mono_string_UnityMono - String

@ref BNM::Structures::Mono::String - implementation of C# System.String.

```cpp
auto newString = BNM::CreateMonoString("New mono string");

std::string cppString = newString->str();
```

\subsubsection mono_array_UnityMono - Array

@ref BNM::Structures::Mono::Array - implementation of C# System.Array.

```cpp
Mono::Array<int> *array = nullptr;

// Create a new array with size 10 (int array = new int[10];)
array = Mono::Array<int>::Create(10);

// To get data use:
auto dataPtr = array->GetData(); // Pointer to the C array
// or
auto dataVec = array->ToVector(); // std::vector<int>
// or
auto firstData = array->At(0); // The first element of the array
```

\subsubsection mono_list_UnityMono - List

@ref BNM::Structures::Mono::List - implementation of C# System.Collections.Generic.List.

```cpp
Mono::List<int> *list = nullptr;

auto intClass = BNM::Defaults::Get<int>().ToClass();

// Create a new list (List<int> list = new List<int>();)
list = intClass.NewList<int>();

// To get data use:
auto dataPtr = list->GetData(); // Pointer to the C array
// or
auto dataVec = list->ToVector(); // std::vector<int>
// or
auto firstData = list->At(0); // The first element of the array
```

\subsubsection mono_dictionary_UnityMono - Dictionary

@ref BNM::Structures::Mono::List - implementation of C# System.Collections.Generic.Dictionary.

```cpp
Mono::Dictionary<int, int> *dictionary;

// This example uses generic. See Generic section at this page to understand how it works
auto dictionaryClass = BNM::Class("System.Collections.Generic", "Dictionary`2", BNM::Image("mscorlib.dll"));

auto intClass = BNM::Defaults::Get<int>();
auto dictionary_int_int_Class = dictionaryClass.GetGeneric({intClass, intClass});

// Create a new dictionary (Dictionary<int, int> dictionary = new Dictionary<int, int>();)
dictionary = (Mono::Dictionary<int, int> *) dictionary_int_int_Class.CreateNewObjectParameters();

// To get data use:
auto keys = dictionary->GetKeys(); // std::vector<Key type>
// or
auto values = dictionary->GetValues(); // std::vector<Value type>
// or
auto map = dictionary->ToMap(); // std::map<Key type, Value type>
// or
int value = 0;
if (dictionary->TryGet(1 /*Key*/, &value))
    ; // The value is found
```


\subsubsection mono_delegate_UnityMono - Delegate

@ref BNM::Delegate - implementation of C# System.Delegate.

@ref BNM::MulticastDelegate - implementation of C# System.MulticastDelegate. 

```cpp
// In the app we have
// delegate int DemoDelegate(int x, int y);
// 
// static DemoDelegate demoDelegate;

BNM::Field<BNM::MulticastDelegate<int> *> demoDelegate = ...;

auto delegate = demoDelegate();

// Invoke the delegate and get a result
auto result = delegate->Invoke(1, 2);
```

\subsubsection mono_action_UnityMono - Action/UnityAction

@ref BNM::Structures::Mono::Action - implementation of C# System.Action.
It works the same way as delegate, because it's inherited from it.

@ref BNM::UnityEngine::UnityAction - implementation of C# UnityEngine.Events.UnityAction.
It works the same way as delegate, because it's inherited from it.

```cpp
// In the app we have
// static Action<int, int> demoAction;
// static UnityAction<int, int> demoUnityAction;

BNM::Field<Mono::Action<int, int> *> demoAction = ...;
BNM::Field<BNM::UnityEngine::UnityAction<int, int> *> demoUnityAction = ...;

auto action = demoAction();
auto unityAction = demoUnityAction();

// Invoke the actions
action->Invoke(1, 2);
unityAction->Invoke(1, 2);
```


\subsubsection unity_action_UnityMono - Unity event

@ref BNM::UnityEngine::UnityEvent - implementation of C# UnityEngine.Events.UnityEvent.

```cpp
// In the app we have
// static UnityEvent<int, int> demoEvent;

BNM::Field<BNM::UnityEngine::UnityEvent<int, int> *> demoEvent = ...;

auto event = demoEvent();

// Invoke the event
event->Invoke(1, 2);
```

## Generics {#basics_Generics}

BNM provides API for getting typed versions of generic classes and methods.

\subsubsection method_Generics - Generic methods

```cpp
// Unity's GameObject has some generic methods like GetComponent
// We want to get GetComponent<object>
/*
public class GameObject : Object {
    // ...
    public T GetComponent<T>() {}
    // ...
}
*/

auto gameObject = BNM::Class("UnityEngine", "GameObject", BNM::Image("UnityEngine.CoreModule"));

// Get GetComponent<T>() method
auto GetComponent = gameObject.GetMethod("GetComponent", 0);

// Get GetComponent<object>() method
Method<void *> GetComponentObject = GetComponent.GetGeneric({BNM::Defaults::Get<void *>()});
```


\subsubsection classes_Generics - Generic classes

```cpp
// Let's analyze getting of generic classes from Dictionary section

/*
namespace System.Collections.Generic
{
    public class Dictionary<TKey, TValue> : ... {}
}
*/

// To find a type with <T1, T2, T3, ..., Tx>, you need to search for 'TypeName`(number of parameters in <>)"
// "Dictionary<TKey, TValue>" will result "Dictionary`2"
// "Action<T1, T2, T3>" will result "Action`3"

// This line gets generic version of Dictionary<TKey, TValue>
auto dictionaryClass = BNM::Class("System.Collections.Generic", "Dictionary`2", BNM::Image("mscorlib.dll"));

// Here we get int type
auto intClass = BNM::Defaults::Get<int>();

// And at this line we get Dictionary<int, int> class
auto dictionary_int_int_Class = dictionaryClass.GetGeneric({intClass, intClass});
```

## Exceptions {#basics_Exceptions}

BNM provides simple API to handle il2cpp's exceptions.


### Macros
You can use [BNM_try](@ref BNM_try)/[BNM_catch](@ref BNM_catch) macros:

```cpp
BNM::Method<int> DangerMethod;
// ...
int result = 0;

BNM_try
    result = DangerMethod[instance]();
BNM_catch(exception /*exception object name*/) // You can skip catch block
    auto className = exception.ClassName();
    auto message = exception.Message();
    BNM_LOG_WARN("DangerMethod returned exception (in try catch) [%s]: %s", className.c_str(), message.c_str());
    result = -1;
BNM_end_try
```

### API

Or you can use @ref BNM::TryInvoke method:
```cpp
BNM::Method<int> DangerMethod;
// ...
int result = 0;

auto exception = BNM::TryInvoke([&]{
    result = DangerMethod[instance]();
});

if (exception.IsValid()) {
    auto className = exception.ClassName();
    auto message = exception.Message();
    BNM_LOG_WARN("DangerMethod returned exception (in TryInvoke) [%s]: %s", className.c_str(), message.c_str());
    result = -1;
}
```