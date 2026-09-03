import React from 'react';
import { Text, View ,StyleSheet, TouchableOpacity } from 'react-native';
import Downloads from '../sections/DownloadSection';

const NoData = ({onRetryClick}:any) => {
  return (
    <View style={styles.nodata}>
      <Text style={styles.nodataText}>No data available!</Text>
    <TouchableOpacity  onPress={()=>{onRetryClick()}}>
      <Text style={{borderColor:'white', fontSize:14 , 
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      padding:10,
      borderRadius: 4,
      color: 'white',
      marginTop:10,
      backgroundColor : '#000000' }}>Try again</Text>
      </TouchableOpacity>
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

export default NoData;
