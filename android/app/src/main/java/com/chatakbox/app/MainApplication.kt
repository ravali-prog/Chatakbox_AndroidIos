package com.chatakbox.app
import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
//import com.facebook.react.flipper.ReactNativeFlipper
import com.facebook.react.soloader.OpenSourceMergedSoMapping

import com.facebook.soloader.SoLoader
import com.facebook.FacebookSdk



class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
//            override fun getPackages(): List<ReactPackage> =  PackageList(this).packages.apply {
//                // Packages that cannot be auto linked yet can be added manually here, for example:
//                // packages.add(new MyReactNativePackage());
//                add(ActivityStarterPackage())
//                add(FbEventsPackage())
//
//
//            }

            override fun getPackages(): List<ReactPackage> {
                return PackageList(this).packages.toMutableList().apply {
                    add(ActivityStarterPackage())
                    add(FbEventsPackage())
                }
            }


            /*{
              // Packages that cannot be auto linked yet can be added manually here, for example:
              // packages.add(new MyReactNativePackage());
               PackageList(this).packages.add(JioAdViewPackage());
              return PackageList(this).packages
            }*/

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(this.applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        FacebookSdk.setAutoInitEnabled(false);
//        FacebookSdk.setAutoLogAppEventsEnabled(false);
//        FacebookSdk.setAdvertiserIDCollectionEnabled(false);
//        SoLoader.init(this, false)
        SoLoader.init(this, OpenSourceMergedSoMapping)


        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            load()
        }
//        ReactNativeFlipper.initializeFlipper(this, reactNativeHost.reactInstanceManager)
    }
}