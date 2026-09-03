// import {
//   initConnection,
//   purchaseErrorListener,
//   purchaseUpdatedListener,
//   type ProductPurchase,
//   type PurchaseError,
//   flushFailedPurchasesCachedAsPendingAndroid,
//   requestPurchase,
//   requestSubscription,
//   finishTransaction,
//   SubscriptionPurchase,
//   getProducts,
//   getSubscriptions,
//   getAvailablePurchases
// } from 'react-native-iap';
// import RazorpayCheckout from 'react-native-razorpay';
// import { notifyTransactionGoogle } from '../state_mgmt/AppCommonSlice';
// import { API_GOOGLE_SUB_SYNC, LogData, LogError } from '../app_config/AppConstants';
// import { isRejected } from '@reduxjs/toolkit';

// // https://react-native-iap.dooboolab.com/docs/api-reference/hooks/
// // https://github.com/dooboolab-community/react-native-iap/blob/main/IapExample/src/screens/ClassSetup.tsx#L141

// var purchaseUpdateSubscription = null;
// var purchaseErrorSubscription = null;
// var onGoogleBillingResult : any = null
// var googleSubDetails : any = null;


// const purchase = async (sku: string) => {
//     try {
//       await requestPurchase({
//         sku,
//         andDangerouslyFinishTransactionAutomaticallyIOS: false,
//       });
//     } catch (err) {
//     }
//   };

//   export const subscribewithsku = async (subDetails: any , resultCallback:any) => {
//     try {
      
//       onGoogleBillingResult = resultCallback;
//       googleSubDetails = subDetails;
//       const skuss =   [subDetails.sku]
//       const products = await getSubscriptions({
//         skus: skuss,
//       });
//       let offeertoken = "";
//       if(products && products[0] && products[0].subscriptionOfferDetails.length>0) {
//         offeertoken = products[0].subscriptionOfferDetails[0].offerToken
//       }

//       subscribe( subDetails.sku, offeertoken)
      

      
    
//     } catch (err) {
//     }
//   };

//  export const subscribe = async (sku: string, offerToken: string | undefined) => {
//     try {
   
//       await requestSubscription({
//         sku,
//         ...(offerToken && {subscriptionOffers: [{sku, offerToken}]}),
//       });
//     } catch (err) {
//     }
//   };

//   export function getActiveGooglePurchases(callback:any){
//     try {
//       const availpush =  getAvailablePurchases({ alsoPublishToEventListener:false,
//         automaticallyFinishRestoredTransactions:false, onlyIncludeActiveItems:true })
//         availpush.then(repp => {
//            try {

//             const respp =   notifyTransactionGoogle(API_GOOGLE_SUB_SYNC,repp )
//             respp.then(ressss=>{
//               try {
//                 callback()
//               } catch (error) {
//                 LogError("IAPHelper getActiveGooglePurchases notifyTransactionGoogle inside catch error",error)
//               }
//             },isRejected=>{
//               callback()
//             }).catch(error=>{
//               callback()
//             })
             
//            } catch (error) {
//              callback()
//              LogError("IAPHelper getActiveGooglePurchases getAvailablePurchases inside catch error",error)
//            }
//         },isRejected=>{
//           callback()
//         }).catch(error=>{
//           callback()
//         })
        
//     } catch (error) {
//       LogError("IAPHelper getActiveGooglePurchases getAvailablePurchases outside catch error",error)
//       callback()
//     } 
//   }

//   export function initIap() {
//     try {
//       initConnection().then(() => {

// try {
//   const availpush =  getAvailablePurchases({ alsoPublishToEventListener:false,
//     automaticallyFinishRestoredTransactions:false, onlyIncludeActiveItems:true })
//     availpush.then(repp => {
//        try {
         

//          notifyTransactionGoogle(API_GOOGLE_SUB_SYNC,repp )
         
//        } catch (error) {
//          LogError("IAPHelper initIap getAvailablePurchases availpush inside catch error",error)
//        }
//     })


//  flushFailedPurchasesCachedAsPendingAndroid()
//    .catch((reason) => {
//    })
//    .then((onstatus) => {
//     try {
     
//      purchaseUpdateSubscription = purchaseUpdatedListener(
//        (purchase: SubscriptionPurchase | ProductPurchase) => {
//          const receipt = purchase.transactionReceipt;
//          if (receipt) {

//            if (onGoogleBillingResult) {

//              const receiptDownloadcalback =async (status:number, isConsumable :boolean  ) => {

//                try {
//                    if (status == 1) {
//                      const result =   await finishTransaction({purchase : purchase, isConsumable: isConsumable});
                     
//                    } else if (status == 0) {
                     
//                    }
//                } catch (error) {
//                }                   

//              }

//              onGoogleBillingResult(googleSubDetails,receipt,receiptDownloadcalback)

//            }

//          }
//        },
//      );

//      purchaseErrorSubscription = purchaseErrorListener(
//        (error: PurchaseError) => {
//          try {
//            if (onGoogleBillingResult) {
         
//              if(error){

//                onGoogleBillingResult(googleSubDetails,JSON.stringify(error),null)
//              }
//              else{
//              const failed={"error":"Something Went Wrong!"};
//                onGoogleBillingResult(googleSubDetails,JSON.stringify(failed),null)
//              }
//            }
//          } catch (error) {
//            LogError('IAPHelper', error)
//          }

         
//          // {"code": "E_ALREADY_OWNED", "debugMessage": "", "message": "You already own this item.", "responseCode": 7}
//        },
//      );
//     } catch (error) {
//       LogError("IAPHelper initIap flushFailedPurchasesCachedAsPendingAndroid catch error",error)

//     }
     
//    });
// } catch (error) {
//   LogError("IAPHelper initIap initConnection inside catch error",error)
// }
       

//       });


//     } catch (error) {
//     }
    
//   }


//   export function invokeRazorpay(paymentConfig:any,resultCalback:any) {

//     try {
//       RazorpayCheckout.open(paymentConfig).then((data) => {
//         try {
//           resultCalback(data)
//         } catch (error) {
//           LogError("IAPHelper invokeRazorpay RazorpayCheckout inside catch error",error)
//         }

//         // handle success
//         //alert(`Success: ${data.razorpay_payment_id}`);
//       }).catch((error) => {
//         resultCalback( error.error)
//         // handle failure
//         // alert(`Error: ${error.code} | ${error.description}`);
//       });
//     } catch (error) {
//     }

//   }




import {
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  type ProductPurchase,
  type PurchaseError,
  flushFailedPurchasesCachedAsPendingAndroid,
  requestPurchase,
  requestSubscription,
  finishTransaction,
  SubscriptionPurchase,
  getProducts,
  getSubscriptions,
  getAvailablePurchases,
  setup,
} from '@iaptic/react-native-iap';
// import RazorpayCheckout from "react-native-razorpay";
// import  Razorpay  from 'react-native-customui';
import Razorpay from 'react-native-customui';
import { notifyTransactionGoogle, notifyTransactionIOS } from "../state_mgmt/AppCommonSlice";
import {
  API_GOOGLE_SUB_SYNC,
  API_IOS_SUB_SYNC,
  LogData,
  LogError,
} from "../app_config/AppConstants";
import { isRejected } from "@reduxjs/toolkit";

// https://react-native-iap.dooboolab.com/docs/api-reference/hooks/
// https://github.com/dooboolab-community/react-native-iap/blob/main/IapExample/src/screens/ClassSetup.tsx#L141

import { Platform } from 'react-native';

var purchaseUpdateSubscription = null;
var purchaseErrorSubscription = null;
var onGoogleBillingResult: any = null;
var googleSubDetails: any = null;
var onIOSBillingResult: any = null;
var IOSSubDetails: any = null;

const purchase = async (sku: string) => {
  try {
    await requestPurchase({
      sku,
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    });
  } catch (err) {}
};

// export const subscribewithsku = async (subDetails: any , resultCallback:any) => {
//   try {

//     onGoogleBillingResult = resultCallback;
//     googleSubDetails = subDetails;
//     const skuss =   [subDetails.sku]
//     const products = await getSubscriptions({
//       skus: skuss,
//     });
//     let offeertoken = "";
//     if(products && products[0] && products[0].subscriptionOfferDetails.length>0) {
//       offeertoken = products[0].subscriptionOfferDetails[0].offerToken
//     }

//     subscribe( subDetails.sku, offeertoken)

//   } catch (err) {
//   }
// };

export const subscribewithsku = async (subDetails, resultCallback) => {
  try {
    onGoogleBillingResult = resultCallback;
    googleSubDetails = subDetails;

    const products = await getSubscriptions({
      skus: [subDetails.sku],
    });

    let offerToken = "";

    if (
      products &&
      products[0] &&
      products[0].subscriptionOfferDetails &&
      products[0].subscriptionOfferDetails.length > 0
    ) {
      offerToken = products[0].subscriptionOfferDetails[0].offerToken;
    }

    await subscribe(subDetails.sku, offerToken);
  } catch (err) {
    if (onGoogleBillingResult) {
      onGoogleBillingResult(
        googleSubDetails,
        {
          success: false,
          cancelled: false,
          error: err,
        },
        null,
      );
    }
  }
};

//  export const subscribe = async (sku: string, offerToken: string | undefined) => {
//     try {

//       await requestSubscription({
//         sku,
//         ...(offerToken && {subscriptionOffers: [{sku, offerToken}]}),
//       });
//     } catch (err) {
//     }
//   };

export const subscribe = async (sku, offerToken) => {
  try {
    await requestSubscription({
      sku,
      ...(offerToken && {
        subscriptionOffers: [{ sku, offerToken }],
      }),
    });
  } catch (err) {
    if (onGoogleBillingResult) {
      onGoogleBillingResult(
        googleSubDetails,
        {
          success: false,
          cancelled: false,
          error: err,
        },
        null,
      );
    }
  }
};

export const purchaseIOS = async (paramData: any, resultCallback: any) => {
  try {
    onIOSBillingResult = resultCallback;
    IOSSubDetails = paramData;

    const skuss = [paramData.sku];
    const products = await getSubscriptions({
      skus: skuss,
    });

    await requestSubscription({
      sku: paramData.sku,
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    });
  } catch (error) {
    if (onIOSBillingResult) {
      onIOSBillingResult(
        IOSSubDetails,
        {
          success: false,
          cancelled: false,
          error: error,
        },
        null,
      );
    }
  }
};

export function getActiveGooglePurchases(callback: any) {
  try {
    const availpush = getAvailablePurchases({
      alsoPublishToEventListener: false,
      automaticallyFinishRestoredTransactions: false,
      onlyIncludeActiveItems: true,
    });
    availpush
      .then(
        (repp) => {
          try {
            const respp = notifyTransactionGoogle(API_GOOGLE_SUB_SYNC, repp);
            respp
              .then(
                (ressss) => {
                  try {
                    callback();
                  } catch (error) {
                    LogError(
                      "IAPHelper getActiveGooglePurchases notifyTransactionGoogle inside catch error",
                      error,
                    );
                  }
                },
                (isRejected) => {
                  callback();
                },
              )
              .catch((error) => {
                callback();
              });
          } catch (error) {
            callback();
            LogError(
              "IAPHelper getActiveGooglePurchases getAvailablePurchases inside catch error",
              error,
            );
          }
        },
        (isRejected) => {
          callback();
        },
      )
      .catch((error) => {
        callback();
      });
  } catch (error) {
    LogError(
      "IAPHelper getActiveGooglePurchases getAvailablePurchases outside catch error",
      error,
    );
    callback();
  }
}

export function initIap() {
  try {
   if (Platform.OS === 'ios') {
      setup({ storekitMode: 'STOREKIT_HYBRID_MODE' });
    }

    initConnection().then(() => {
      try {
        const availpush = getAvailablePurchases({
          alsoPublishToEventListener: false,
          automaticallyFinishRestoredTransactions: false,
          onlyIncludeActiveItems: true,
        });
  
        availpush.then((repp) => {
          try {
            if (Platform.OS === 'ios') {
              notifyTransactionIOS(API_IOS_SUB_SYNC, repp);
            } else {
              notifyTransactionGoogle(API_GOOGLE_SUB_SYNC, repp);
            }
          } catch (error) {
            LogError(
              "IAPHelper initIap getAvailablePurchases availpush inside catch error",
              error,
            );
          }
        });

        flushFailedPurchasesCachedAsPendingAndroid()
          .catch((reason) => {})
          .then((onstatus) => {
            try {
              purchaseUpdateSubscription = purchaseUpdatedListener(
                (purchase: SubscriptionPurchase | ProductPurchase) => {
                  const receipt = purchase.transactionReceipt;
                  if (receipt) {
                    if (onGoogleBillingResult) {
                      const receiptDownloadcalback = async (
                        status: number,
                        isConsumable: boolean,
                      ) => {
                        try {
                          if (status == 1) {
                            const result = await finishTransaction({
                              purchase: purchase,
                              isConsumable: isConsumable,
                            });
                          } else if (status == 0) {
                          }
                        } catch (error) {}
                      };

                      onGoogleBillingResult(
                        googleSubDetails,
                        receipt,
                        receiptDownloadcalback,
                      );
                    }

                    if (Platform.OS === 'ios' && onIOSBillingResult) {
                      const receiptDownloadcalback = async (
                        status: number,
                        isConsumable: boolean,
                      ) => {
                        try {
                          if (status == 1) {
                            const result = await finishTransaction({
                              purchase: purchase,
                              isConsumable: isConsumable,
                            });
                          } else if (status == 0) {
                          }
                        } catch (error) {}
                      };

                      onIOSBillingResult(
                        IOSSubDetails,
                        JSON.stringify(purchase),
                        receiptDownloadcalback,
                      );
                    }
                  }
                },
              );

              // purchaseErrorSubscription = purchaseErrorListener(
              //   (error: PurchaseError) => {
              //     try {
              //       if (onGoogleBillingResult) {
              //         if (error) {
              //           onGoogleBillingResult(
              //             googleSubDetails,
              //             JSON.stringify(error),
              //             null,
              //           );
              //         } else {
              //           const failed = { error: "Something Went Wrong!" };
              //           onGoogleBillingResult(
              //             googleSubDetails,
              //             JSON.stringify(failed),
              //             null,
              //           );
              //         }
              //       }
              //     } catch (error) {
              //       LogError("IAPHelper", error);
              //     }

              //     // {"code": "E_ALREADY_OWNED", "debugMessage": "", "message": "You already own this item.", "responseCode": 7}
              //   },
              // );
              purchaseErrorSubscription = purchaseErrorListener(
  (error) => {
    try {
      if (onGoogleBillingResult) {
        onGoogleBillingResult(
          googleSubDetails,
          {
            success: false,
            cancelled:
              error?.code === "E_USER_CANCELLED" ||
              error?.responseCode === 1,
            error,
          },
          null
        );
      }
      if (Platform.OS === 'ios' && onIOSBillingResult) {
        onIOSBillingResult(
          IOSSubDetails,
          {
            success: false,
            cancelled:
              error?.code === "E_USER_CANCELLED" ||
              error?.responseCode === 1,
            error,
          },
          null
        );
      }
    } catch (e) {
      LogError("IAPHelper purchaseErrorListener", e);
    }
  }
);
            } catch (error) {
              LogError(
                "IAPHelper initIap flushFailedPurchasesCachedAsPendingAndroid catch error",
                error,
              );
            }
          });
      } catch (error) {
        LogError("IAPHelper initIap initConnection inside catch error", error);
      }
    });
  } catch (error) {}
}

// export function invokeRazorpay(paymentConfig: any, resultCalback: any) {
//   try {
//     RazorpayCheckout.open(paymentConfig)
//       .then((data) => {
//         try {
//           resultCalback(data);
//         } catch (error) {
//           LogError(
//             "IAPHelper invokeRazorpay RazorpayCheckout inside catch error",
//             error,
//           );
//         }

//         // handle success
//         //alert(`Success: ${data.razorpay_payment_id}`);
//       })
//       .catch((error) => {
//         resultCalback(error.error);
//         // handle failure
//         // alert(`Error: ${error.code} | ${error.description}`);
//       });
//   } catch (error) {}
// }


// NEW:
export function invokeRazorpay(transformedOptions: any, resultCalback: any) {
  try {
    Razorpay.open(transformedOptions)
      .then((data) => {
        try {
          resultCalback(data);
        } catch (error) {
          LogError("IAPHelper invokeRazorpay Razorpay.open inside catch error", error);
        }
      })
      .catch((error) => {
        resultCalback(error);
      });
  } catch (error) {
    LogError("IAPHelper invokeRazorpay outer catch error", error);
  }
}
