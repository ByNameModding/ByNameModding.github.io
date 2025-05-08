#include <BNM/Loading.hpp>

#include "KittyMemory.h"

// An example of replacing a method for searching methods using KittyMemory.
ElfScanner g_il2cppELF{};

void *KittyMemoryFinder(const char *name, void *data) {
    auto &scanner = *(ElfScanner *) data;
    return (void *) scanner.findSymbol(name);
}


void Example() {
    // Tells BNM to use KittyMemoryFinder instead of BNM_dlsym.
    BNM::Loading::SetMethodFinder(KittyMemoryFinder, (void *) &g_il2cppELF);

    // If loading happens later we enable LateInitHook
    BNM::Loading::AllowLateInitHook();

    // Set g_il2cppELF in any way.
    // g_il2cppELF = ...;

    // Try to load BNM
    auto result = BNM::Loading::TryLoadByUsersFinder();
    BNM_LOG_DEBUG("07: %d", (int) result);
}