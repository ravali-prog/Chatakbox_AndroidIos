package com.chatakbox.app
import android.os.Bundle
import android.app.Application
import com.facebook.FacebookSdk
import com.facebook.appevents.AppEventsLogger
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

    object FbEventNames {
    const val COMPLETE_REGISTRATION = "fb_mobile_complete_registration"
    const val PURCHASE = "fb_mobile_purchase"
    const val VIEW_CONTENT = "fb_mobile_content_view"
    const val INITIATE_CHECKOUT = "fb_mobile_initiated_checkout"
    const val LAUNCH = "fb_mobile_activate_app"
}


class FbEventsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var initialized = false

    private val logger: AppEventsLogger by lazy {
        AppEventsLogger.newLogger(reactContext)
    }

    override fun getName(): String = "FbEvents"

    @ReactMethod
    fun configure(appId: String, clientToken: String, promise: Promise) {
        try {
            if (!initialized) {
//                val appId = "YOUR_DYNAMIC_APP_ID"
//                val clientToken = "YOUR_DYNAMIC_CLIENT_TOKEN"
                FacebookSdk.setApplicationId(appId)
                FacebookSdk.setClientToken(clientToken)

//                println("facebook_id" + appId)
//                println("facebook_client" + clientToken)
                FacebookSdk.setIsDebugEnabled(true)
                FacebookSdk.sdkInitialize(reactContext.applicationContext)
                FacebookSdk.setAutoInitEnabled(true);


                FacebookSdk.setAutoLogAppEventsEnabled(true)
                FacebookSdk.setAdvertiserIDCollectionEnabled(true)
                AppEventsLogger.activateApp(reactContext.applicationContext as Application)
                initialized = true
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("FB_INIT_ERROR", e)
        }
    }

    @ReactMethod
    fun logEvent(eventName: String, params: ReadableMap?) {
        if (!initialized) {
//            println("Facebook SDK not initialized yet. Event skipped: $eventName")
            return
        }



        val bundle = android.os.Bundle().apply {
            params?.toHashMap()?.forEach { (k, v) ->
                when (v) {
                    is String -> putString(k, v)
                    is Int -> putInt(k, v)
                    is Double -> putDouble(k, v)
                    is Boolean -> putBoolean(k, v)
                }
            }
        }

        logger.logEvent(eventName, bundle)
//        println("Facebook SDK event.  $eventName" + " " + params + "_" + bundle)

    }
    // FB EVENTS
@ReactMethod
fun logEventByFb(eventCode: Int, params: ReadableMap?) {
    if (!initialized) return

    val eventName = when (eventCode) {
        1 -> FbEventNames.COMPLETE_REGISTRATION
        2 -> FbEventNames.PURCHASE
        3 -> FbEventNames.VIEW_CONTENT
        4 -> FbEventNames.INITIATE_CHECKOUT
        5 -> FbEventNames.LAUNCH
        else -> return
    }

    val bundle = Bundle()
    params?.toHashMap()?.forEach { (k, v) ->
        when (v) {
            is String -> bundle.putString(k, v)
            is Int -> bundle.putInt(k, v)
            is Double -> bundle.putDouble(k, v)
            is Boolean -> bundle.putBoolean(k, v)
        }
    }

    logger.logEvent(eventName, bundle)
}

}
