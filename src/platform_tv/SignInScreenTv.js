import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import HeaderWithLogo from './TvHeaderWithLogo';
import QRCode from 'react-native-qrcode-svg';
import {useTVEventHandler} from 'react-native-tvos';
import {tvCode} from '../state_mgmt/AppCommonSlice';

const LoginScreenTv = () => {
  const [tvCodeValue, setTvCodeValue] = useState('');
  const [qrCodeLink, setQRCodeLink] = useState('');
  const [id, setID] = useState('');
  

  const handleGetNewCodePress = () => {
    reGenereteTvcode();

  };

  useEffect(() => {
    genereteTvcode();
  }, []);



  const genereteTvcode = async () => {
    try {
      const response = await tvCode('generatetvcode');
      setTvCodeValue(response.data.code);
      setQRCodeLink(response.data.url);
      const generatedId = response.data.id; 
      setID(response.data.id);
    } catch (error) {
    }
  };
  
  const reGenereteTvcode = async () => { 
    try {
      const response = await tvCode('re-generatetvcode', id); 
      setTvCodeValue(response.data.code);
      setQRCodeLink(response.data.url);
    } catch (error) {
    }
  };

  useTVEventHandler(event => {
    if (event && event.eventType === 'focus' && event.tag === 'GET_NEW_CODE') {
      handleGetNewCodePress();
    }
  });
  return (
    <View style={styles.container}>
      <HeaderWithLogo headerText="Authenticate with Android device or website" />
      <View style={styles.containerScreen}>
        <View style={styles.contentContainer}>
          <View style={styles.instructionsContainer}>
            <View style={styles.intructionGroup}>
              <Text style={styles.instructionsText}>
                Login to your account on Chatak Box app or website
              </Text>
              <Text style={styles.instructionsText}>
                https://...........................
              </Text>
            </View>
            <View style={styles.intructionGroup}>
              <Text style={styles.instructionsText}>
                Go to authentic section from the Account.
              </Text>
              <Text style={styles.instructionsText}>
                Open Chatak Box App-Account-Activate TV
              </Text>
            </View>
            <View style={styles.intructionGroup}>
              <Text style={styles.instructionsText}>
                Enter code given below and click authenticate
              </Text>
            </View>
            <Text style={styles.uniqueCode}>{tvCodeValue}</Text>
            <TouchableOpacity
              style={styles.newCodeButton}
              onPress={handleGetNewCodePress}
              onFocus={() => {
                if (Platform.OS === 'tvos') {
                }
              }}>
              <Text style={styles.newCodeButtonText}>GET NEW CODE</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.circle}>
            <Text style={styles.text}>OR</Text>
          </View>

          <View style={styles.qrCodeContainer}>
            <Text style={styles.qrcodeText}>
              Scan this Qr code and authenticate to login
            </Text>
            <View style={styles.qrCodeContainer}>
              <Text style={styles.qrcodeText}>
                Scan this QR code and authenticate to login
              </Text>
              {qrCodeLink ? ( 
                <View style={styles.qrCodeBackground}>
                  <QRCode value={qrCodeLink} size={150} />
                </View>
              ) : (
                <Text style={styles.errorText}>No QR code available</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  containerScreen: {
    flex: 1,
    marginTop: 20,
  },
  divider: {
    width: 2,
    backgroundColor: 'white',
    marginVertical: 10,
    height: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 20,
    right: 15,
    backgroundColor: 'white',
    alignSelf: 'center',
  },
  text: {
    color: 'black',
    alignSelf: 'center',
    padding: 5,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  intructionGroup: {
    marginBottom: 20,
    alignItems: 'flex-start',
    marginStart: 50,
  },

  instructionsContainer: {
    flex: 1,
  },
  instructionsText: {
    color: 'white',
  },
  qrCodeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  qrcodeText: {
    color: 'white',
    fontSize: 19,
    fontWeight: 'bold',
  },
  qrCodeBackground: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    backgroundColor: 'white',
    width: 200,
    height: 200,
  },
  uniqueCode: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  newCodeButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    width: 200,
    justifyContent: 'center',
    alignSelf: 'center',
    borderColor: 'red',
    borderWidth: 2,
    marginTop: 20,
  },
  newCodeButtonText: {
    color: 'red',
    fontSize: 17,
    textAlign: 'center',
  },
});

export default LoginScreenTv;
