package com.facebook.react;

import android.app.Application;
import android.content.Context;
import android.content.res.Resources;

import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainPackageConfig;
import com.facebook.react.shell.MainReactPackage;
import java.util.Arrays;
import java.util.ArrayList;

// @react-native-async-storage/async-storage
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
// @react-native-community/checkbox
import com.reactnativecommunity.checkbox.ReactCheckBoxPackage;
// @react-native-community/datetimepicker
import com.reactcommunity.rndatetimepicker.RNDateTimePickerPackage;
// @react-native-community/slider
import com.reactnativecommunity.slider.ReactSliderPackage;
// @react-native-firebase/analytics
import io.invertase.firebase.analytics.ReactNativeFirebaseAnalyticsPackage;
// @react-native-firebase/app
import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;
// @react-native-firebase/app-check
import io.invertase.firebase.appcheck.ReactNativeFirebaseAppCheckPackage;
// @react-native-firebase/auth
import io.invertase.firebase.auth.ReactNativeFirebaseAuthPackage;
// @react-native-firebase/dynamic-links
import io.invertase.firebase.dynamiclinks.ReactNativeFirebaseDynamicLinksPackage;
// @react-native-firebase/messaging
import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingPackage;
// @react-native-google-signin/google-signin
import com.reactnativegooglesignin.RNGoogleSigninPackage;
// @shopify/flash-list
import com.shopify.reactnative.flash_list.ReactNativeFlashListPackage;
// react-native-crypto-aes-cbc
import in.nspheresolutions.CryptoAesCbcPackage;
// react-native-customui
import com.razorpay.rn.custom.RazorpayCustomPackage;
// react-native-device-info
import com.learnium.RNDeviceInfo.RNDeviceInfo;
// react-native-exit-app
import com.github.wumke.RNExitApp.RNExitAppPackage;
// react-native-gesture-handler
import com.swmansion.gesturehandler.RNGestureHandlerPackage;
// react-native-get-random-values
import org.linusu.RNGetRandomValuesPackage;
// react-native-google-cast
import com.reactnative.googlecast.GoogleCastPackage;
// react-native-linear-gradient
import com.BV.LinearGradient.LinearGradientPackage;
// react-native-orientation-locker
import org.wonday.orientation.OrientationPackage;
// react-native-play-install-referrer
import com.uerceg.play_install_referrer.PlayInstallReferrerPackage;
// react-native-quick-base64
import com.reactnativequickbase64.QuickBase64Package;
// react-native-razorpay
import com.razorpay.rn.RazorpayPackage;
// react-native-safe-area-context
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
// react-native-screens
import com.swmansion.rnscreens.RNScreensPackage;
// react-native-send-intent
import com.burnweb.rnsendintent.RNSendIntentPackage;
// react-native-share
import cl.json.RNSharePackage;
// react-native-splash-screen
import org.devio.rn.splashscreen.SplashScreenReactPackage;
// react-native-svg
import com.horcrux.svg.SvgPackage;
// react-native-system-navigation-bar
import com.reactnativesystemnavigationbar.SystemNavigationBarPackage;
// react-native-vector-icons
import com.oblador.vectoricons.VectorIconsPackage;
// react-native-video
import com.brentvatne.react.ReactVideoPackage;
// react-native-webview
import com.reactnativecommunity.webview.RNCWebViewPackage;
// @iaptic/react-native-iap
import com.dooboolab.rniap.RNIapPackage;
// @invertase/react-native-apple-authentication
import com.RNAppleAuthentication.AppleAuthenticationAndroidPackage;

public class PackageList {
  private Application application;
  private ReactNativeHost reactNativeHost;
  private MainPackageConfig mConfig;

  public PackageList(ReactNativeHost reactNativeHost) {
    this(reactNativeHost, null);
  }

  public PackageList(Application application) {
    this(application, null);
  }

  public PackageList(ReactNativeHost reactNativeHost, MainPackageConfig config) {
    this.reactNativeHost = reactNativeHost;
    mConfig = config;
  }

  public PackageList(Application application, MainPackageConfig config) {
    this.reactNativeHost = null;
    this.application = application;
    mConfig = config;
  }

  private ReactNativeHost getReactNativeHost() {
    return this.reactNativeHost;
  }

  private Resources getResources() {
    return this.getApplication().getResources();
  }

  private Application getApplication() {
    if (this.reactNativeHost == null) return this.application;
    return this.reactNativeHost.getApplication();
  }

  private Context getApplicationContext() {
    return this.getApplication().getApplicationContext();
  }

  public ArrayList<ReactPackage> getPackages() {
    return new ArrayList<>(Arrays.<ReactPackage>asList(
      new MainReactPackage(mConfig),
      new AsyncStoragePackage(),
      new ReactCheckBoxPackage(),
      new RNDateTimePickerPackage(),
      new ReactSliderPackage(),
      new ReactNativeFirebaseAnalyticsPackage(),
      new ReactNativeFirebaseAppPackage(),
      new ReactNativeFirebaseAppCheckPackage(),
      new ReactNativeFirebaseAuthPackage(),
      new ReactNativeFirebaseDynamicLinksPackage(),
      new ReactNativeFirebaseMessagingPackage(),
      new RNGoogleSigninPackage(),
      new ReactNativeFlashListPackage(),
      new CryptoAesCbcPackage(),
      new RazorpayCustomPackage(),
      new RNDeviceInfo(),
      new RNExitAppPackage(),
      new RNGestureHandlerPackage(),
      new RNGetRandomValuesPackage(),
      new GoogleCastPackage(),
      new LinearGradientPackage(),
      new OrientationPackage(),
      new PlayInstallReferrerPackage(),
      new QuickBase64Package(),
      new RazorpayPackage(),
      new SafeAreaContextPackage(),
      new RNScreensPackage(),
      new RNSendIntentPackage(),
      new RNSharePackage(),
      new SplashScreenReactPackage(),
      new SvgPackage(),
      new SystemNavigationBarPackage(),
      new VectorIconsPackage(),
      new ReactVideoPackage(),
      new RNCWebViewPackage(),
      new RNIapPackage(),
      new AppleAuthenticationAndroidPackage()
    ));
  }
}