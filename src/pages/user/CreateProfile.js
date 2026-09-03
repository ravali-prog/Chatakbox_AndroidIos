import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Switch,
  ToastAndroid,
  Modal,
  ScrollView,
} from "react-native";
import { doProfileAction, profileLoginPIN } from "../../state_mgmt/AppCommonSlice";
import { LOCAL_EVENTS, LogError, USER_UUID, icons, removeExtension, selectedUserProfile } from "../../app_config/AppConstants";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { EventRegister } from "react-native-event-listeners";
import { APP_EVENTS_ } from "../../app_config/AnalyticsConfig";
import { colors } from "../../theming/colors";

const AddProfile = () => {
  // const [name, setName] = useState(['']);
  const [name, setName] = useState("");
  const [profileid, setprofileid] = useState("");
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [pin, setPin] = useState("");
  const [isProtected, setIsProtected] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [availableImages, setAvailableImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const [isAddClicked, setIsAddClicked] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const imageList = [
    "User1",
    "User2",
    "User3",
    "User4",
    "User5",
    "User6",
    "User7",
  ];
  const imagePaths = {
    User1: require("../../../app_assets/avatars_sm/av_sm_01.png"),
    User2: require("../../../app_assets/avatars_sm/av_sm_02.png"),
    User3: require("../../../app_assets/avatars_sm/av_sm_03.png"),
    User4: require("../../../app_assets/avatars_sm/av_sm_04.png"),
    User5: require("../../../app_assets/avatars_sm/av_sm_05.png"),
    User6: require("../../../app_assets/avatars_sm/av_sm_06.png"),
    User7: require("../../../app_assets/avatars_sm/av_sm_07.png"),
    Kids: require("../../../app_assets/avatars_sm/Kids.png"),
  };
  const [isPrimary, setIsPrimary] = useState();
  const [isSaving, setIsSaving] = useState(false);

  const handleBackPress = () => { };

  useEffect(()=>{
    try {
      APP_EVENTS_.screen("AddProfile")
    } catch (error) {
      LogError("AddProfile",error)
    }  
  },[])

  useEffect(() => {
    // Use availableImages to filter out images
    const remainingImages = imageList.filter(
      (imageName) => !availableImages.includes(imageName)
    );

    setFilteredImages(remainingImages);
  }, [availableImages]);

  useEffect(() => {
    const { selectedProfile, selectedProfileId, isProtected, isAddClicked, serverImages, image, isPrimary } = route.params || {};
  
    if (selectedProfile) {
      setPageTitle("Update Profile")
    } else {
      setPageTitle("Create Profile")
    }
    // setName(selectedProfile);
    setName(selectedProfile || '');
    setprofileid(selectedProfileId);
    setIsProtected(isProtected);
    // setIsSwitchOn(isProtected)
    setIsAddClicked(isAddClicked)
    setSelectedImage(removeExtension(image))
    setIsPrimary(isPrimary)
    if (serverImages) {
      // If serverImages is truthy (neither undefined nor null)
      setAvailableImages(serverImages);
    } else {
      const response = doProfileAction('myprofiles', USER_UUID, '', '', '', '');
  
      response.then((x) => {
        try {
          if ('data' in x && Array.isArray(x.data.profiles)) {
            const serverImages = x.data.profiles.map((profile) => profile.image);
            setAvailableImages(serverImages);
    
            // Check if the selectedProfileId matches any profileid in the response and set isProtected accordingly
            const selectedProfileData = x.data.profiles.find(profile => profile.profileid === selectedProfileId);
            if (selectedProfileData) {
              setIsProtected(selectedProfileData.protected);
            } else {
            }
    
          } else {
          }  
        } catch (error) {
        LogError("AddProfile doProfileAction catch error",error)
          
        }
   
      });
    }
  
  }, [route]);


  const handleSavePress = () => {
    if (isSaving) return; // Prevent multiple clicks
    
    // if (name.trim().length < 2 || name.trim().length > 20) {
      if (!name || name.trim().length < 2 || name.trim().length > 20) {
      EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE, {
        msg: "Name should be minimum 2 to 7 characters"
      });
    } else {
      setIsSaving(true); // Set saving flag
      if (profileid) {
        updateProfile();
      } else {
        addUser();
      }
    }
  };
  
  const addUser = () => {

    try {
      let pinString = null;
    
      if (isSwitchOn) {
        pinString = pin.join("");
        if (!pinString || pinString.length !== 4) {
          setIsSaving(false); // Reset saving flag on error
          return;
        }
      }
    
      const response = doProfileAction(
        "addprofile",
        USER_UUID,
        name,
        selectedImage,
        profileid,
        pinString
      );
    
      response
        .then((x) => {
          try {
            if(x.data.resultcode=="101"){
              setIsSaving(false);
              navigation.goBack();
            }
            else{
              setIsSaving(false);
            }            
          } catch (error) {
            LogError("AddProfile addUser doProfileAction catch error inside",error)
          }
 
        })
        .catch((error) => {
          setIsSaving(false);
          LogError("Error in adding profile:", error);
        })
        .finally(() => {
          setIsSaving(false); // Reset saving flag
        });
      
    } catch (error) {
      LogError("AddProfile addUser doProfileAction catch error outside",error)
    }
  };
  
  const updateProfile = () => {

    try {
      let pinString = null;
  
      if (isSwitchOn) {
        pinString = pin.join("");
        if (!pinString || pinString.length !== 4) {
          setIsSaving(false); // Reset saving flag on error
          return;
        }
      }
    
      const response = doProfileAction(
        "updateprofile",
        USER_UUID,
        name,
        selectedImage,
        profileid,
        pinString
      );
    
      response
        .then((x) => {
          try {
            if ("data" in x && x.data.resultcode === "101") {
              setIsSaving(false);
              EventRegister.emitEvent(LOCAL_EVENTS.EVENT_PROFILE_CHNAGE, {});
              navigation.goBack();
            } else {
              setIsSaving(false);
            }
       } catch (error) {
            LogError("AddProfile updateProfile doProfileAction catch error inside",error)
          }
        })
        .catch((error) => {
          setIsSaving(false);
          LogError("Error in updating profile:", error);
        })
        .finally(() => {
          setIsSaving(false); // Reset saving flag
        });
    } catch (error) {
      LogError("AddProfile updateProfile doProfileAction catch error outside",error)
    }
   
  };


  const deleteUser = () => {
    try {
      const userprofiles = doProfileAction(
        "deleteprofile",
        USER_UUID,
        name,
        "",
        profileid
      );
      userprofiles.then((response) => {
        try {

          if (response.data) {
            try {
              if(selectedUserProfile.profileid===profileid)
              {
                EventRegister.emitEvent(LOCAL_EVENTS.EVENT_SELECTED_DELETE_REASSIGN_PROFILE,{})
              }
            } catch (error) {
              LogError('EVENT_SELECTED_DELETE_REASSIGN_PROFILE',error)
            }
            navigation.goBack();
          } else {
          }          
        } catch (error) {
          LogError("AddProfile deleteUser doProfileAction catch error inside",error)
        }
    
      });
    } catch (error) {
      LogError("AddProfile deleteUser doProfileAction catch error outside",error)
    }
  };

  const backPage = () => {
    navigation.navigate("WhosWatching");
  };

  const handleSwitchToggle = () => {
    setIsSwitchOn((prev) => !prev);
    setPin(["", "", "", ""]);
  };

  const pin1ref = useRef(null);
  const pin2ref = useRef(null);
  const pin3ref = useRef(null);
  const pin4ref = useRef(null);

  const handleKeyPress = (event, ref, index) => {
    if (event.nativeEvent.key === "Backspace") {
      if (pin[index] !== "") {
        setPin((prev) => {
          const newPin = [...prev];
          newPin[index] = "";
          return newPin;
        });
        if (index > 0) {
          ref.current.focus();
        }
      } else if (index > 0) {
        const prevRef = index === 1 ? pin1ref : index === 2 ? pin2ref : pin3ref;
        prevRef.current.focus();
      }
    } else if (index < 3) {
      const nextRef = index === 0 ? pin2ref : index === 1 ? pin3ref : pin4ref;
      nextRef.current.focus();
    }
  };
  const displayUserImages = () => {
    setIsImageModalVisible(true);
  };

  const selectImage = imageName => {
    
    if (imageName) {
      setSelectedImage(imageName);
    } else {
      // If no image is selected, set the default image path
      const defaultImagePath = getImagePath(); // Update with your default image path
      setSelectedImage(defaultImagePath);
    }
    setIsImageModalVisible(false);
  };

  const renderImageItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => selectImage(item)} style={styles.imageModalContainer}>
      <Image source={imagePaths[removeExtension(item)]} style={styles.imageItem} />
    </TouchableOpacity>
  );
  

  const renderSelectedImage = () => {
    if (selectedImage) {
      const imagePath = getImagePath(selectedImage);
      return (
      <Image source={imagePath} style={styles.image} />);
    } else if (filteredImages.length > 0) {
      // Display the first image from the remaining images as the default
      const defaultImage = filteredImages[0];
      const defaultImagePath = getImagePath(defaultImage);
      setSelectedImage(defaultImage);

      return (
      <Image source={defaultImagePath} style={styles.image} />);
    } else {
      // If no selected image and no remaining images, you can set a default image here
      const defaultImage = getImagePath(); // Update with your default image path
      setSelectedImage(defaultImage);
      return (
      <Image source={defaultImage} style={styles.image} />);
    }
  };

  const getImagePath = (imageName) => {
    switch (imageName) {
      case "User1":
        return icons.User1;
      case "User2":
        return icons.User2;
      case "User3":
        return icons.User3;
      case "User4":
        return icons.User4;
      case "User5":
        return icons.User5;
      case "User6":
        return icons.User6;
      case "User7":
        return icons.User7;
        case "Kids":
        return icons.Kids;
      // Add cases for other images
      default:
        return icons.User1; // Replace with your default image path
    }
  };




  return (
    <View style={styles.container}>
      <View style={styles.header}>
            <TouchableOpacity 
            activeOpacity={0.9}
         style={{width: 50,
          height: 50, justifyContent: 'center',
          alignItems: 'center', }}
        
        onPress={() => navigation.goBack()}>
          <Image
            onPress={backPage}
            source={require("../../../app_assets/symbols/sym_06.png")}
            style={styles.backIcon}
          />
        </TouchableOpacity>
       
        <Text style={styles.headerText}>{pageTitle}</Text>
    
        <TouchableOpacity activeOpacity={0.9} onPress={handleSavePress}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.centerContent}>
          <View>{renderSelectedImage()}</View>
          <TouchableOpacity  activeOpacity={0.9} onPress={() => displayUserImages()}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Enter Name"
            placeholderTextColor="gray"
            value={name}
            onChangeText={(text) => setName(text)}
          />
          <TouchableOpacity
          activeOpacity={0.9}
          >
            <View style={styles.switchContainer}>
              <Switch
                onValueChange={handleSwitchToggle}
                value={isSwitchOn}
                trackColor={{ false: THEME.primary, true: THEME.secondary }}
                thumbColor={
                  isSwitchOn ? THEME.accentPrimary : THEME.accentSecondary
                }
              />

              <Text style={styles.switchLabel}>
                {" "}
                {isProtected ? "Update PIN:" : "Enable PIN:"}
              </Text>
            </View>
          </TouchableOpacity>
          <Modal
            animationType="slide"
            transparent={false}
            visible={isImageModalVisible}
            onRequestClose={() => setIsImageModalVisible(false)}
          >
            <View style={styles.headerinner}>
                        <TouchableOpacity activeOpacity={0.9} onPress={() => setIsImageModalVisible(false)}
                style={{
                  width: 50,
                  height: 50, justifyContent: 'center',
                  alignItems: 'center',
                  //  backgroundColor:'red',
                }}>
                <Image
                  onPress={backPage}
                  source={require("../../../app_assets/symbols/sym_06.png")}
                  style={styles.backIcon}
                />
              </TouchableOpacity>

              <Text style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "white",
                position: 'absolute',
                left: 0,
                right: 0,
                //  backgroundColor:'red',
                flexWrap: 'wrap',
                textAlign: "center",
                // alignItems: "center",
              }}>Choose An Image</Text>

    

            </View>
            <View style={styles.imageModalMainContainer}>
              <FlashList
              
                data={filteredImages} 
                keyExtractor={(item) => item}
                numColumns={2}
                renderItem={renderImageItem}
                estimatedItemSize={125}
                ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
                  contentContainerStyle={{
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  }}
              />

            </View>
          </Modal>


          {isSwitchOn && (
            <View style={styles.inputContainer}>
              <TextInput
                ref={pin1ref}
                keyboardType={"number-pad"}
                maxLength={1}
                value={pin[0]}
                onChangeText={(text) =>
                  setPin((prev) => [text, prev[1], prev[2], prev[3]])
                }
                onKeyPress={(event) => handleKeyPress(event, pin1ref, 0)}
                style={styles.textInputText}
              />
              <TextInput
                ref={pin2ref}
                keyboardType={"number-pad"}
                maxLength={1}
                value={pin[1]}
                onChangeText={(text) =>
                  setPin((prev) => [prev[0], text, prev[2], prev[3]])
                }
                onKeyPress={(event) => handleKeyPress(event, pin2ref, 1)}
                style={styles.textInputText}
              />
              <TextInput
                ref={pin3ref}
                keyboardType={"number-pad"}
                maxLength={1}
                value={pin[2]}
                onChangeText={(text) =>
                  setPin((prev) => [prev[0], prev[1], text, prev[3]])
                }
                onKeyPress={(event) => handleKeyPress(event, pin3ref, 2)}
                style={styles.textInputText}
              />
              <TextInput
                ref={pin4ref}
                keyboardType={"number-pad"}
                maxLength={1}
                value={pin[3]}
                onChangeText={(text) =>
                  setPin((prev) => [prev[0], prev[1], prev[2], text])
                }
                onKeyPress={(event) => handleKeyPress(event, pin4ref, 3)}
                style={styles.textInputText}
              />
            </View>
          )}
        </View>
      </ScrollView>
      {(!isAddClicked && isPrimary == '0') && (
        <TouchableOpacity  activeOpacity={0.9} style={styles.deleteContainer}  onPress={deleteUser}>
          <View>
            <Text style={styles.deleteText}>Delete</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const THEME = {
  primary: colors.action_secondary,    
  secondary: colors.action_primary,   
  accentPrimary: colors.action_secondary,   
  accentSecondary: colors.action_primary, 
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: '#ffffff',
    // backgroundColor:'red'
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.action_primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  centerContent: {
   flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#1f1f1f',
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.action_primary,
    marginTop: 14,
    marginBottom: 24,
  },
  textInput: {
    width: '90%',
    height: 54,
    backgroundColor: '#1e1e1e',
    borderRadius: 14,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#1e1e1e',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  switchLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginTop: 24,

  },
  textInputText: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    fontSize: 24,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.42)',
  },
  deleteContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  deleteText: {
    fontSize: 16,
    color: '#ff453a',
    fontWeight: '600',
    textAlign: 'center',
  },
  headerinner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
  },
  imageModalMainContainer: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  imageModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  imageItem: {
    width: 120,
    height: 120,
    borderRadius: 65,
    margin: 7,
    backgroundColor: '#1f1f1f',
  },
  modalHeader: {
    backgroundColor: '#0a0a0a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  modalHeaderText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
export default AddProfile;