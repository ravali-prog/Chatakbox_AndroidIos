import AsyncStorage from '@react-native-async-storage/async-storage';

export const CONST_TOKEN = "token";

// user details
export const CONST_ALL_PROFILES = "all_profiles";

export const CONST_SELECTED_PROFILE = "selected_profile";

export const CONST_USER_INFO = "user_info";

export const CONST_USER_ID = "userid";
export const CONST_USER_NAME = "usrname";
export const CONST_USER_MOBILE_NO = "mobno";
export const CONST_USER_EMAILID = "email";
export const CONST_USER_GENDER = "gender";

export const CONST_SERIES_WATCH_HISTORY = "SWH";

export const TRANSACTION_HISTORY = "transcation_history";



export const storeValue = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // saving error
  }
};

export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // saving error
  }
};


export const storeSelectedProfile = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // saving error
  }
};

export const getValue = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      // value previously stored
    }
    return value
  } catch (e) {
    // error reading value
  }
  return null
};


export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
  }
};


export const getSelectedProfile = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    // error reading value
  }
};

export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
  }
};