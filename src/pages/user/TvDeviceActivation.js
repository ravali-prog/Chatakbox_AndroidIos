import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, TextInput, ScrollView, ToastAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addTV } from '../../state_mgmt/AppCommonSlice';
import { LOCAL_EVENTS, LogError, USER_UUID, checkTokenExpiry, selectedUserProfile, userProfiles } from '../../app_config/AppConstants';
import { APP_EVENTS_ } from '../../app_config/AnalyticsConfig';
import { EventRegister } from 'react-native-event-listeners';
import Loader from '../../ui_components/widgets/LoadingSpinner';

const TvActivation = () => {
  const navigation = useNavigation();

  const [showLoading, setshowLoading] = useState(false);
  

  const profileid = selectedUserProfile ? selectedUserProfile.profileid : '';
  const [pin, setPin] = useState('');
  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleActivate = () => {
    
    try {

      setshowLoading(true)
      const response = addTV(
        'addtv',
        USER_UUID,
        profileid,
        pin,
      );
    
      response.then((x) => {
        try {
          var message = "";
        
          if ('data' in x) {

            if (x.data.resultcode === '101') {
              setPin("")
  
              EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE, {"msg":"Tv Device Added successfully!"})

  
              try {
                APP_EVENTS_.TvActivation("true")
              } catch (error) {
              }  
             
  
            } else {
              
              if (x.data.resultmsg)
              message = x.data.resultmsg//
  
              try {
                APP_EVENTS_.TvActivation("false")
              } catch (error) {
              }  
            }
          } else {
  
            try {
              APP_EVENTS_.TvActivation("false")
            } catch (error) {
            }  
            message = "Something went wrong"
          }
          setshowLoading(false)
          if (message!=""){

          EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE, {"msg":message+""})
          }
        } catch (error) {
          LogError("TvActivation handleActivate addTV catch error inside",error)
        }
      })
    } catch (error) {
      LogError("TvActivation handleActivate addTV catch error outside",error)
    }
  };



  useEffect(() => {

    try {
      APP_EVENTS_.screen("TvActivation")
    } catch (error) {
    }  
   
  }, []);



  const pinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleKeyPress = (event, inputIndex) => {
    if (event.nativeEvent.key === 'Backspace') {
      if (inputIndex > 0) {
        pinRefs[inputIndex - 1].current.focus();
      }
      setPin((prevPin) => prevPin.slice(0, -1));
    }
  };


  const handlePinInputChange = (text, inputIndex) => {
    setPin((prevPin) => {
      const newPin = prevPin.split('');
      newPin[inputIndex] = text;
      return newPin.join('');
    });

    if (inputIndex < 3 && text !== '') {
      pinRefs[inputIndex + 1].current.focus();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        
        <Text style={styles.headerText}>Activate TV</Text>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Image source={require('../../../app_assets/symbols/sym_06.png')} style={styles.backIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.centerContent}>
        <View style={styles.logoContainer}>
          <Image source={require('../../../app_assets/pictures/headerLogo_nobg.png')} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.otpText}>Enter TV code here</Text>
        </View>
        <View style={styles.pinContainer}>
          {Array.from({ length: 4 }).map((_, index) => (
            <TextInput
              key={index}
              ref={pinRefs[index]}
              keyboardType="default"
              autoCapitalize="none"
              style={styles.pinInputField}
              value={pin[index] || ''}
              onChangeText={(text) => handlePinInputChange(text, index)}
              maxLength={1}
              onKeyPress={(event) => handleKeyPress(event, index)}
            />

          ))}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.activateButton} onPress={handleActivate}>
            <Text style={styles.buttonText}>Activate</Text>
          </TouchableOpacity>
        </View>
      </View>

      <>
   {showLoading && <Loader />} 
    </>
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000000',
  },

  header: {
    height: 58,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // borderBottomWidth: 0.6,
    // borderBottomColor: 'rgba(255,255,255,0.08)',
  },

  backButton: {
    position: 'absolute',
    left: 0,
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },

  headerText: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80,
  },

  logoContainer: {
    marginBottom: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textContainer: {
    marginBottom: 12,
  },

  otpText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.4,
  },

  subText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    paddingHorizontal: 12,
  },

  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 4,
  },

  pinInputField: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#161616',
    borderWidth: 1.2,
    borderColor: '#2B2B2B',
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 8,
  },

  buttonContainer: {
    width: '100%',
    marginTop: 50,
  },

  activateButton: {
    height: 56,
    backgroundColor: '#E50914',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: '#E50914',
    // shadowOffset: {
    //   width: 0,
    //   height: 6,
    // },
    // shadowOpacity: 0.35,
    // shadowRadius: 10,
    elevation: 8,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});

export default TvActivation;