import React from "react";
import { TouchableOpacity, Image, View, StyleSheet, Text, Dimensions } from "react-native";
import { Icon } from "react-native-elements";
import LinearGradient from "react-native-linear-gradient";
import { colors } from "../../theming/colors";


const Layout38 =  (propdata )=> {

    const screenWindowWidth = Dimensions.get('window').width;
    const screenWidth = screenWindowWidth - 25;
    var imageWidth = 0;
    var imageHeight = 0;

    var {onClick , listIndex } = propdata
    var desc = ""
    
    if (propdata.dataitem.genre) {
        desc = propdata.dataitem.genre.replace(","," , ")
    }
    
    if (propdata.dataitem.certificate) {
        desc = desc + " . " + propdata.dataitem.certificate
    }

    if ( propdata.dataitem.lang) {
      desc = desc + " . " +  propdata.dataitem.lang
    }
  
    if (__DEV__) {
   }
   var imageurl = ""
   try {
    imageWidth = ((screenWidth* Number(propdata.imgratio.imgper) )/100  )
    imageHeight =  ((imageWidth* Number(propdata.imgratio.imghratio) )/ Number(propdata.imgratio.imgwratio)  )
    var imageurl =  propdata.image["t"+propdata.imgratio.imgwratio + "x"+propdata.imgratio.imghratio]
   } catch (error) {
     
   }


  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity activeOpacity={0.9} style={[styles.imageContainer, { width: imageWidth, height: imageHeight ,backgroundColor: '#000000' }]} onPress={()=>onClick(listIndex)} >
          <Image
            source={{
              uri: imageurl,
            }}
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.92)"]}
            locations={[0, 0.45, 1]}
            style={styles.bottomGradient}
            pointerEvents="none"
          />
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>
              {desc}
            </Text>
            <View style={styles.playButton}>
              <Icon
                name="play-arrow"
                type="material"
                size={22}
                color="#FFFFFF"
                style={styles.playIcon}
              />
              <Text style={styles.playButtonText}>Start watching</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems:'center'
    
  },
  imageContainer: {
    overflow: 'hidden', // Ensure the overlay stays within the image container
    borderRadius: 5, // Optional: add border radius for a rounded appearance
    marginVertical:10
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '48%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  overlayText: {
    fontSize: 14,
    color: '#fff', // Adjusted overlay text color
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: '#C62828',
    paddingVertical: 12,
    paddingHorizontal: 28,
    minWidth: 200,
    maxWidth: '78%',
    alignSelf: 'center',
    borderRadius: 999,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    marginRight: 2,
  },
  playButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 4,
  },
});

export default Layout38;