import React from 'react';
import { ScrollView, View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {handleNavigation} from '../app_config/AppConstants'
const windowWidth = Dimensions.get('window').width;

const DetailLayoutTv = ({param}) => {
  const navigation = useNavigation();

 const imageurl = "https://encrypted-tbn0.gstatic.com/ImageAssets?q=tbn:ANd9GcT5fgNCXza8btnw8ui8faJJB48Tr4rbr5yPbA&usqp=CAU"

  const data = [ ];

  const handleContainerPress = () => {
    handleNavigation(navigation,param)
   
  };

  return (
   
    
        <TouchableOpacity
          
          onPress={() => handleContainerPress()}>

          <View style={styles.container}>
            <View style={styles.imageContainer}>
              <Image
                source={{uri : imageurl}}
                style={styles.image}
                // resizeMode="cover"
              />
              <Image  style={styles.playIcon}
              source={require('../../../app_assets/res_14.png')}
              resizeMode='contain'
              tintColor="#fff"/>
            </View>
            <View style={styles.contentContainer}>
          {param && (
            <>
              <Text style={styles.title}>{param.title}</Text>
              <Text style={styles.duration}>{param.duration}</Text>
            </>
          )}
        </View>
      </View>
      <View style={styles.descriptionContainer}>
        {param && param.desc && (
          <>
            <Text
              style={styles.description}
              numberOfLines={3}
              ellipsizeMode='tail'
            >
              {param.desc}
            </Text>
            <View style={styles.separator} />
          </>
        )}
      </View>
    </TouchableOpacity>
     
   
  );
};

const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: '#111111',
    },
    container: {
      flexDirection: 'row',
      borderRadius: 2,
      overflow: 'hidden',
      marginTop: 20,
      margin: 10,
    },
    imageContainer: {
      width: 180,
      height: 115,
      overflow: 'hidden',
      flexDirection:'row',
      borderRadius:15,
      justifyContent:'center'
      
    },
    image: {
      // flex: 1,
      width: '100%',
      height: '100%',
    },
    playIcon:{
      marginLeft:'auto',
      alignSelf:'center',
      right:70,
      width:30,
    },
    contentContainer: {
      flex: 1,
      padding: 5,
      justifyContent: 'center',
    },
    title: {
      fontSize: 12,
      fontWeight: 'bold',
      color: 'white',
    },
    duration: {
      fontSize: 9,
      color: 'white',
    },
    descriptionContainer: {
      marginStart: 10,
    },
    description: {
      fontSize: 10,
      fontWeight:'200',
      color: 'white',
      marginStart: 5,
      marginEnd: 5,
    
      
    },
    separator: {
      borderBottomWidth: 0.6,
      borderBottomColor: 'white',
      marginStart: 5,
      marginEnd: 5,
      marginVertical: 10,
    },
  });

export default DetailLayoutTv;