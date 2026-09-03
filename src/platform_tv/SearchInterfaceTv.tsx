import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {ContentData} from '../data_models/ContentDataTypes';
import {getHomeContent, search} from '../state_mgmt/AppCommonSlice';
import {useNavigation} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';

const SearchScreenTv = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ContentData[] | []>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle');
  const [contentList, setContentList] = useState<ContentData[]>([]);

  useEffect(() => {
    let isMounted = true;
    if (status === 'idle') {
      setStatus('loading');
      const content = getHomeContent(null);
      content.then(x => {
        setContentList(x.data);
        setStatus('successful');
      });
    }
    return () => {
      isMounted = false;
    };
  }, [status]);

  const searchbar = async () => {
    try {
      const response = await search('search');
    } catch (error) {
    }
  };

  

  useEffect(() => {
    const fetchDataFromServer = async () => {
      setIsLoading(true);
      try {
        // Use contentList from the server instead of static data
        const filteredData = contentList.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()),
        );

        setSearchResults(filteredData);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch data only if there's a search query
    if (searchQuery.trim() !== '') {
      fetchDataFromServer();
    } else {
      // Reset results if the search query is empty
      setSearchResults([]);
    }
  }, [searchQuery, contentList]);

  const renderResultItem = ({item}: any) => (
    <Text style={{color: '#fff'}}>{item.title}</Text>
    // You can customize the rendering of each search result item here
  );

  const navigation = useNavigation();
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={{
            width: 50,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
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
          onChangeText={text => setSearchQuery(text)}
          onSubmitEditing={searchbar}
        />
      </View>

      {/* Search Bar */}

      {/* Search Results */}
      <FlashList
        estimatedItemSize={100}
        data={searchResults}
        renderItem={renderResultItem}
        keyExtractor={item => item.title}
        ListEmptyComponent={() =>
          !isLoading && <Text style={{color: '#fff'}}>No results found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#111111',
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

    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    backgroundColor: '#222222',
    marginBottom: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
});

export default SearchScreenTv;
