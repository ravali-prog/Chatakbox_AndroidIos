import "react-native-get-random-values";
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
  DeviceEventEmitter,
  NativeModules,
} from "react-native";
import { PaperProvider } from "react-native-paper";
import { Provider } from "react-redux";
import { store } from "./src/state_mgmt/ReduxStore";
import SplashScreen from "react-native-splash-screen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./src/pages/auth/SignInScreen";
import SignUpScreen from "./src/pages/auth/SignUpScreen";
import HomeScreen from "./src/pages/main/HomePage";
import SearchScreen from "./src/ui_components/content/SearchInterface";
import HomeItem from "./src/ui_components/content/HomeItemCard";
import ContentDetails from "./src/ui_components/content/ContentDetailView";
import ContentListing from "./src/ui_components/content/ContentListView";
import { initDeviceInfo, device } from "./src/app_config/DeviceInfo";
import axios from "axios";
import {
  customerSession,
  fireInstallReferer,
  fireVideoTracking,
  firebaseLogin,
  getConfigData,
  getErrorCode,
  getPrivileges,
  getTabs,
  getUserActivity,
} from "./src/state_mgmt/AppCommonSlice";
import LoadingSpinner from "./src/ui_components/widgets/LoadingSpinner";
import EmptyState from "./src/ui_components/widgets/EmptyState";

import ClipDetail from "./src/pages/detail/ClipViewer";
import ReelsPlayerScreen from "./src/pages/reels/ReelsPlayerScreen";
import MyAccount from "./src/pages/user/AccountSettings";
import OttWebView from "./src/pages/user/ExternalWebView";
import PayWall from "./src/pages/user/PaymentGateway";
import LandScapeVideoplayer from "./src/pages/VideoPlayerFullscreen";
import {
  CONST_ALL_PROFILES,
  CONST_SELECTED_PROFILE,
  getData,
  storeData,
} from "./src/persistence/AsyncStorage";
import { UserprofileData } from "./src/data_models/UserProfileTypes";
import {
  API_URL,
  // ENCRYPTION_ENABLED,
  LOCAL_EVENTS,
  USER_UUID,
  checkAppUpgrade,
  firebaseLoginParams,
  isTvPlatform,
  selectedUserProfile,
  setCurrDeeplinkParam,
  setSelectedUserProfile,
  setUserProfiles,
  setUseractivityDetails,
  userProfiles,
  useractivityDetails,
  processWatchHistory,
  getCurrentPlayingVideo,
  setCurrentPlayingResumeVal,
  LogData,
  LogError,
  getFormattedISODateTime,
  generateSessionId,
  getSessionId,
  checkTokenExpiry,
  logoutCurrentProfile,
  configData,
  isUserSubscribed,
  isInActiveUser,
  global_content_group,
  shouldShowPaywall,
  FB_APP_ID,
  FB_CLIENT_TOKEN,
  API_MODE,
  API_KEY,
  APP_KEY,
} from "./src/app_config/AppConstants";
import { Image, Text } from "react-native-elements";
import TvActivation from "./src/pages/user/TvDeviceActivation";
import Wishlist from "./src/pages/user/FavoritesList";
import ViewingHistory from "./src/pages/user/ViewingHistory";
import WhosWatching from "./src/pages/user/ProfileSelector";
import SeriesViewerAlt from "./src/pages/detail/SeriesViewerAlt";
import Orientation from "react-native-orientation-locker";
import { initIap } from "./src/payment/PurchaseHelper";
import WhosWatchingTv from "./src/platform_tv/ProfileSelectorTv";
import HomeScreenTv from "./src/platform_tv/HomeScreenTv";
import DetailsTv from "./src/platform_tv/ContentDetailTv";
import AddProfile from "./src/pages/user/CreateProfile";
import PlaylistViewer from "./src/pages/detail/PlaylistViewer";
import VEncrypt from "./src/core_crypto/CipherVE";
import HomeWhosWatching from "./src/pages/user/ProfileSelectorHome";
import LandScapeTrailerplayer from "./src/pages/TrailerPlayerFullscreen";
import Downloads from "./src/ui_components/sections/DownloadSection";
import ManageDevices from "./src/pages/user/DeviceManager";
import { PermissionsAndroid } from "react-native";
import dynamicLinks from "@react-native-firebase/dynamic-links";
//import {useDispatch, useSelector} from 'react-redux';
//import {getConfig} from './src/state_mgmt/AppCommonSlice';
import auth from "@react-native-firebase/auth";
import { firebase } from "@react-native-firebase/app-check";
import "react-native-url-polyfill/auto";
import { SubscriptionCard } from "./src/pages/user/SubscriptionManager";
import { EventRegister } from "react-native-event-listeners";
import { APP_EVENTS_ } from "./src/app_config/AnalyticsConfig";
import SplashImage from "./src/ui_components/widgets/SplashScreen";
import { PlayInstallReferrer } from "react-native-play-install-referrer";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import RNExitApp from "react-native-exit-app";
import { isRejected } from "@reduxjs/toolkit";
import ToastMessage from "./src/data_models/ToastMessageData";
import { err } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { colors } from "./src/theming/colors";
// import { Settings } from 'react-native-fbsdk-next';

const Stack = createNativeStackNavigator();

// monthly_sub , quarterly_sub , yearly_sub

function App() {
  const [status, setStatus] = useState("splash");
  const [showDashboard, setshowDashboard] = useState(false);
  const [nextscreen, setnextscreen] = useState("HomeScreen");
  //var isDashboard = true

  const [upgradeModalVisible, setUpgradeModalVisible] = useState(true);
  const [upgradeValue, setUpgradeValue] = useState(0);
  const [upgradeDlink, setUpgradeDlink] = useState("");
  const [sessionId, setSessionId] = useState("");
  const { FacebookInfo } = NativeModules;
  const { FbEvents } = NativeModules;

  // const dispatch = useDispatch<any>();
  // const config = useSelector((state : any  )=> state.config);
  // const { configdata, status } = config;

  // const settvconfig = () => {
  //   try {
  //     axios.defaults.timeout = 5000;
  //     if (isTvPlatform()) {
  //       axios.defaults.headers.common["x-api-key"] =
  //         "9zT3MDCpGtkVOnXCdSDmBe55FB7Gq2nV";
  //       Orientation.lockToLandscape();
  //     } else {
  //       axios.defaults.headers.common["x-api-key"] =
  //         "97qcAEaZc2mWP6cdIm03qOfYIy7SoQpM";
  //       Orientation.lockToPortrait();
  //     }
  //   } catch (error) {
  //   }
  // };

  const settvconfig = () => {
    try {
      axios.defaults.timeout = 5000;
      axios.defaults.headers.common["Content-Type"] = "application/json";
      axios.defaults.headers.common["X-App-Key"] = APP_KEY;
      if (isTvPlatform()) {
        Orientation.lockToLandscape();
      } else {
        Orientation.lockToPortrait();
      }
    } catch (error) {}
  };

  useEffect(() => {
    // Settings.setAutoLogAppEventsEnabled(false);

    const eventEmitter = DeviceEventEmitter.addListener(
      "fun1",
      function (data) {
        // handle event and you will get a value in event object, you can log it herec

        try {
          if (data && data.key1) {
            fireVideoTracking(data.key1);
          } else if (data && data.key2) {
            setCurrentPlayingResumeVal(data.key2);
            processWatchHistory(getCurrentPlayingVideo());
          } else if (data && data.key3) {
          }
        } catch (error) {}
      },
    );

    setTimeout(function () {
      try {
        setStatus("loading");
        initApp();
      } catch (error) {}
    }, 2000);

    return () => {
      try {
        if (!__DEV__) {
          RNExitApp.exitApp();
        }
      } catch (error) {}
      try {
        eventEmitter.remove();
      } catch (error) {}
    };
  }, []);

  function initApp() {
    EventRegister.addEventListener(LOCAL_EVENTS.EVENT_UPGRADE_AVAILABLE, () => {
      setUpgradeModalVisible(true);
    });

    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    //SplashScreen.hide();
    //Orientation.lockToPortrait();
    settvconfig();
    initDeviceInfo();

    // intercept and add logging
    // axios.interceptors.request.use(
    //   (request) => {
    //     //   if (!checkTokenExpiry()) {
    //     //     return Promise.reject("Token expired");
    //     // }

    //     if (userProfiles && userProfiles.token && userProfiles.token != "") {
    //       axios.defaults.headers.common["Authorization"] =
    //         "Bearer " + userProfiles.token;
    //       request.headers["Authorization"] = "Bearer " + userProfiles.token; // adding to the current request header
    //     }

    //     const reqst = { header: request.headers, data: request.data };
    //     if (__DEV__) {
    //     }

    //     //const newrequestdata  =  request.data

    //     //const newrequest = {...request , re}

    //     if (request.data && request.data.data) {
    //       request.data.data.storeid = 5;
    //       request.data.data.storever = "1.0";
    //     }

    //     //request.data = {}
    //     if (__DEV__) {
    //     }
    //     if (ENCRYPTION_ENABLED) {
    //       try {
    //         var disableenc = false;
    //         if (request.data.enc && request.data.enc == "false") {
    //           disableenc = true;
    //         }
    //         if (!disableenc) {
    //           const encValue = VEncrypt.encrypt(
    //             "I?IF7t[cR@7B%iYc#yX6A5ztF.2FmH;&",
    //             JSON.stringify(request.data.data)
    //           );
    //           request.data = { data: encValue };
    //         }
    //       } catch (error) {
    //       }
    //     }

    //     if (__DEV__) {
    //     }

    //     return request;
    //   },
    //   (onrejected) => {
    //   }
    // );

    axios.interceptors.request.use(
      (request) => {
        if (userProfiles?.token) {
          request.headers["Authorization"] = "Bearer " + userProfiles.token;
        }
        if (API_MODE === "B") {
          try {
            const timestamp = new Date().toISOString();
            const payloadJson = JSON.stringify(request.data);

            if (__DEV__) {
              console.log(
                "=== REQUEST undecc  ===>",payloadJson
              )}


            const encrypted = VEncrypt.encrypt(VEncrypt.apiSecret, payloadJson);
            request.data = { data: encrypted };
            request.headers["X-API-Key"] = API_KEY;
            request.headers["X-API-Timestamp"] = timestamp;
            request.headers["X-API-Signature"] = VEncrypt.signRequest(
              JSON.stringify(request.data),
              timestamp,
            );
          } catch (error) {}
        }
        if (__DEV__) {
          console.log(
            "=== REQUEST ===>",
            JSON.stringify(
              {
                url: request.url,
                method: request.method,
                headers: request.headers,
                data: request.data,
              },
              null,
              2,
            ),
          );
        }
        return request;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    axios.interceptors.response.use(
      (response) => {
        if (API_MODE === "B" && response.data?.data) {
          try {
            if (typeof response.data.data === "string") {
              const decrypted = VEncrypt.decrypt(
                VEncrypt.apiSecret,
                response.data.data,
              );
              if (decrypted) {
                response.data = JSON.parse(decrypted);
              }
            }
          } catch (error) {}
        }

        try {
          const resultcode =
            response.data?.resultcode ?? response.data?.data?.resultcode;
          if (resultcode == "238") {
            setshowDashboard(false);
            setStatus("successful");
          }
          if (resultcode == "233") {
            EventRegister.emitEvent(LOCAL_EVENTS.EVENT_CHANGE_SCREEN, {});
          }
        } catch (error) {}

        if (__DEV__) {
          console.log(
            "<=== RESPONSE ===",
            JSON.stringify(
              {
                url: response.config?.url,
                status: response.status,
                data: response.data,
              },
              null,
              2,
            ),
          );
        }
        return response;
      },
      (error) => {
        if (__DEV__) {
        }
        return Promise.reject(error);
      },
    );
    // axios.interceptors.response.use(
    //   (response) => {
    //     if (__DEV__) {

    //     }

    //     if (ENCRYPTION_ENABLED) {
    //       try {
    //         var disableenc = false;
    //         if (response.data.enc && response.data.enc == "false") {
    //           disableenc = true;
    //         }

    //         if (!disableenc) {
    //           if (__DEV__) {
    //           }
    //           response.data = {
    //             data: JSON.parse(
    //               VEncrypt.decrypt(
    //                 "I?IF7t[cR@7B%iYc#yX6A5ztF.2FmH;&",
    //                 response.data.data
    //               )
    //             ),
    //           };
    //         }
    //       } catch (error) {
    //       }
    //     }

    //     try {
    //       if (
    //         response &&
    //         response.data &&
    //         response.data.data &&
    //         response.data.data.resultcode == "238"
    //       ) {
    //         setshowDashboard(false);
    //         setStatus("successful");
    //       }
    //     } catch (error) {
    //     }
    //     if (__DEV__) {
    //     }

    //     if (response.data.data.resultcode == "233") {
    //       EventRegister.emitEvent(LOCAL_EVENTS.EVENT_CHANGE_SCREEN, {});
    //     }

    //     return response;
    //   },
    //   (error) => {
    //     // // return { "error": true };
    //     // // return error;
    //     // return getErrorCode(error)
    //   }
    // );

    // intercept and add common headers
    axios.defaults.headers.common["Content-Type"] = "application/json";
    //  axios.defaults.headers.common['Authorization'] = "Bearer 97qcAEaZc2mWP6cdIm03qOfYIy7SoQpM";

    const dataa = getConfigData(null);
    dataa.then((configResp) => {
      try {
        if (configResp) {
          initIap();
          fetchIstallReferrer();

          try {
            const fbAppId = configResp.data.config.facebook.id;
            const fbClientToken = configResp.data.config.facebook.client_token;

            if (fbAppId && fbClientToken) {
              FbEvents.configure(fbAppId, fbClientToken)
                .then(() => {})
                .catch((err) => LogData("failed", err));
            } else {
            }
          } catch (error) {}

          try {
            const { upgradeValue, dlink } = checkAppUpgrade(configResp);

            if (__DEV__) {
            }
            setUpgradeValue(upgradeValue);
            setUpgradeDlink(dlink);
          } catch (error) {}

          const userprofiles = getData(CONST_ALL_PROFILES);
          userprofiles.then((usrProfilesLocal) => {
            try {
              if (
                usrProfilesLocal &&
                usrProfilesLocal &&
                usrProfilesLocal.resultcode &&
                usrProfilesLocal.resultcode == "101"
              ) {
                if (Object.keys(usrProfilesLocal).length !== 0) {
                  setUserProfiles(usrProfilesLocal);

                  const selectedProfile = getData(CONST_SELECTED_PROFILE);
                  selectedProfile.then((selProfile) => {
                    try {
                      if (
                        selProfile != null &&
                        Object.keys(selProfile).length !== 0
                      ) {
                        // some profile is selected
                        setSelectedUserProfile(selProfile);

                        // fetch the privilages :
                        const privilages = getPrivileges();
                        privilages.then((prov) => {
                          try {
                            fetchuserActivity();
                          } catch (error) {
                            LogError(
                              "App initApp configresp getPrivileges catch error",
                              error,
                            );
                          }
                        });
                      } else {
                        // OLD LOGIC (commented out):
                        // // show homewhoiswatching
                        // setnextscreen("HomeWhosWatching");
                        // setshowDashboard(true);
                        // setStatus("successful");

                        // NEW LOGIC: Auto-select first profile
                        if (
                          userProfiles &&
                          userProfiles.profile &&
                          userProfiles.profile.length > 0
                        ) {
                          setSelectedUserProfile(userProfiles.profile[0]);
                          const privilages = getPrivileges();
                          privilages.then((prov) => {
                            try {
                              fetchuserActivity();
                            } catch (error) {
                              LogError(
                                "App initApp auto-select profile getPrivileges catch error",
                                error,
                              );
                            }
                          });
                        } else {
                          // Fallback: No profiles available
                          setnextscreen("HomeWhosWatching");
                          setshowDashboard(true);
                          setStatus("successful");
                        }
                      }
                    } catch (error) {
                      LogError(
                        "App initApp getData CONST_SELECTED_PROFILE catch error",
                        error,
                      );
                    }
                  });
                } else {
                  setshowDashboard(false);
                  setStatus("successful");
                }
              } else {
                setshowDashboard(false);
                setStatus("successful");
              }
            } catch (error) {
              LogError(
                "App initApp getData CONST_ALL_PROFILES catch error",
                error,
              );
            }
          });
        } else {
          // handle failure
          setStatus("failed");
        }
      } catch (error) {
        LogError("App initApp getConfigData catch error", error);
      }
    });
  }

  function setToken() {
    try {
      if (userProfiles && userProfiles.token && userProfiles.token != "") {
        axios.defaults.headers.common["Authorization"] =
          "Bearer " + userProfiles.token;
      }
    } catch (error) {}
  }

  const handleDynamicLink = async (link: any) => {
    try {
      // Check and handle if the link is a email login link
      if (firebaseLoginParams && firebaseLoginParams.email) {
        processLogin(link.url);
      } else {
        // navigate to specific screen
        try {
          const urll = new URL(link.url);
          const myArray = urll.pathname.split("/");
          const type = myArray[2];
          const id = myArray[4];
          const groupid = myArray[5];

          setCurrDeeplinkParam({ id: id, type: type, groupid: groupid });
          EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_DEEPLINK, null);
        } catch (error) {}
      }
    } catch (error) {}
  };

  function processLogin(url: string) {
    try {
      if (
        firebaseLoginParams &&
        firebaseLoginParams.email &&
        url &&
        auth().isSignInWithEmailLink(url)
      ) {
        try {
          const resp = auth().signInWithEmailLink(
            firebaseLoginParams.email,
            url,
          );
          resp
            .then(
              (fireresp) => {
                LogData(
                  "linkkkkk respppp == " +
                    auth().currentUser +
                    ": : " +
                    JSON.stringify(fireresp),
                );
                try {
                  const tokenresp = auth().currentUser?.getIdToken(false);
                  tokenresp?.then((res) => {
                    try {
                      const loginuserrep = firebaseLogin(
                        "email",
                        fireresp,
                        res,
                      );

                      loginuserrep.then((logresp) => {
                        try {
                          EventRegister.emitEvent(
                            LOCAL_EVENTS.EVENT_EMAIL_REGISTRATION,
                            logresp,
                          );
                        } catch (error) {
                          LogError(
                            "App processLogin firebaseLogin logresp catch error",
                            error,
                          );
                        }
                      });
                    } catch (error) {
                      LogError(
                        "App processLogin getIdToken res catch error",
                        error,
                      );
                    }
                  });
                } catch (error) {
                  LogError(
                    "App processLogin signInWithEmailLink fireresp catch error",
                    error,
                  );
                }

                //respppp {"additionalUserInfo":{"isNewUser":true},"user":{"multiFactor":{"enrolledFactors":[]},"metadata":{"lastSignInTime":1710235057278,"creationTime":1710235057278},"photoURL":null,"phoneNumber":null,"tenantId":null,"displayName":null,"emailVerified":true,"isAnonymous":false,"uid":"XPouZVCnR9dWsLDHhprMGajMtei2","email":"kiran.sai1220@gmail.com","providerData":[{"email":"kiran.sai1220@gmail.com","providerId":"password","photoURL":null,"phoneNumber":null,"displayName":null,"uid":"kiran.sai1220@gmail.com"}],"providerId":"firebase"}}
              },
              (onrejected) => {
                // const loading = false;
                EventRegister.emitEvent(
                  LOCAL_EVENTS.EVENT_UPDATE_LOADING_MODAL,
                  { loading: false },
                );
              },
            )
            .catch((error) => {});

          /* You can now navigate to your initial authenticated screen
            You can also parse the `link.url` and use the `continueurl` param to go to another screen
            The `continueurl` would be the `url` passed to the action code settings */
        } catch (e) {}
      } else {
      }
    } catch (error) {}
  }

  async function checkapp() {
    try {
      const { token } = await firebase.appCheck().getToken(true);

      if (token.length > 0) {
      }
    } catch (error) {}
  }

  const getUrlAsync = async () => {
    // Get the deep link used to open the app
    const initialUrl = await Linking.getInitialURL();

    processLogin(initialUrl);
    // The setTimeout is just for testing purpose
  };

  // deeplink procesing
  useEffect(() => {
    try {
      APP_EVENTS_.launch("AndroidPhone");
    } catch (error) {}

    try {
      const rnfbProvider = firebase
        .appCheck()
        .newReactNativeFirebaseAppCheckProvider();
      // 55099704-76D3-40F4-9865-E5E126C40EA9
      rnfbProvider.configure({
        android: {
          provider: __DEV__ ? "debug" : "playIntegrity",

          debugToken: "51ED3718-1C9F-489E-84B5-0697C4955D23",
        },
        apple: {
          provider: __DEV__ ? "debug" : "appAttestWithDeviceCheckFallback",
          debugToken:
            "some token you have configured for your project firebase web console",
        },
        web: {
          provider: "reCaptchaV3",
          siteKey: "unknown",
        },
      });

      const resppppp = firebase.appCheck().initializeAppCheck({
        provider: rnfbProvider,
        isTokenAutoRefreshEnabled: true,
      });
      resppppp.then((x) => {
        try {
          checkapp();
        } catch (error) {
          LogError("App UseEffect firebase resppppp catch error", error);
        }
      });

      Linking.addEventListener("url", (param) => {
        if (!USER_UUID) {
          processLogin(param.url);
        } else {
          LogData("USER_UUID", USER_UUID);
        }
      });

      getUrlAsync();

      dynamicLinks()
        .getInitialLink()
        .then(
          (link) => {
            try {
              if (!USER_UUID) {
                handleDynamicLink(link);
              } else {
                LogData("USER_UUID", USER_UUID);
              }
            } catch (error) {}
          },
          (isRejected) => {},
        )
        .catch((error) => {});

      const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
      return () => {
        unsubscribe();
      };
    } catch (error) {}
  }, []);

  useEffect(() => {
    if (!getSessionId()) {
      generateSessionId();
    }
    const interval = setInterval(() => {
      customerSessionAction();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  function fetchuserActivity() {
    try {
      const userActivity = getUserActivity(
        USER_UUID,
        selectedUserProfile.profileid,
      );
      userActivity.then((res) => {
        // const isSubscribed = isUserSubscribed(global_content_group);
        // const isInactive = isInActiveUser(global_content_group);
        try {
          if (res && res.data) {
            setUseractivityDetails(res.data);
          }
          if (shouldShowPaywall()) {
            setnextscreen("HomeScreen");
            setshowDashboard(true);
            setStatus("successful");
          } else {
            setshowDashboard(true);
            setStatus("successful");
          }
        } catch (error) {}
      });
    } catch (error) {}
  }
  const updateDialog = () => {
    return (
      <>
        {upgradeValue === 1 ? (
          <Modal
            visible={upgradeModalVisible}
            animationType="fade"
            transparent={true}
            statusBarTranslucent
            onRequestClose={() => setUpgradeModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>App Upgrade Available</Text>
                </View>
                <Text style={styles.modalMessage}>
                  A new version is available. Please upgrade to continue using
                  the app.
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => setUpgradeModalVisible(false)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={colors.gradients.disableButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.modalBtn, styles.modalBtnGhost]}
                    >
                      <Text
                        style={[styles.modalBtnText, styles.modalBtnTextGhost]}
                      >
                        Cancel
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => {
                      setUpgradeModalVisible(false);
                      Linking.openURL(upgradeDlink);
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={colors.gradients.primaryButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.modalBtn}
                    >
                      <Text style={styles.modalBtnText}>Upgrade</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        ) : upgradeValue === 2 ? (
          <Modal
            visible={upgradeModalVisible}
            animationType="fade"
            transparent={true}
            statusBarTranslucent
            onRequestClose={() => setUpgradeModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>App Upgrade Required</Text>
                </View>
                <Text style={styles.modalMessage}>
                  This version is no longer supported. Please upgrade now.
                </Text>
                <TouchableOpacity
                  style={{ width: "100%" }}
                  onPress={() => {
                    setUpgradeModalVisible(false);
                    Linking.openURL(upgradeDlink);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={colors.gradients.primaryButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.modalBtnFull}
                  >
                    <Text style={styles.modalBtnText}>Upgrade</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        ) : null}
      </>
    );
  };

  const customerSessionAction = () => {
    try {
      const sessionId = getSessionId();
      if (sessionId) {
        const response = customerSession(
          getFormattedISODateTime(),
          USER_UUID,
          sessionId,
        );

        response.then((x) => {});
      }
    } catch (error) {}
  };

  const navigationui = () => {
    if (isTvPlatform()) {
      return (
        <View style={{ flex: 1, backgroundColor: "#111111" }}>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={`${showDashboard ? "HomeScreen" : "Login"}`}
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Login" component={SignUpScreen} />

              <Stack.Screen name="HomeScreen" component={HomeScreenTv} />
              <Stack.Screen name="SearchScreen" component={SearchScreen} />

              <Stack.Screen name="HomeItem" component={HomeItem} />
              <Stack.Screen
                name="SeriesViewerAlt"
                component={SeriesViewerAlt}
              />
              <Stack.Screen name="PlaylistViewer" component={PlaylistViewer} />
              <Stack.Screen name="clipdetails" component={ClipDetail} />
              <Stack.Screen
                name="videoplayer"
                component={LandScapeVideoplayer}
              />

              <Stack.Screen name="contentlisting" component={ContentListing} />

              <Stack.Screen name="MyAccount" component={MyAccount} />
              <Stack.Screen name="webview" component={OttWebView} />
              <Stack.Screen name="PayWall" component={PayWall} />
              <Stack.Screen name="TvActivation" component={TvActivation} />

              <Stack.Screen name="ViewingHistory" component={ViewingHistory} />
              <Stack.Screen name="Wishlist" component={Wishlist} />
              <Stack.Screen name="WhosWatching" component={WhosWatching} />

              <Stack.Screen name="AddProfile" component={AddProfile} />
              <Stack.Screen name="WhosWatchingTv" component={WhosWatchingTv} />
              <Stack.Screen name="HomeScreenTv" component={HomeScreenTv} />
              <Stack.Screen name="DetailsTv" component={DetailsTv} />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      );
    } else {
      return (
        <SafeAreaProvider>
          <SafeAreaView
            style={{ flex: 1, backgroundColor: "#000000" }}
            edges={["top", "left", "right", "bottom"]}
          >
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName={`${showDashboard ? nextscreen : "Login"}`}
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="Login" component={SignUpScreen} />

                <Stack.Screen name="HomeScreen" component={HomeScreen} />
                <Stack.Screen name="SearchScreen" component={SearchScreen} />

                <Stack.Screen name="HomeItem" component={HomeItem} />
                <Stack.Screen
                  name="SeriesViewerAlt"
                  component={SeriesViewerAlt}
                />
                <Stack.Screen
                  name="PlaylistViewer"
                  component={PlaylistViewer}
                />
                <Stack.Screen name="clipdetails" component={ClipDetail} />
                <Stack.Screen
                  name="videoplayer"
                  component={LandScapeVideoplayer}
                />
                <Stack.Screen
                  name="reelsplayer"
                  component={ReelsPlayerScreen}
                />
                <Stack.Screen
                  name="trailervideoplayer"
                  component={LandScapeTrailerplayer}
                />

                <Stack.Screen
                  name="contentlisting"
                  component={ContentListing}
                />

                <Stack.Screen name="MyAccount" component={MyAccount} />
                <Stack.Screen name="webview" component={OttWebView} />
                <Stack.Screen
                  name="PayWall"
                  component={PayWall}
                  initialParams={{
                    intent: {
                      url: configData || "",
                      title: "Subscription",
                      // contentgroup: ["c3c"],
                      contentgroup: ["c2c"],
                      source: "App",
                    },
                  }}
                />
                <Stack.Screen name="TvActivation" component={TvActivation} />

                <Stack.Screen
                  name="ViewingHistory"
                  component={ViewingHistory}
                />
                <Stack.Screen name="Wishlist" component={Wishlist} />
                <Stack.Screen name="WhosWatching" component={WhosWatching} />
                <Stack.Screen
                  name="HomeWhosWatching"
                  component={HomeWhosWatching}
                />

                <Stack.Screen
                  name="subscriptions"
                  component={SubscriptionCard}
                />

                <Stack.Screen name="AddProfile" component={AddProfile} />
                <Stack.Screen name="ManageDevices" component={ManageDevices} />
              </Stack.Navigator>
            </NavigationContainer>
          </SafeAreaView>
        </SafeAreaProvider>
      );
    }
  };

  function fetchIstallReferrer() {
    try {
      PlayInstallReferrer.getInstallReferrerInfo(
        (installReferrerInfo, error) => {
          if (!error) {
            if (installReferrerInfo != null) {
              console.log(
                "Install_referrer = " + installReferrerInfo.installReferrer
              );
              console.log(
                "Referrer timestamp seconds = " +
                  installReferrerInfo.referrerClickTimestampSeconds
              );
              console.log(
                "Install begin timestamp= " +
                  installReferrerInfo.installBeginTimestampSeconds
              );
              console.log(
                "Referrer timestamp server= " +
                  installReferrerInfo.referrerClickTimestampServerSeconds
              );
              console.log(
                "Install begin timestamp server= " +
                  installReferrerInfo.installBeginTimestampServerSeconds
              );
              console.log(
                "version = " + installReferrerInfo.installVersion
              );
              console.log(
                "Google Play instant = " + installReferrerInfo.googlePlayInstant
              );
              fireInstallReferer(installReferrerInfo);
            }
          } else {
            console.log("Failed to get install referrer info!");
            console.log("Response code: " + error.responseCode);
            console.log("Message: " + error.message);
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Provider store={store}>
        <PaperProvider>
          <StatusBar barStyle={"light-content"} backgroundColor={`#111111`} />

          <>
            {status === "loading" && <LoadingSpinner />}
            {status === "splash" && <SplashImage />}
            {status === "failed" && <EmptyState />}
            {status === "successful" &&
              //isTvPlatform() ? navigationuiTV() :
              navigationui()}

            <View
              style={{
                position: "absolute",
                bottom: "10%",
                alignSelf: "center",
              }}
            >
              <ToastMessage />
            </View>
          </>
        </PaperProvider>
      </Provider>

      {updateDialog()}
    </>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "400",
  },
  highlight: {
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#1c1c1e",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginStart: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 15,
    color: "#a1a1aa",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  modalBtnFull: {
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#e50914",
    alignItems: "center",
  },
  modalBtnGhost: {
    borderWidth: 1,
    borderColor: "#444",
  },
  modalBtnText: {
    fontSize: 15,
    color: "#ffffff",
    fontWeight: "700",
  },
  modalBtnTextGhost: {
    color: "#9ca3af",
  },
});

export default App;
