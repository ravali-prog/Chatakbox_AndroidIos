import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, Image, Platform, TouchableNativeFeedback, BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';

import plusIcon from '../../app_assets/symbols/sym_53.png';

export default function WhosWatchingTv() {
  const [items, setItems] = useState([
    { name: 'TURQUOISE', code: '#1abc9c' },
    { name: 'EMERALD', code: '#2ecc71' },
    { name: 'PETER RIVER', code: '#3498db' },
    { name: 'AMETHYST', code: '#9b59b6' },
    { name: 'WET ASPHALT', code: '#34495e' },
    { name: 'GREEN SEA', code: '#16a085' },
    { name: 'SILVER', code: '#bdc3c7' },
    { name: 'ASBESTOS', code: '#7f8c8d' },
    { name: 'POMEGRANATE', code: '#c0392b' },
  ]);

  const navigation = useNavigation();
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  const { width: screenWidth } = Dimensions.get('window');
  const isTV = Platform.isTV;
  const numColumns = isTV ? 4 : screenWidth > 600 ? 2 : 1;
  const screenWindow = (screenWidth / numColumns) - 20;

  const handleBackPress = () => {
    navigation.push("AddProfile");
    return true;
  };

  const renderItem = ({ item, index }) => {
    const isSelected = index === selectedItemIndex;

    if (index === items.length - 1) {
      return (
        <TouchableNativeFeedback onPress={handleBackPress} background={Platform.OS === 'android' ? TouchableNativeFeedback.SelectableBackground() : ''}>
          <View style={styles.itemContainer}>
            <View style={[styles.imageContainer, { width: screenWindow }]}>
              <Image source={plusIcon} style={styles.moreIcon} />
            </View>
            <Text style={styles.itemName}>Add</Text>
          </View>
        </TouchableNativeFeedback>
      );
    }

    return (
      <TouchableNativeFeedback onPress={() => handleItemPress(index)} background={Platform.OS === 'android' ? TouchableNativeFeedback.SelectableBackground() : ''}>
        <View style={[styles.itemContainer, isSelected && styles.selectedItem]}>
          <View style={[styles.imageContainer, { width: screenWindow, backgroundColor: item.code }]}>
          </View>
          <Text style={[styles.itemName, isSelected && styles.selectedItemText]}>{item.name}</Text>
        </View>
      </TouchableNativeFeedback>
    );
  };

  const handleItemPress = (index) => {
    setSelectedItemIndex(index);
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Image source={require('../../app_assets/symbols/sym_06.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Who's Watching</Text>
      </View>
      <View style={styles.columnLayout}>
        <FlashList
          data={items}
          numColumns={numColumns}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()} // Add key extractor
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#222222',
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    alignContent: 'center',
  },
  columnLayout: {
    flexDirection: 'row',
    marginTop: 40,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  itemContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  imageContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 10,
    height: 110,
    borderWidth: 0,
    borderColor: 'white',
  },
  itemName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginTop: 15,
  },
  moreIcon: {
    width: 60,
    height: 60,
    alignSelf: 'center',
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: 'white',
  },
  selectedItemText: {
    color: 'white',
  },
});
