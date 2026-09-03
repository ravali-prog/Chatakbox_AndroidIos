import React from "react";
import { TouchableOpacity, Image, View, StyleSheet, Text,Dimensions } from "react-native";

/*
const screenWindowWidth = Dimensions.get('window').width;
const width = screenWindowWidth - 20;
const imageWidth = width;
const imageHeight = (imageWidth * 9) / 16;
*/
const Layout37 = (propdata )=> {

 
    var {onClick , listIndex } = propdata
    const screenWindowWidth = Dimensions.get('window').width;
    const screenWidth = screenWindowWidth -15;
    var imageWidth = 0;
    var imageHeight = 0;

    //imageWidth = ((screenWidth* Number(100) )/100  )
    imageWidth = ((screenWidth* Number(propdata.imgratio.imgper) )/100  )
    imageHeight =  ((imageWidth* Number(propdata.imgratio.imghratio) )/ Number(propdata.imgratio.imgwratio)  )

    var imageurl =  propdata.image["t"+propdata.imgratio.imgwratio + "x"+propdata.imgratio.imghratio]
    

  return (
    <>
      <TouchableOpacity activeOpacity={0.9} style={{ position: 'relative',paddingHorizontal:10,marginVertical:10 ,flex:1 , alignItems:'center',backgroundColor: '#000000'}}  onPress={()=>onClick(listIndex)} >
        <View>
          <Image
            // source={require('../../../app_assets/pictures/pic_14.png')}
            source={{uri:imageurl}}
            style={{ width: imageWidth, height: imageHeight,borderRadius:5  }}
            resizeMode="stretch"
          />
        </View>
        <View style={styles.playIconContainer}>
          <Image
            source={require('../../../app_assets/res_14.png')}
            style={{ width: 60 , height :60 }}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  playIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Layout37;