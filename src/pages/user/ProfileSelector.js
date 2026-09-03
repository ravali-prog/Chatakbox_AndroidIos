import { FlashList } from '@shopify/flash-list';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  TouchableHighlight,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import addIcon from '../../../app_assets/symbols/sym_53.png';
import { useNavigation } from '@react-navigation/native';
import { doProfileAction, getUserActivity, profileLoginPIN } from '../../state_mgmt/AppCommonSlice';
import {
  LOCAL_EVENTS,
  LogError,
  USER_UUID,
  removeExtension,
  selectedUserProfile,
  setSelectedUserProfile,
  setUseractivityDetails,
} from '../../app_config/AppConstants';
import LoadingSpinner from '../../ui_components/widgets/LoadingSpinner';
import { EventRegister } from 'react-native-event-listeners';
import { APP_EVENTS_ } from '../../app_config/AnalyticsConfig';
import { colors } from '../../theming/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
// const AVATAR_SIZE = 140;
const AVATAR_SIZE = Math.min(screenWidth * 0.35, 120);

export default function WhosWatching() {
  const [items, setItems] = useState([]);
  const [selectedProfile, setSelectedProfileName] = useState(null);
  const [selectedProfileID, setSelectedProfileID] = useState(null);
  const [headerText, setHeaderText] = useState('Profile');
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const navigation = useNavigation();
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  const [tempSelectedProfile, setTempSelectedProfile] = useState(null);
  const [pin, setPin] = useState('');
  const [image, setImage] = useState('');
  const [serverImages, setServerImages] = useState([]);
  const [status, setStatus] = useState('loading');
  const [isPrimary, setIsPrimary] = useState();
  const [dataWithAddIcon, setDataWithAddIcon] = useState([]);
  const pinInputRef = useRef(null);

  const imagePaths = {
    User1: require('../../../app_assets/avatars_sm/av_sm_01.png'),
    User2: require('../../../app_assets/avatars_sm/av_sm_02.png'),
    User3: require('../../../app_assets/avatars_sm/av_sm_03.png'),
    User4: require('../../../app_assets/avatars_sm/av_sm_04.png'),
    User5: require('../../../app_assets/avatars_sm/av_sm_05.png'),
    User6: require('../../../app_assets/avatars_sm/av_sm_06.png'),
    User7: require('../../../app_assets/avatars_sm/av_sm_07.png'),
    Kids: require('../../../app_assets/avatars_sm/Kids.png'),
    // Kids: require("../../../assets/Users_200/Kids.png"),

  };

  const handleBackPress = () => navigation.goBack();

  const handlePinModalClose = () => {
    setPin('');
    setPinModalVisible(false);
  };

  const handlePinModalSubmit = () => {
    try {
      const profileID = editMode ? selectedProfileID : tempSelectedProfile.profileid;
      const response = profileLoginPIN('profilelogin', USER_UUID, profileID, pin);
      response.then((x) => {
        try {
          if ('data' in x) {
            if (x.data.resultcode === '101') {
              if (editMode) {
                navigation.push('AddProfile', {
                  selectedProfile,
                  selectedProfileId: selectedProfileID,
                  isProtected,
                  serverImages,
                  image,
                  isPrimary,
                });
                EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE, { msg: 'Entered in Edit Mode' });
              } else {
                setSelectedUserProfile(tempSelectedProfile);
                fetchuserActivity();
              }
            } else {
              setPinModalVisible(false);
              EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE, {
                msg: 'Forbidden - ' + x.data.resultmsg,
              });
            }
          }
        } catch (error) {
          LogError('WhosWatching handlePinModalSubmit inside', error);
        }
      });
    } catch (error) {
      LogError('WhosWatching handlePinModalSubmit outside', error);
    }
    handlePinModalClose();
  };

  const renderPinModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={pinModalVisible}
      onRequestClose={handlePinModalClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Enter PIN to access profile</Text>
          <View style={styles.pinWrapper}>
            <TextInput
              ref={pinInputRef}
              style={styles.pinInput}
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              maxLength={4}
              placeholder="••••"
              placeholderTextColor="#555"
              secureTextEntry
            />
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity
            activeOpacity={0.9}
              style={[styles.modalBtn, styles.modalBtnGhost]}
              onPress={handlePinModalClose}
            >
              <Text style={[styles.modalBtnText, styles.modalBtnTextGhost]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} style={styles.modalBtn} onPress={handlePinModalSubmit}>
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const handleEditPress = () => {
    setEditMode((prev) => !prev);
    setHeaderText((prev) => (prev === 'Manage Profiles' ? "Profile" : 'Manage Profiles'));
  };

  const fetchData = useCallback(() => {
    try {
      const userprofiles = doProfileAction('myprofiles', USER_UUID, '', '', '');
      userprofiles.then((x) => {
        try {
          if ('data' in x) {
            for (let i = 0; i < x.data.profiles.length; i++) {
              if (x.data.profiles[i].profileid === selectedUserProfile?.profileid) {
                setSelectedItemIndex(i);
                break;
              }
            }
            setStatus('successful');
            setItems(x.data.profiles);
            const profileImages = x.data.profiles.map((p) => p.image);
            setServerImages(profileImages.map(removeExtension));
          }
        } catch (error) {
          LogError('WhosWatching fetchData inner', error);
        }
      });
    } catch (error) {
      LogError('WhosWatching fetchData outer', error);
    }
  }, []);

  useEffect(() => {
    const list = items.length < 5
      ? [...items, { name: 'Add', code: 'transparent' }]
      : [...items];
    setDataWithAddIcon(list);
  }, [items, editMode]);

  useEffect(() => {
    try { APP_EVENTS_.screen('ProfileManagement'); } catch (_) {}
  }, []);

  const handleProfileChange = () => {
    try {
      const primaryProfileIndex = items.findIndex((p) => p.primary === '1');
      if (primaryProfileIndex !== -1) {
        setSelectedItemIndex(primaryProfileIndex);
        setSelectedUserProfile(items[primaryProfileIndex]);
        EventRegister.emitEvent(LOCAL_EVENTS.EVENT_PROFILE_CHNAGE, {});
      }
    } catch (error) {
      LogError('WhosWatching handleProfileChange', error);
    }
  };

  useEffect(() => {
    const el = EventRegister.addEventListener(
      LOCAL_EVENTS.EVENT_SELECTED_DELETE_REASSIGN_PROFILE,
      handleProfileChange
    );
    return () => EventRegister.removeEventListener(el);
  }, [items]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => fetchData());
    return unsub;
  }, [navigation]);

  function fetchuserActivity() {
    try {
      setStatus('loading');
      const userActivity = getUserActivity(USER_UUID, selectedUserProfile.profileid);
      userActivity.then((res) => {
        try {
          if (res?.data) setUseractivityDetails(res.data);
          navigation.goBack();
          EventRegister.emitEvent(LOCAL_EVENTS.EVENT_PROFILE_CHNAGE, {});
          EventRegister.emitEvent(LOCAL_EVENTS.EVENT_WATCHHISTORY_UPDATE, {});
          EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE, {
            msg: 'Profile Changed Successfully.',
          });
        } catch (_) {}
      });
    } catch (_) {}
  }

  const handleItemPress = (item, index) => {
    if (item.name === 'Add') {
      navigation.push('AddProfile', { isAddClicked: true, serverImages });
      return;
    }

    if (!editMode) {
      if (item.protected) {
        setTempSelectedProfile(item);
        setImage(imagePaths[removeExtension(item.image)]);
        setPinModalVisible(true);
      } else {
        setSelectedUserProfile(item);
        setSelectedItemIndex(index);
        setImage(imagePaths[removeExtension(item.image)]);
        fetchuserActivity();
      }
    } else {
      const profileName = items[index].name;
      const profileId = items[index].profileid;
      const imgKey = removeExtension(items[index].image);
      const primary = items[index].primary;

      setSelectedProfileName(profileName);
      setSelectedProfileID(profileId);
      setImage(imgKey);
      setIsPrimary(primary);

      if (item.protected) {
        setIsProtected(true);
        setPinModalVisible(true);
      } else {
        navigation.push('AddProfile', {
          selectedProfile: profileName,
          selectedProfileId: profileId,
          serverImages,
          image: imgKey,
          isPrimary: primary,
        });
        EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE, { msg: 'Entered in Edit Mode' });
      }
    }
  };

  const renderItem = ({ item, index }) => {
    const isSelected = index === selectedItemIndex;

    if (item.name === 'Add') {
      if (editMode) return null;
      return (
        <View style={styles.profileWrapper}>
          <TouchableOpacity onPress={() => handleItemPress(item, index)} activeOpacity={0.9}>
            <View style={[styles.avatarCircle, styles.addCircle]}>
              <Image source={addIcon} style={styles.addIcon} />
            </View>
            <Text style={styles.profileName}>Add Profile</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.profileWrapper}>
        <TouchableOpacity onPress={() => handleItemPress(item, index)} activeOpacity={0.9}>
          <View
            style={[
              styles.avatarCircle,
              isSelected && styles.avatarSelected,
              editMode && styles.avatarEditMode,
            ]}
          >
            <View style={styles.avatarImageWrapper}>
              <Image
                style={styles.avatarImage}
                source={imagePaths[removeExtension(item.image)]}
                resizeMode="cover"
              />
              {editMode && <View style={styles.editOverlay} />}
            </View>

            {item.protected && (
              <View style={styles.badgeLock}>
                <Image
                  style={styles.badgeIcon}
                  source={require('../../../app_assets/symbols/sym_47.png')}
                />
              </View>
            )}

            {editMode && (
              <View style={styles.badgeEdit}>
                <Image
                  style={styles.badgeEditIcon}
                  source={require('../../../app_assets/symbols/sym_25.png')}
                />
              </View>
            )}
          </View>

          <Text
            style={[
              styles.profileName,
              isSelected && !editMode && styles.profileNameSelected,
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const numColumns = dataWithAddIcon.length <= 2 ? 2 : 3;

  const whosWatchingData = () => (
    <View style={styles.container}>

      <View style={styles.topBar}>
        <TouchableOpacity  activeOpacity={0.9}onPress={handleBackPress} style={styles.backBtn}>
          <Image
            source={require('../../../app_assets/symbols/sym_06.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>{headerText}</Text>
      </View>

      <View style={styles.gridArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gridWrapper}>
            {dataWithAddIcon.map((item, index) => (
              <View key={item.profileid ?? 'add'} style={styles.profileWrapper}>
                {renderItem({ item, index })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity  onPress={handleEditPress} activeOpacity={0.9}>
        <View style={styles.bottomBar}>
          <Text style={styles.manageText}>
            {editMode ? 'DONE' : 'MANAGE PROFILES'}
          </Text>
        </View>
      </TouchableOpacity>

      {pinModalVisible && renderPinModal()}
    </View>
  );

  return (
    <>
      {status === 'successful' && whosWatchingData()}
      {status === 'loading' && <LoadingSpinner />}
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    height: 60,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: '#fff',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.4,
    textAlign: 'center',
  },

  gridArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',  
    alignItems: 'center',  
    paddingVertical: 32,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',  
    alignItems: 'flex-start',
    gap: 30,                  
    maxWidth: screenWidth,
  },

  profileWrapper: {
    alignItems: 'center',
     width: (screenWidth - 50 * 3) / 2,
  },

  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2, 
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: '#ffffff',
  },
  avatarEditMode: {
    borderColor: colors.action_primary,
  },

  avatarImageWrapper: {
    width: AVATAR_SIZE - 5,         
    height: AVATAR_SIZE - 5,
    borderRadius: (AVATAR_SIZE - 5) / 2,
    overflow: 'hidden', 
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  addCircle: {
    backgroundColor: '#1c1c1c',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  addIcon: {
    width: 34,
    height: 34,
    tintColor: '#9ca3af',
  },

  profileName: {
    marginTop: 10,
    fontSize: 14,
    color: '#8a8a8a',
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: AVATAR_SIZE + 16,
  },
  profileNameSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },

  badgeLock: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 11,
    backgroundColor: 'rgba(20,20,20,0.9)',
    borderWidth: 1.5,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  badgeIcon: {
    width: 11,
    height: 11,
    tintColor: '#fff',
  },

  badgeEdit: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.action_primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    zIndex: 10,
  },
  badgeEditIcon: {
    width: 13,
    height: 13,
    tintColor: '#fff',
  },

  bottomBar: {
    paddingVertical: 22,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#1e1e1e',
  },
  manageText: {
    fontSize: 13,
    color: '#9ca3af',
    letterSpacing: 1.5,
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.78)',
    padding: 20,
  },
  modalCard: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: '#161616',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#2a2a2a',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 20,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 22,
  },
  pinWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  pinInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    color: '#ffffff',
    letterSpacing: 10,
    backgroundColor: '#0d0d0d',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    backgroundColor: '#e50914',
    alignItems: 'center',
  },
  modalBtnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalBtnText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalBtnTextGhost: {
    color: '#9ca3af',
  },
});