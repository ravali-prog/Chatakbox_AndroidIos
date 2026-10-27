// Example to Get Device Information in React Native
// https://aboutreact.com/react-native-device-info/

// import React in our code


// import all the components we are going to use
import { Platform, ScrollView, StyleSheet, Text } from 'react-native';

import DeviceInfo from 'react-native-device-info';

export var CountryCode = "unknown"

export function setCountryCode(code) {
  CountryCode = code
  device.cc = code
}

export var device = {};
/*
"device": {  
  "appver":500,
  "os": "android",
  "ua": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
  "ip": "127.0.0.1",
  "cc": "IN",
  "type": "mobile",
  "apptype": "Android"
} */

function safeUserAgent() {
  try {
    return DeviceInfo.getUserAgentSync() || '';
  } catch (e) {
    return Platform.OS === 'ios'
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
      : '';
  }
}

export function initDeviceInfo() {
  const isIOS = Platform.OS === 'ios';

  device = {
    "appvercode": DeviceInfo.getBuildNumber(),
    "appver": DeviceInfo.getVersion(),
    "os": DeviceInfo.getSystemName(), // "Android" / "iOS"
    "ua": safeUserAgent(),
    // "ip": "127.0.0.1",
    "cc": CountryCode,
    "make": DeviceInfo.getManufacturerSync() + "",
    "model": DeviceInfo.getModel() + "",
    "type": DeviceInfo.getDeviceType(), //"mobile",
    // Was hardcoded Android — backend paywall 500'd on iOS with mismatched device meta.
    "apptype": isIOS ? "iOS" : "Android",
    "id": DeviceInfo.getUniqueIdSync(),
    "installMedium": isIOS ? "AppStore" : "GooglePlayStore"

  }


  /*
   device.uniqueId = DeviceInfo.getUniqueIdSync();
   device.deviceId = DeviceInfo.getDeviceId();
   device.bundleId = DeviceInfo.getBundleId();
   device.systemName = DeviceInfo.getSystemName();
   device.systemVersion = DeviceInfo.getSystemVersion();
   device.version = DeviceInfo.getVersion();
   device.readableVersion = DeviceInfo.getReadableVersion();
   device.buildNumber = DeviceInfo.getBuildNumber();
   device.isTablet = DeviceInfo.isTablet();
   device.appName = DeviceInfo.getApplicationName();
   device.brand = DeviceInfo.getBrand();
   device.model = DeviceInfo.getModel();
   device.deviceType = DeviceInfo.getDeviceType();
   device.androidid = DeviceInfo.getAndroidIdSync();
  */

}



const styles = StyleSheet.create({
  titleStyle: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'left',
    color: '#333333',
    margin: 5,
  },
});