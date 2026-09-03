import analytics from "@react-native-firebase/analytics";
import { LogData, LogError, USER_UUID } from "../app_config/AppConstants";
import { NativeModules } from "react-native";

const { FbEvents } = NativeModules;

export const APP_EVENTS_ = {
  launch: (attr_launch_type) => {
    recordEvent("app_launch", { attr_launch_type: attr_launch_type });
  },
  screen: (screen) => {
    recordEvent("screen", { screen_name: screen });
  },
  login: (attr_success, attr_login_method) => {
    recordEvent("user_login", {
      attr_success: attr_success,
      attr_login_method: attr_login_method,
    });
  },
  complete_registraion: (attr_registration_method) => {
    recordEvent("registration_complete", {
      attr_registration_method: attr_registration_method,
    });
  },
  search: (attr_search_string) => {
    recordEvent("search_content", { attr_search_string: attr_search_string });
  },
  content_view_list: (attr_content_list) => {
    recordEvent("content_list_view", { attr_content_list: attr_content_list });
  },
  content_view: (attr_content, attr_content_id, attr_content_type) => {
    recordEvent("content_details_view", {
      attr_content: attr_content,
      attr_content_id: attr_content_id,
      attr_content_type: attr_content_type,
    });
  },
  add_to_wishlist: (attr_content, attr_content_id, attr_content_type) => {
    recordEvent("add_to_wishlist", {
      attr_content: attr_content,
      attr_content_id: attr_content_id,
      attr_content_type: attr_content_type,
    });
  },
  remove_from_wishlist: (attr_content, attr_content_id, attr_content_type) => {
    recordEvent("remove_from_wishlist", {
      attr_content: attr_content,
      attr_content_id: attr_content_id,
      attr_content_type: attr_content_type,
    });
  },
  add_to_likes: (attr_content, attr_content_id, attr_content_type) => {
    recordEvent("liked_content", {
      attr_content: attr_content,
      attr_content_id: attr_content_id,
      attr_content_type: attr_content_type,
    });
  },
  add_to_unlikes: (attr_content, attr_content_id, attr_content_type) => {
    recordEvent("unliked_content", {
      attr_content: attr_content,
      attr_content_id: attr_content_id,
      attr_content_type: attr_content_type,
    });
  },
  remove_from_likes: (attr_content, attr_content_id, attr_content_type) => {
    recordEvent("remove_from_likes", {
      attr_content: attr_content,
      attr_content_id: attr_content_id,
      attr_content_type: attr_content_type,
    });
  },
  remove_from_unlikes: (attr_content, attr_content_id, attr_content_type) => {
    recordEvent("remove_from_unlikes", {
      attr_content: attr_content,
      attr_content_id: attr_content_id,
      attr_content_type: attr_content_type,
    });
  },
  share: (
    
    attr_content,
    attr_content_id,
    attr_content_type,
    attr_share_method
  ) => {
    recordEvent("content_share", {
      attr_content: attr_content,
      attr_content_id: attr_content_id,
      attr_content_type: attr_content_type,
      attr_share_method: attr_share_method,
    });
  },
  paywall_initiated: (
    attr_content,
    attr_content_id,
    attr_content_type,
    atr_trigger
  ) => {
    recordEvent("subscription_paywall_initiated", {
      attr_content: attr_content,
      attr_content_id: attr_content_id,
      attr_content_type: attr_content_type,
      atr_trigger: atr_trigger,
    });
  },
  paywall_closed: () => {
    recordEvent("subscription_paywall_closed");
  },
  content_play: (attr_content, attr_content_id, attr_content_type) => {
    recordEvent("content_playback_started", {
      attr_content: attr_content,
      attr_content_id: attr_content_id,
      attr_content_type: attr_content_type,
    });
  },
  profile_update: (attr_change, attr_success) => {
    // ["name","image","enablepin","disablepin"]
    recordEvent("user_profile_updated", {
      attr_change: attr_change,
      attr_success: attr_success,
    });
  },
  account_update: (attr_change, attr_success) => {
    //  ["mobile","email","dob","gender"]
    recordEvent("user_account_updated", {
      attr_change: attr_change,
      attr_success: attr_success,
    });
  },
  logout_device: (attr_device) => {
    recordEvent("device_logout", { attr_device: attr_device });
  },
  deactivate: (attr_package_id) => {
    recordEvent("subscription_deactivated", { attr_package_id: attr_package_id });
  },
  TvActivation: (attr_success) => {
    recordEvent("tv_activation", { attr_success: attr_success });
  },

  delete_history: () => { 
    recordEvent("viewing_history_deleted");
  },
};

function isSubscribeEvent(eventName) {
  if (eventName.startsWith("paywall_success")) {
    return "Subscribe";
  }
  return eventName;
}


export function recordEvent(eventName, extraParam) {

  try {
    if (__DEV__) {
      LogData("EVENTS before : " + eventName, extraParam);
    }

    if (USER_UUID != null && USER_UUID != "") {
      extraParam.uid = USER_UUID;
    }
    if (__DEV__) {
      LogData("EVENTS : " + eventName, JSON.stringify(extraParam));
    }

    try {
      analytics().logEvent(eventName, extraParam);
    } catch (error) {
      LogError("Event error", error);
    }

    try {
      const fbEvent = isSubscribeEvent(eventName);
      LogData("eventName =", eventName);
      LogData("fbEvent =", fbEvent);

      const fbParams = { ...extraParam };

      if (fbEvent === "Subscribe") {
        LogData("eventName =", eventName);
        LogData("fbEvent =", fbEvent);

        if (
          extraParam.attr_price !== undefined &&
          extraParam.attr_price !== null
        ) {
          fbParams._valueToSum = extraParam.attr_price;
        }

        if (
          extraParam.attr_curr !== undefined &&
          extraParam.attr_curr !== null
        ) {
          fbParams.fb_currency = extraParam.attr_curr;
        }


        // FbEvents.logEvent("Subscribe", fbParams);
        LogData("FB Subscribe Event Params:", JSON.stringify(fbParams));
        FbEvents.logEvent("Subscribe", fbParams);
        LogData("FB Subscribe Event Fired");
      } else {
        // FbEvents.logEvent(eventName, extraParam);
        LogData("FB Event:", eventName, JSON.stringify(extraParam));
        FbEvents.logEvent(eventName, extraParam);
         LogData("FB Event Fired:", eventName);
      }
    } catch (err) {
      LogError("Meta Event error", err);
    }


logFbStandardEvent(eventName,extraParam)
    
  } catch (error) {
    LogError("Event error", error);
  }
}

export function logFbStandardEvent(eventname, params = {}) {
  try {

    var code = -1;

    if (eventname == "registration_complete") {
      code = 1;

    } else if (eventname == "app_launch") {
      code = 5;
 
    } else if (eventname == "content_details_view") {
      code = 3;

    } else if (eventname == "subscription_paywall_initiated") {
      code = 4;

    } else {
      code = -1;
    }

  } catch (err) {
    LogError("FB Standard Event error", err);
  }
}
