import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  BackHandler,
  DeviceEventEmitter,
  Modal,
  Platform,
  AppState
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { getPaymentConfig, getPrivileges, notifyTransaction } from '../../state_mgmt/AppCommonSlice'
import { API_KEY, EVENT_SUBSCRIPTION, LOCAL_EVENTS, LogData, LogError, USER_UUID } from '../../app_config/AppConstants'
import { invokeRazorpay, subscribe, subscribewithsku, purchaseIOS } from '../../payment/PurchaseHelper';
import CustomModal from '../../data_models/CustomDialogTypes';
import ConfirmModal from '../../data_models/ConfirmationTypes';
//import LoadingSpinner from '../../ui_components/widgets/LoadingSpinner';
import { EventRegister } from 'react-native-event-listeners';
import { APP_EVENTS_, recordEvent } from '../../app_config/AnalyticsConfig';
import { getData, removeData, storeData, TRANSACTION_HISTORY } from '../../persistence/AsyncStorage';
import Razorpay from "react-native-customui";
import { Linking } from 'react-native';
import SendIntentAndroid from 'react-native-send-intent';
import Loader from '../../ui_components/widgets/LoadingSpinner';



const PayWall = ({ route }) => {

  const navigation = useNavigation();
  const [url, seturl] = useState("");
  const [title, setTitle] = useState("");
  const [timeout, settimeout] = useState(-1);
  const [razorpayTransactionResponse, setRazorpayTransactionResponse] = useState(undefined);
  const [googleTransactionResponse, setgoogleTransactionResponse] = useState(undefined);
  const [paymentConfig, setpaymentConfig] = useState(undefined);
  const [exitmodalvisibility, setexitmodalvisibility] = useState(false);
  const [showLoading, setshowLoading] = useState(false);
  const [txnHistory, setTxnHistory] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [source, setSource] = useState('other');
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [showPaymentText, setShowPaymentText] = useState(false);



  var backHandler;
  useEffect(() => {

    try {
      APP_EVENTS_.screen("PayWall")
    } catch (error) {
    }

    try {
      backHandler = BackHandler.addEventListener(
        "hardwareBackPressPaywall",
        handleBackPress
      );


      return () => {
        backHandler.remove();
      };

    } catch (error) {

    }




  }, []);


  const handleBackPress = () => {
    setexitmodalvisibility(true)

    return true;


  };


  useEffect(() => {
    if (razorpayTransactionResponse != undefined) {
      setshowLoading(true)
      let timer = setTimeout(() => {
        notifyRazorpayTxn(razorpayTransactionResponse)
      }, 60000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [razorpayTransactionResponse]);


  useEffect(() => {

    try {
      getData(TRANSACTION_HISTORY).then((history) => {
        try {
          if (history && history.length > 0) {
            setModalVisible(true);
            processPreviousTransactions(history);
          }
          else {
            setTxnHistory(true)
            getPaywallUrl()
          }
        } catch (error) {
        LogError("Paywall getData TRANSACTION_HISTORY catch inside",error)          
        }
      });
    } catch (error) {
      LogError("Paywall getData TRANSACTION_HISTORY catch outside",error)          
    }
  }, [route]);

  const resolvePaywallUri = (payload) => {
    if (typeof payload === 'string' && /^https?:\/\//i.test(payload.trim())) {
      return payload.trim();
    }
    if (payload && typeof payload === 'object') {
      const candidates = [payload.paywall, payload.url, payload.paywallurl];
      for (const candidate of candidates) {
        if (typeof candidate === 'string' && /^https?:\/\//i.test(candidate.trim())) {
          return candidate.trim();
        }
      }
    }
    return '';
  };

  const getPaywallUrl = () => {
    if (route.params) {
      const { intent } = route.params;

      // intent.onPaymentCallbackfunc();

      if (intent) {

        setTitle(intent.title)
        setSource(intent.source)
        setshowLoading(true)
        const resp = getPaymentConfig(intent.url, USER_UUID, intent.contentgroup)
        // const paywallurl = resp.data.data.paywallurl
        if (resp) {
          resp.then(x => {
            try {
              const resolved = resolvePaywallUri(x);
              if (resolved) {
                seturl(resolved);
              } else {
                setshowLoading(false)
                LogError("Paywall getPaywallUrl invalid paywall uri", x);
              }
              // setTxnHistory(true)
            } catch (error) {
              setshowLoading(false)
              LogError("Paywall getPaywallUrl getPaymentConfig catch",error)          
            }
          })
        } else {
          setshowLoading(false)
        }

      }
    }
  }

  const processPreviousTransactions = (history) => {
    try {
      let promises = history.map((transaction) => {
        const { notifyurl, txndata } = transaction;
        return notifyTransaction(notifyurl, USER_UUID, txndata);
      });
  
      Promise.all(promises)
        .then((results) => {
          try {
            setModalVisible(false); // Close the modal
    
            // Use removeData from AsyncStore.js
            removeData(TRANSACTION_HISTORY)
              .then(() => {
                setTxnHistory(true); // Show the WebView
                getPaywallUrl(); // Proceed to display the WebView
              })
              .catch((error) => {
                setTxnHistory(true);
                getPaywallUrl();
              });
          } catch (error) {
            LogError("Paywall processPreviousTransactions notifyTransaction catch inside",error)            
          }
        })
        .catch((error) => {
          setModalVisible(false);
          setTxnHistory(true);
          getPaywallUrl();
        });
    } catch (error) {
      LogError("Paywall processPreviousTransactions notifyTransaction catch outside",error)            
      setModalVisible(false);
      setTxnHistory(true);
      getPaywallUrl();
    }
  };
  

  var partnerpagecalled = true

  function notifyRazorpayTxn(result) {
    try {
      const notifyurl = paymentConfig.notifyurl + "&action=orderupdate"

      if (result) {
        const resultfromrazor = {
          "mode": paymentConfig.mode,
          "result": result
        }

        const notifyresp = notifyTransaction(notifyurl, USER_UUID, resultfromrazor)
        notifyresp.then(x => {
          try {
  
  
            if (x) {
              setshowLoading(false)
              setShowPaymentText(false);
              const result = x.data.result
              if (result) {
                if (result.resultcode == 101) {
                  // success 
                  sendDataToWebView(1)
  
                } else if (result.resultcode == 102) {
                  sendDataToWebView(0)
                  // result.resultdesc use this 
                } else {
  
                }
              }
            } else {
              sendDataToWebView(0)
              // fail condition
            }
          } catch (error) {
            LogError("Paywall notifyRazorpayTxn notifyTransaction catch inside",error)               
          }

        });
      } else {
        const resultfromrazor = {
          "mode": paymentConfig.mode,
          "result": { error: "invalid razorpay result" }
        }

        notifyTransaction(notifyurl, USER_UUID, resultfromrazor)
      }
    } catch (error) {
      LogError("Paywall notifyRazorpayTxn notifyTransaction catch outside",error)               
    }
  }


  var counter = 0;
  const maxRetries = 5;




  function notifyGooglePLayTxn(subDetails, result, receiptDownloadCallback) { 
    try {
      setshowLoading(true);
setShowPaymentText(true);
      const notifyurl = subDetails.notifyurl + "&action=orderupdate"; 

      function makeTransactionCall() {
        // if (counter >= maxRetries) {
        //   storeFailedTransaction(notifyurl, resultfromrazor);
        //   return;
        // }

        if (counter >= maxRetries) {
  setshowLoading(false);
  setShowPaymentText(false);
  storeFailedTransaction(notifyurl, resultfromrazor);
  sendDataToWebView(0);
  return;
}

        const resultfromrazor = {
          "mode": subDetails.mode,
          "result": result || { error: "invalid razorpay result" }
        };
        // setshowLoading(true);
        const notifyresp = notifyTransaction(
  notifyurl, 
  USER_UUID, 
  resultfromrazor,
  { "X-API-Key": API_KEY } 
);

        notifyresp.then(x => {
          try {
            // setshowLoading(false);
            setShowPaymentText(false);
  
            if (x) {
              const result = x.data;
              if (result && result.resultcode == 101) {
                if (receiptDownloadCallback) {
                  receiptDownloadCallback(1, false);
                }
                sendDataToWebView(1);
                setshowLoading(false);

              } else {
                counter++;
                if (counter < maxRetries) {
                  setTimeout(makeTransactionCall, 10000); // Optional: delay before retry
                } 
                
          else {
  setshowLoading(false);
  setShowPaymentText(false);
  storeFailedTransaction(notifyurl, resultfromrazor);
  sendDataToWebView(0);
}
              }
            } else {
              counter++;
              if (counter < maxRetries) {
                setTimeout(makeTransactionCall, 10000);
              } 
              
         else {
  setshowLoading(false);
  setShowPaymentText(false);
  storeFailedTransaction(notifyurl, resultfromrazor);
  sendDataToWebView(0);
}
            }
            
          } catch (error) {
            LogError("Paywall notifyGooglePLayTxn makeTransactionCall notifyTransaction catch inside",error)                 
          }
        }).catch(error => {
          // Retry on error
          counter++;
          if (counter < maxRetries) {
            setTimeout(makeTransactionCall, 2000);
      } else {
  setshowLoading(false);
  setShowPaymentText(false);
  sendDataToWebView(0);
}
        });
      }
      setTimeout(makeTransactionCall, 10000);

    } catch (error) {
      LogError("Paywall notifyGooglePLayTxn makeTransactionCall notifyTransaction catch outside",error)                 
    }
  }

  function notifyIOSPLayTxn(subDetails, result, receiptDownloadcalback) { 
    try {
      setshowLoading(true);
      setShowPaymentText(true);
      const notifyurl = subDetails.notifyurl + "&action=orderupdate"; 

      if (result && result.success === false) {
        setshowLoading(false);
        setShowPaymentText(false);
        return;
      }

      const resultfromrazor = {
        "mode": subDetails.mode,
        "result": result || { error: "invalid apple result" }
      };

      const notifyresp = notifyTransaction(notifyurl, USER_UUID, resultfromrazor);
      notifyresp.then(x => {
        try {
          setshowLoading(false);
          setShowPaymentText(false);

          if (x) {
            const result = x.data;
            if (result && result.resultcode == 101) {
              if (receiptDownloadcalback) {
                receiptDownloadcalback(1, false);
              }
              sendDataToWebView(1);
            } else if (result && result.resultcode == 102) {
              if (receiptDownloadcalback) {
                receiptDownloadcalback(1, false);
              }
              sendDataToWebView(0);
            } else {
              sendDataToWebView(0);
            }
          } else {
            sendDataToWebView(0);
          }
        } catch (error) {
          LogError("Paywall notifyIOSPLayTxn notifyTransaction catch inside",error)
        }
      }).catch(error => {
        setshowLoading(false);
        setShowPaymentText(false);
        sendDataToWebView(0);
      });
    } catch (error) {
      LogError("Paywall notifyIOSPLayTxn notifyTransaction catch outside",error)
    }
  }

  function storeFailedTransaction(notifyurl, resultfromrazor) {
    // Get the existing transaction history
    try {
      getData(TRANSACTION_HISTORY)
        .then((currentHistory) => {
          try {
            let transactionHistory = currentHistory ? currentHistory : [];
    
            // Add the new failed transaction to the history array
            const newTransaction = {
              notifyurl: notifyurl,
              txndata: resultfromrazor
            };
    
            transactionHistory.push(newTransaction);
    
            // Store the updated transaction history
            storeData(TRANSACTION_HISTORY, transactionHistory)
              .then(() => {
                try {
                  
                } catch (error) {
                  LogError("Paywall storeFailedTransaction storeData TRANSACTION_HISTORY catch inside",error)                         
                }
              })
              .catch((error) => {
              });
            
          } catch (error) {
            LogError("Paywall storeFailedTransaction getData TRANSACTION_HISTORY catch inside",error)                     
          }
        })
        .catch((error) => {
        });
    } catch (error) {
      LogError("Paywall storeFailedTransaction getData TRANSACTION_HISTORY catch outside",error)                     

    }
  }

  function fetchprivilages() {
    try {
      setshowLoading(true)
      const privilages = getPrivileges()
      privilages.then(prov => {
        try {
          setshowLoading(false)
          const { intent } = route.params;
          EventRegister.emitEvent(LOCAL_EVENTS.EVENT_SUBSCRIPTION, {})
            if(source == "App"){
navigation.replace("HomeScreen")
    }else{
      setexitmodalvisibility(false)
      navigation.goBack()
    }
          // intent.onPaymentCallbackfunc();
          // navigation.goBack();
        } catch (error) {
          LogError("Paywall fetchprivilages getData getPrivileges catch inside",error)                      
        }
      })
    } catch (error) {
      LogError("Paywall fetchprivilages getData getPrivileges catch outside",error)                      
    }
  }


  function onMessage(data) {
    console.log("RAZORPAY_DEBUG :: onMessage called :: " + JSON.stringify(data?.nativeEvent?.data));

    try {
      if (data && data.nativeEvent && data.nativeEvent.data) {
        const paramData = JSON.parse(data.nativeEvent.data);
        if (paramData.action == "closepaywall") {

          fetchprivilages()

        } else if (paramData.action == "closeandprocess") {

          fetchprivilages()



        } 

if (paramData.action == "events") {

    try {

        const eventName = paramData.eventname;
        const eventdata = paramData.eventdata;


        recordEvent(eventName, eventdata);


    } catch (e) {
        LogData("6", e);
    }
}
        else {

          setpaymentConfig(paramData)

          if (paramData && paramData.mode) {

            if (paramData.mode == 'RAZORPAY') {

              if (partnerpagecalled) {
                partnerpagecalled = false
                    const options = paramData.options;
                        const transformed = transformRazorpayOptions(options);

                const callback = (result) => {

                  try {
                      setShowPaymentText(true);
                      setshowLoading(true);
                    setRazorpayTransactionResponse(result)

                  } catch (error) {
                  }

                }


               hasUpiApps().then((upiAvailable) => {
                 if (upiAvailable) {
                   LogData("Razorpay.open CALLLED");

                   Razorpay.open(transformed)
                     .then((data) => {
                       LogData("Payment success:", data);
                       callback(data);
                     })
                     .catch((error) => {
                       LogData("Payment failed:", error);
                       callback({ error });
                     });
                 } else {
                   LogData("nvokeRazorpay CALLLED");

                  //  invokeRazorpay(options, callback);
                  invokeRazorpay(transformed, callback);
                 }
               });

                // invokeRazorpay(paramData.options, callback)
              }

            } else if (paramData.mode == 'GOOGLEPLAY') { 
              if (partnerpagecalled) {
                partnerpagecalled = false

                // const billingCallback = (googleSubDetails, receipt, receiptDownloadcalback) => {
                //   notifyGooglePLayTxn(googleSubDetails, receipt, receiptDownloadcalback)
                // }

                const billingCallback = (
  googleSubDetails,
  receipt,
  receiptDownloadcalback 
) => {

  if (receipt?.success === false) {
    setshowLoading(false);
    setShowPaymentText(false);
    return;
  }

  notifyGooglePLayTxn(
    googleSubDetails,
    receipt,
    receiptDownloadcalback
  );
};

                subscribewithsku(paramData, billingCallback)
              }

            } else if (paramData.mode == 'APPLEPAY') { 
              if (partnerpagecalled) {
                partnerpagecalled = false

                const billingCallback = (
  iosSubDetails,
  receipt,
  receiptDownloadcalback 
) => {

  if (receipt?.success === false) {
    setshowLoading(false);
    setShowPaymentText(false);
    return;
  }

  notifyIOSPLayTxn(
    iosSubDetails,
    receipt,
    receiptDownloadcalback
  );
};

                purchaseIOS(paramData, billingCallback)
              }

            }
          } else {
            // fail condition
          }



        }



      } else {
        // handle error params not passed
      }
    } catch (e) {
    }

    // alert(data.nativeEvent.data);
  }

  async function hasUpiApps() {
  try {
    return await Linking.canOpenURL("upi://pay"); 
  } catch (e) {
    return false;
  }
}

// function transformRazorpayOptions(original) {
//   return {
//     currency: original.currency,
//     amount: original.amount,
//     key_id: original.key,
//     method: "upi",
//     description: original.description.toString(),
//     subscription_id: original.subscription_id,
//     "_[flow]": "intent",

//     contact: original?.prefill?.contact || "",
//     email: original?.prefill?.email || "",

//     notes: original.notes
//   };
// }

function transformRazorpayOptions(original) {
  const result = {
    currency: original.currency,
    amount: original.amount,
    key_id: original.key,
    description: original.description ? original.description.toString() : '',
    contact: original?.prefill?.contact || "",
    email: original?.prefill?.email || "",
    notes: original.notes
  };
  if (original.subscription_id) {
    result.subscription_id = original.subscription_id;
    result.method = "upi";
    result["_[flow]"] = "intent";
  } else if (original.order_id) {
    result.order_id = original.order_id;
  }
  return result;
}


  function sendDataToWebView(status) {
    const syncdata = { "action": "synctxn", "status": status }
    webviewRef.current.postMessage(JSON.stringify(syncdata));
  }


  const handleModalClose = () => {
      setexitmodalvisibility(false)


  };

  const handleModalConfirm = () => {

    if(source == "App"){
navigation.replace("HomeScreen")
    }else{
    setexitmodalvisibility(false)
    fetchprivilages()
    }

  };

  function extractFallbackUrl(intentUrl) {
  try {
    const fallbackMatch = intentUrl.match(/S\.browser_fallback_url=([^;]+)/);
    if (fallbackMatch && fallbackMatch[1]) {
      const decodedUrl = decodeURIComponent(fallbackMatch[1]);
      return decodedUrl;
    }
  } catch (e) {
  }
  return null;
}


  const webviewRef = useRef();
  const appWasOpenedRef = useRef(false); // ← add this line


  return (
    <SafeAreaView style={{ flex: 1 }}>
      { /* <View style={styles.header}  >
            <TouchableOpacity onPress={handleBackPress}>
              <Image
                source={require('../../../app_assets/symbols/sym_06.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>
        <Text style={styles.headerText}>{title}</Text>
  </View> */ }
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}>
          <View style={{ padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
            <Text>Fetching previous transactions...</Text>
            <Loader />
          </View>
        </View>
      </Modal>
      {txnHistory && !!url && (
        <WebView
          ref={webviewRef}
          scalesPageToFit={false}
          mixedContentMode="compatibility"
          setSupportMultipleWindows={false} 
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
          allowsInlineMediaPlayback={true}
          onMessage={onMessage}
          startInLoadingState={true}
          originWhitelist={['*']} 
onShouldStartLoadWithRequest={(request) => {
  const requestUrl = request.url || '';

  if (Platform.OS === 'android' && (requestUrl.startsWith('intent://') || requestUrl.startsWith('upi://'))) {
    let fallbackUrl = null;

    try {
      const match = requestUrl.match(/S\.browser_fallback_url=([^;]+)/);
      if (match && match[1]) {
        fallbackUrl = decodeURIComponent(match[1]);
      }
    } catch (e) {
    }

    // Reset before each attempt
    appWasOpenedRef.current = false;

    try {
      SendIntentAndroid.openChromeIntent(requestUrl);
    } catch (e) {
    }

    if (fallbackUrl) {
      const sub = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'background' || nextState === 'inactive') {
          appWasOpenedRef.current = true;
          sub.remove();
        }
      });

      setTimeout(() => {
        sub.remove();
        if (!appWasOpenedRef.current) {
          if (webviewRef.current) {
            webviewRef.current.injectJavaScript(`
              window.location.href = "${fallbackUrl}";
              true;
            `);
          }
        }
      }, 5000);
    }

    return false;
  }

  // Allow normal web / blank loads through the WebView
  if (
    requestUrl.startsWith('http://') ||
    requestUrl.startsWith('https://') ||
    requestUrl.startsWith('about:')
  ) {
    return true;
  }

  // Custom schemes (upi://, phonepe://, etc.) fail with NSURLErrorDomain on iOS if left in WKWebView
  Linking.openURL(requestUrl).catch(() => {});
  return false;
}}
          onLoadStart={()=>{
            setshowLoading(true) 
          }}
          onLoadProgress={
           
            () =>{ 
             // setshowLoading(true) 
            }
          }
          onLoad={() => {
            setshowLoading(false)
            //  webviewRef.current.postMessage("synctxn");
          }}

          onLoadEnd={()=>{
             setshowLoading(false)
          }}

          javaScriptEnabled
          onError={(syntheticEvent) => {
            setshowLoading(false)
            const { nativeEvent } = syntheticEvent || {};
            LogError("Paywall WebView onError", nativeEvent || syntheticEvent)
          }}

          source={{ uri: url }}
        />
      )}


      <ConfirmModal
        visible={exitmodalvisibility}
        loading={false}
        message={"Are you sure you want to go back?"}
        error={""}
        onConfirm={handleModalConfirm}
        onDismiss={handleModalClose}
      />
      <>
{showLoading && (
  <View
    style={{
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      position: 'absolute',
      height: '100%',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 30,
    }}
  >
    <Loader/>

    {showPaymentText && (
      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <Text style={styles.waitText}>Please wait</Text>

        <Text style={styles.subText}>
          Loading..it will take few seconds.
        </Text>

        <Text style={styles.warningText}>
          Do not go back.
        </Text>
      </View>
    )}
  </View>
)}

      </>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#222222',
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  }
  ,
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  waitText: {
  color: '#ffffff',
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 6,
},

subText: {
  color: '#ffffff',
  fontSize: 14,
  textAlign: 'center',
  marginBottom: 6,
  opacity: 0.9,
},

warningText: {
  color: '#ffffff',
  fontSize: 13,
  textAlign: 'center',
  opacity: 0.8,
},
});

export default PayWall;

 

//  import React, { useRef, useState, useEffect } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   Image,
//   Alert,
//   BackHandler,
//   DeviceEventEmitter,
//   Modal,
//   Platform,
//   AppState
// } from 'react-native';
// import { WebView } from 'react-native-webview';
// import { useNavigation } from '@react-navigation/native';
// import { getPaymentConfig, getPrivileges, notifyTransaction } from '../../state_mgmt/AppCommonSlice'
// import { API_KEY, EVENT_SUBSCRIPTION, LOCAL_EVENTS, LogData, LogError, USER_UUID } from '../../app_config/AppConstants'
// import { invokeRazorpay, subscribe, subscribewithsku } from '../../payment/PurchaseHelper';
// import CustomModal from '../../data_models/CustomDialogTypes';
// import ConfirmModal from '../../data_models/ConfirmationTypes';
// //import LoadingSpinner from '../../ui_components/widgets/LoadingSpinner';
// import { EventRegister } from 'react-native-event-listeners';
// import { APP_EVENTS_, recordEvent } from '../../app_config/AnalyticsConfig';
// import { getData, removeData, storeData, TRANSACTION_HISTORY } from '../../persistence/AsyncStorage';
// import Razorpay from "react-native-customui";
// import { Linking } from 'react-native';
// import SendIntentAndroid from 'react-native-send-intent';
// import Loader from '../../ui_components/widgets/LoadingSpinner';



// const PayWall = ({ route }) => {

//   const navigation = useNavigation();
//   const [url, seturl] = useState("");
//   const [title, setTitle] = useState("");
//   const [timeout, settimeout] = useState(-1);
//   const [razorpayTransactionResponse, setRazorpayTransactionResponse] = useState(undefined);
//   const [googleTransactionResponse, setgoogleTransactionResponse] = useState(undefined);
//   const [paymentConfig, setpaymentConfig] = useState(undefined);
//   const [exitmodalvisibility, setexitmodalvisibility] = useState(false);
//   const [showLoading, setshowLoading] = useState(false);
//   const [txnHistory, setTxnHistory] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [source, setSource] = useState('other');
//     const [selectedPackage, setSelectedPackage] = useState(null);
//     const [showPaymentText, setShowPaymentText] = useState(false);

//   // BUG 1 & 3 FIX: these must be refs declared inside the component,
//   // not module-level "var" declarations, so they persist correctly
//   // across renders without ever getting permanently stuck.
//   const partnerpagecalled = useRef(true);
//   const webviewRef = useRef();
//   const appWasOpenedRef = useRef(false);



//   var backHandler;
//   useEffect(() => {

//     try {
//       APP_EVENTS_.screen("PayWall")
//     } catch (error) {
//     }

//     try {
//       backHandler = BackHandler.addEventListener(
//         "hardwareBackPressPaywall",
//         handleBackPress
//       );


//       return () => {
//         backHandler.remove();
//       };

//     } catch (error) {

//     }




//   }, []);


//   const handleBackPress = () => {
//     setexitmodalvisibility(true)

//     return true;


//   };


//   useEffect(() => {
//     if (razorpayTransactionResponse != undefined) {
//       setshowLoading(true)
//       let timer = setTimeout(() => {
//         notifyRazorpayTxn(razorpayTransactionResponse)
//       }, 60000);
//       return () => {
//         clearTimeout(timer);
//       };
//     }
//   }, [razorpayTransactionResponse]);


//   useEffect(() => {

//     try {
//       getData(TRANSACTION_HISTORY).then((history) => {
//         try {
//           if (history && history.length > 0) {
//             setModalVisible(true);
//             processPreviousTransactions(history);
//           }
//           else {
//             setTxnHistory(true)
//             getPaywallUrl()
//           }
//         } catch (error) {
//         LogError("Paywall getData TRANSACTION_HISTORY catch inside",error)          
//         }
//       });
//     } catch (error) {
//       LogError("Paywall getData TRANSACTION_HISTORY catch outside",error)          
//     }
//   }, [route]);

//   const getPaywallUrl = () => {
//     if (route.params) {
//       const { intent } = route.params;

//       // intent.onPaymentCallbackfunc();

//       if (intent) {

//         setTitle(intent.title)
//         setSource(intent.source)
//         const resp = getPaymentConfig(intent.url, USER_UUID, intent.contentgroup)
//         // const paywallurl = resp.data.data.paywallurl
//         if (resp) {
//           resp.then(x => {
//             try {
//               seturl(x)
//               // setTxnHistory(true)
//             } catch (error) {
//               LogError("Paywall getPaywallUrl getPaymentConfig catch",error)          
//             }
//           })
//         }

//       }
//     }
//   }

//   const processPreviousTransactions = (history) => {
//     try {
//       let promises = history.map((transaction) => {
//         const { notifyurl, txndata } = transaction;
//         return notifyTransaction(notifyurl, USER_UUID, txndata);
//       });
  
//       Promise.all(promises)
//         .then((results) => {
//           try {
//             setModalVisible(false); // Close the modal
    
//             // Use removeData from AsyncStore.js
//             removeData(TRANSACTION_HISTORY)
//               .then(() => {
//                 setTxnHistory(true); // Show the WebView
//                 getPaywallUrl(); // Proceed to display the WebView
//               })
//               .catch((error) => {
//                 setTxnHistory(true);
//                 getPaywallUrl();
//               });
//           } catch (error) {
//             LogError("Paywall processPreviousTransactions notifyTransaction catch inside",error)            
//           }
//         })
//         .catch((error) => {
//           setModalVisible(false);
//           setTxnHistory(true);
//           getPaywallUrl();
//         });
//     } catch (error) {
//       LogError("Paywall processPreviousTransactions notifyTransaction catch outside",error)            
//       setModalVisible(false);
//       setTxnHistory(true);
//       getPaywallUrl();
//     }
//   };


//   function notifyRazorpayTxn(result) {
//     try {
//       const notifyurl = paymentConfig.notifyurl + "&action=orderupdate"

//       if (result) {
//         const resultfromrazor = {
//           "mode": paymentConfig.mode,
//           "result": result
//         }

//         const notifyresp = notifyTransaction(notifyurl, USER_UUID, resultfromrazor)
//         notifyresp.then(x => {
//           try {
  
  
//             if (x) {
//               setshowLoading(false)
//               setShowPaymentText(false);
//               const result = x.data.result
//               if (result) {
//                 if (result.resultcode == 101) {
//                   // success 
//                   sendDataToWebView(1)
  
//                 } else if (result.resultcode == 102) {
//                   sendDataToWebView(0)
//                   // result.resultdesc use this 
//                 } else {
  
//                 }
//               }
//             } else {
//               sendDataToWebView(0)
//               // fail condition
//             }
//           } catch (error) {
//             LogError("Paywall notifyRazorpayTxn notifyTransaction catch inside",error)               
//           }

//         });
//       } else {
//         const resultfromrazor = {
//           "mode": paymentConfig.mode,
//           "result": { error: "invalid razorpay result" }
//         }

//         notifyTransaction(notifyurl, USER_UUID, resultfromrazor)
//       }
//     } catch (error) {
//       LogError("Paywall notifyRazorpayTxn notifyTransaction catch outside",error)               
//     }
//   }


//   var counter = 0;
//   const maxRetries = 5;




//   function notifyGooglePLayTxn(subDetails, result, receiptDownloadCallback) { 
//     try {
//       setshowLoading(true);
// setShowPaymentText(true);
//       const notifyurl = subDetails.notifyurl + "&action=orderupdate"; 

//       function makeTransactionCall() {
//         // if (counter >= maxRetries) {
//         //   storeFailedTransaction(notifyurl, resultfromrazor);
//         //   return;
//         // }

//         if (counter >= maxRetries) {
//   setshowLoading(false);
//   setShowPaymentText(false);
//   storeFailedTransaction(notifyurl, resultfromrazor);
//   sendDataToWebView(0);
//   return;
// }

//         const resultfromrazor = {
//           "mode": subDetails.mode,
//           "result": result || { error: "invalid razorpay result" }
//         };
//         // setshowLoading(true);
//         const notifyresp = notifyTransaction(
//   notifyurl, 
//   USER_UUID, 
//   resultfromrazor,
//   { "X-API-Key": API_KEY } 
// );

//         notifyresp.then(x => {
//           try {
//             // setshowLoading(false);
//             setShowPaymentText(false);
  
//             if (x) {
//               const result = x.data;
//               if (result && result.resultcode == 101) {
//                 if (receiptDownloadCallback) {
//                   receiptDownloadCallback(1, false);
//                 }
//                 sendDataToWebView(1);
//                 setshowLoading(false);

//               } else {
//                 counter++;
//                 if (counter < maxRetries) {
//                   setTimeout(makeTransactionCall, 10000); // Optional: delay before retry
//                 } 
                
//           else {
//   setshowLoading(false);
//   setShowPaymentText(false);
//   storeFailedTransaction(notifyurl, resultfromrazor);
//   sendDataToWebView(0);
// }
//               }
//             } else {
//               counter++;
//               if (counter < maxRetries) {
//                 setTimeout(makeTransactionCall, 10000);
//               } 
              
//          else {
//   setshowLoading(false);
//   setShowPaymentText(false);
//   storeFailedTransaction(notifyurl, resultfromrazor);
//   sendDataToWebView(0);
// }
//             }
            
//           } catch (error) {
//             LogError("Paywall notifyGooglePLayTxn makeTransactionCall notifyTransaction catch inside",error)                 
//           }
//         }).catch(error => {
//           // Retry on error
//           counter++;
//           if (counter < maxRetries) {
//             setTimeout(makeTransactionCall, 2000);
//       } else {
//   setshowLoading(false);
//   setShowPaymentText(false);
//   sendDataToWebView(0);
// }
//         });
//       }
//       setTimeout(makeTransactionCall, 10000);

//     } catch (error) {
//       LogError("Paywall notifyGooglePLayTxn makeTransactionCall notifyTransaction catch outside",error)                 
//     }
//   }

//   function storeFailedTransaction(notifyurl, resultfromrazor) {
//     // Get the existing transaction history
//     try {
//       getData(TRANSACTION_HISTORY)
//         .then((currentHistory) => {
//           try {
//             let transactionHistory = currentHistory ? currentHistory : [];
    
//             // Add the new failed transaction to the history array
//             const newTransaction = {
//               notifyurl: notifyurl,
//               txndata: resultfromrazor
//             };
    
//             transactionHistory.push(newTransaction);
    
//             // Store the updated transaction history
//             storeData(TRANSACTION_HISTORY, transactionHistory)
//               .then(() => {
//                 try {
                  
//                 } catch (error) {
//                   LogError("Paywall storeFailedTransaction storeData TRANSACTION_HISTORY catch inside",error)                         
//                 }
//               })
//               .catch((error) => {
//               });
            
//           } catch (error) {
//             LogError("Paywall storeFailedTransaction getData TRANSACTION_HISTORY catch inside",error)                     
//           }
//         })
//         .catch((error) => {
//         });
//     } catch (error) {
//       LogError("Paywall storeFailedTransaction getData TRANSACTION_HISTORY catch outside",error)                     

//     }
//   }

//   function fetchprivilages() {
//     try {
//       setshowLoading(true)
//       const privilages = getPrivileges()
//       privilages.then(prov => {
//         try {
//           setshowLoading(false)
//           const { intent } = route.params;
//           EventRegister.emitEvent(LOCAL_EVENTS.EVENT_SUBSCRIPTION, {})
//             if(source == "App"){
// navigation.replace("HomeScreen")
//     }else{
//       setexitmodalvisibility(false)
//       navigation.goBack()
//     }
//           // intent.onPaymentCallbackfunc();
//           // navigation.goBack();
//         } catch (error) {
//           LogError("Paywall fetchprivilages getData getPrivileges catch inside",error)                      
//         }
//       })
//     } catch (error) {
//       LogError("Paywall fetchprivilages getData getPrivileges catch outside",error)                      
//     }
//   }


//   // BUG 2 & 4 FIX: full if / else-if chain (instead of a separate "if" for
//   // "events") so only one branch ever runs, plus a guard on missing
//   // options and real error logging in the outer catch.
//   // function onMessage(data) {
//   //   console.log("RAZORPAY_DEBUG :: onMessage called :: " + JSON.stringify(data?.nativeEvent?.data));

//   //   try {
//   //     if (data && data.nativeEvent && data.nativeEvent.data) {
//   //       const paramData = JSON.parse(data.nativeEvent.data);

//   //       if (paramData.action == "closepaywall") {
//   //         fetchprivilages()
//   //       } else if (paramData.action == "closeandprocess") {
//   //         fetchprivilages()
//   //       } else if (paramData.action == "events") {
//   //         try {
//   //           const eventName = paramData.eventname;
//   //           const eventdata = paramData.eventdata;
//   //           recordEvent(eventName, eventdata);
//   //         } catch (e) {
//   //           LogData("6", e);
//   //         }
//   //       } else {
//   //         // ONLY payment messages reach this block
//   //         setpaymentConfig(paramData)

//   //         if (paramData && paramData.mode) {
//   //           if (paramData.mode == 'RAZORPAY') {
//   //             if (partnerpagecalled.current) {
//   //               partnerpagecalled.current = false

//   //               const options = paramData.options;
//   //               if (!options) {
//   //                 console.error("RAZORPAY_DEBUG :: Missing options in paramData");
//   //                 return;
//   //               }
//   //               const transformed = transformRazorpayOptions(options);

//   //               const callback = (result) => {
//   //                 try {
//   //                   setShowPaymentText(true);
//   //                   setshowLoading(true);
//   //                   setRazorpayTransactionResponse(result)
//   //                 } catch (error) {
//   //                   LogError("Paywall Razorpay callback error", error)
//   //                 }
//   //               }

//   //               hasUpiApps().then((upiAvailable) => {
//   //                 if (upiAvailable) {
//   //                   LogData("Razorpay.open CALLED");
//   //                   Razorpay.open(transformed)
//   //                     .then((data) => {
//   //                       LogData("Payment success:", data);
//   //                       callback(data);
//   //                     })
//   //                     .catch((error) => {
//   //                       LogData("Payment failed:", error);
//   //                       callback({ error });
//   //                     });
//   //                 } else {
//   //                   LogData("invokeRazorpay CALLED");
//   //                   invokeRazorpay(options, callback);
//   //                 }
//   //               });
//   //             }
//   //           } else if (paramData.mode == 'GOOGLEPLAY') {
//   //             if (partnerpagecalled.current) {
//   //               partnerpagecalled.current = false

//   //               const billingCallback = (
//   //                 googleSubDetails,
//   //                 receipt,
//   //                 receiptDownloadcalback
//   //               ) => {
//   //                 if (receipt?.success === false) {
//   //                   setshowLoading(false);
//   //                   setShowPaymentText(false);
//   //                   return;
//   //                 }
//   //                 notifyGooglePLayTxn(
//   //                   googleSubDetails,
//   //                   receipt,
//   //                   receiptDownloadcalback
//   //                 );
//   //               };

//   //               subscribewithsku(paramData, billingCallback)
//   //             }
//   //           }
//   //         } else {
//   //           // fail condition
//   //         }
//   //       }
//   //     } else {
//   //       // handle error params not passed
//   //     }
//   //   } catch (e) {
//   //     LogError("Paywall onMessage catch", e);
//   //   }
//   // }

//   function onMessage(data) {
//     console.log("RAZORPAY_DEBUG :: onMessage called :: " + JSON.stringify(data?.nativeEvent?.data));

//     try {
//       if (data && data.nativeEvent && data.nativeEvent.data) {
//         const paramData = JSON.parse(data.nativeEvent.data);

//         if (paramData.action == "closepaywall") {
//           fetchprivilages()
//         } else if (paramData.action == "closeandprocess") {
//           fetchprivilages()
//         } else if (paramData.action == "events") {
//           try {
//             const eventName = paramData.eventname;
//             const eventdata = paramData.eventdata;
//             recordEvent(eventName, eventdata);
//           } catch (e) {
//             LogData("6", e);
//           }
//         } else {
//           // ONLY payment messages reach this block
//           setpaymentConfig(paramData)

//           if (paramData && paramData.mode) {
//             if (paramData.mode == 'RAZORPAY') {
//               if (partnerpagecalled.current) {
//                 partnerpagecalled.current = false

//                 const options = paramData.options;
//                 if (!options) {
//                   console.error("RAZORPAY_DEBUG :: Missing options in paramData");
//                   return;
//                 }
//                 const transformed = transformRazorpayOptions(options);

//                 const callback = (result) => {
//                   try {
//                     setShowPaymentText(true);
//                     setshowLoading(true);
//                     setRazorpayTransactionResponse(result)
//                   } catch (error) {
//                     LogError("Paywall Razorpay callback error", error)
//                   }
//                 }

//                 hasUpiApps().then((upiAvailable) => {
//                   if (upiAvailable) {
//                     LogData("Razorpay.open CALLED");
//                     Razorpay.open(transformed)
//                       .then((data) => {
//                         LogData("Payment success:", data);
//                         callback(data);
//                       })
//                       .catch((error) => {
//                         LogData("Payment failed:", error);
//                         callback({ error });
//                       });
//                   } else {
//                     LogData("invokeRazorpay CALLED");
//                     invokeRazorpay(transformed, callback);
//                   }
//                 });
//               }
//             } else if (paramData.mode == 'GOOGLEPLAY') {
//               if (partnerpagecalled.current) {
//                 partnerpagecalled.current = false

//                 const billingCallback = (
//                   googleSubDetails,
//                   receipt,
//                   receiptDownloadcalback
//                 ) => {
//                   if (receipt?.success === false) {
//                     setshowLoading(false);
//                     setShowPaymentText(false);
//                     return;
//                   }
//                   notifyGooglePLayTxn(
//                     googleSubDetails,
//                     receipt,
//                     receiptDownloadcalback
//                   );
//                 };

//                 subscribewithsku(paramData, billingCallback)
//               }
//             }
//           } else {
//             // fail condition
//           }
//         }
//       } else {
//         // handle error params not passed
//       }
//     } catch (e) {
//       LogError("Paywall onMessage catch", e);
//     }
//   }

//   async function hasUpiApps() {
//   try {
//     return await Linking.canOpenURL("upi://pay"); 
//   } catch (e) {
//     return false;
//   }
// }

// // function transformRazorpayOptions(original) {
// //   return {
// //     currency: original.currency,
// //     amount: original.amount,
// //     key_id: original.key,
// //     method: "upi",
// //     description: original.description.toString(),
// //     subscription_id: original.subscription_id,
// //     "_[flow]": "intent",

// //     contact: original?.prefill?.contact || "",
// //     email: original?.prefill?.email || "",

// //     notes: original.notes
// //   };
// // }

// function transformRazorpayOptions(original) {
//   const result = {
//     currency: original.currency,
//     amount: original.amount,
//     key_id: original.key,
//     description: original.description ? original.description.toString() : '',
//     contact: original?.prefill?.contact || "",
//     email: original?.prefill?.email || "",
//     notes: original.notes
//   };
//   if (original.subscription_id) {
//     // Subscription payment: use UPI intent flow
//     result.subscription_id = original.subscription_id;
//     result.method = "upi";
//     result["_[flow]"] = "intent";
//   } else if (original.order_id) {
//     // One-time order payment: standard checkout, don't force UPI
//     result.order_id = original.order_id;
//   }
//   return result;
// }  


//   function sendDataToWebView(status) {
//     const syncdata = { "action": "synctxn", "status": status }
//     webviewRef.current.postMessage(JSON.stringify(syncdata));
//   }


//   const handleModalClose = () => {
//       setexitmodalvisibility(false)


//   };

//   const handleModalConfirm = () => {

//     if(source == "App"){
// navigation.replace("HomeScreen")
//     }else{
//     setexitmodalvisibility(false)
//     fetchprivilages()
//     }

//   };

//   function extractFallbackUrl(intentUrl) {
//   try {
//     const fallbackMatch = intentUrl.match(/S\.browser_fallback_url=([^;]+)/);
//     if (fallbackMatch && fallbackMatch[1]) {
//       const decodedUrl = decodeURIComponent(fallbackMatch[1]);
//       return decodedUrl;
//     }
//   } catch (e) {
//   }
//   return null;
// }


//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       { /* <View style={styles.header}  >
//             <TouchableOpacity onPress={handleBackPress}>
//               <Image
//                 source={require('../../../app_assets/symbols/sym_06.png')}
//                 style={styles.backIcon}
//               />
//             </TouchableOpacity>
//         <Text style={styles.headerText}>{title}</Text>
//   </View> */ }
//       <Modal
//         transparent={true}
//         animationType="fade"
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={{
//           flex: 1,
//           justifyContent: 'center',
//           alignItems: 'center',
//           backgroundColor: 'rgba(0, 0, 0, 0.7)'
//         }}>
//           <View style={{ padding: 20, backgroundColor: 'white', borderRadius: 10 }}>
//             <Text>Fetching previous transactions...</Text>
//             <Loader />
//           </View>
//         </View>
//       </Modal>
//       {txnHistory && (
//         <WebView
//           ref={webviewRef}
//           scalesPageToFit={false}
//           mixedContentMode="compatibility"
//           setSupportMultipleWindows={false} 
//           domStorageEnabled={true}
//           onMessage={onMessage}
//           startInLoadingState={true}
//           originWhitelist={['*']} 
// onShouldStartLoadWithRequest={(request) => {
//   const url = request.url;
//   if (Platform.OS === 'android') {
//     if (url.startsWith('intent://') || url.startsWith('upi://')) {
//       let fallbackUrl = null;

//       try {
//         const match = url.match(/S\.browser_fallback_url=([^;]+)/);
//         if (match && match[1]) {
//           fallbackUrl = decodeURIComponent(match[1]);
//         }
//       } catch (e) {
//       }

//       // Reset before each attempt
//       appWasOpenedRef.current = false;

//       try {
//         SendIntentAndroid.openChromeIntent(url);
//       } catch (e) {
//       }

//       if (fallbackUrl) {
//         const sub = AppState.addEventListener('change', (nextState) => {
//           if (nextState === 'background' || nextState === 'inactive') {
//             appWasOpenedRef.current = true;
//             sub.remove();
//           }
//         });

//    setTimeout(() => {
//   sub.remove();
//   if (!appWasOpenedRef.current) {
//     if (webviewRef.current) {
//       webviewRef.current.injectJavaScript(`
//         window.location.href = "${fallbackUrl}";
//         true;
//       `);
//     }
//   }
// }, 5000);
//       }

//       return false;
//     }
//   }

//   return true;
// }}
//           onLoadStart={()=>{
//             setshowLoading(true) 
//           }}
//           onLoadProgress={
           
//             () =>{ 
//              // setshowLoading(true) 
//             }
//           }
//           onLoad={() => {
//             setshowLoading(false)
//             //  webviewRef.current.postMessage("synctxn");
//           }}

//           onLoadEnd={()=>{
//              setshowLoading(false)
//           }}

//           javaScriptEnabled
//           onError={(error) => {
//             setshowLoading(false)
//           }}

//           source={{ uri: url }}
//         />
//       )}


//       <ConfirmModal
//         visible={exitmodalvisibility}
//         loading={false}
//         message={"Are you sure you want to go back?"}
//         error={""}
//         onConfirm={handleModalConfirm}
//         onDismiss={handleModalClose}
//       />
//       <>
// {showLoading && (
//   <View
//     style={{
//       flex: 1,
//       backgroundColor: 'rgba(0,0,0,0.7)',
//       position: 'absolute',
//       height: '100%',
//       width: '100%',
//       justifyContent: 'center',
//       alignItems: 'center',
//       paddingHorizontal: 30,
//     }}
//   >
//     <Loader/>

//     {showPaymentText && (
//       <View style={{ marginTop: 20, alignItems: 'center' }}>
//         <Text style={styles.waitText}>Please wait</Text>

//         <Text style={styles.subText}>
//           Loading..it will take few seconds.
//         </Text>

//         <Text style={styles.warningText}>
//           Do not go back.
//         </Text>
//       </View>
//     )}
//   </View>
// )}

//       </>


//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     padding: 15,
//     backgroundColor: '#222222',
//   },
//   backIcon: {
//     width: 20,
//     height: 20,
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: 'white',
//     flex: 1,
//     textAlign: 'center',
//   }
//   ,
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//   },
//   highlight: {
//     fontWeight: '700',
//   },
//   waitText: {
//   color: '#ffffff',
//   fontSize: 18,
//   fontWeight: 'bold',
//   marginBottom: 6,
// },

// subText: {
//   color: '#ffffff',
//   fontSize: 14,
//   textAlign: 'center',
//   marginBottom: 6,
//   opacity: 0.9,
// },

// warningText: {
//   color: '#ffffff',
//   fontSize: 13,
//   textAlign: 'center',
//   opacity: 0.8,
// },
// });

// export default PayWall;