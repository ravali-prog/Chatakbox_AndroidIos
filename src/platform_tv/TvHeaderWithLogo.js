import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const HeaderWithLogoTv = ({ headerText }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../app_assets/pictures/headerLogo_nobg.png')}
        style={styles.logo}
      />
      <Text style={styles.headerText}>{headerText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 5,
    backgroundColor: 'black',
  },
  logo: {
    width: 150,
    height: 70,
    resizeMode: 'contain',

  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1, 
    color:'white',

     
  },
});

export default HeaderWithLogoTv;