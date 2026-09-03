import React from 'react';
import { Text, View ,StyleSheet, TouchableOpacity, Image } from 'react-native';
import Downloads from '../sections/DownloadSection';


const SplashImage = () => {
  return (
    <View style={styles.nodata}>
      <Image 
      source={require('../../../app_assets/pictures/logo.png')}
      style={{
        width:150,
        height:150,
      justifyContent: 'center',
      alignItems: 'center',
      padding:10,
       }}/>

    </View>
  );
};

const styles = StyleSheet.create({
    nodata: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 24,
      color: 'red',
      backgroundColor : '#000000'
    },
    nodataText: {
      
      fontSize: 16,
      color: 'white',
      textAlign:'center'
    },
  });

export default SplashImage;
