import React from "react";
import { TouchableOpacity, Image, View, StyleSheet, Text, Dimensions } from "react-native";
import { LogData } from "../../app_config/AppConstants";


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
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>
              {desc}
            </Text>
            <View
              style={styles.playButton}
              onPress={() => 
                LogData('Play button pressed')}
            >
              <Text style={styles.playButtonText}>Play</Text>
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
    backgroundColor: '#fff',
    padding: 15,
    width: 100,
    alignSelf: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  playButtonText: {
    color: '#000',
    textAlign: 'center',
    fontWeight:'700'
  },
});

export default Layout38;