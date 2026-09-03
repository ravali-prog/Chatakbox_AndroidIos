import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, ScrollView} from 'react-native';
import {withNavigation} from 'react-navigation';
import Video from 'react-native-video';
import DetailLayout from '../../ui_components/widgets/DetailLayout';
import Player from '../../ui_components/widgets/MediaPlayer';
import { LogData } from '../../app_config/AppConstants';
//import CastDetails from './CastDetails';
// import { ScrollView } from 'react-native-gesture-handler';

const ClipDetail = () => {
  const videoUrl =
    'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8';
  const title = 'Tears Of Steel';
  const videoType = 'Thriller, Comedy - U/A 16+ -Hindi';
  const seasonTitle = 'S1:E1 - Episode Title';
  const DirectorName = 'Director: xyz ';
  const description =
    'Based on the 1935 novel by C.S. Forester, the wonderful combination of Hepburn and Bogie makes this a thoroughly enjoyable blend of comedy and adventure.';
  const cast = [
    'Actor 1',
    'Actor 2',
    'Actor 3',
    'Actor 4',
    'Actor 5',
    'Actor 6',
    'Actor 7',
  ];
  const maxVisibleCast = 2;
  const [showAllCast, setShowAllCast] = useState(false);

  const toggleShowAllCast = () => {
    setShowAllCast(!showAllCast);
  };

  const navigateToCastDetails = cast => {
    //navigation.navigate('CastDetails', {cast});
  };

  //   const renderCast = () => {
  //     if (showAllCast) {
  //       return cast.map((actor, index) => (
  //         <View style={{flexDirection:'row',flexWrap:'wrap'}}>
  //         <Text key={index} style={styles.castText}>{actor}</Text>
  //         </View>
  //       ));
  //     } else {
  //       const visibleCast = cast.slice(0, maxVisibleCast).join(', ');
  //       return (
  //         <>
  //           <Text style={styles.castText}>{visibleCast}</Text>
  //           {cast.length > maxVisibleCast && (
  //             <TouchableOpacity onPress={toggleShowAllCast}>
  //               <Text style={styles.moreButton}>...More</Text>
  //             </TouchableOpacity>
  //           )}
  //         </>
  //       );
  //     }
  //   };

  // const renderCast = () => {
  //     if (showAllCast) {
  //       return (
  //         <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
  //           <Text style={styles.castHeading}>Cast: </Text>
  //           {cast.map((actor, index) => (
  //             <Text key={index} style={styles.castText}>
  //               {index > 0 && ', '}
  //               {actor}
  //             </Text>
  //           ))}
  //         </View>
  //       );
  //     } else {
  //       const visibleCast = cast.slice(0, maxVisibleCast).join(', ');
  //       return (
  //         <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
  //           <Text style={styles.castHeading}>Cast: {visibleCast}</Text>
  //           {cast.length > maxVisibleCast && (
  //             <>
  //               <Text style={styles.moreButton} onPress={toggleShowAllCast}>...More</Text>
  //             </>
  //           )}
  //         </View>
  //       );
  //     }
  //   };

  const renderCast = () => {
    if (showAllCast) {
      return (
        <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
          <Text style={styles.castHeading}>Cast: </Text>
          {cast.map((actor, index) => (
            <Text key={index} style={styles.castText}>
              {index > 0 && ', '}
              {actor}
            </Text>
          ))}
        </View>
      );
    } else {
      const visibleCast = cast.slice(0, maxVisibleCast).join(', ');
      return (
        <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
          <Text style={styles.castHeading}>Cast: {visibleCast}</Text>
          {cast.length > maxVisibleCast && (
            <>
              <Text
                style={styles.moreButton}
                onPress={() => navigateToCastDetails(cast)}>
                ...More
              </Text>
            </>
          )}
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
           
      <ScrollView    >
   
      <Player        
          
          resizeMode="contain"
          
        />
        <View style={styles.detailsContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.videoType}>{videoType}</Text>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: 'red'}]}
          onPress={() => 
          LogData('Button pressed')
          }>
          <Image
            source={require('../../../app_assets/res_15.png')}
            style={{width: 15, height: 20, tintColor: 'white', marginEnd: 10}}
          />
          <Text style={styles.buttonText}>Watch</Text>
        </TouchableOpacity>
        <Text style={styles.seasonTitle}>{seasonTitle}</Text>
        <Text style={styles.description}>{description}</Text>
        {renderCast()}
        <Text style={styles.castHeading}>{DirectorName}</Text>

        <View style={styles.videoIconsContainer}>
          <View>
            <TouchableOpacity>
              <Image
                source={require('../../../app_assets/res_15.png')}
                style={styles.imageIconsStyle}
              />
            </TouchableOpacity>
          </View>

          <View>
            <TouchableOpacity>
              <Image
                source={require('../../../app_assets/res_15.png')}
                style={styles.imageIconsStyle}
              />
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity>
              <Image
                source={require('../../../app_assets/res_15.png')}
                style={styles.imageIconsPlus}
              />
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity>
              <Image
                source={require('../../../app_assets/res_15.png')}
                style={styles.imageIconsStyle}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={{color:'white',fontSize:17,fontWeight:'bold'}}>Episodes</Text>
        <View>
            <TouchableOpacity  style={styles.dropDownStyle}>
            <Text style={{color:'white',fontSize:17,fontWeight:'bold'}}>Season</Text>
            <Image
                style={{width:15, height :15}}
                source={require('../../../app_assets/res_08.png')}
                      />
            </TouchableOpacity>
        </View>
        </View>
        <DetailLayout></DetailLayout>
    
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
    flexDirection:'column',
    backgroundColor: '#111111',
    
  },
  videoContainer: {
    //height: 210,
    backgroundColor: 'black',
  },
  video: {
    flex: 1,
    position:'absolute',
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    paddingHorizontal : 8    
    
  },
  title: {
    fontSize: 25,
    color: 'white',
    fontWeight: '500',
    marginTop:20,
    marginBottom: 8,
  },
  videoType: {
    fontSize: 11,
    color: 'white',
    marginBottom: 8,
  },
  videoIconsContainer: {
    marginVertical: 12,
    marginBottom: 8,
    marginStart:-10,
    flexDirection: 'row',
  },
  imageIconsStyle: {
    width: 50,
    height: 50,
    marginHorizontal: 7,
    flexDirection: 'row',
    tintColor : '#ffffff'
  },
  imageIconsPlus: {
    width: 55,
    height: 55,
    marginTop: -2,
    marginHorizontal: 7,
    flexDirection: 'row',
  },
  seasonTitle: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 10,
    color: 'white',
  },
  description: {
    fontSize: 13,
    fontWeight: '300',
    marginVertical: 10,
    color: 'white',
  },
  button: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
  },
  castHeading: {
    fontSize: 13,
    color: 'white',
    fontWeight: '300',
  },
  castText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '300',
  },
  moreButton: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 5,
  },
  dropDownStyle: {
    backgroundColor:'#3d3c3b', flexDirection:'row',width:120, justifyContent:'center',alignItems:'center',borderRadius:5,marginTop:10,
  },
});

export default ClipDetail;
