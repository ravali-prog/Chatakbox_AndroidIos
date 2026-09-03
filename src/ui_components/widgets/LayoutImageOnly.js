import React from "react";
import { TouchableOpacity, Image, View, StyleSheet, Dimensions } from "react-native";

const Layout5 = (propdata) => {
  const screenWidth = Dimensions.get('window').width - 15;
  var imageWidth = (screenWidth * Number(propdata.imgratio.imgper)) / 100;
  var imageHeight = (imageWidth * Number(propdata.imgratio.imghratio)) / Number(propdata.imgratio.imgwratio);
  var imageurl = propdata.image["t" + propdata.imgratio.imgwratio + "x" + propdata.imgratio.imghratio]
    || propdata.image.t2x3 || propdata.image.t16x9 || "";

  return (
    <TouchableOpacity
    activeOpacity={0.9}
      style={styles.container}
      onPress={() => propdata.onClick(propdata.listIndex)}
    >
      {imageurl ? (
        <Image
          source={{ uri: imageurl }}
          style={{ width: imageWidth, height: imageHeight, borderRadius: 5 }}
          resizeMode="stretch"
        />
      ) : (
        <View style={{ width: imageWidth, height: imageHeight, borderRadius: 5, backgroundColor: '#17171D' }} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: 10,
    marginVertical: 10,
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#17171D',
  },
});

export default Layout5;