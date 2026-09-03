package com.chatakbox.app


import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class FbEventsPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(FbEventsModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext)
            = emptyList<ViewManager<*, *>>()
}
