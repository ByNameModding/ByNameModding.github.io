# Getting Started {#GettingStarted}

1. Clone repo and add it to your project.
2. Set C++ version to 20 or higher.
3. Add the code below depending on what builder you use:<br>
    Android.mk:
    ~~~~~~~~~~~~~{.mk}
    BNM_PATH := $(LOCAL_PATH)/path/to/ByNameModding
    LOCAL_C_INCLUDES += $(BNM_PATH)/include $(BNM_PATH)/external/include
    LOCAL_STATIC_LIBRARIES += BNM
    # ...
    include $(BUILD_SHARED_LIBRARY)
    # ...
    include $(CLEAR_VARS)
    include $(BNM_PATH)/Android.mk
    ~~~~~~~~~~~~~
    CMake (CMakeLists.txt):
    ~~~~~~~~~~~~~
    add_subdirectory(path/to/ByNameModding EXCLUDE_FROM_ALL)
    get_property(BNM_INCLUDE_DIRECTORIES TARGET BNM PROPERTY BNM_INCLUDE_DIRECTORIES)

    # ...

    target_include_directories(
        # Your lib name
        PUBLIC
        ${BNM_INCLUDE_DIRECTORIES}
        # ...
    )
    target_link_libraries(
        # Your lib name
        PUBLIC
        BNM
        # ...
    )
    ~~~~~~~~~~~~~
4. Get Unity version of your target app and change `UNITY_VER` in GlobalSettings.hpp.
5. Setup your desired hooking software in GlobalSettings.hpp.
6. Use one of the loading methods of BNM from @ref BNM::Loading namespace.
7. Done!