package com.chatakbox.app
import android.os.Bundle;
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.dooboolab.rniap.RNIapModule.Companion.TAG
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.google.android.gms.cast.framework.CastContext;
import java.lang.Exception
import org.devio.rn.splashscreen.SplashScreen;
import com.facebook.FacebookSdk;
import com.facebook.appevents.AppEventsLogger;


class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Ott_client"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

   override fun onCreate(savedInstanceState: Bundle?){ 
    super.onCreate(null)
//       FacebookSdk.sdkInitialize(applicationContext)
    try {
      // lazy load Google Cast context
      CastContext.getSharedInstance(this);
    } catch (e:Exception) {
      // cast framework not supported
    }
  }
 override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "onDestroy() called")
    }

}