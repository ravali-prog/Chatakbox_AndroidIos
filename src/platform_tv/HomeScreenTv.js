import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  Animated,
  TouchableOpacity,
  Platform,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import {useTVEventHandler} from 'react-native-tvos';
import DeviceInfo from 'react-native-device-info';
import ContentDetailTv from './ContentDetailTv';
// import HomeItem from '../../ui_components/content/HomeItemCard';
import HomeContentTv from './HomeContentTv';

const HomeScreenTv = () => {
  const [selectedIconIndex, setSelectedIconIndex] = useState(null);
  const [hoveredIconIndex, setHoveredIconIndex] = useState(null);
  const [selectedIconName, setSelectedIconName] = useState(null);
  const [lastSelectedIcon, setLastSelectedIcon] = useState(null);

  const sidebarWidth = useRef(new Animated.Value(60)).current;

  const handleIconPress = (index, iconName) => {
    if (selectedIconIndex === index) {
      setSelectedIconIndex(null);
      setSelectedIconName(null);
      setLastSelectedIcon(index);
      setHoveredIconIndex(index);
      Animated.timing(sidebarWidth, {
        toValue: 60,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      const newWidth = index !== null ? 170 : 60;

      Animated.timing(sidebarWidth, {
        toValue: newWidth,
        duration: 200,
        useNativeDriver: false,
      }).start();

      setSelectedIconIndex(index);
      setSelectedIconName(iconName);
      setLastSelectedIcon(null);
      setHoveredIconIndex(index); // Highlight the selected icon
    }
  };

  const iconData = [
    {iconPath: require('../../app_assets/symbols/sym_50.png')},
    {name: 'Home', iconPath: require('../../app_assets/symbols/sym_39.png')},
    {name: 'Videos', iconPath: require('../../app_assets/symbols/sym_67.png')},
    {name: 'Shows', iconPath: require('../../app_assets/symbols/sym_01.png')},
    {name: 'Wishlist', iconPath: require('../../app_assets/symbols/sym_79.png')},
    {
      name: 'Watch History',
      iconPath: require('../../app_assets/symbols/sym_77.png'),
    },
    {
      name: 'Profiles',
      iconPath: require('../../app_assets/symbols/sym_56.png'),
    },
    {name: 'Logout', iconPath: require('../../app_assets/symbols/sym_48.png')},
  ];

  const handleIconBlur = () => {
    setHoveredIconIndex(null);
  };
  const renderIcons = () => {
    const TouchableComponent =
      Platform.OS === 'android' && Platform.isTV
        ? TouchableNativeFeedback
        : TouchableHighlight;

    return iconData.map((data, index) => (
      <TouchableComponent
        key={index}
        onPress={() => handleIconPress(index, data.name)}
        onTouchStart={() => handleIconTouch(index)}
        onFocus={() => handleIconFocus(index)}
        onBlur={() => handleIconBlur()}
        style={[
          styles.iconWrapper,
          selectedIconIndex === index && styles.selectedIconContainer,
          hoveredIconIndex === index &&
            !selectedIconIndex &&
            styles.hoveredIconContainer,
        ]}
        hasTVPreferredFocus={true}
        tvParallaxProperties={{magnification: 1.2, pressMagnification: 0.8}}>
        <View
          style={[
            styles.iconWrapper,
            selectedIconIndex === index && styles.selectedIconContainer,
            hoveredIconIndex === index &&
              !selectedIconIndex &&
              styles.hoveredIconContainer,
          ]}>
          <Image source={data.iconPath} style={styles.iconImage} />
          {selectedIconIndex !== null && (
            <Text style={[styles.iconName, styles.highlightedText]}>
              {data.name}
            </Text>
          )}
        </View>
      </TouchableComponent>
    ));
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.sidebar, {width: sidebarWidth, opacity: 0.9}]}>
        {renderIcons()}
      </Animated.View>
      {/* ContentDetailTv Content */}
      <View style={styles.content}>
        <HomeContentTv />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',

    flexDirection: 'row',
    backgroundColor: 'black',
    flex: 1,
  },
  sidebar: {
    backgroundColor: 'black',
    position: 'absolute',
    zIndex: 1,
    justifyContent: 'center',
    height: '100%',
  },
  iconWrapper: {
    marginVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
  },
  selectedIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRightWidth: 4,
    borderRightColor: 'red',
    height: 40,
  },
  hoveredIconContainer: {
    backgroundColor: 'red',
    height: 40,
  },
  iconImage: {
    width: 22,
    height: 22,
    marginStart: 17,
    padding: 5,
  },
  iconName: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
  highlightedText: {
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginStart: 40,
  },
});

export default HomeScreenTv;
