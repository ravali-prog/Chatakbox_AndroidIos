import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ToastAndroid } from 'react-native';
import { ContentData } from '../../data_models/ContentDataTypes';
import { getHomeContent, searchContent } from '../../state_mgmt/AppCommonSlice';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { LogError, USER_UUID, handleNavigation, selectedUserProfile } from '../../app_config/AppConstants';
import LoadingModal from '../../data_models/LoadingStateTypes';
import CustomModal from '../../data_models/CustomDialogTypes';
import { APP_EVENTS_ } from '../../app_config/AnalyticsConfig';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [combinedData, setCombinedData] = useState<ContentData[]>([]);
  const profileid = selectedUserProfile ? selectedUserProfile.profileid : '';
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);


  const handleModalClose = () => {
    setModalVisible(false);
    navigation.goBack()
  };


  const handleSearch = () => {
    try {
      if (searchQuery.length >= 3) {
        setLoading(true);  // Show loading modal
        setLoadingMessage('Searching...')
        searchContent('search', USER_UUID, profileid, searchQuery)
          .then((response) => {
            try {
              setLoading(false);
              if ('data' in response && response.data.series !== null && response.data.clips !== null) {
                const seriesData = response.data.series;
                const clipsData = response.data.clips;
                const combinedData = [...seriesData, ...clipsData];
                setCombinedData(combinedData);
              } else {
                setError("No response from the server");
                setModalVisible(true);
              }
            } catch (error) {
              LogError("SearchScreen handleSearch searchContent inside catch error",error)

            }
         
          })
          .catch((error) => {
            setLoading(false); // Set loading to false
            setError("No response from the server");
            setModalVisible(true);
          })
      }
    } catch (error) {
      LogError("SearchScreen handleSearch searchContent outside catch error",error)
    }
   
  };

  useEffect(()=>{
    try {
      APP_EVENTS_.screen("Search")
    } catch (error) {
    }
    
  },[])

  useEffect(() => {
    // Trigger the API request whenever searchQuery changes
    handleSearch();
  }, [searchQuery]);

  const renderResultItem = ({ item }: any) => {
    let aspectRatio;
    let thumbnail;
    let videoID;
    let videoType: string;

    if (item === 'playlist') {
      videoID = item.seriesId;
      videoType = 'seriesdetails';

    } else if (item === 'clip') {

      videoID = item.id;
      videoType = 'clip';
    }
    aspectRatio = 2 / 3;
    thumbnail = item.thumbnail['t2x3'];

    return (
      <View style={styles.imageContainer}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => handleNavigation(navigation, { type: videoType, ...item })}>
          <Image source={{ uri: thumbnail }} style={[styles.image, { aspectRatio }]} />
        </TouchableOpacity>
      </View>
    );

  }

  const navigation = useNavigation();
  const handleBackPress = () => {
    navigation.goBack()
  };

  const renderNoDataMessage = () => {
    if (searchQuery.length > 0 && combinedData.length === 0 && !loading) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            No related search results for "{searchQuery}"
          </Text>
        </View>
      );
    }
    return (
      null
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity activeOpacity={0.9} onPress={handleBackPress} style={{
          width: 50,
          height: 50, justifyContent: 'center',
          alignItems: 'center',
          
        }} >
          <Image
            source={require('../../../app_assets/symbols/sym_06.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <TextInput
          placeholderTextColor="#848a94"
          style={styles.searchInput}
          placeholder="Type something to search..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />

      </View>

      <View style={{ height: '100%', flexDirection: 'row', flex:1 , }}>
        {combinedData.length !== 0 ? (
          <FlashList
            estimatedItemSize={500}
            data={combinedData}
            renderItem={renderResultItem}
            keyExtractor={(item) => item.title}
            numColumns={2}
          // ListEmptyComponent={() => (!combinedData.length && <Text style={{ color: '#fff', textAlign: 'center' }}>No results found</Text>)}
          />
        ) : (
          renderNoDataMessage()
        )}
      </View>
      {/* <LoadingModal visible={loading} message={loadingMessage} /> */}
      <CustomModal
        visible={modalVisible}
        loading={loading}
        message={loadingMessage}
        error={error}
        onClose={handleModalClose}
      />
    </View>
  );
};

export default SearchScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000000',
    
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    color: '#fff',
  },
  searchInput: {
    height: 40,
    width: '100%',

    marginLeft: 6,
    color: '#fff',

    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    backgroundColor: '#000000',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },

  imageContainer: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    padding: 10,
    // marginLeft: 'auto',
    // marginRight: 'auto',
    // paddingHorizontal:10


  },
  image: {
    height: '100%',
    resizeMode: 'contain',
    width: '100%',
    // marginTop: 10,
    backgroundColor:"#17171D",
    borderRadius:12,


  },
  noDataContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  noDataText: {
    fontSize: 14,
    color: '#fff',
  },
});