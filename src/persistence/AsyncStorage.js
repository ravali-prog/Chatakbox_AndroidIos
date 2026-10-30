import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this per client build to isolate AsyncStorage keys
export const STORE_NAME = "chanajor";

export const LOCAL_STORAGE_TOKEN = `${STORE_NAME}_token`;

// user details
export const LOCAL_STORAGE_ALL_PROFILES = `${STORE_NAME}_all_profiles`;
export const LOCAL_STORAGE_SELECTED_PROFILE = `${STORE_NAME}_selected_profile`;
export const LOCAL_STORAGE_USER_INFO = `${STORE_NAME}_user_info`;

export const LOCAL_STORAGE_USER_ID = `${STORE_NAME}_userid`;
export const LOCAL_STORAGE_USER_NAME = `${STORE_NAME}_usrname`;
export const LOCAL_STORAGE_USER_MOBILE_NO = `${STORE_NAME}_mobno`;
export const LOCAL_STORAGE_USER_EMAILID = `${STORE_NAME}_email`;
export const LOCAL_STORAGE_USER_GENDER = `${STORE_NAME}_gender`;

export const LOCAL_STORAGE_SERIES_WATCH_HISTORY = `${STORE_NAME}_SWH`;
export const LOCAL_STORAGE_TRANSACTION_HISTORY = `${STORE_NAME}_transcation_history`;

// previously direct / hardcoded elsewhere
export const LOCAL_STORAGE_TOKEN_EXPIRED_EVENT = `${STORE_NAME}_tokenExpiredEvent`;
export const LOCAL_STORAGE_SELECTED_GENDER = `${STORE_NAME}_selectedGender`;
export const LOCAL_STORAGE_LAST_SELECTED_OPTION = `${STORE_NAME}_lastSelectedOption`;

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
