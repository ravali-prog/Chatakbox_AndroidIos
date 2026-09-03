import { FlashList } from '@shopify/flash-list';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ToastAndroid
} from 'react-native';
import { doProfileAction, getPrivileges, getUserActivity, profileLoginPIN } from "../../state_mgmt/AppCommonSlice";
import { LOCAL_EVENTS, LogError, USER_UUID, configData, global_content_group, isInActiveUser, isUserSubscribed, removeExtension, selectedUserProfile, setSelectedUserProfile, setUseractivityDetails, shouldShowPaywall } from '../../app_config/AppConstants';
import { CONST_SELECTED_PROFILE, storeData } from '../../persistence/AsyncStorage';
import { useNavigation } from '@react-navigation/native';
import { APP_EVENTS_ } from '../../app_config/AnalyticsConfig';
import addIcon from '../../../app_assets/symbols/sym_53.png';
import { EventRegister } from 'react-native-event-listeners';

export default function HomeWhosWatching() {
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [dataWithAddIcon, setdataWithAddIcon] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfileName] = useState(null);
  const [selectedProfileID, setSelectedProfileID] = useState(null);
  const profileid = selectedUserProfile ? selectedUserProfile.profileid : '';
  const imagePaths = {

    // "User1.png": require("../../app_assets/avatars_sm/av_sm_01.png"),
    // "User2.png": require("../../app_assets/avatars_sm/av_sm_02.png"),
    // "User3.png": require("../../app_assets/avatars_sm/av_sm_03.png"),
    // "User4.png": require("../../app_assets/avatars_sm/av_sm_04.png"),
    // "User5.png": require("../../app_assets/avatars_sm/av_sm_05.png"),
    // "User6.png": require("../../app_assets/avatars_sm/av_sm_06.png"),
    // "User7.png": require("../../app_assets/avatars_sm/av_sm_07.png"),

    User1: require("../../../app_assets/avatars_sm/av_sm_01.png"),
    User2: require("../../../app_assets/avatars_sm/av_sm_02.png"),
    User3: require("../../../app_assets/avatars_sm/av_sm_03.png"),
    User4: require("../../../app_assets/avatars_sm/av_sm_04.png"),
    User5: require("../../../app_assets/avatars_sm/av_sm_05.png"),
    User6: require("../../../app_assets/avatars_sm/av_sm_06.png"),
    User7: require("../../../app_assets/avatars_sm/av_sm_07.png"),
    Kids: require('../../../app_assets/avatars_sm/Kids.png'),

  };
  const [image, setImage] = useState("");
  const [serverImages, setServerImages] = useState([]);
  const { width: screenWidth } = Dimensions.get('window'); 
  const screenWindow = screenWidth / 2;


  const handlePinModalClose = () => {
    setPin('');
    setPinModalVisible(false);
  };

  const handlePinModalSubmit = () => {
    try {
   

      const response = profileLoginPIN('profilelogin', USER_UUID, profileid, pin);

      response.then((x) => {
        try {
          if (x.data.resultcode === '101') {
            // Handle success, perform actions accordingly
            //Should navigate to indivual userContent previouslyy watched
  
            // navigation.goBack();
            const resultmsg = x.data.resultmsg;
            // ToastAndroid.showWithGravityAndOffset(
            //   'Forbidden - ' + resultmsg,
            //   3000,
            //   ToastAndroid.CENTER,
            //   0,
            //   100
            // );
            EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE, {"msg":'Forbidden - ' + resultmsg})
            fetchuserActivity()
            
          } else {
            const resultmsg = x.data.resultmsg;
            // ToastAndroid.showWithGravityAndOffset(
            //   'Forbidden - ' + resultmsg,
            //   3000,
            //   ToastAndroid.CENTER,
            //   0,
            //   100
            // );
            EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE, {"msg":'Forbidden - ' + resultmsg})
          }
        } catch (error) {
        LogError("HomeWhosWatching handlePinModalSubmit profileLoginPIN catch error inside",error)  
        }

      });
    } catch (error) {
      LogError("HomeWhosWatching handlePinModalSubmit profileLoginPIN catch error outside",error)  
    }
    handlePinModalClose();
  };

  const handlePinInputChange = (text) => {
    setPin(text)
  };

  const [pin, setPin] = useState('');
  const pinInputRef = useRef(null);
  const renderPinModal = () => {

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={pinModalVisible}
        onRequestClose={handlePinModalClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Your PIN to access this Profile.</Text>
            <View style={styles.pinContainer}>
              {/* {pinArray.map((digit, index) => ( */}
              <TextInput
                ref={pinInputRef}
                style={styles.pinInputField}
                value={pin}
                onChangeText={handlePinInputChange}
                keyboardType="numeric"
                maxLength={4}
                placeholder="Enter PIN"
                placeholderTextColor="gray"
              />
              {/* ))} */}
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handlePinModalClose}>
                <Text style={styles.modalButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => {
                handlePinModalSubmit();
              }}>
                <Text style={styles.modalButton}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const fetchData = useCallback(() => {

    try {
      const userprofiles = doProfileAction('myprofiles', USER_UUID, '', '', '');
      userprofiles.then(x => {
        try {
          if ('data' in x) {
    
    
    
            setItems(x.data.profiles);
            const profileImages = x.data.profiles.map(profile => profile.image);
            setServerImages(profileImages);
          } else {
            LogError("HomeWhosWatching fetchData error",error)        
          }
          
        } catch (error) {
          LogError("HomeWhosWatching fetchData doProfileAction res catch inside",error)        

        }
      })
      .catch((error)=>{
        LogError("HomeWhosWatching fetchData .catch error",error)        
      });
      
    } catch (error) {
      LogError('HomeWhosWatching fetchData catch error outside',error)
    }

  }, []);



  useEffect(() => {
    try {
      APP_EVENTS_.screen("WhosisWatching")
    } catch (error) {
    }
  }, []);



  useEffect(() => {
    const reloadPage = navigation.addListener('focus', () => {
      fetchData();
    });

    return reloadPage;
  }, [navigation]);

  useEffect(() => {
    const reloadPage = navigation.addListener('focus', () => {
      fetchData();
    });

    return reloadPage;
  }, [navigation]);

  useEffect(() => {
    try {
      setdataWithAddIcon(      items.length < 5
        ? [...items, { name: 'Add', code: 'transparent' }]
        : [...items]);  
    } catch (error) {
      LogError("HomeWhoiswatching",error);
    }    
  }, [items]);

 // var dataWithAddIcon = []//[...items]

  /*const dataWithAddIcon = //[...items]
    items.length < 5
      ? [...items, { name: 'Add', code: 'transparent' }]
      : [...items];
*/

  function fetchuserActivity() {

    try {

      // fetch the privilages :
      const privilages = getPrivileges()
      privilages.then(prov => {
        try {
          const userActivity = getUserActivity(USER_UUID, selectedUserProfile.profileid)
          userActivity.then(res => {
            try {
              if (res && res.data) {
                setUseractivityDetails(res.data)
              }
                    //  const isSubscribed = isUserSubscribed(global_content_group);
                    //           const isInactive = isInActiveUser(global_content_group);
                                        if(shouldShowPaywall()){
                                           navigation.replace('PayWall', {
                                                      intent: {
                                                          url: configData.data.config.paywallurl, title: "Subscription",
                                                          // contentgroup: ["c3c"],
                                                          contentgroup: ["c2c"],
                                                                source : "App"
                                                          // , onPaymentCallbackfunc:onPaymentCallback 
                                                      }
                                                  });
                                        }
                                        else{
                                          navigation.replace("HomeScreen")
                                        }

            } catch (error) {
              LogError("HomeWhosWatching fetchuserActivity getUserActivity catch inside",error)        
            }
  
          })
          
        } catch (error) {
          LogError("HomeWhosWatching fetchuserActivity getPrivileges catch inside",error)        
        }
      })
    } catch (error) {
    }

  }

  const renderItem = ({ item, index }) => {
    

    const handlePress = () => {

      if (item.name != 'Add') {

        const selectedProfileName = item.name;
        const selectedProfileId = item.profileid;
        setSelectedUserProfile(item)
        setSelectedProfileName(selectedProfileName);
        setSelectedProfileID(selectedProfileId);
        storeData(CONST_SELECTED_PROFILE, item) // added later 
        if (item.protected) {
          setPinModalVisible(true);
        }

        else {
          fetchuserActivity()

        }
      }
      else if (item.name === 'Add') {

        navigation.push('AddProfile',
          {
            isAddClicked: true,
            serverImages: serverImages,
            // image:image
          });
      }



    };
    if (item.name === 'Add') {
      return (
        <TouchableOpacity onPress={handlePress}>
          <View
            style={[
              styles.addImageContainer,
              { width: screenWindow }
            ]}>
            <Image source={addIcon} style={styles.addIconStyle} />
          </View>
          <Text style={styles.addTextStyle}>
            Add
          </Text>
        </TouchableOpacity>
      );
    }


    // if (item.protected) {
    return (
      <>
        <View style={{ marginLeft: 'auto', marginRight: 'auto', width: '70%', }}>

          <TouchableOpacity

            onPress={() => handlePress()}>
            <View style={styles.imageContainer}>
              {item.protected && (
                <Image
                  style={styles.lockImage}
                  source={require('../../../app_assets/symbols/sym_47.png')} />
              )}
              <Image
                style={styles.image}
                source={imagePaths[removeExtension(item.image)]}
                resizeMode='contain' />
              <Text style={styles.itemName}>
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>

          <View>

          </View>

        </View>
      </>
    );
    // } else {
    //   //   Render for unprotected profiles
    //   return (
    //     <>
    //       <View style={{ marginLeft: 'auto', marginRight: 'auto' }}>
    //         <View style={{ width: '100%', height: '100%', position: 'absolute', marginTop: 20 }}>
    //           <Image
    //             style={{ width: '100%', height: '70%', borderRadius: 10, marginLeft: 'auto', marginRight: 'auto', marginTop: 15, justifyContent: 'center', alignItems: 'center' }}
    //             source={require('../../../app_assets/avatars_sm/av_sm_01.png')}
    //             resizeMode='contain' />
    //         </View>
    //         <TouchableOpacity onPress={() => handlePress()}>
    //           <View>
    //             <View style={styles.imageContainer}>
    //               {item.protected && (
    //                 <Image
    //                   style={{ width: 20, height: 20, }}
    //                   source={require('../../../app_assets/symbols/sym_47.png')} />
    //               )}
    //             </View>
    //           </View>
    //         </TouchableOpacity>
    //         <View style={{ top: 10 }}>
    //           <Text style={styles.itemName}>
    //             {item.name}
    //           </Text>
    //         </View>
    //       </View>
    //     </>
    //   );
    // }
  };


  return (
    <>
      {pinModalVisible && renderPinModal()}
      <View style={styles.mainContainer}>
        <View style={{ marginVertical: 10 }}>
          <Text style={styles.header}>Who's Watching</Text>
        </View>
        <View style={styles.columnLayout}>
         {dataWithAddIcon &&  <FlashList
            data={dataWithAddIcon}
            numColumns={2}
            renderItem={renderItem}
            estimatedItemSize={125}
            ItemSeparatorComponent={() => <View style={{ height: 30 }} />}
          /> }
        </View>
      </View>
    </>
  );
}


const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
    // height:'70%',
    backgroundColor: '#111111',
  },

  columnLayout: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    marginVertical: 10,
    paddingHorizontal: 10

  },
  itemContainer: {
    width: '100%',
    // marginTop: 20
  },
  header: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
    color: '#fff'
  },
  selectedItemText: {
    color: 'white',
  },
  imageContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 8,
    padding: 20,
    aspectRatio: 1,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginHorizontal: 5,
    paddingHorizontal: 5

  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    marginLeft: 'auto',
    marginRight: 'auto',
    justifyContent: 'center',
    alignItems: 'center'
  },
  lockImage: {
    width: 20,
    height: 20,
    position: 'absolute',
    marginLeft: 'auto',
    marginRight: 'auto',

  },
  itemName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',

  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginHorizontal: 10
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4D4C4C',
  },
  pinContainer: {
    width:'50%',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Center the items vertically
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#7B7D7D",
    borderRadius: 5,
  },
  pinInputField: {
    flex: 1,
    height: 40,
    borderColor: '#4D4C4C',
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 5,
    color: '#4D4C4C'

  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#4D4C4C',
    paddingVertical: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButton: {
    fontSize: 18,
    color: '#FFFF',
    fontWeight: 'bold',
  },
  addImageContainer: {
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: 10,
    marginVertical: 10,
    paddingHorizontal: 10
  },

  addIconStyle: {
    width: 70,
    height: 70,
    alignSelf: 'center',
  },

  addTextStyle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },

});