import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RadioButton } from 'react-native-paper';
import { icons, LogData, LogError } from '../../app_config/AppConstants';
import { Calendar } from 'react-native-calendars';
import Dialog from 'react-native-dialog';
import RNPickerSelect from 'react-native-picker-select';
import { accountUpdate, getAccountDetails } from '../../state_mgmt/AppCommonSlice';
import { USER_UUID, selectedUserProfile } from '../../app_config/AppConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../../ui_components/widgets/LoadingSpinner';
import { APP_EVENTS_ } from '../../app_config/AnalyticsConfig';
import { AccountDialog } from '../../data_models/AccountData';
import CalendarDialog from '../../data_models/CalendarData';
import { EventRegister } from 'react-native-event-listeners';
import { LOCAL_EVENTS } from '../../app_config/AppConstants';
import { colors } from '../../theming/colors';


const MyAccount = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'other'>('male');
  // const [initialGender, setInitialGender] = useState<'male' | 'female' | 'other'>('male');

  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [inputType, setInputType] = useState<'name' | 'mobileNumber' | 'email' |'dob' | 'gender' | null>(null);

  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dataType, setDataType] = useState('');
  const [value, setValue] = useState('');
  const [showMessage, setShowMessage] = useState('');
  const [everified, setEverified] = useState('');
  const [mverified, setMverified] = useState('');
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState(''); // State for selected country code
  const profileid = selectedUserProfile ? selectedUserProfile.profileid : '';
  const UUID = USER_UUID;
  const [radioButtons, setRadioButtons] = useState({
    male: { radioOn: icons.radioOn, radioOff: icons.radioOff },
    female: { radioOn: icons.radioOn, radioOff: icons.radioOff },
    other: { radioOn: icons.radioOn, radioOff: icons.radioOff },
  });
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    getDetails();
    // Retrieve the initial gender from AsyncStorage
    AsyncStorage.getItem('selectedGender').then((storedGender) => {
      try {
        if (storedGender) {
          setSelectedGender(storedGender as 'male' | 'female' | 'other');
        }
      } catch (error) {
        LogError("MyAccount AsyncStorage selectedGender catch",error)         
      }
    });



   
      try {
        APP_EVENTS_.screen("MyAccount")
      } catch (error) {
      }


  }, []);




  const handleCalendarDialogClose = () => {
    setShowCalendarDialog(false);
  };

  const handleCalendarDialogOk = () => {
    setShowCalendarDialog(false);
  };


  const handleEmailDialogClose = () => {
    setShowEmailDialog(false);
    setEmail('');
  };

  const handleEmailDialogSubmit = () => {
    setShowEmailDialog(false);
    setEmail('');
  };


  const handleDialogClose = () => {
    setShowEmailDialog(false);
    setEmail('');
  };

  const handleDialogSubmit = () => {
    setShowEmailDialog(false);
    setEmail('');
    handleDialogClose()
  };


  const handleMobileDialogClose = () => {

    // Additional logic if needed
  };

  const handleMobileDialogSubmit = () => {

  };


  const update = (input,dataType) => {
    try {
      let updateType = '';
      let updateValue = '';

      switch (inputType) {
        case 'name':
          updateType = 'name';
          updateValue = input;
          break;
        case 'mobileNumber':
          updateType = 'mobile';
          updateValue = input;
          break;
          case 'email':
          updateType = 'email';
          updateValue = input;
          break;
        case 'dob':
          updateType = 'dob';
          updateValue = input || ''; // Ensure selectedDate is not null
          break;
        case 'gender':
          updateType = 'gender';
          updateValue = selectedGender;
          break;
        default:
          break;
      }

      if (updateType && updateValue) {
        const update = accountUpdate('accountupdate', UUID, profileid, updateType, updateValue);
        update.then(response => {
          try {
            if (response) {
              getDetails();
              LogData("MyAccount update accountUpdate if inside",response)        
            } else {
              LogError("MyAccount update accountUpdate else inside",response)        
            }
          } catch (error) {
            LogError("MyAccount update accountUpdate catch inside",error)        
          }
        });
      }
    } catch (error) {
    }
  };



  const getDetails = () => {

    try {
     
      const response = getAccountDetails(
        'getaccountdetails',
        UUID,
        profileid,
      );

      response.then((x) => {
        try {
        
          setStatus("successful")
          if ('data' in x) {
            setEmail(x.data.email)
            setName(x.data.name)
            setMobileNumber(x.data.mobile)
            setSelectedDate(x.data.dob)
            setEverified(x.data.everified)
            setMverified(x.data.mverified)
  
             if (x.data.gender == ''){
              updateRadioButtons('')
             }
              else if(x.data.gender === 'male') {
              updateRadioButtons('male');
            } else if (x.data.gender === 'female') {
              updateRadioButtons('female');
            } else if (x.data.gender === 'other') {
              updateRadioButtons('other');
            }
  
  
          } else {
            LogError("MyAccount getDetails getAccountDetails else inside",x)        
          }
        } catch (error) {
          LogError("MyAccount getDetails getAccountDetails catch inside",error)        
        }
      });
    } catch (error) {
      LogError("MyAccount getDetails getAccountDetails catch outside",error)        
    }
  };

  const handleGenderChange = async (gender: string) => {
    // Display loading indicator while API request is in progress
    setInputType('gender');
    try {
      // Make the API request
      const response = await accountUpdate('accountupdate', UUID, profileid, 'gender', gender);

      // Update the state with the selected gender if API request is successful
      if (response) {
        LogData("response accountUpdate",response)
        setSelectedGender(gender as 'male' | 'female' | 'other');
        // Store the selected gender in AsyncStorage for persistence
        await AsyncStorage.setItem('selectedGender', gender);

        // Update the radio button images based on the selected gender
        updateRadioButtons(gender);
      } else {
        const newRadioButtons: any = {
          male: { radioOn: icons.radioOff, radioOff: icons.radioOff },
          female: { radioOn: icons.radioOff, radioOff: icons.radioOff },
          other: { radioOn: icons.radioOff, radioOff: icons.radioOff },
        };
        setRadioButtons(newRadioButtons);
      }
    } catch (error) {
      // Handle error gracefully, e.g., display an error message
    } finally {
      // Hide loading indicator
    }
  };

  const updateRadioButtons = (gender: string) => {
    const newRadioButtons: any = {
      male: { radioOn: icons.radioOff, radioOff: icons.radioOff },
      female: { radioOn: icons.radioOff, radioOff: icons.radioOff },
      other: { radioOn: icons.radioOff, radioOff: icons.radioOff },
    };

    if(gender == ''){
      setRadioButtons(newRadioButtons);
    }
    else if(gender){
       // Update the radio buttons images based on the selected gender
       newRadioButtons[gender].radioOn = icons.radioOn;
  
       // Set the updated radio buttons images in the state
       setRadioButtons(newRadioButtons);
    }
  };

  const validatePassword = (pwd: string) => {
  if (pwd.length < 4 || pwd.length > 16)
    return "Password must be 4–16 characters";
  // if (!/[A-Z]/.test(pwd))
  //   return "Must contain uppercase letter";
  // if (!/[a-z]/.test(pwd))
  //   return "Must contain lowercase letter";
  // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd))
  //   return "Must contain special character";
  return "";
};

const handlePasswordUpdate = async () => {
  try {
    setPasswordError('');

    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    const response: any = await accountUpdate(
      'accountupdate',
      UUID,
      profileid,
      'pwd',
      newPassword
    );


    if (response?.data?.resultcode === "101") {
      EventRegister.emit(
        LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE,
        { msg: 'Password updated successfully' }
      );

      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordDialog(false);
    }
    else if (response?.data?.resultcode === "220") {
      EventRegister.emit(
        LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE,
        { msg: response?.data?.resultmsg || 'Password update failed' }
      );
            setShowPasswordDialog(false);

    }
    else {
      EventRegister.emit(
        LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE,
        { msg: 'Something went wrong. Please try again.' }
      );
    }

  } catch (error) {
    LogError('Password update error', error);

    EventRegister.emit(
      LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE,
      { msg: 'Network error. Please try again.' }
    );
  }
};

const handlePasswordCancel = () => {
  setShowPasswordDialog(false);
  setNewPassword('');
  setConfirmPassword('');
  setPasswordError('');
  setConfirmError('');
  setShowNewPassword(false);
  setShowConfirmPassword(false);
  setPasswordLoading(false);
};


  const myAccountData = () =>{
    return(<>
        <View style={styles.container}>
      <View style={styles.header}>
      
        <Text style={styles.headerText}>My Account</Text>
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

      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Account</Text>
      </View>

      <View style={styles.userContainer}>
        <View style={styles.userInfo}>
          <Image
            source={require('../../../app_assets/symbols/sym_75.png')}
            style={styles.icon}
          />
          <Text style={styles.username}>{name}</Text>
        </View>
        <TouchableOpacity onPress={() => {
            setShowDialog(true)
            setShowMessage("Enter Name")
            setInputType("name")
            setValue(name)
        }}
        style={{padding:10}}
        >
          <Image
            source={require('../../../app_assets/symbols/sym_25.png')}
            style={styles.editIcon}
          />
        </TouchableOpacity>

      </View>

      <View style={styles.userContainer}>
        <View style={styles.userInfo}>
          <Image
            source={require('../../../app_assets/symbols/sym_09.png')}
            style={styles.icon}
          />
          <Text style={styles.username}>{mobileNumber}</Text>
        </View>
        {mverified !== '1' && (
          <TouchableOpacity onPress={() => {
            setShowDialog(true)
            setShowMessage("Enter Mobile Number")
            setInputType("mobileNumber")
            setValue(mobileNumber)
          }}
          style={{padding:10}}
          >

            <Image
              source={require('../../../app_assets/symbols/sym_25.png')}
              style={styles.editIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.userContainer}>
        <View style={styles.userInfo}>
          <Image source={require('../../../app_assets/symbols/sym_27.png')} style={styles.icon} />
          <Text style={styles.username}>{email || 'N/A'}</Text>
        </View>
        {everified !== '1' && (
          <TouchableOpacity onPress={() => {
            setShowDialog(true)
            setShowMessage("Enter Email ID")
            setInputType("email")    
            setValue(email)
          }}
          style={{padding:10}}
          >
            <Image source={require('../../../app_assets/symbols/sym_02.png')} style={styles.editIcon} />
          </TouchableOpacity>
        )}
      </View>
       {/* <View style={styles.userContainer}>
         <View style={styles.userInfo}>
           <Image
             source={require('../../../app_assets/symbols/sym_47.png')}
             style={styles.icon}
           />
           <Text style={styles.username}>Update Password</Text>
         </View>
         <TouchableOpacity onPress={() => setShowPasswordDialog(true)} style={{padding:10}}>
           <Image
             source={require('../../../app_assets/symbols/sym_25.png')}
             style={styles.editIcon}
           />
         </TouchableOpacity>
       </View> */}

        <AccountDialog
          showDialog={showDialog}
          setShowDialog={setShowDialog}
          value={value}
          title={showMessage}
          dataType={inputType}
          updateProfile={update}
        />

<Modal
  visible={showPasswordDialog}
  animationType="slide"
  transparent={true}
  statusBarTranslucent
  onRequestClose={handlePasswordCancel}
>
  <View style={styles.sheetOverlay}>
    <TouchableOpacity
      style={styles.sheetBackdrop}
      activeOpacity={1}
      onPress={handlePasswordCancel}
    />
    <View style={styles.sheetCard}>
      <View style={styles.sheetHandle} />
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Update Password</Text>
        <TouchableOpacity
          style={styles.sheetCloseBtn}
          onPress={handlePasswordCancel}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../../app_assets/symbols/sym_06.png')}
            style={styles.sheetCloseIcon}
          />
        </TouchableOpacity>
      </View>
      {/* New Password */}
      <View style={styles.sheetInputRow}>
        <Image
          source={require('../../../app_assets/symbols/sym_47.png')}
          style={styles.sheetInputIcon}
        />
        <TextInput
          style={styles.sheetInput}
          placeholder="New Password"
          placeholderTextColor="#6b6b6b"
          secureTextEntry={!showNewPassword}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity
          onPress={() => setShowNewPassword(!showNewPassword)}
          activeOpacity={0.7}
        >
          <Image
            source={showNewPassword
              ? require('../../../app_assets/symbols/sym_28.png')
              : require('../../../app_assets/symbols/sym_38.png')}
            style={styles.sheetEyeIcon}
          />
        </TouchableOpacity>
      </View>
      {/* Confirm Password */}
      <View style={styles.sheetInputRow}>
        <Image
          source={require('../../../app_assets/symbols/sym_47.png')}
          style={styles.sheetInputIcon}
        />
        <TextInput
          style={styles.sheetInput}
          placeholder="Confirm Password"
          placeholderTextColor="#6b6b6b"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          activeOpacity={0.7}
        >
          <Image
            source={showConfirmPassword
              ? require('../../../app_assets/symbols/sym_28.png')
              : require('../../../app_assets/symbols/sym_38.png')}
            style={styles.sheetEyeIcon}
          />
        </TouchableOpacity>
      </View>
      {/* Error */}
      {passwordError ? (
        <Text style={styles.sheetError}>{passwordError}</Text>
      ) : null}
      {/* Cancel link */}
      <TouchableOpacity
        onPress={handlePasswordCancel}
        activeOpacity={0.7}
        style={styles.sheetCancelWrap}
      >
        <Text style={styles.sheetCancelText}>Cancel</Text>
      </TouchableOpacity>
      {/* CTA */}
      <TouchableOpacity
        style={styles.sheetCta}
        onPress={handlePasswordUpdate}
        activeOpacity={0.8}
      >
        <Text style={styles.sheetCtaText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>D.O.B</Text>
      </View>


      <View style={styles.userContainer}>
        <View style={styles.userInfo}>
          <Image source={require('../../../app_assets/symbols/sym_08.png')} style={styles.icon} />
          <Text style={styles.username}>{selectedDate || 'Select a Date'}</Text>
        </View>
        <TouchableOpacity onPress={() => {
        setShowCalendarDialog(true)
          setInputType('dob');
          setValue(selectedDate)
        }}
        style={{padding:10}}
        >
          <Image source={require('../../../app_assets/symbols/sym_02.png')} style={styles.editIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Gender</Text>
      </View>

      <View style={styles.genderContainer}>
        <TouchableOpacity onPress={() => handleGenderChange('male')} style={styles.genderButtons}>
          <Image source={radioButtons.male.radioOn} style={styles.radioIcons} />
          <Text style={styles.genderTextStyle}>Male</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleGenderChange('female')} style={styles.genderButtons}>
          <Image source={radioButtons.female.radioOn} style={styles.radioIcons} />
          <Text style={styles.genderTextStyle}>Female</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleGenderChange('other')} style={styles.genderButtons}>
          <Image source={radioButtons.other.radioOn} style={styles.radioIcons} />
          <Text style={styles.genderTextStyle}>Others</Text>
        </TouchableOpacity>
      </View>

        <CalendarDialog
          showDialog={showCalendarDialog}
          setShowDialog={setShowCalendarDialog}
          value={value}
          updateProfile={update}
        />

      {/* <Dialog.Container visible={showCalendarDialog} contentStyle={{ backgroundColor: '#3b3f42' }}>
        <Dialog.Title >{selectedDate ? ` ${selectedDate}` : 'Select a Date'}</Dialog.Title>
        <Dialog.Description>
          <Calendar
            theme={{
              calendarBackground: '#3b3f42',
              dayTextColor: '#fff',
              monthTextColor: 'white',
              selectedDayBackgroundColor: '#00ffff',
              textDisabledColor: '#929496',
              selectedDayTextColor: 'black',
              todayTextColor: 'white',
              arrowColor: '#00ffff',

            }}
            markedDates={selectedDate ? { [selectedDate]: { selected: true } } : {}}
            onDayPress={(day: any) => {
              setSelectedDate(day.dateString);
            }}
            enableSwipeYears={true}
          />
        </Dialog.Description>
        <Dialog.Button label="Cancel" onPress={handleCalendarDialogClose} style={{ color: '#00ffff' }} />
        <Dialog.Button label="OK" onPress={() => { handleCalendarDialogClose(), update() }} style={{ color: '#00ffff' }} />
      </Dialog.Container> */}


      
    </View>
    </>);
  }

  return (
    <>
    {status === 'successful' && myAccountData()}
    {status === 'loading' && <LoadingSpinner />}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // header: {
  //   height: 56,
  //   backgroundColor: '#17171D',
  //   // justifyContent: 'flex-end',
  //   alignItems: 'center',
  //   paddingBottom: 18,
  //   justifyContent: 'center',
  //   borderBottomWidth: 1,
  //   borderBottomColor: 'rgba(255,255,255,0.05)',
  // },

  backButton: {
    position: 'absolute',
    left: 16,
    bottom: 12,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#24242D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // backIcon: {
  //   width: 18,
  //   height: 18,
  //   tintColor: '#FFFFFF',
  // },
  header: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', height:56, backgroundColor: '#000000', },
   backIcon: { width: 20, height: 20, }, headerText: { fontSize: 18, fontWeight: 'bold', color: 'white', textAlign: 'center', position:'absolute', left:0, right:0, },

  // headerText: {
  //   fontSize: 22,
  //   fontWeight: '700',
  //   color: '#FFFFFF',
  //   textAlign: 'center',
  //   alignSelf: 'center',
  // },

  sectionCard: {
    marginHorizontal: 18,
    marginTop: 20,
    backgroundColor: '#17171D',
    borderRadius: 24,
    paddingVertical: 10,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  titleContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 10,
  },

  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginHorizontal: 14,
    marginVertical: 8,

    backgroundColor: '#1E1E26',
    borderRadius: 18,

    paddingHorizontal: 16,
    paddingVertical: 18,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#2A2A35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  icon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
    marginRight: 10,
  },

  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flexShrink: 1,
  },

  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2A2A35',
    justifyContent: 'center',
    alignItems: 'center',
  },

  editIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },

  genderContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  genderButtons: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#1E1E26',
    borderRadius: 16,

    paddingVertical: 16,
    paddingHorizontal: 16,

    marginBottom: 12,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },

  radioIcons: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: colors.action_primary,
  },

  genderTextStyle: {
    marginLeft: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  input: {
    backgroundColor: '#1E1E26',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2D8CFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 10,
  },

  dialogContainer: {
    backgroundColor: '#17171D',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  dialogTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },

  closeIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },

  passwordContainer: {
    marginHorizontal: 16,
    marginTop: 12,
  },

  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#1E1E26',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',

    borderRadius: 16,

    paddingHorizontal: 14,
    marginVertical: 10,
  },

  passwordInput: {
    flex: 1,
    color: '#FFFFFF',
    height: 52,
    fontSize: 15,
  },

  eyeIcon: {
    width: 22,
    height: 22,
    tintColor: '#A1A1AA',
  },

  updateButton: {
    marginTop: 18,
    backgroundColor: '#2D8CFF',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },

  updateButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },

  errorText: {
    color: '#FF6B6B',
    marginTop: 6,
    fontSize: 13,
    marginLeft: 2,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },

  modalContainer: {
    width: '88%',
    backgroundColor: '#17171D',
    borderRadius: 28,
    padding: 22,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },

  modalInput: {
    width: '100%',
    height: 52,
    backgroundColor: '#1E1E26',
    color: '#FFFFFF',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',

    borderRadius: 16,
    paddingHorizontal: 14,

    marginTop: 10,
  },

  modalButtonContainer: {
    flexDirection: 'row',
    marginTop: 24,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: '#2A2A35',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 10,
  },

  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  submitButton: {
    flex: 1,
    backgroundColor: '#2D8CFF',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginLeft: 10,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
   sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetCard: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3a3a3c',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  sheetCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetCloseIcon: {
    width: 14,
    height: 14,
    tintColor: '#a1a1aa',
  },
  sheetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 54,
  },
  sheetInputIcon: {
    width: 18,
    height: 18,
    tintColor: '#8e8e93',
    marginRight: 12,
  },
  sheetInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
  },
  sheetEyeIcon: {
    width: 20,
    height: 20,
    tintColor: '#8e8e93',
  },
  sheetError: {
    color: '#ff453a',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
    marginLeft: 4,
  },
  sheetCancelWrap: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetCancelText: {
    color: '#8e8e93',
    fontSize: 15,
    fontWeight: '600',
  },
  sheetCta: {
    backgroundColor: '#e50914',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sheetCtaText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MyAccount;