import React from 'react';
import { ScrollView, View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const windowWidth = Dimensions.get('window').width;

const DetailLayoutDummy = ({ navigation }) => {
  const data = [
    {
      title: '1.Title',
      duration: '22m',
      description: 'In a classification analysis, the SVM looks for the optimal hyperplane to separate two groups in a multidimensional space.',
      image: require('../../../app_assets/pictures/pic_07.jpg'),
      videoUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
    },
    {
      title: '2.Title',
      duration: '25m',
      description: 'Based on the 1935 novel by C.S. Forester, the wonderful combination of Hepburn and Bogie makes this a thoroughly enjoyable blend of comedy and adventure',
      image: require('../../../app_assets/pictures/pic_07.jpg'),
      videoUrl: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
    },
    {
      title: '3.Title',
      duration: '30m',
      description: 'One of the great 50s screen musicals, colorfully enhanced by the grace and athleticism of Gene Kelly ',
      image: require('../../../app_assets/pictures/pic_07.jpg'),
    },
    {
      title: '3.Title',
      duration: '30m',
      description: 'One of the great 50s screen musicals, colorfully enhanced by the grace and athleticism of Gene Kelly ',
      image: require('../../../app_assets/pictures/pic_07.jpg'),
    },
    
];

  const handleContainerPress = (videoUrl) => {
    navigation.navigate('VideoPlayer', { videoUrl });
  };

  return (
    <ScrollView style={styles.scrollView}>
      {data.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleContainerPress(item.videoUrl)}
        >
          <View style={styles.container}>
            <View style={styles.imageContainer}>
              <Image
                source={item.image}
                style={styles.image}
                // resizeMode="cover"
              />
                <Image
                style={styles.playIcon}
                source={require('../../../app_assets/symbols/sym_58.png')}
                resizeMode="contain"
                tintColor="#fff"
              />
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.duration}>{item.duration}</Text>
              <Text style={styles.description}>{item.description}</Text>

            </View>
          </View>
          <View style={styles.descriptionContainer}>
            <View style={styles.separator} />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: '#000',
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
      height: 105,
      overflow: 'hidden',
      borderRadius:15,
      marginStart: 15,
    },
    image: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    contentContainer: {
      flex: 1,
      marginStart:5,
      marginTop:10,
    },
    title: {
      fontSize: 14,
      fontWeight: 'bold',
      color: 'white',
    },
    duration: {
      fontSize: 14,
      color: 'white',
    },
    descriptionContainer: {
      marginStart: 10,
    },
    description: {
      fontSize: 13,
      color: 'white',
    },
    separator: {
      borderBottomWidth: 1,
      borderBottomColor: 'white',
      marginStart: 15,
      marginEnd: 15,
      marginBottom:10,
    },
    playIcon: {
      position: 'absolute',
      alignSelf: 'center',
      width: 25,
      height: 25,
      zIndex: 1,
      top: '40%',
    },
  });

export default DetailLayoutDummy;