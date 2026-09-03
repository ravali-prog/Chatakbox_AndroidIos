import React, {useState , useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList} from 'react-native';
import DetailLayout from '../../ui_components/widgets/DetailLayout';
import Player from '../../ui_components/widgets/MediaPlayer';
import { useNavigation  } from '@react-navigation/native';
import { Clip, List } from '../../data_models/ContentDataTypes'; 

const SeriesViewer = ({route}:any) => {

  
  const navigation = useNavigation();
  
  useEffect(() => {
    
    const {intent} = route.params;
    const info :List  = intent ;
    settitle(info.title)
    setvideoType(info.genre)
    //setseasonTitle(info.)
    setDirectorName(info.directors)
    setdescription(info.desc)
    setepisodesList(info.clips)
  },[route.params])

  const [title, settitle] = useState("");
  const [videoType, setvideoType] = useState("");
  const [seasonTitle, setseasonTitle] = useState("");
  const [DirectorName, setDirectorName] = useState("");
  const [description, setdescription] = useState("");

  const [episodesList, setepisodesList] = useState<any[]>([]);
  
  
  
  const videoUrl = 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8';
  //const title = 'Tears Of Steel';
 // const videoType = 'Thriller, Comedy - U/A 16+ -Hindi';
 // const seasonTitle = 'S1:E1 - Episode Title';
  //const DirectorName = 'Director: xyz ';
 // const description =  'Based on the 1935 novel by C.S. Forester, the wonderful combination of Hepburn and Bogie makes this a thoroughly enjoyable blend of comedy and adventure.';
  
  
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

  const navigateToCastDetails = (castinfo:any) => {
    //navigation.navigate('CastDetails', {cast});
  };

 
 

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
          <Text style={styles.castHeading}>Cast: </Text>
          <Text style={styles.castText}>{visibleCast}</Text>
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
        showfullscreenicon= {true}   
      />

        <View style={styles.detailsContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.videoType}>{videoType}</Text>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: 'red'}]}
          >
          <Image
            source={require('../../../app_assets/res_15.png')}
            style={{width: 15, height: 20, tintColor: 'white', marginEnd: 10}}
          />
          <Text style={styles.buttonText}>Watch</Text>
        </TouchableOpacity>
        <Text style={styles.seasonTitle}>{seasonTitle}</Text>
        {/* <Text style={styles.seasonTitle}>HIII</Text> */}
        <Text style={styles.description}>{description}</Text>
        {renderCast()}
        <View style={styles.directorContainer}>
        <Text style={styles.directorHeading}>Director: </Text>
        <Text style={styles.directorText}>{DirectorName}</Text>
        </View>

        <View style={styles.videoIconsContainer}>
          <View>
            <TouchableOpacity>
              <Image
                source={require('../../../app_assets/symbols/sym_42.png')}
                style={styles.imageIconsStyle}
              />
            </TouchableOpacity>
          </View>

          <View>
            <TouchableOpacity>
              <Image
                source={require('../../../app_assets/symbols/sym_22.png')}
                style={styles.imageIconsStyle}
              />
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity>
              <Image
                source={require('../../../app_assets/symbols/sym_59.png')}
                style={styles.imageIconsStyle}
              />
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity>
              <Image
                source={require('../../../app_assets/symbols/sym_66.png')}
                style={styles.imageIconsStyle}
                resizeMode='contain'
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={{color:'white',fontSize:15,fontWeight:'bold'}}>Episodes</Text>
        <View>
            <TouchableOpacity  style={styles.dropDownStyle}>
            <Text style={{color:'white',fontSize:14,fontWeight:'bold'}}>Season 1</Text>
            <Image
                style={{width:15, height :15}}
                source={require('../../../app_assets/res_08.png')}
                tintColor="#fff"
                      />
            </TouchableOpacity>
        </View>
        </View>   
        <ScrollView>
            {episodesList.map((item, index) => (
                <View key={index}>
                  <DetailLayout  param={item} ></DetailLayout>
                </View>
            ))}
        </ScrollView>
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
    marginStart:-7,
    flexDirection: 'row',
  },
  imageIconsStyle: {
    marginHorizontal: 7,
    width:40,
    height:40,
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
    color: '#fff',
  },
  description: {
    // fontSize: 12,
    // fontWeight:'100',
    // color: 'white',
    // fontFamily:'Times New Roman',
    fontSize: 12,
    letterSpacing:1,
    color: '#fff',
    marginVertical: 11,
    fontWeight: '300',
    fontStyle:'normal',
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
  directorContainer:{
    flexDirection:'row',
    alignItems:'baseline'
  },
  directorHeading:{
    fontSize: 13,
    color: 'white',
    fontWeight: '300',
  },
  directorText:{
    fontSize: 12,
    color: 'white',
    fontWeight: '300',
  },
  castHeading: {
    fontSize: 13,
    color: 'white',
    fontWeight: '300',
    marginBottom:6
  },
  castText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '300',
    letterSpacing:1,
  },
  moreButton: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 5,
  },
  dropDownStyle: {
    backgroundColor:'#3d3c3b',
    padding:5,
     flexDirection:'row',width:120, 
     justifyContent:'space-around',
     alignItems:'center',
     borderRadius:5,
     marginTop:10,
  },
});

export default SeriesViewer;