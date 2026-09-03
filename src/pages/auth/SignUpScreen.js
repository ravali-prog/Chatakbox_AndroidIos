import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, BackHandler, TextInput, Keyboard, ImageBackground, StatusBar, Platform } from "react-native";
import { Input, Button, SocialIcon, Image, Icon } from "react-native-elements";
import { AppleButton, appleAuth } from "@invertase/react-native-apple-authentication";
import CountryPicker from "../../ui_components/overlays/CountrySelector";
import { TouchableOpacity } from "react-native";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import {
  firebaseLogin, getPrivileges, getUserActivity, requestOtp, socialLogin, socialLoginIOS, validateOtp, checkUsername,
  register,
  passwordLogin,
  getUserProfiles,
 
} from '../../state_mgmt/AppCommonSlice';
import CustomModal from "../../data_models/CustomDialogTypes";
import LoadingModal from "../../data_models/LoadingStateTypes";
import { storeData, CONST_ALL_PROFILES, getData } from "../../persistence/AsyncStorage"
import {
  API_URL, LOCAL_EVENTS, LogData, LogError, PAYWALL_URL, TOKEN_EXPIRY, USER_UUID, configData, firebaseLoginParams, getTokenExpiry, logoutCurrentProfile, removeEventListener, setFirebaseLoginParams, setSelectedUserProfile, setTokenExpiry, setUserProfiles, shouldShowPaywall,
  setUseractivityDetails,
} from "../../app_config/AppConstants";
import auth from '@react-native-firebase/auth';
import { EventRegister } from "react-native-event-listeners";
import { APP_EVENTS_ } from "../../app_config/AnalyticsConfig";
import { isRejected } from "@reduxjs/toolkit";
import LoadingSpinner from "../../ui_components/widgets/LoadingSpinner";
import { err } from "react-native-svg";
import SecureCodeInput from "../../ui_components/widgets/SecureCodeInput";
import { device } from "../../app_config/DeviceInfo";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";



var socialLoginType = ""
var deviceId = device.id;

const SignUpScreen = () => {

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [selectedCountry, setSelectedCountry] = useState({ "currency": "INR", "callingCode": "91", "flag": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAMAAABpA6zvAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAqZQTFRF53MA5HIC43ID53MB9XcA+3oA9ngA53QB83cA6XMCpV8oX0hPR0RkSUVlXkdPpF8o53EA428B9ncArmIkL0OAG02vZo3TfJ3agqLcZYzTJFSzLkJ/6X0R6X0S5XsS+IQOl2E+BDqjgJ7X5eny5enz5uv05er05OjyjancCD6llmE+/fXu+/Ps///zvMPUCDefqbre8fP32ODwyNPpwMzmwc3mxNDo1N3u8fL3v8znEj+kucHS/////v//NVuwf5bK9/n7vcrkma3WgZnMf5fLlKnUusjjzdfr+Pn7iZ/OOmCz/f7///7+/Pz9tcPgGUWh4efz2eDwvMrkf5nMXH2+aojDa4jEW3y9gJnMuMbi6u/3Jk+ms8Hf+/z9aofDXn2+9ff70Nrsm6/XXHy+jKPRxNDnxdHol6vVWXq8kqfTz9ns9vj7co3Ga4fD/P3+UHK5dZDI8fT5w8/ngpvNaIbDxM/nvMnku8jkcIzGfZfLws7m8/b6iaDQU3W6dI/H8vT6aIbCu8nkucfjydTpepXK9Pb6UnS67vL4ztfrmKzWWnu9kKbTmK3WW3u9kqjTy9Xq8PP5cY3GbIjD/v/+GEWh4ujz1t7ugZrNbInEfJbL7fH4JlCns8LgOVuxfpbKzNbqlqrUfpbLe5TKytTqj6XRPWCz/v7/8fju7vXt/v/zssXUCTigs8Hi8fT309zuxtHo0Nns7vL2wMznFECkr8LT///0QJkUQJoUPpcVSKIRKHVADDqki6DY4+ny4ujy4Oby4ejyl6ndEj+mJ3Q/LpAAL5AALI4BNZgAJHomD0iAJk6xd47Uip7bjqHceI7VLlW0LY4BM5IEM5MEMZEFNZcAMpMDIXUqDFZQDE9lDlBmDFVQMpIDNpgAOJsANpkAOZsAMZEGMpEFwJ5XlQAAAAFiS0dEPKdqYc8AAAAJcEhZcwAAAEgAAABIAEbJaz4AAAGtSURBVDjLY2AY1oCRiRGICCtjZmFlY2NlYcZQyo4CGDk4ubh5ePn4OTkYUWUYBJCBoJCwiKiYuISklLSwkCCKFIMMAsjKySsoKimrqKqpq2toasnLySJJMmgjgI6unr6BoZGxiamZuYWllbWuDpIkgw0c2NrY2tk7mDk6Obu4url7eHp5A4XggMEHDnxt/PwDAoOCQ0LDwiMi3aOiY2x8EbJIJsbaxMUnJCYlp6SmpWdkZmXn5AKFECYimHk2+QWFRcUlpWXlxhWVVdU1tUAhHArr6k0jGooam5orWkxaa9pwKIy1yY1v7+js6k4t6unt658wcRKK1ZPhINbGb8rUaeXTw0NndM1sMp81e45NLEIWJXhs5s5zmF+2YOGivsjFDkuWLkMJnuUIsGLlqtVr1q5bXxZUumHjps1btq5AkmTYhgDbd+zctXvP3n1T9x/Ye/DQ4Z07tiNJMhxBAkePHT9x8tTpM2fPnT954viFo8hyDBeRwKVLl69cvXb9xs1b125fuXzpErIcw21UcPn2nbv37t2/A2SgAnSFQKUPHj58cBlDGFMhDjAUFAIALMfjyKVz+egAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTMtMTAtMDdUMTM6MTQ6MzQrMDI6MDDj9ijFAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDEzLTEwLTA3VDEzOjE0OjM0KzAyOjAwkquQeQAAAABJRU5ErkJggg==", "name": { "en": "India", "deu": "Indien", "fra": "Inde", "hrv": "Indija", "ita": "India", "jpn": "インド", "nld": "India", "por": "Índia", "rus": "Индия", "spa": "India", "svk": "India", "fin": "Intia", "zho": "印度", "isr": "הודו", "ar": "الهند" } });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [showRegister, setShowRegister] = useState(true);
  const [showOtpOverlay, setShowOtpOverlay] = useState(false);
  const [otp, setOtp] = useState("");
  const [selectedSignupMethod, setSelectedSignupMethod] = useState("phone");
  const [currentScreen, setCurrentScreen] = useState("mobileInput");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false); // New loading state
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(""); // New error state
  const [modalVisible, setModalVisible] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  let otpInterval;

  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [currentId, setCurrentId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isTextDisabled, setIsTextDisabled] = useState(false);
  const [firebasePhoneRequest, setFirebasePhoneRequest] = useState();
  const [onAuthStateParam, setOnAuthStateParam] = useState();
  const [phoneNumberType, setPhoneNumberType] = useState("");
  const [otpLength, setOtpLength] = useState(6);


 const otpInputRefs = React.useRef([]);
  const insets = useSafeAreaInsets();

  const getOtpLength = () => {
    // Firebase phone auth uses 6 digits
    if (selectedSignupMethod === "phone" && phoneNumberType === "firebase") {
      return 6;
    }
    return 4;
  };

  useEffect(() => {
    if (showOtpOverlay) {
      setOtpTimer(30);
      setIsTextDisabled(false);
      setIsResendDisabled(true);

      otpInterval = setInterval(() => {
        setOtpTimer((timer) => {
          if (timer > 0) {
            return timer - 1;
          } else {
            setIsTextDisabled(true);
            setIsResendDisabled(false);
            return 0;
          }
        });
      }, 1000);
    }

    return () => {
      clearInterval(otpInterval);
    };
  }, [showOtpOverlay]);


  const resendOTP = () => {
    setOtpTimer(otpTimer);
    setOtpError("");
    setIsTextDisabled(false);
    setIsResendDisabled(true);
    try {
      // setLoading(true); // Set loading to true

      setLoadingMessage('Resending OTP...');


      if (selectedSignupMethod === "phone") {
        socialLoginType = "phone"
        const phno = "+" + selectedCountry.callingCode + phoneNumber

        const response = requestOtp("mobilenumber", phno, 4);


        response.then((x) => {
          try {
            // setLoading(false); // Set loading to false
            if (x && x.data && x.data.resultcode == "101") {
              setLoading(false); 

              setOtpLength(4);
              //setOtpLength(4);
              setShowOtpOverlay(true);
              setShowRegister(false);
              setCurrentScreen("otpInput");
              setPhoneNumberType("apiresponse")
            } else if (x && x.data && x.data.resultcode == "241") {
              auth().signInWithPhoneNumber(phno).then(phoneresp => {
                try {
                  setLoading(false);
                  setPhoneNumberType("firebase")
                  setOtpLength(6);
                  setFirebasePhoneRequest(phoneresp)
                  setShowOtpOverlay(true);
                  setShowRegister(false);
                  setCurrentScreen("otpInput");
                  setTimeout(
                    () => otpInputRefs.current[0]?.current?.focus(),
                    100
                  );

                } catch (error) {
                  LogError("Registration resesndOTP requestOtp 241 signInWithPhoneNumber phoneresp catch error", error)
                }


              }, onrerejec => {
                setLoading(false); // Set loading to false
                setError("Something went wrong!");
                setModalVisible(true);

                setTimeout(() => {
                  setModalVisible(true);
                }, 300);
              }).catch((error) => {
              setLoading(false);
              })
            }
            else {
              // Handle error response from requestOtp if needed
              setError(x.data.resultmsg);
              setModalVisible(true);

              setTimeout(() => {
                setModalVisible(true);
              }, 300);
            }
          } catch (error) {
            LogError("Registration resendOTP catch error", error)
          }


        });

        const settings = auth().settings;
        if (__DEV__) {

          settings.forceRecaptchaFlowForTesting = true
        }
        //  signInWithPhoneNumber(phno)
      }

    } catch (error) {
      setLoading(false); // Set loading to false
      setError("No response from the server");
      setModalVisible(true);

      setTimeout(() => {
        setModalVisible(true);
      }, 300);
    }
  };

  function ImageMemo({ source, style }) {
    return (
      <Image

        source={source}
        style={style}
        resizeMode="contain"

      />
    );
  }

  const MemoizedImage = React.memo(ImageMemo);



  const [user, setUser] = useState(null);

  useEffect(() => {


    try {


      try {
        if (getTokenExpiry()) {
          tokenExpiry();
        } else {
        }

      } catch (error) {

      }


      try {
        APP_EVENTS_.screen("Login")
      } catch (error) {
      }

      GoogleSignin.configure({
        webClientId: '705960357183-1fe7spdr2uon618osd9u8mq4787kgic9.apps.googleusercontent.com',

        offlineAccess: true,
      });
      const evenid = EventRegister.addEventListener(LOCAL_EVENTS.EVENT_EMAIL_REGISTRATION, (resp) => {
        processLoginResp(resp)
      });


      const updateLoader = EventRegister.addEventListener(LOCAL_EVENTS.EVENT_UPDATE_LOADING_MODAL, (resp) => {
        setLoading(resp.loading)
        // EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE, {"msg":"Link is already used. Please try again for new link."})
        setModalVisible(true)
        // setLoadingMessage(null);
        setError("Verification Link is expired, Please try again with new link");
        // processLoginResp(resp)
      });

      return () => {

        try {

          removeEventListener(updateLoader)

          if (type(evenid) === 'string') {
            EventRegister.removeEventListener(evenid)
          }
          //firebaseAuth()

        } catch (error) {
        }
      }
    } catch (error) {

    }


  }, []);

  var backHandler;
  useEffect(() => {
    backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => {
      backHandler.remove();
    };
  }, [currentScreen]);


const handleBackPress = () => {
  if (currentScreen === "otpInput") {
    setPhoneNumber("");
    setEmail("");
    setOtp("");
    setOtpError("");
    setError("");
    setShowOtpOverlay(false);
    setShowRegister(true);
    setCurrentScreen("mobileInput");
    setFirebasePhoneRequest(null);
    setPhoneNumberType("");
    setOtpTimer(30);
    setIsResendDisabled(true);
    setIsTextDisabled(false);
    return true;
  } else if (
    currentScreen === "passwordInput" ||
    currentScreen === "registration"
  ) {
    setCurrentId("");
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setConfirmPasswordError("");
    setPhoneError("");
    setEmailError("");
    setError("");
    setPhoneNumber("");
    setEmail("");
    setOtp("");
    setOtpError("");
    setOtpTimer(30);
    setIsResendDisabled(true);
    setIsTextDisabled(false);
    setFirebasePhoneRequest(null);
    setPhoneNumberType("");
    
    setCurrentScreen("mobileInput");
    setShowRegister(true);
    return true;
  }

  return false;
};

  const handleOtpKeyPress = (index, key) => {
    if (key === "Backspace") {
      const newOtp = [...otp];

      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // otpInputRefs[index - 1].current?.focus();
        otpInputRefs.current[index - 1]?.current?.focus();
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    // if (value && index < 5) {
    //   otpInputRefs[index + 1].current?.focus();
    // }
    if (value && index < otp.length - 1) {
      otpInputRefs.current[index + 1]?.current?.focus();
    }
  };

    const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      socialLoginType = "google";
      await GoogleSignin.signOut();    
      //setSelectedSignupMethod("google")
      const userInfo = await GoogleSignin.signIn();
      setUser(userInfo);

      //   action : sociallogin , type : google ,

      const googlesigninresult = JSON.parse(JSON.stringify(userInfo));

      const socilaoresult = socialLogin(googlesigninresult);
      socilaoresult.then((x) => {
        try {
          processLoginResp(x);
          //dofinalNavigation(x)
        } catch (error) {
          LogError(
            "Registration handleGoogleSignIn socialLogin catch error",
            error
          );
        }
      });

      // Handle successful sign-in, e.g., send user data to your backend
    } catch (error) {
      setLoading(false);
    }
  };

  async function onAppleButtonPress() {
    setLoading(true);
    const appleAuthRequestResponse = appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });

    appleAuthRequestResponse
      .then((authrep) => {
        if (!authrep.identityToken) {
          throw new Error("Apple Sign-In failed - no identify token returned");
        }

        const { identityToken, nonce } = authrep;
        const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

        const authpromise = auth().signInWithCredential(appleCredential);
        authpromise
          .then((param) => {
            const socilaoresult = socialLoginIOS(authrep, param);
            socilaoresult
              .then(
                (x) => {
                  processLoginResp(x);
                },
                (isRejected) => {
                  setLoading(false);
                  setError("Something went wrong: " + isRejected);
                }
              )
              .catch((err) => {
                setError("Something went wrong!!!!! ");
                setLoading(false);
              });
          })
          .catch((err) => {
            setLoading(false);
            setError("Something went wrong!!! ");
            LogError("Apple Reg", err);
          });
      })
      .catch((err) => {
        setLoading(false);
        LogError("appauth apple catch: ", err);
      });
  }

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }
    return appleAuth.onCredentialRevoked(async () => {});
  }, []);

  // const validatePassword = (pwd) => {
  //   if (pwd.length < 8 || pwd.length > 16) {
  //     return "Password must be 8-16 characters long";
  //   }
  //   if (!/[A-Z]/.test(pwd)) {
  //     return "Password must contain at least one uppercase letter";
  //   }
  //   if (!/[a-z]/.test(pwd)) {
  //     return "Password must contain at least one lowercase letter";
  //   }
  //   if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
  //     return "Password must contain at least one special character";
  //   }
  //   return null;
  // };

  const validatePassword = (pwd) => {
    if (pwd.length < 4 || pwd.length > 16) {
      return "Password must be 4-16 characters long";
    }
    return null;
  };




  const onSelectCountry = (country) => {
    setSelectedCountry(country);
  };


  const validateMobile = (text) => {
    if (!phoneNumber) {
      setPhoneError("Enter Your Mobile Number");
      return false;
    }

    if (phoneNumber.length < 10) {
      setPhoneError("Phone number should be at least 10 digits");
      return false;
    }
    //   let regex = /^\d{10}$/;
    //  if(regex.test(text)){
    //   setPhoneError("Phone number should be at least 10 digits");
    // return false; 
    // }
    return true;
  };

  const validateEmail = (text) => {
    if (!email) {
      setEmailError("Please enter your email address");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    return true;
  };



  

  const onPressProceed = () => {
    setPhoneError("");
    setEmailError("");
    setError("");

    if (selectedSignupMethod === "phone" && !validateMobile(phoneNumber)) {
      return;
    }

    if (selectedSignupMethod === "email" && !validateEmail(email)) {
      return;
    }

    const id =
      selectedSignupMethod === "phone"
        ? "+" + selectedCountry.callingCode + phoneNumber
        : email;
    setCurrentId(id);

    if (selectedSignupMethod === "phone") {
      setLoading(true);
      setLoadingMessage("Sending OTP...");
      socialLoginType = "phone";

      const response = requestOtp("mobilenumber", id, 4);

      response.then((x) => {
        try {
          // setLoading(false);

          if (x && x.data && x.data.resultcode == "101") {
              setLoading(false) 

            setOtpLength(4);
            setPhoneNumberType("apiresponse");
            setShowOtpOverlay(true);
            setShowRegister(false);
            setCurrentScreen("otpInput");

          } else if (x && x.data && x.data.resultcode == "241") {
            const settings = auth().settings;
            if (__DEV__) settings.forceRecaptchaFlowForTesting = true;

            auth().signInWithPhoneNumber(id)
              .then((phoneresp) => {
                try {
                  setLoading(false);
                  setOtpLength(6);
                  setPhoneNumberType("firebase");
                  setFirebasePhoneRequest(phoneresp);
                  setShowOtpOverlay(true);
                  setShowRegister(false);
                  setCurrentScreen("otpInput");
                } catch (e) {
                  setLoading(false);
                  setError("Failed to setup OTP. Try again.");
                  setModalVisible(true);
                }
              })
              .catch((e) => {
                setLoading(false);
                setError(e?.message || "Firebase OTP failed.");
                setModalVisible(true);
              });

          } else {
            // show actual server error message
            const msg = x?.data?.resultmsg || x?.error || "Failed to send OTP.";
            setError(msg);
            setModalVisible(true);
            setLoading(false)
          }
        } catch (e) {
          setLoading(false);
        }
      }).catch((e) => {
        setLoading(false);
        setError("Network error: " + (e?.message || "Check your connection."));
        setModalVisible(true);
      });

    } else if (selectedSignupMethod === "email") {
      // email flow unchanged
      socialLoginType = "email";
      firebaseLoginParams.email = id;
      setLoading(true);
      setLoadingMessage("We have sent a verification email! Please check your inbox.");
      auth()
        .sendSignInLinkToEmail(id, {
          url: "https://chatakbox.com/en/login/",
          handleCodeInApp: true,
          dynamicLinkDomain: "chatakbox.page.link",
        })
        .then(() =>
           LogData("Email verification sent")
      )
        .catch((e) => {
          setLoading(false);
          setError("Verification email failed!");
          setModalVisible(true);
        });
    }
  };


  const onPasswordSubmit = () => {
    setPasswordError("");
    setError("");

    setLoading(true);
    setLoadingMessage("Logging in...");

    const logintype =
      selectedSignupMethod === "phone" ? "mobilenumber" : "email";
    const response = passwordLogin(currentId, logintype, password);

    response
      .then((x) => {
        try {
          processLoginResp(x);
        } catch (error) {
          LogError(
            "Registration onPasswordSubmit passwordLogin catch error",
            error
          );
        }
      })
      .catch((error) => {
        setLoading(false);
        setError("Something went wrong!");
        setModalVisible(true);
      });
  };

  const onRegisterSubmit = () => {
    setPhoneError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setError("");

    if (selectedSignupMethod === "phone" && !validateMobile(phoneNumber)) {
      return; 
    }

    if (selectedSignupMethod === "email" && !validateEmail(email)) {
      return;
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    const id =
      selectedSignupMethod === "phone"
        ? "+" + selectedCountry.callingCode + phoneNumber
        : email;

    setLoading(true);
    setLoadingMessage("Registering...");

    const logintype =
      selectedSignupMethod === "phone" ? "mobilenumber" : "email";
    const response = register(id, logintype, password);

    response
      .then((x) => {
        try {
          processLoginResp(x);
        } catch (error) {
          LogError("Registration onRegisterSubmit register catch error", error);
        }
      })
      .catch((error) => {
        setLoading(false);
        setError("Something went wrong!");
        setModalVisible(true);
      });
  };

  const onLoginWithOtp = () => {
    setPasswordError("");
    setConfirmPasswordError("");
    // setPhoneNumber("");
    setOtpError("");
    setError("");
    // setShowOtpOverlay(false);
    // setShowOtpOverlay(false);
    setShowRegister(false);
    setError("");
    if (selectedSignupMethod === "phone") {
      setLoadingMessage("Sending OTP...");
      socialLoginType = "phone";
      const phno = currentId;

      // const response = requestOtp("mobilenumber", phno);
      const response = requestOtp("mobilenumber", phno, 4);


      response.then((x) => {
        try {
          // setLoading(false);
          if (x && x.data && x.data.resultcode == "101") {
            setOtpLength(4);
            setShowOtpOverlay(true);
            setShowRegister(false);
            setCurrentScreen("otpInput");
            setPhoneNumberType("apiresponse");
          } else if (x && x.data && x.data.resultcode == "241") {
            auth()
              .signInWithPhoneNumber(phno)
              .then(
                (phoneresp) => {
                  try {
                    setLoading(false);
                    setPhoneNumberType("firebase");
                    setOtpLength(6);
                    setFirebasePhoneRequest(phoneresp);
                    setShowOtpOverlay(true);
                    setShowRegister(false);
                    setCurrentScreen("otpInput");
                  } catch (error) {
                    LogError(
                      "Registration onPressProceed requestOtp 241 signInWithPhoneNumber phoneresp catch error",
                      error
                    );
                  }
                },
                (onrerejec) => {
                  setLoading(false);
                  setError("Something went wrong!");
                  setModalVisible(true);
                }
              )
              .catch((error) => {
              });
          } else {
            setError(x.data.resultmsg);
            setModalVisible(true);
          }
        } catch (error) {
          LogError(
            "Registration onPressProceed requestOtp catch error",
            error
          );
        }
      });

      const settings = auth().settings;
      if (__DEV__) {
        settings.forceRecaptchaFlowForTesting = true;
      }
    }
    // Request OTP or send email
    onPressProceedOtp();
  };


  const onPressProceedOtp = () => {
    setLoading(true);

    if (selectedSignupMethod === "phone") {
      setLoadingMessage("Sending OTP...");
      socialLoginType = "phone";
      const phno = currentId;

      const response = requestOtp("mobilenumber", phno, 4);


      response.then((x) => {
        try {
          // setLoading(false);
          if (x && x.data && x.data.resultcode == "101") {
            setLoading(false)
            setShowOtpOverlay(true);
            setOtpLength(4);
            setShowRegister(false);
            setCurrentScreen("otpInput");
            setPhoneNumberType("apiresponse");
          } else if (x && x.data && x.data.resultcode == "241") {
            auth()
              .signInWithPhoneNumber(phno)
              .then(
                (phoneresp) => {
                  try {
                    setLoading(false);
                    setPhoneNumberType("firebase");
                    setOtpLength(6);
                    setFirebasePhoneRequest(phoneresp);
                    setShowOtpOverlay(true);
                    setShowRegister(false);
                    setCurrentScreen("otpInput");
                    setTimeout(
                      () => otpInputRefs.current[0]?.current?.focus(),
                      100
                    );
                  } catch (error) {
                    LogError(
                      "Registration onPressProceed requestOtp 241 signInWithPhoneNumber phoneresp catch error",
                      error
                    );
                  }
                },
                (onrerejec) => {
                  setLoading(false);
                  setError("Something went wrong!");
                  setModalVisible(true);
                }
              )
              .catch((error) => {
              });
          } else {
            setError(x.data.resultmsg);
            setModalVisible(true);
          }
        } catch (error) {
          LogError(
            "Registration onPressProceed requestOtp catch error",
            error
          );
        }
      });

      const settings = auth().settings;
      if (__DEV__) {
        settings.forceRecaptchaFlowForTesting = true;
      }
    } else if (selectedSignupMethod === "email") {
      socialLoginType = "email";
      firebaseLoginParams.email = currentId;
      setLoadingMessage(
        "We have sent an verification email! Please check your inbox."
      );
      auth()
        .sendSignInLinkToEmail(currentId, {
          url: "https://chatakbox.com/en/login/",
          handleCodeInApp: true,
          dynamicLinkDomain: "chatakbox.page.link",
        })
        .then((resp) => {
          try {
          } catch (error) {
            LogError(
              "Registration onPressProceedOtp sendSignInLinkToEmail catch error",
              error
            );
          }
        })
        .catch((error) => {
          setLoading(false);
          setError("Verification email failed!");
          setModalVisible(true);
        });
    }
  };


  function firebaseAuthedUser() {  
    try {


      const tokenresp = auth().currentUser?.getIdToken(false)
      tokenresp?.then(res => {
        if (__DEV__) {
        }

        const loginuserrep = firebaseLogin("mobilenumber", auth().currentUser, res)
        loginuserrep.then(
          x => {
            processLoginResp(x)

          })

      }, onrerejec => {
        setLoading(false); // Set loading to false
        setError("Otp verification failed!!");
        setModalVisible(true);

        setTimeout(() => {
          setModalVisible(true);
        }, 300);
      }).catch((error) => {
        setLoading(false); // Set loading to false
        setError("Otp verification failed!!!");
        setModalVisible(true);

        setTimeout(() => {
          setModalVisible(true);
        }, 300);
      })
    } catch (error) {
      setLoading(false);
    }
  }

  const handleOtpSubmit = () => {

    // setCurrentScreen("exit")
    //  navigation.navigate("Dashboard")
    const expectedLength = getOtpLength();

    setPhoneError("");
    setEmailError("");
    setOtpError("");
    setError("");
    setLoadingMessage("")

    // if (!otp) {
    //   setOtpError("Enter OTP");
    //   return;
    // }

    // if (!/^\d{6}$/.test(otp)) {
    //   setOtpError("Invalid OTP. Please enter a 6-digit numerical code.");
    //   return;
    // }
    if (!otp || otp.length !== expectedLength) {
      setOtpError("Please enter complete OTP");
      return;
    }

    if (!new RegExp(`^\\d{${expectedLength}}$`).test(otp)) {
      setOtpError(
        `Invalid OTP. Please enter a ${expectedLength}-digit numerical code.`
      );
      return;
    }

    try {
      const phno = "+" + selectedCountry.callingCode + phoneNumber
      if (phoneNumberType == "apiresponse") {
        setLoadingMessage('Validating OTP...');
        // Dispatch validateOtp action
        const response = validateOtp("mobilenumber", phno, otp, 4);
        response.then(
          x => {
            try {
              processLoginResp(x)
            } catch (error) {
              LogError("Registration handleOtpSubmit validateOtp catch error", error)
            }

          })

      }
      else if (phoneNumberType == "firebase") {

        if (firebasePhoneRequest == null) {
          setLoading(false); // Set loading to false
          setError("Otp verification failed!!!!");
          setModalVisible(true);

          // setTimeout(() => {
          //   setModalVisible(true);
          // }, 300);
          return
        }

        setLoading(true);
        firebasePhoneRequest.confirm(otp).then(confirmesp => {
          try {
            if (__DEV__) {
            }

            firebaseAuthedUser()

          } catch (error) {
            setLoading(false);

          }

        },
          onrerejec => {
            if (auth().currentUser) {
              firebaseAuthedUser()
              return
            }

            LogData('firebase rejec', onrerejec)
            setLoading(false); // Set loading to false
            setError("Internal error, Try another method");
            setModalVisible(false);

            setTimeout(() => {
              setModalVisible(true);
            }, 300);


          }

        ).catch(error => {
          setLoading(false); // Set loading to false
          setError("Try another method");
          setModalVisible(false);

          setTimeout(() => {
            setModalVisible(true);
          }, 300);
        })

      }
    } catch (error) {
      setLoading(false); // Set loading to false
      setError("Something went wrong!!");
      setModalVisible(true);

      setTimeout(() => {
        setModalVisible(true);
      }, 300);
    }
  };

  function processLoginResp(x) {
    try {
      setLoading(false);
      if (x && x.data && x.data.resultcode) {
        if (x.data.resultcode == "101") {
          try {
            APP_EVENTS_.login("true", socialLoginType);
          } catch (error) {
            setError(error);
          }

          try {
            if (x.data.registered == 1) {
              APP_EVENTS_.complete_registraion(socialLoginType);
            }
          } catch (error) {
          }

          // navigate to the who is watching / dashboard
          dofinalNavigation(x);
        }

        else {
          setError(x.data.resultmsg);
          setModalVisible(true);
          // Handle error response from validateOtp if needed
          setOtpError(x.data.resultmsg); //("Invalid OTP. Please enter a valid OTP.");
        }
      } else {
        setError("Something went wrong");
        setModalVisible(true);
        // Handle error response from validateOtp if needed
        // setOtpError("Invalid OTP. Please enter a valid OTP.");
      }
    } catch (error) {
    }
  }





  function dofinalNavigation(x) {
    try {
      storeData(CONST_ALL_PROFILES, x.data);
      setUserProfiles(x.data);

      // NEW LOGIC: Auto-select first profile and navigate to Dashboard
      if (x.data && x.data.profile && x.data.profile.length > 0) {
        setSelectedUserProfile(x.data.profile[0]); // Auto-select first profile
        const firstProfile = x.data.profile[0];
    setSelectedUserProfile(firstProfile);
    
    // Fetch user-specific data for the selected profile
    const userActivity = getUserActivity(USER_UUID, firstProfile.profileid);
    userActivity.then(res => {
      if (res && res.data) {
        setUseractivityDetails(res.data);
      }
    });
        const privilages = getPrivileges();
        privilages.then((prov) => {
          try {
            setLoading(false);
            setCurrentScreen("exit");
            setFirebaseLoginParams({});
            if (shouldShowPaywall()) {
              navigation.replace("PayWall", {
                intent: {
                  url: configData.data.config.paywallurl,
                  title: "Subscription",
                  // contentgroup: ["c3c"],
                  contentgroup: ["c2c"],
                  source: "App",
                },
              });
            } else {
              navigation.replace("HomeScreen");
            }
          } catch (error) {
            LogError(
              "Registration dofinalNavigation auto-select getPrivileges catch error",
              error
            );
          }
        });
      } else {
        // Fallback: No profiles available
        const privilages = getPrivileges();
        privilages.then((prov) => {
          try {
            setLoading(false);
            setCurrentScreen("exit");
            setFirebaseLoginParams({});
            if (shouldShowPaywall()) {
              navigation.replace("PayWall", {
                intent: {
                  url: configData.data.config.paywallurl,
                  title: "Subscription",
                  // contentgroup: ["c3c"],
                  contentgroup: ["c2c"],
                  source: "App",
                },
              });
            } else {
              navigation.replace("HomeWhosWatching");
            }
          } catch (error) {
            LogError(
              "Registration dofinalNavigation fallback getPrivileges catch error",
              error
            );
          }
        });
      }
    } catch (error) {
    }
  }


  const handleModalClose = () => {
    setOtpError("");
    setError("");
    setModalVisible(false);
  };

  const handleSocialSignup = (method) => {
    setSelectedSignupMethod(method);
  };






  const tokenExpiry = () => {

    try {
      setLoading(true)
      //logoutCurrentProfile()

      const signresp = GoogleSignin.isSignedIn()
      signresp.then(status => {
        try {
          if (status) {
            GoogleSignin.signOut()
            setTokenExpiry(false);

          }
          //logoutCurrentProfile()
          setLoading(false)

        } catch (error) {
          setLoading(false)
          // LogError("Profile logout GoogleSignin catch inside",error)            
        }

      }, onreject => {
        // callLogoutApi()
        // logoutCurrentProfile()
        setLoading(false)


      }).catch(errror => {
        // callLogoutApi()
        // logoutCurrentProfile()
        setLoading(false)


      })

    } catch (error) {
      setLoading(false);
    }
  }

  return (
    <View style={styles.rootContainer}>

      <View style={styles.imageSection}>
        <Image
           source={require("../../../app_assets/pictures/loginBackground.png")}
          style={styles.fullImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)", "#000000"]}
          locations={[0.3, 0.7, 1]}
          style={styles.imageBottomGradient}
        />
      </View>

      <View style={styles.blackSection} />

  <View style={styles.overlayAbsolute} pointerEvents="box-none">
  <LoadingModal visible={loading} message={loadingMessage} />

  <CustomModal
    visible={modalVisible}
    error={error}
    onClose={handleModalClose}
  />

  {showRegister && (
    <View style={styles.formContainer}>

      <Image
        source={require("../../../app_assets/pictures/logoNoBackground.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Image
        source={require("../../../app_assets/pictures/loginScreenText.png")}
        style={styles.bannerImage}
        resizeMode="contain"
      />

      <TouchableOpacity
      activeOpacity={0.9}
        style={styles.googleSignIn}
        onPress={handleGoogleSignIn}
      >
        <View style={signInContainer}>
          <Image
            source={require("../../../app_assets/pictures/pic_03.png")}
            resizeMode="cover"
            style={styles.signInIcons}
          />
          <Text style={styles.googleSignInText}>
            Continue With Gmail
          </Text>
        </View>
      </TouchableOpacity>

      {Platform.OS === "ios" && (
        <>
          <View style={styles.gapForAppleSignIn} />
          <View style={styles.appleSignInWrapper}>
            <AppleButton
              buttonStyle={AppleButton.Style.WHITE}
              buttonType={AppleButton.Type.SIGN_IN}
              style={{ width: "100%", height: 45 }}
              onPress={() => {
                onAppleButtonPress();
              }}
            />
          </View>
        </>
      )}

    </View>
  )}
</View>
    </View>
  );
};

  const signInContainer = {
  margin: 0,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  // borderColor: "#5e5e5e",
  // borderWidth: 1,
  borderRadius: 25,
  padding: 12,
  height: 55,
  marginTop: 5,};

const styles = StyleSheet.create({

  rootContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  imageSection: {
    width: "100%",
    height: "100%",
    // aspectRatio: 1200 / 900, 
    backgroundColor: "#000",
    // marginTop: -StatusBar.currentHeight,
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  imageBottomGradient: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: "60%", 
},
  blackSection: {
    flex: 1,
    backgroundColor: "#000",
  },

overlayAbsolute: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 50,
},

formContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 30,
},

logo: {
  width: 270,
  height: 270,
  marginBottom: 20,
},

// googleSignIn: {
//   width: "100%",
//   maxWidth: 320,
// },

centerLogoContainer: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 50,
  justifyContent: "center",
  alignItems: "center",
},

centerLogo: {
  width: 250,
  height: 250,
},


  formContainerOtp: {
    paddingHorizontal: 30,
    // justifyContent:'center'
  },

  imageStyle: {
    width: 200,
    height: 200,
    alignSelf: "center",
    justifyContent:'center',
    alignItems:'center',
    // marginBottom: 10,
    // backgroundColor:'red'
  },
//   imageStyle: {
//   width: "100%",
//   height: 220,
//   alignSelf: "center",
// },

  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
      //  paddingHorizontal: 30,
    //    width: "100%",
    // paddingBottom: 20,
  },
    titleContainerText: {

       paddingHorizontal: 30,
       width: "100%",
    paddingBottom: 20,
  },
 bannerImage: {
  width: 250,
  height: 40,
  marginBottom: 20,
},
  mainText: {
    marginTop: 20,
    marginBottom: 13,
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },

  inputBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#7B7D7D",
    borderRadius: 35,
    height: 53,
  },
  countryPickerContainer: {
    borderRightWidth: 1,
    borderColor: "#7B7D7D",
  },
  phone: {
    fontSize: 14,
    marginTop: 15,
    paddingBottom: 0,
    paddingStart: 0,
    paddingEnd: 20,
    color: "#fff",
  },
  email: {
    fontSize: 14,
    marginTop: 30,
    paddingRight: 0,
    color: "#fff",
  },
  inputContainer: {
    borderBottomWidth: 0,
  },

  errorText: {
    color: "red",
  },

  proceedButton: {
    margin: 0,
    padding: 15,
    backgroundColor: "#fd7f0c",
    borderRadius: 35,
    marginVertical: 10,
  },
  proceedText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    color: "#fff",
  },
  submitButton: {
    margin: 0,
    padding: 15,
    backgroundColor: "#fd7f0c",
    borderRadius: 35,
    marginVertical: 10,
  },
  SubmitText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    color: "#fff",
  },

  orRow: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  // googleSignIn: { borderRadius: 35, width: "100%" },
  // googleSignInText: { color: "#fff" },
   googleSignIn: { backgroundColor: "#fff", width: "85%", borderRadius: 35,  },
  googleSignInText: { color: "#000" , fontWeight:'700', fontSize:18, textAlign:'center'},
  gapForAppleSignIn: { padding: 10 },
  appleSignInWrapper: { width: "85%", borderRadius: 35 },
  mobileSignIn: { borderRadius: 35, width: "100%" },
  mobileSignInText: { color: "#fff" },
  signInIcons: { width: 20, height: 20, marginRight: 20 },
  signInIconsGoogle: { width: 25, height: 25, marginRight: 20 },
  gapForSignIn: { padding: 10 },




  resendContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 10,
  },
  TimeRemaining: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  resendButton: {},
  disabledResendButton: { opacity: 0.5 },
  ResendText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    textDecorationLine: "underline",
  },

  eyeIconButton: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: "#fff",
  },
});

export default SignUpScreen;