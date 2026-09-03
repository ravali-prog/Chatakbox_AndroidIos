import React, { useEffect , useState} from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BackHandler, View, Modal , Text, TouchableOpacity,StyleSheet} from 'react-native';
import { Icon } from 'react-native-paper';
import { Input, Button, Image } from 'react-native-elements';
import Home from '../../ui_components/sections/HomeSection';
import Downloads from '../../ui_components/sections/DownloadSection';
import ReelsSection from '../../ui_components/sections/ReelsSection';

import HomeHeader from '../../ui_components/navigation/AppHeader';
import HomeItem from '../../ui_components/content/HomeItemCard';
import Profile from '../../pages/user/UserProfile';
import WebViewExample from '../../examples/WebViewExample';
import { EventRegister } from 'react-native-event-listeners';
import { accountUpdate } from "../../state_mgmt/AppCommonSlice";
import { LOCAL_EVENTS, handleDeeplinkNavigation, handleScreenTokenExpiry, userProfiles, selectedUserProfile, USER_UUID } from '../../app_config/AppConstants';
import { useNavigation } from '@react-navigation/native';
import type from 'type-detect'
import { APP_EVENTS_ } from '../../app_config/AnalyticsConfig';
import RNExitApp from 'react-native-exit-app';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CONST_ALL_PROFILES, storeData } from '../../persistence/AsyncStorage';


const Tab = createBottomTabNavigator();

const HomeScreen = () => {

  const navigation = useNavigation()
    const insets = useSafeAreaInsets();   // ← get safe-area sizes

    const [showPasswordModal, setShowPasswordModal] = useState(false);
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [passwordError, setPasswordError] = useState("");
const [confirmError, setConfirmError] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

useEffect(() => {
  if (userProfiles && userProfiles.setpassword === true) {
    // setShowPasswordModal(true);
  }
}, [userProfiles]);

const validatePassword = (pwd) => {
  if (pwd.length < 4 || pwd.length > 16) return "Password must be 4-16 characters";
  // if (!/[A-Z]/.test(pwd)) return "Must contain uppercase letter";
  // if (!/[a-z]/.test(pwd)) return "Must contain lowercase letter";
  // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return "Must contain special character";
  return null;
};

const handleSubmit = async () => {
  setPasswordError("");
  setConfirmError("");
  const pwdError = validatePassword(password);
  if (pwdError) {
    setPasswordError(pwdError);
    return;
  }
  if (password !== confirmPassword) {
    setConfirmError("Passwords do not match");
    return;
  }
  try {
    const response = await accountUpdate("accountupdate", USER_UUID, selectedUserProfile.profileid, "pwd", password);
    if (response.data.resultcode === "101") {
      userProfiles.setpassword = false;
      await storeData(CONST_ALL_PROFILES, userProfiles);
      // setShowPasswordModal(false);
         EventRegister.emit(
              LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE,
              { msg: 'Password updated successfully' }
            );
    }   else if (response?.data?.resultcode === "220") {
            // setShowPasswordModal(false);

          EventRegister.emit(
            LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE,
            { msg: response?.data?.resultmsg || 'Password update failed' }
          );


        }
    
    
    else {
      setPasswordError(response.data.resultmsg || "Update failed");
    }
  } catch (error) {
    setPasswordError("Network error");
  }
};



  const handleBackPress = () => {
    const {routes, index} = navigation.getState();
    const currentRoute = routes[index].name;
    if (currentRoute == 'Dashboard') {
      
      RNExitApp.exitApp();
      return true;
    }
    return false;

  //  return true; // Prevent default behavior (exit the app)
  };


  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    try {

      handleDeeplinkNavigation(navigation)
      const evenid =  EventRegister.addEventListener(LOCAL_EVENTS.EVENT_HANDLE_DEEPLINK, () => {
        handleDeeplinkNavigation(navigation)
    });
      
     const handleScreen = EventRegister.addEventListener(LOCAL_EVENTS.EVENT_CHANGE_SCREEN, () => {
      handleScreenTokenExpiry(navigation)
        });
    
      return()=>{
        if ( type(evenid) === 'string') {
          EventRegister.removeEventListener(evenid as string)
      }
      
      if ( type(handleScreen) === 'string') {
        EventRegister.removeEventListener(handleScreen as string)
    }

      }
    } catch (error) {
      
    }
    try {
      APP_EVENTS_.screen("Home Screen")
    } catch (error) {
    }
    
  }, []);

  return (
    <>
    {showPasswordModal && (
     <Modal visible={showPasswordModal} animationType="slide" transparent>
       <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
         <View style={{ backgroundColor: "#343334", padding: 20, margin: 20, borderRadius: 10, width: "90%" }}>
           <View style={{ alignItems: "center", marginBottom: 20 }}>
             <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>Set Password</Text>
           </View>
                      <Text style={{ color: "white", fontSize: 16, marginBottom: 5}}>Password</Text>
           <View style={styles.inputBox}>
             <Input
                    style={styles.inputText}
               placeholder="Enter Password"
               secureTextEntry={!showPassword}
               value={password}
               onChangeText={(text) => {
                 setPassword(text);
                 setPasswordError("");
               }}
               inputContainerStyle={{ borderBottomWidth: 0 }}
               containerStyle={{ flex: 1 }}
             />
             <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 10 }}>
               <Image
                 source={showPassword ? require('../../../app_assets/symbols/sym_28.png') : require('../../../app_assets/symbols/sym_38.png')}
                 style={{ width: 20, height: 20 }}
               />
             </TouchableOpacity>
           </View>
           {passwordError ? <Text style={{ color: "red", fontSize: 14 }}>{passwordError}</Text> : null}
           
           {/* Confirm Password Field */}
           <Text style={{ color: "white", fontSize: 16, marginBottom: 5 }}>Confirm Password</Text>
           <View style={styles.inputBox}>
             <Input
                    style={styles.inputText}
               placeholder="Confirm Password"
               secureTextEntry={!showConfirmPassword}
               value={confirmPassword}
               onChangeText={(text) => {
                 setConfirmPassword(text);
                 setConfirmError("");
               }}
               inputContainerStyle={{ borderBottomWidth: 0 }}
               containerStyle={{ flex: 1 }}
             />
             <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 10 }}>
               <Image
                 source={showConfirmPassword ? require('../../../app_assets/symbols/sym_28.png') : require('../../../app_assets/symbols/sym_38.png')}
                 style={{ width: 20, height: 20 }}
               />
             </TouchableOpacity>
           </View>
           {confirmError ? <Text style={{ color: "red", fontSize: 14 }}>{confirmError}</Text> : null}
           
           <TouchableOpacity
             style={{ backgroundColor: "#fd7f0c", padding: 15, borderRadius: 35, alignItems: "center", marginTop: 20 }}
             onPress={handleSubmit}
           >
             <Text style={{ color: "white", fontSize: 16 }}>Submit</Text>
           </TouchableOpacity>
         </View>
       </View>
     </Modal>
   )}
    <View style={{height: 60, backgroundColor: 'red'}}>
    <HomeHeader />
  </View>
    <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        paddingHorizontal: 5,

        paddingTop: 0,

        backgroundColor: 'rgb(0, 0, 0)',
        borderTopWidth: 0,
        marginBottom: -insets.bottom,
        
      },

      tabBarActiveTintColor: '#FF7A00',
      tabBarInactiveTintColor: 'white', 
      
    }}>
      <Tab.Screen
        name="Home"
        component={HomeItem}
        options={{
          tabBarLabel: () => {
            return null;
          },
          tabBarIcon: ({color, size}) => {
            return <Icon source="home" size={size} color={color} />;
          },
          header: props => (
            <View style={{height: 60}}>
              <HomeHeader  />
            </View>
          ),
        }}
      />
      {/* <Tab.Screen
        name="Reels"
        component={ReelsSection}
        options={{
          tabBarLabel: () => {
            return null;
          },
          tabBarIcon: ({color, size}) => {
            return <Icon source="play-box-multiple" size={size} color={color} />;
          },
          header: props => (
            <View style={{height: 60, backgroundColor: 'red'}}>
              <HomeHeader />
            </View>
          ),
        }}
      /> */}
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: () => {
            return null;
          },
          tabBarIcon: ({color, size}) => {
            return <Icon source="account" size={size} color={color} />;
          },
          header: props => (
            <View style={{height: 60, backgroundColor: 'red'}}>
              <HomeHeader />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
    </>
  );
};

const box = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center", // Center the items vertically
  marginBottom: 10,
  borderWidth: 1,
  borderColor: "#7B7D7D",
  borderRadius: 5,
  // paddingRight:5
};


const styles = StyleSheet.create({
  inputText: {
    fontSize: 14,
    marginTop: 30,
    // marginRight: 0,
    paddingRight: 0,
    color: "#fff",
    alignContent: "center",
  },

    inputBox: {
    // flex:1,
    ...box,
    height: 48,
  },



})

export default HomeScreen;
