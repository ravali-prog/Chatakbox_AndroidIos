import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_KEY, API_URL, CONFIG_URL, CUSTOMER_SESSION_URL, ERROR_CODES, ERROR_MESSAGES, LogData, USER_UUID, VIDEO_EVENTS_URL, setUserPrivilages, updateSelectedProfile } from '../app_config/AppConstants';
import axios from 'axios';
import { device } from '../app_config/DeviceInfo';
import { Config } from '../data_models/AppConfigTypes';
import { setConfigData } from '../app_config/AppConstants';
import { ContentResponse } from '../data_models/ContentDataTypes';
import { ApiResponse } from '../data_models/ApiResponseTypes';
import { UserprofileResponse } from '../data_models/UserProfileTypes';
import { UserPrivilage } from '../data_models/UserPrivilegeTypes';

const initialState = {
  config: {},
  status: 'idle',
  error: null,
};

export const getPaymentConfig = async (url: string, uuid: string, contentgroup: string[]) => {
  try {
    const trigger = { "contentgroup": contentgroup }
    const payload = { uuid, device: device, action: 2, trigger }
    const res = await axios.post(url, payload);
    // return res.data.data.paywall;
    return res.data?.data?.paywall || res.data?.paywall;
  } catch (err) {
    return { error: err.message };
  }
};

// export const notifyTransaction = async (url: string, uuid: string, txninfoparam: any) => {
//   try {
//     const payload = { uuid, device: device, txninfo: txninfoparam }
//     const res = await axios.post(url, payload);
//     return res.data;
//   } catch (err) {
//     return { error: err };
//   }
// };

export const notifyTransaction = async (url: string, uuid: string, txninfoparam: any, extraHeaders?: Record<string, string>) => {
  try {
    const payload = { uuid, device: device, txninfo: txninfoparam }
    const res = await axios.post(url, payload, {
      headers: {
        ...extraHeaders
      }
    });
    return res.data;
  } catch (err) {
    return { error: err };
  }
};

// export const notifyTransactionGoogle = async (url: string, purchases: any) => {
//   try {
//     const payload = { uuid: USER_UUID, device: device, txninfo: purchases }
//     const res = await axios.post(url, payload);
//     return res.data;
//   } catch (err) {
//     return getErrorCode(err)
//   }
// };

export const notifyTransactionGoogle = async (url: string, purchases: any) => {
  try {
    const payload = { uuid: USER_UUID, device: device, txninfo: purchases }
    const res = await axios.post(url, payload, {
      headers: { 
        "X-API-Key": API_KEY
      }
    });
    return res.data;
  } catch (err) {
    return getErrorCode(err)
  }
};

export const notifyTransactionIOS = async (url: string, purchases: any) => {
  try {
    const payload = { uuid: USER_UUID, device: device, txninfo: purchases }
    const res = await axios.post(url, payload, {
      headers: { 
        "X-API-Key": API_KEY
      }
    });
    return res.data;
  } catch (err) {
    return getErrorCode(err)
  }
};

export function getErrorCode(err: any) {
  return { error: ERROR_MESSAGES.NETWORK_ERROR_MESSAGE, errorcode: ERROR_CODES.NETWORK_ERROR_CODE };
}export const getPrivileges = async () => {
  try {
    const payload = { uuid: USER_UUID, device: device, action: 1 }
    const res = await axios.post(CONFIG_URL, payload);
    try {
      // const privilages: UserPrivilage = res.data.privileges
      const privilages: UserPrivilage = res.data?.data?.privileges || res.data?.privileges;
      if (privilages) {
        setUserPrivilages(privilages)
      }
    } catch (error) {
    }
    return res.data;
  } catch (err) {
    return { error: err.message };
  }
};

export const getSubscriptions = async () => {
  try {
    const payload = { uuid: USER_UUID, device: device, action: 5 }
    const res = await axios.post(CONFIG_URL, payload);
    return res.data;
  } catch (err) {
    return getErrorCode(err)
  }
};

export const doLogout = async (profileid: string) => {
  try {
    const payload = { device: device, action: "logout", uuid: USER_UUID, profileid }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp: ApiResponse = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const checkUsername = async (id: string, logintype: string) => {
  try {
    const payload = { id, logintype, device: device, action: "checkusername" }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp: ApiResponse = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const register = async (id: string, logintype: string, pwd: string) => {
  try {
    const payload = { id, logintype, pwd, device: device, action: "register" }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp: ApiResponse = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const passwordLogin = async (id: string, logintype: string, pwd: string) => {
  try {
    const payload = { id, logintype, pwd, device: device, action: "passwordlogin" }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp: ApiResponse = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const getContentToken = async (uuid: string, contentid: string, profileid: string, cid: string) => {
  try {
    const payload = { uuid, id: contentid, device: device, action: 'getaccesstoken', profileid, cid }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const doLogoutAll = async (uuid: string) => {
  try {
    const payload = { device: device, action: 'logoutall', uuid }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp: ApiResponse = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const doProfileAction = async (action: string, id: string, name: string, img: string, profileid: string, pinString: string) => {
  try {
    const payload = { uuid: id, name, image: img, device: device, action: action, profileid: profileid, pin: pinString }
    const res = await axios.post(CONFIG_URL, payload);
    const resp = res.data;
    try {
      updateSelectedProfile(resp.data.profiles)
    } catch (error) {
    }
    return resp;
  } catch (err) {
    return { error: err.message };
  }
};

export const profileLoginPIN = async (action: string, id: string, profileid: string, pinString: string) => {
  try {
    const payload = { uuid: id, device: device, action: action, profileid, pin: pinString }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp: UserprofileResponse = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const doUserAction = async (action: string, uuid: string, profileid: string, type: string, id: string) => {
  try {
    const payload = { uuid: uuid, device: device, action: action, profileid: profileid, type: type, id: id }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const getUserProfiles = async (id: string) => {
  try {
    const payload = { uuid: id, device: device, action: "myprofiles" }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp: UserprofileResponse = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const requestOtp = async (
  logintype: string,
  id: string,
  pinlength?: number
) => {
  try {
    const payload = {
      logintype: logintype,
      id: id,
      pinlength,
      device: device,
      action: "sendotp",
    };
    const res = await axios.post(CONFIG_URL, payload);
    const apiresp: ApiResponse = res.data;
    return apiresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const validateOtp = async (
  logintype: string,
  id: string,
  pin: string,
  pinlength?: number
) => {
  try {
    const payload = {
      logintype: logintype,
      id: id,
      pin,
      pinlength,
      device: device,
      action: "validateotp",
    };
    const res = await axios.post(CONFIG_URL, payload);
    const configresp: UserprofileResponse = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const socialLogin = async (result: any) => {
  try {
    // const data = { data: { device: device, logintype: "google", "action": "sociallogin", result: result } }
        const payload = {
      logintype: "google",
      device: device,
      action: "sociallogin",
      result: result
    };
    

    const res = await axios.post(API_URL, payload);
    const configresp: UserprofileResponse = res.data;
    return configresp;

  } catch (err) {
    return { error: err.message };
  }
};

export const socialLoginIOS = async (result: any, result1: any) => {
  try {
    const payload = {
      logintype: "apple",
      device: device,
      action: "sociallogin",
      result: result,
      result1: result1,
    };
    const res = await axios.post(API_URL, payload);
    const configresp: UserprofileResponse = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const firebaseLogin = async (loginType: string, resultData: any, idtoken: string) => {
  try {
    const data = { data: { device: device, logintype: loginType, "action": "sociallogin", result: { "idToken": idtoken, resultData } } }

    const res = await axios.post(API_URL, data);
    const configresp: UserprofileResponse = res.data;
    return configresp;

  } catch (err) {
    return { error: err.message };
  }
};


export const getConfigData = async (body: any) => {
  try {
    const payload = { ...body, device: device, action: "config", cc: "IN" }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp: Config = res.data;
    setConfigData(configresp);
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const getHomeContent = async (pageid: any): Promise<ContentResponse> => {
  try {
    const payload = { pageid: pageid, device: device, action: "content" }
    // const payload = { pageid: pageid, device: device, action: "content",storeid: 100, storever: "staging-1.0" }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp: ContentResponse = res.data;
    return configresp;
  } catch (err) {
    const configresp: ContentResponse = {
      data: [],
      resultcode: '301',
      resultmsg: 'Something went wrong!'
    };
    return configresp;
  }
};

export const getSeriesDetails = async (body: any): Promise<any> => {
  try {
    const payload = { ...body, device: device, action: "content" }
    // const payload = { ...body, device: device, action: "content",storeid: 100, storever: "staging-1.0" }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp = res.data;
    return configresp;
  } catch (err) {
    const configresp = {
      data: [],
      resultcode: '301',
      resultmsg: 'Something went wrong!'
    };
    return configresp;
  }
};

export const getContentDetails = async (body: any): Promise<any> => {
  try {
    const payload = { ...body, device: device, action: "content"}
    // const payload = { ...body, device: device, action: "content", storeid: 100, storever: "staging-1.0" }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp = res.data;
    return configresp;
  } catch (err) {
    const configresp = {
      data: [],
      resultcode: '301',
      resultmsg: 'Something went wrong!'
    };
    return configresp;
  }
};

export const addTV = async (action: string, id: string, profileid: string, pin: string) => {
  try {
    const payload = { uuid: id, device: device, action: action, profileid: profileid, code: pin }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp: UserprofileResponse = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const accountUpdate = async (action: string, id: string, profileid: string, updateType: string, updateValue: string,) => {
  try {
    const payload = { uuid: id, device: device, action: action, profileid: profileid, [updateType]: updateValue, }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp: UserprofileResponse = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const getAccountDetails = async (action: string, uuid: string, profileid: string) => {
  try {
    const payload = { uuid, device: device, action: action, profileid }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp: UserprofileResponse = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const tvCode = async (action: string, id: string) => {
  try {
    const payload = { device: device, action: action, id: id }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp: UserprofileResponse = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const getTabs = async (uuid: string, profileid: string) => {
  try {
    // const payload = { uuid, device: device, action: "tabs", profileid: profileid , storeid: 100, storever: "staging-1.0"}
    const payload = { uuid, device: device, action: "tabs", profileid: profileid}
    const res = await axios.post(CONFIG_URL, payload);
    console.log("tabss", JSON.stringify(res.data))
    return res.data;
  } catch (err) {
    return { error: err.message };
  }
};

export const getUserActivity = async (uuid: string, profileid: string) => {
  try {
    const payload = { uuid, device: device, action: "myactivity", profileid: profileid }
    const res = await axios.post(CONFIG_URL, payload);
    return res.data;
  } catch (err) {
    return { error: err.message };
  }
};

export const fetchMyDevices = async (action: string, uuid: string, profileid: string, deviceId: string) => {
  try {
    const payload = { device: device, uuid, action: action, profileid: profileid, deviceId }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const logoutDevice = async (uuid: string, profileid: string, deviceid: string) => {
  try {
    const payload = { device: device, action: 'logoutdevice', uuid, profileid, deviceid }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp: ApiResponse = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const watchHistoryAction = async (action: string, uuid: string, profileid: string, id: string) => {
  try {
    const payload = { uuid, device: device, action: action, profileid: profileid, cids: id }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const searchContent = async (action: string, id: string, profileid: string, searchQuery: string) => {
  try {
    const payload = { uuid: id, device: device, action: action, profileid: profileid, q: searchQuery }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const similarVideos = async (id: string, groupId: string) => {
  try {
    const payload = { action: "recommended", device: device, uuid: id, groupId }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const createShareLink = async (id: string, type: string, name: string) => {
  try {
    const payload = { action: "share", device: device, uuid: USER_UUID, id: id, type: type, name: name }
    const res = await axios.post(CONFIG_URL, payload);
    const configresp = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

// export const fireVideoTracking = async (url: string) => {
//   try {
//     const res = await axios.post(url);
//     const configresp = res.data;
//     return configresp;
//   } catch (err) {
//     return { error: err.message };
//   }
// };

export const fireVideoTracking = async (url: string) => {
  const res = await axios.post(url);
  return res.data;
};

export const getSimilarContent = async (body: any): Promise<any> => {
  try {
    const payload = { ...body, device: device, action: "recommended" }
    const res = await axios.post(CONFIG_URL, payload);
    return res.data;
  } catch (err) {
    const configresp = {
      data: [],
      resultcode: '301',
      resultmsg: 'Something went wrong!'
    };
    return configresp;
  }
};

export const fireInstallReferer = async (referrer: any) => {
  try {
    const payload = { uuid: USER_UUID, device: device, action: "installreferrer", referrer: referrer }
    const res = await axios.post(CONFIG_URL, payload);
    return res.data;
  } catch (err) {
    return { error: err.message };
  }
};

export const deactivatePlan = async (url: string) => {
  try {
    const res = await axios.post(url);
    const configresp = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const customerUsage = async (datetime: string, uuid: string, VideoType: string, VideoName: string, sessionId: string) => {
  try {
    const payload = { eventType: "CUSTOMER_USAGE", channel: "APP", productID: "101", device: device, datetime, user: uuid, itemTags: VideoType, itemName: VideoName, sessionId: sessionId }
    const res = await axios.post(VIDEO_EVENTS_URL, payload);
    const configresp = res.data;
    return configresp;
  } catch (err) {
    return { error: err.message };
  }
};

export const customerSession = async (datetime: string, uuid: string, sessionId: string) => {
  try {
    const payload = { eventType: "CUSTOMER_SESSION", channel: "APP", productID: "101", device: device, datetime, user: uuid, sessionId: sessionId }
    const res = await axios.post(CUSTOMER_SESSION_URL, payload);
    const configresp = res.data;
    return configresp;
  } catch (err) { 
    return { error: err.message };
  }
};
