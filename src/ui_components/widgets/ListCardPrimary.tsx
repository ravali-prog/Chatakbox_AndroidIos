import React from 'react';
import {Dimensions, Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon} from 'react-native-paper';

const ListItemType1 = (props : any ) => {
  const {brand,onItemSelect} = props;
  let deviceWidth = Dimensions.get('window').width;
  let deviceHeight = Dimensions.get('window').height;
  const imgWdt = (deviceWidth * 35) / 100;
  const imgHt = imgWdt / 2;
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginBottom: 2,
        height: 80,
      }}
      onPress={() => onItemSelect(brand)}>
      <View style={[styles.container, {flexDirection: 'row'}]}>
        <View style={{flex: 4}}>
          <Image
            resizeMode="contain"
            source={{uri: brand.brandImage}}
            style={{width: imgWdt, height: imgHt}}
          />
        </View>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Icon source="right-arrow" color="grey" size={26}></Icon>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default ListItemType1;
