import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Dimensions } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { useNavigation } from '@react-navigation/native';
import { doUserAction } from '../../state_mgmt/AppCommonSlice';
import { USER_UUID, handleNavigation, openReelsIfReelsSourced, selectedUserProfile } from '../../app_config/AppConstants';
import LoadingSpinner from '../../ui_components/widgets/LoadingSpinner';
import CustomModal from '../../data_models/CustomDialogTypes';
import { APP_EVENTS_ } from '../../app_config/AnalyticsConfig';

const Wishlist = () => {

  const navigation = useNavigation();
  const [imageWidth, setImageWidth] = useState(0);
  const UUID = USER_UUID;
  const profileid = selectedUserProfile ? selectedUserProfile.profileid : '';
  const [series, setSeries] = useState([]);
  const [clips, setClips] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [status, setStatus] = useState('loading');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);


  const handleBackPress = () => {
    navigation.goBack()
  };

  const handleModalClose = () => {
    setModalVisible(false);
    navigation.goBack()

  };


  const calculateImageWidth = () => {
    const screenWidth = Dimensions.get('window').width;
    const padding = 10;
    const imagesPerRow = 3;
    const width = (screenWidth - padding * (imagesPerRow)) / imagesPerRow;
    setImageWidth(width);
  };

  useEffect(() => {

    try {
      APP_EVENTS_.screen("WishList")
    } catch (error) {
    }  

    calculateImageWidth();

    const handleWishlistAPI = async () => {
      try {
        // Determine the action based on the current state of isInWatchlist
        const action = 'wishlist';
        // Dispatch getUserData action
        const response = await doUserAction(action, UUID, profileid);

        if (response.data.resultcode === '101') {
          setStatus("successful")

          setSeries(response.data.series);
          setClips(response.data.clips);
          const combinedData = [...series, ...clips];
          setCombinedData(combinedData);
        } else {
          setStatus("failed")
          setLoadingMessage('NO DATA')
          setError("No response from the server");
          setModalVisible(true);
        }
      } catch (error) {
        setStatus("failed")
        setLoadingMessage('NO DATA')
        setError("No response from the server");
        setModalVisible(true);
      }
    };
    handleWishlistAPI();
  }, []);


  const removeWishlistAPI = async (wishlist, videoID, videoType) => {
    try {
      // Determine the action based on the current state of isInWatchlist
      const action = wishlist; // 'addwishlist' or 'removewishlist'

      const response = await doUserAction(action, UUID, profileid, videoType, videoID);

      if (response.data.resultcode === "101") {
        // Handle success, perform actions accordingly

        if (videoType === 'series') {
          setSeries((prevSeries) => prevSeries.filter((seriesItem) => seriesItem.seriesId !== videoID));
        } else if (videoType === 'clip') {
          setClips((prevClips) => prevClips.filter((clipItem) => clipItem.id !== videoID));
        }


      } else {
      }
    } catch (error) {
    }
  };


  useEffect(() => {
    const combinedData = [...series, ...clips];
    setCombinedData(combinedData);
  }, [series, clips]);

  const renderItem = ({ item, type }) => {
    let aspectRatio;
    let thumbnail;
    let videoID;
    let videoType;
    if (item.type === 'series') {
      videoID = item.seriesId;
      videoType = 'series';
      aspectRatio = 2 / 3;
      thumbnail = item.thumbnail['t2x3'];
    } else if (item.type === 'clip') {
      // aspectRatio = 16 / 9;
      // thumbnail = item.thumbnail['t16x9'];
      videoID = item.id;
      videoType = 'clip';
      aspectRatio = 2 / 3;
      thumbnail = item.thumbnail['t2x3'];
    }

    return (
      <View style={[styles.imageContainer, { aspectRatio }]}>
        {/* Use the item data to display images */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => openReelsIfReelsSourced(navigation, { type: videoType, ...item }).then((opened) => { if (!opened) { handleNavigation(navigation, { type: videoType, ...item }); } })}>
          <Image source={{ uri: thumbnail }} style={[styles.image, { aspectRatio }]} />
        </TouchableOpacity>

        {/* <CheckBox
          value={selectedIds.includes(item.type=='playlist'?item.seriesId:item.id)}
          onValueChange={() => toggleSelect(item)}
          style={styles.checkbox}
        /> */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => removeWishlistAPI('removewishlist', videoID, videoType)}>
          <Image
            source={require('../../../app_assets/symbols/sym_17.png')}
            style={styles.checkmark}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const getContent = () => {
    return (<>
      <View style={styles.container}>
        <View style={styles.header}>
   
          <Text style={styles.headerText}>Wishlist</Text>
          <TouchableOpacity activeOpacity={0.9} onPress={handleBackPress} style={{position:'absolute', left:0 , width:50,height:50 ,justifyContent:'center' , alignItems:'center'}}>
            <Image
              source={require('../../../app_assets/symbols/sym_06.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
        </View>
        {combinedData.length > 0 ? (
          <FlatList
            data={combinedData}
            renderItem={renderItem}
            keyExtractor={(item) => (item.item ? item.item.seriesId : item.id)} // Extract ID based on type
            numColumns={2}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No Data</Text>
          </View>
        )}
      </View>
    </>);
  }

  return (
    <>
      {status === 'loading' && <LoadingSpinner />}
      {status === 'failed' && <CustomModal
        visible={modalVisible}
        message={loadingMessage}
        error={error}
        onClose={handleModalClose}
      />}
      {status === 'successful' && getContent()}
    </>
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
    height:56,
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
    flex: 1,
    left:0,
    right:0,
    position:'absolute',
    textAlign: 'center',
  },
  backButton: {
    width: 100,
  },
  imageContainer: {
    flexDirection: 'row',
    height: '100%',
    width: '50%',
    justifyContent: 'center',
    position: 'relative',
    padding: 10
  },
  image: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
    marginTop: 10,
    backgroundColor:"#17171D",
    borderRadius:12,


  },
  checkmark: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 15,
    right: 5,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 20,
    color: '#fff',
  },
});


export default Wishlist;