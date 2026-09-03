import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  LOCAL_EVENTS,
  LogError,
  configData,
  logoutCurrentProfile,
  removeEventListener,
  removeExtension,
} from '../../app_config/AppConstants';
import { useDispatch } from 'react-redux';
import { store } from '../../state_mgmt/ReduxStore';
import {
  USER_UUID,
  selectedUserProfile,
  icons,
} from '../../app_config/AppConstants';
import {
  doLogout,
  doLogoutAll,
} from '../../state_mgmt/AppCommonSlice';
import { EventRegister } from 'react-native-event-listeners';
import { APP_EVENTS_ } from '../../app_config/AnalyticsConfig';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { device } from '../../app_config/DeviceInfo';
import {
  LogoutDialog,
  LogoutDialogAll,
} from '../../data_models/DialogData';

const { width } = Dimensions.get('window');

const Profile = () => {
  const navigation: any = useNavigation();

  const dispatch = useDispatch<any>();

  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [logoutAllDialogVisible, setLogoutAllDialogVisible] = useState(false);

  const [name, setName] = useState('');
  const [profileid, setProfileId] = useState('');
  const [image, setImage] = useState('');

  const appVersion = device.appver;

  function callLogoutApi() {
    try {
      auth().signOut();
    } catch (error) {}

    try {
      const response = doLogout(profileid);

      response.then((x) => {
        try {
          if ('data' in x) {
            if (x.data.resultcode === '101') {

              logoutCurrentProfile();
              navigation.replace('Login');
            }
          } else {
          }
        } catch (error) {
          LogError(
            'Profile callLogoutApi doLogout catch inside',
            error,
          );
        }
      });
    } catch (error) {
      LogError(
        'Profile callLogoutApi doLogout catch outside',
        error,
      );
    }
  }

  const logout = () => {
    try {
      const signresp = GoogleSignin.isSignedIn();

      signresp
        .then(
          (status) => {
            try {

              if (status) {
                GoogleSignin.signOut();
              }

              callLogoutApi();
            } catch (error) {
              LogError(
                'Profile logout GoogleSignin catch inside',
                error,
              );
            }
          },
          (onreject) => {
            callLogoutApi();
          },
        )
        .catch((errror) => {
          callLogoutApi();
        });
    } catch (error) {
      LogError(
        'Profile logout GoogleSignin catch outside',
        error,
      );
    }
  };

  const logoutAll = () => {
    try {
      const response = doLogoutAll(USER_UUID);

      response.then((x) => {
        try {
          if ('data' in x) {
            if (x.data.resultcode === '101') {
              EventRegister.emitEvent(
                LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE,
                { msg: 'Logout sucessful!!' },
              );

            } else {
              EventRegister.emitEvent(
                LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE,
                { msg: 'Some thing went wrong!!' },
              );
            }
          } else {
            EventRegister.emitEvent(
              LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE,
              { msg: 'Try Again Later !!' },
            );

          }
        } catch (error) {
          LogError(
            'Profile logoutAll doLogoutAll catch inside',
            error,
          );
        }
      });
    } catch (error) {
      LogError(
        'Profile logoutAll doLogoutAll catch outside',
        error,
      );
    }
  };

  const handleLogoutPress = () => {
    setLogoutDialogVisible(true);
  };

  const handleLogoutAllPress = () => {
    setLogoutAllDialogVisible(true);
  };

  const [count, setcount] = useState(1);

  const unsubscribe = store.subscribe(() => {
    let { subscription } = store.getState();


    setcount(subscription.count);
  });

  var profileEvenId: string | Boolean = '';

  useFocusEffect(
  React.useCallback(() => {
    updateUserProfileDetails();
  }, [])
);

  function updateUserProfileDetails() {
    setName(selectedUserProfile ? selectedUserProfile.name : '');
    setProfileId(
      selectedUserProfile ? selectedUserProfile.profileid : '',
    );
    setImage(selectedUserProfile ? selectedUserProfile.image : '');
  }

  useEffect(() => {
    updateUserProfileDetails();

    profileEvenId = EventRegister.addEventListener(
      LOCAL_EVENTS.EVENT_PROFILE_CHNAGE,
      () => {
        updateUserProfileDetails();
      },
    );

    return () => {
      removeEventListener(profileEvenId);

      unsubscribe();
    };
  }, []);

  const currstate = store.getState();

  useEffect(() => {
    setcount(currstate.subscription.count);
  }, [currstate]);

  function eventRecord(screenName: string) {
    try {
      var tempname = screenName;

      tempname =
        tempname[0].toUpperCase() + tempname.slice(1);

      APP_EVENTS_.screen(tempname);
    } catch (error) {
    }
  }

  const navigateToScreen = (screenName: string) => {
    if (screenName === 'subscriptions') {
      navigation.push('subscriptions', {
        intent: {
          url: configData.data.config.paywallurl,
          title: 'Subscription',
        },
      });

      eventRecord(screenName);
    } else if (screenName === 'aboutus') {
      navigation.push('webview', {
        intent: {
          url: configData.data.config.weburls.aboutus,
          title: 'About us',
        },
      });

      eventRecord(screenName);
    } else if (screenName === 'PrivacyPolicy') {
      navigation.push('webview', {
        intent: {
          url: configData.data.config.weburls.privacy,
          title: 'Privacy Policy',
        },
      });

      eventRecord(screenName);
    } else if (screenName === 'terms') {
      navigation.push('webview', {
        intent: {
          url: configData.data.config.weburls.tnc,
          title: 'Terms and Conditions',
        },
      });

      eventRecord(screenName);
    } else if (screenName === 'contactus') {
      navigation.push('webview', {
        intent: {
          url: configData.data.config.weburls.contactus,
          title: 'Contact Us',
        },
      });

      eventRecord(screenName);
    } else if (screenName === 'complaint') {
      navigation.push('webview', {
        intent: {
          url: configData.data.config.weburls.contentcomplaints,
          title: 'Content Complaints',
        },
      });

      eventRecord(screenName);
    } else if (screenName === 'refund') {
      navigation.push('webview', {
        intent: {
          url: configData.data.config.weburls.refund,
          title: 'Refund',
        },
      });

      eventRecord(screenName);
    } else if (screenName === 'disclaimer') {
      navigation.push('webview', {
        intent: {
          url: configData.data.config.weburls.disclaimer,
          title: 'Disclaimer',
        },
      });

      eventRecord(screenName);
    } else if (screenName === 'notifications') {
      Linking.openSettings();

      eventRecord(screenName);
    } else {
      navigation.push(screenName);
    }
  };

  const menuItems = [
    {
      title: 'Profiles',
      icon: require('../../../app_assets/symbols/sym_61.png'),
      screen: 'WhosWatching',
    },
    {
      title: 'My Account',
      icon: require('../../../app_assets/symbols/sym_56.png'),
      screen: 'MyAccount',
    },
    {
      title: 'Manage Devices',
      icon: require('../../../app_assets/symbols/sym_61.png'),
      screen: 'ManageDevices',
    },
    {
      title: 'Subscriptions',
      icon: require('../../../app_assets/symbols/sym_70.png'),
      screen: 'subscriptions',
    },
    {
      title: 'Watch History',
      icon: require('../../../app_assets/symbols/sym_77.png'),
      screen: 'ViewingHistory',
    },
    {
      title: 'Wishlist',
      icon: require('../../../app_assets/symbols/sym_79.png'),
      screen: 'Wishlist',
    },
    // {
    //   title: 'Activate TV',
    //   icon: require('../../../app_assets/symbols/sym_01.png'),
    //   screen: 'TvActivation',
    // },
    {
      title: 'Notifications',
      icon: require('../../../app_assets/symbols/sym_57.png'),
      screen: 'notifications',
    },
    {
      title: 'Privacy Policy',
      icon: require('../../../app_assets/symbols/sym_60.png'),
      screen: 'PrivacyPolicy',
    },
    {
      title: 'Terms & Conditions',
      icon: require('../../../app_assets/symbols/sym_15.png'),
      screen: 'terms',
    },
    {
      title: 'About us',
      icon: require('../../../app_assets/symbols/sym_10.png'),
      screen: 'aboutus',
    },
    {
      title: 'Contact us',
      icon: require('../../../app_assets/symbols/sym_12.png'),
      screen: 'contactus',
    },
    {
      title: 'Content Complaints',
      icon: require('../../../app_assets/symbols/sym_11.png'),
      screen: 'complaint',
    },
    {
      title: 'Refund',
      icon: require('../../../app_assets/symbols/sym_14.png'),
      screen: 'refund',
    },
    {
      title: 'Disclaimer',
      icon: require('../../../app_assets/symbols/sym_13.png'),
      screen: 'disclaimer',
    },
  ];

  return (
    <>
      <StatusBar
        backgroundColor="#0B0B0F"
        barStyle="light-content"
      />

      <ScrollView
        style={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.headerCard}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                navigation.push('AddProfile', {
                  selectedProfile: name,
                  selectedProfileId: profileid,
                  image: image,
                });
              }}>
              <View style={styles.imageWrapper}>
                <Image
                  source={
                    icons[
                      removeExtension(
                        image,
                      ) as keyof typeof icons
                    ]
                  }
                  style={styles.profileImage}
                />

                <View style={styles.editIconContainer}>
                  <Image
                    source={require('../../../app_assets/symbols/sym_26.png')}
                    style={styles.editIcon}
                  />
                </View>
              </View>
            </TouchableOpacity>

            <Text style={styles.profileName}>
              {selectedUserProfile.name}
            </Text>

            <Text style={styles.profileSubText}>
              Manage your account and preferences
            </Text>
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                style={styles.menuCard}
                onPress={() =>
                  navigateToScreen(item.screen)
                }>
                <View style={styles.leftContainer}>
                  <View style={styles.iconBg}>
                    <Image
                      source={item.icon}
                      style={styles.ProfileIcon}
                      tintColor="#FFFFFF"
                    />
                  </View>

                  <Text style={styles.myAccountTitle}>
                    {item.title}
                  </Text>
                </View>

                <Text style={styles.arrow}>{'›'}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.menuCard}
              onPress={handleLogoutAllPress}>
              <View style={styles.leftContainer}>
                <View style={styles.iconBg}>
                  <Image
                    source={require('../../../app_assets/symbols/sym_49.png')}
                    style={styles.ProfileIcon}
                    tintColor="#FFFFFF"
                  />
                </View>

                <Text style={styles.myAccountTitle}>
                  Logout Other Devices
                </Text>
              </View>

              <Text style={styles.arrow}>{'›'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.menuCard}
              onPress={handleLogoutPress}>
              <View style={styles.leftContainer}>
                <View style={styles.iconBg}>
                  <Image
                    source={require('../../../app_assets/symbols/sym_48.png')}
                    style={styles.ProfileIcon}
                    tintColor="#FFFFFF"
                  />
                </View>

                <Text style={styles.myAccountTitle}>
                  Logout
                </Text>
              </View>

              <Text style={styles.arrow}>{'›'}</Text>
            </TouchableOpacity>

            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>
                Version {appVersion}
              </Text>
            </View>
          </View>

          <LogoutDialog
            logoutDialogVisible={logoutDialogVisible}
            setLogoutDialogVisible={
              setLogoutDialogVisible
            }
            logout={logout}
          />

          <LogoutDialogAll
            logoutAllDialogVisible={
              logoutAllDialogVisible
            }
            setLogoutAllDialogVisible={
              setLogoutAllDialogVisible
            }
            logoutAll={logoutAll}
          />
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },

  container: {
    flex: 1,
    paddingBottom: 30,
  },

  headerCard: {
    marginHorizontal: 18,
    marginTop: 20,
    paddingVertical: 28,
    borderRadius: 28,
    alignItems: 'center',
    backgroundColor: '#17171D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  imageWrapper: {
    position: 'relative',
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#ffffff',
  },

  editIconContainer: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#333333',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#17171D',
  },

  editIcon: {
    width: 15,
    height: 15,
    tintColor: '#FFFFFF',
  },

  profileName: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  profileSubText: {
    marginTop: 6,
    fontSize: 13,
    color: '#8E8E93',
  },

  menuContainer: {
    marginTop: 22,
    paddingHorizontal: 18,
  },

  menuCard: {
    backgroundColor: '#17171D',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,

    elevation: 4,
  },

  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#24242D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutIconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FF4D4F',
    justifyContent: 'center',
    alignItems: 'center',
  },

  ProfileIcon: {
    width: 20,
    height: 20,
  },

  myAccountTitle: {
    marginLeft: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  arrow: {
    fontSize: 26,
    color: '#8E8E93',
    marginTop: -2,
  },

  logoutCard: {
    backgroundColor: '#17171D',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginTop: 4,
    marginBottom: 14,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: 'rgba(255,77,79,0.25)',
  },

  logoutText: {
    marginLeft: 16,
    fontSize: 15,
    fontWeight: '700',
    color: '#FF6B6B',
  },

  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },

  versionText: {
    fontSize: 13,
    color: '#6E6E73',
    letterSpacing: 0.5,
  },

  dialogContainer: {
    backgroundColor: '#444444',
    paddingHorizontal: 10,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});

export default Profile;