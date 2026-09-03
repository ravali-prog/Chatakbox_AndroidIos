import { TouchableOpacity, Image, View, Text, StyleSheet, Dimensions } from "react-native";

const Layout32 = (propdata) => {
  const screenWidth = Dimensions.get('window').width - 15;
  var imageWidth = (screenWidth * Number(propdata.imgratio.imgper)) / 100;
  var imageHeight = (imageWidth * Number(propdata.imgratio.imghratio)) / Number(propdata.imgratio.imgwratio);
  var imageurl = propdata.image["t" + propdata.imgratio.imgwratio + "x" + propdata.imgratio.imghratio]
    || propdata.image.t2x3 || propdata.image.t16x9 || "";

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.container} onPress={() => propdata.onClick(propdata.listIndex)}>
      {imageurl ? (
        <Image source={{ uri: imageurl }} style={{ width: imageWidth, height: imageHeight, borderTopLeftRadius: 5, borderTopRightRadius: 5 }} resizeMode="stretch" />
      ) : (
        <View style={{ width: imageWidth, height: imageHeight, backgroundColor: '#17171D' }} />
      )}
      <View style={[styles.textContainer, { width: imageWidth }]}>
        <Text style={styles.text} numberOfLines={2}>{propdata.text || ""}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { margin: 10, alignItems: 'center', backgroundColor: '#17171D', borderRadius: 5 },
  textContainer: { padding: 8, backgroundColor: '#000000', borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
  text: { color: '#fff', fontSize: 12, textAlign: 'center' },
});

export default Layout32;