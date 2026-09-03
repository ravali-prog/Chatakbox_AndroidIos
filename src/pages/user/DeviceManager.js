import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Dimensions } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';
import { logoutDevice, fetchMyDevices } from '../../state_mgmt/AppCommonSlice';
import { LogError, USER_UUID, handleNavigation, selectedUserProfile } from '../../app_config/AppConstants';
import { LogoutDialog } from '../../data_models/DialogData';
import { APP_EVENTS_ } from '../../app_config/AnalyticsConfig'; 


const ManageDevices = () => {

  const navigation = useNavigation();
  const UUID = USER_UUID;
  const profileid = selectedUserProfile ? selectedUserProfile.profileid : '';
  const [devices, setDevices] = useState([]);
  const [deviceid, setDeviceId] = useState('');
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const handleBackPress = () => {
    navigation.goBack()
  };

  useEffect(() => {

    try {
      APP_EVENTS_.screen("ManageDevices")
    } catch (error) {
    }  
   
      try {
        const action = 'mydevices';
        const response =  fetchMyDevices(action, UUID, profileid);


        response.then(Deviceresp=>{
          try {
            if (Deviceresp.data.resultcode == "101") {
                    
              setDevices(Deviceresp.data.devices);
            } else {
              // Handle error response from myDevices if needed
              LogError("ManageDevices fetchMyDevices getPDevicerespivileges else",Deviceresp)        
            }
          } catch (error) {
            LogError("ManageDevices fetchMyDevices getPDevicerespivileges catch inside",error)        
          }
        })

      
      } catch (error) {
        LogError("ManageDevices fetchMyDevices getPDevicerespivileges catch outside",error)        
      }
  

 
  }, []);




  const handleMyDevices = () => {
  
    try {


      const response = logoutDevice(UUID, profileid, deviceid);

      response.then(lodoutresp=>{
        try {
          if (lodoutresp.data.resultcode+"" == "101") {
            // Handle success, perform actions accordingly
            const remDevices =  devices.filter((device) => {
              return  device.id !== deviceid
            })
            setDevices([...remDevices])
    
          } else {
            // Handle error response from myDevices if needed
           LogError("ManageDevices handleMyDevices logoutDevice else inside",error)        
          }
          
        } catch (error) {
          LogError("ManageDevices handleMyDevices logoutDevice catch inside",error)        
        }

      })

    } catch (error) {
      LogError("ManageDevices handleMyDevices logoutDevice catch outside",error)        
    }
  };

  const handleLogoutPress = () => {
    setLogoutDialogVisible(true);
  };

  const sortedDevices = [...devices].sort((a, b) => b.current - a.current);

  const renderItem = ({ item }) => {
    

    const displayDeviceName = () => {
      const baseName = item.name || 'Unnamed Device';
      return item.current === 1 ? `Current Device: ${baseName}` : baseName;
    };
  

    return (
      <View style={styles.deviceContainer}>
        <View style={styles.deviceBox}>
          <Text style={styles.deviceName}>{displayDeviceName()}</Text>
        </View>
        {item.current !== 1 && (
          <TouchableOpacity onPress={() => {
            let currentId = item.id
            setDeviceId(currentId)
            handleLogoutPress()
          }} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
     
        <Text style={styles.headerText}>Manage Devices</Text>
        <TouchableOpacity onPress={handleBackPress} style={{
          width: 50,
          height: 50, justifyContent: 'center',
          alignItems: 'center',
          position:'absolute',
          left:0,
          
        }} >
          <Image
            source={require('../../../app_assets/symbols/sym_06.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedDevices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={1}
      />
      <LogoutDialog
        logoutDialogVisible={logoutDialogVisible}
        setLogoutDialogVisible={setLogoutDialogVisible}
        logout={handleMyDevices}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#000000',
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
   // flex: 1,
    textAlign: 'center',
    position:'absolute',
    left:0,
    right:0,
  },
  backButton: {
    width: 100,
  },
  deviceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    paddingVertical: 15,
    backgroundColor: '#17171D',
    padding: 10,
    borderRadius: 8,
  },
  deviceBox: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    color: 'white',
  },
  logoutButton: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: '#363636',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
  },
});


export default ManageDevices;