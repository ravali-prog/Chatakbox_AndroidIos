import React from 'react';
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';

const GridItemType1 = (props :  any )  => {
  const {brand} = props;
  let deviceWidth = Dimensions.get('window').width;
  const imageHeight = (deviceWidth * 9) / 16;
  const {container} = styles;
  const combineStyles = StyleSheet.flatten([container, {height: imageHeight}]);
  return (
    <View>
      <View style={combineStyles}>
        <Image
          resizeMode="contain"
          style={{width: '100%', height: '100%'}}
          source={{uri: brand.brandImage}}
        />
      </View>
      <Text style={styles.title}>{brand.brandName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
    marginBottom: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'black',
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'center',
  },
});

export default GridItemType1;
