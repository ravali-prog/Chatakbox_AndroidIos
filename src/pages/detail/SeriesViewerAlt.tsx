import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, Dimensions, NativeModules, Modal, Platform } from 'react-native';
import DetailLayout from '../../ui_components/widgets/DetailLayout';
import TrailerPlayer from '../../media_player/TrailerPlayerCore';
import { useNavigation } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import { Clip, List } from '../../data_models/ContentDataTypes';
import ModalComponent from '../../data_models/ModalComponentData';
import { APP_NAME, USER_UUID, cacheData, handleTrailerVideoPlay, handleVideoPlay, selectedUserProfile, useractivityDetails, handleVideoPlayAsync, configData, setCurrentPlayingVideo , LogData, LogError, LOCAL_EVENTS, openResolvedVideoPlayer} from '../../app_config/AppConstants';
import {  getSeriesDetails, doUserAction, createShareLink } from '../../state_mgmt/AppCommonSlice';
import Share from 'react-native-share';
import SeasonData from '../../data_models/SeasonData';
import LoadingSpinner from '../../ui_components/widgets/LoadingSpinner';
import EmptyState from '../../ui_components/widgets/EmptyState';

import { ContentData } from '../../data_models/ContentDataTypes';
import { APP_EVENTS_ } from '../../app_config/AnalyticsConfig';
import {EventRegister} from 'react-native-event-listeners';
import { Animated } from 'react-native'; 
import Loader from '../../ui_components/widgets/LoadingSpinner';
import { colors } from '../../theming/colors';
import LinearGradient from "react-native-linear-gradient";




var seriesId=''


const SeriesViewerAlt = ({ route }: any) => {

  const navigation = useNavigation();
  const [title, settitle] = useState("");
  const [videoGenre, setVideoGenre] = useState("");
  const [videoType, setVideoType] = useState("");
  const [thumbnail, setthumbnail] = useState("");
  const [videoID, setVideoID] = useState("");
  const [seasonTitle, setseasonTitle] = useState("");
  const [cast, setCast] = useState<string[]>([]);
  const [producers, setProducers] = useState<string[]>([]);
  const [DirectorName, setDirectorName] = useState("");
  const [description, setdescription] = useState("");
  const [selectedSeason, setSelectedSeason] = useState('Season 1');
  const [episodesList, setepisodesList] = useState<any[]>([]);
  const profileid = selectedUserProfile ? selectedUserProfile.profileid : '';
  const UUID = USER_UUID;
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [selectedWishlist, setSelectedWishlist] = useState('removewishlist');
  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const [isSeason1ModalVisible, setSeason1ModalVisible] = useState(false);
  const [currentPLayingVideo, setCurrentPLayingVideo] = useState<any>(null);

  const [seasons, setseasons] = useState<string[]>([]);

  const [sortedMultiseasons, setsortedMultiseasons] = useState<any>(null);
  
  const [status, setStatus] = useState('idle');
  
  const [itemWidth, setitemWidth]  =  useState(0)
  const [itemHeight, setitemHeight]  =  useState(0) 

  const { width: screenWidth , height: screenHeight } = Dimensions.get('window');


  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [seriesData, setSeriesData] = useState<ContentData[]>([]);
  const [showVideoLoading, setShowVideoLoading] = useState(false);


  const toggleSeasonModal = () => {
    setSeason1ModalVisible(!isSeason1ModalVisible);
  };

  const handleSeasonSelection = (season: string) => {
    setSelectedSeason(season);
    toggleSeasonModal();
  };

  const DOT_COLORS = ['#e50914', '#e87c16', '#ffffff', '#e87c16', '#e50914'];


 




  

  const { ActivityStarter } = NativeModules;

 
  const handlePlayPress = () => {
    try {
      setShowVideoLoading(true);
      setPauseInlineTrailer(true);
      setCurrentPlayingVideo(currentPLayingVideo);
      var resume = 0;
  
      try {
        if (currentPLayingVideo.resume) {
          resume = parseInt(currentPLayingVideo.resume);
        }
      } catch (error) {}
  
      var subtitleArray = '';
      if (
        currentPLayingVideo &&
        currentPLayingVideo.media &&
        currentPLayingVideo.media.subtitles
      ) {
        const data = {subtitles: currentPLayingVideo.media.subtitles};
        subtitleArray = JSON.stringify(data);
      }
  
      const seriesdetails = {seriestitle: title};
      const contentaccess = handleVideoPlayAsync(
        navigation,
        currentPLayingVideo,
        seriesdetails,
      );
  
      contentaccess
        .then(
          resp => {
  
            try {
              setShowVideoLoading(false);
    
              if (resp && resp.videourl) {
                openResolvedVideoPlayer(navigation, {
                  videourl: resp.videourl,
                  title: resp.title,
                  dwnid: resp.dwnid,
                  resume,
                  subtitleArray,
                  clipDetails: currentPLayingVideo,
                  seriesDetails: seriesdetails,
                });
              } else {
                LogError("SeriesDetails2 handlePlayPress handleVideoPlayAsync else error",resp)
              }
            } catch (error) {
              LogError("SeriesDetails2 handlePlayPress handleVideoPlayAsync catch error inside",error)
            }
  
  
          },
          isRejected => {
            setShowVideoLoading(false);
          },
        )
        .catch(err => {
          setShowVideoLoading(false);
        });
      
    } catch (error) {
      LogError("SeriesDetails2 handlePlayPress handleVideoPlayAsync catch error outside",error)
    }
  };




  const [videoUrl, setVideoUrl] = useState("");
  const [pauseInlineTrailer, setPauseInlineTrailer] = useState(false);

  useEffect(() => {
    let resizeTimer = null;
    const unsub = navigation.addListener('focus', () => {
      setPauseInlineTrailer(false);
      // After leaving the landscape player, iOS can leave a stuck landscape layout.
      if (Platform.OS === 'ios') {
        try {
          Orientation.lockToPortrait();
        } catch (e) {}
        const w = Dimensions.get('window').width;
        setitemWidth(w);
        setitemHeight((w * 9) / 16);
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          try {
            Orientation.lockToPortrait();
          } catch (e) {}
          const w2 = Dimensions.get('window').width;
          setitemWidth(w2);
          setitemHeight((w2 * 9) / 16);
        }, 250);
      }
    });
    return () => {
      unsub();
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
    };
  }, [navigation]);

  const maxVisibleCast = 2;
  const [showAllCast, setShowAllCast] = useState(false);

  const [watchResumeFlag, setwatchResumeFlag] = useState('Watch');

  const toggleShowAllCast = () => {
    setShowAllCast(!showAllCast);
  };

  const navigateToCastDetails = (castinfo: any) => {
    //navigation.navigate('CastDetails', {cast});
  };

  useEffect(() => {
    try {
      APP_EVENTS_.screen("SeriesDetails")
    } catch (error) {
    }
  }, []);

  useEffect(() => {
    // Check if the video has been played or not
    // For example, you might have logic here to determine if the video has been played
    // You can set setIsVideoPlayed(true) when the video is played

    const updateWatchHistory = EventRegister.addEventListener(
      LOCAL_EVENTS .EVENT_WATCHHISTORY_UPDATE,
      param => {
       
        try {
          if(seriesId!=param.seriesId)
            {
              return
            }
          // setsortedMultiseasons(obj => {
          //   LogData('updateWatchHistory in SeriesDetails', param);
          //   const playingVideo=obj["Season "+param.season][parseInt(param.episode)-1]
          //   setwatchResumeFlag('Resume');
          //   playingVideo.resume = param.resume+''
          //   setCurrentPLayingVideo(playingVideo)
          //   return {
          //     ...obj
          //   };
          // });
          setsortedMultiseasons(obj => {
    LogData('updateWatchHistory in SeriesDetails', param);
    if (!obj) return obj;
    const seasonArr = obj["Season " + param.season];
    if (!seasonArr) return { ...obj };
    const playingVideo = seasonArr[parseInt(param.episode) - 1];
    if (!playingVideo) return { ...obj };
    setwatchResumeFlag('Resume');
    playingVideo.resume = param.resume + '';
    setCurrentPLayingVideo(playingVideo);
    return { ...obj };
});
        } catch (error) {
          LogError('updateWatchHistory_scroller in SeriesDetails', error);
        }
      },
    );

    const updateWatchHistory_scroller = EventRegister.addEventListener(
      LOCAL_EVENTS.EVENT_WATCHHISTORY_UPDATE_SCROLLER,
      param => {
       
        try {
          if(seriesId!=param.seriesId)
            {
              return
            }
          // setsortedMultiseasons(obj => {
          //   LogData('updateWatchHistory_scroller in SeriesDetails',param);
          //   const playingVideo=obj["Season "+param.season][parseInt(param.episode)-1]
          //   //({...obj, resume:(param.contentID==obj.id)? param.resume+'':obj.resume+''})
          //   setwatchResumeFlag('Resume');
          //   playingVideo.resume = param.resume+''
          //   setCurrentPLayingVideo(playingVideo)
          //   return {
          //     ...obj
          //   };
          // });
          setsortedMultiseasons(obj => {
    LogData('updateWatchHistory_scroller in SeriesDetails', param);
    if (!obj) return obj;
    const seasonArr = obj["Season " + param.season];
    if (!seasonArr) return { ...obj };
    const playingVideo = seasonArr[parseInt(param.episode) - 1];
    if (!playingVideo) return { ...obj };
    setwatchResumeFlag('Resume');
    playingVideo.resume = param.resume + '';
    setCurrentPLayingVideo(playingVideo);
    return { ...obj };
});
          // setCurrentPLayingVideo(obj => ({
          //   ...obj,
          //   resume:
          //     param.contentID == obj.id ? param.resume + '' : obj.resume + '',
          // }));
        }catch (error) {
          LogError('updateWatchHistory_scroller in SeriesDetails', error);
        }
      },
    );

    return () => {
      LogData('removeEventListener in SeriesDetails');
      EventRegister.removeEventListener(updateWatchHistory);
      EventRegister.removeEventListener(updateWatchHistory_scroller);
    };
  }, []);


  useEffect(() => {
    //uuid : string  ,contentid : string , profileid : string 
    if (route.params){

 
     if (status === 'idle') {
       setStatus("loading");
 
       
       setitemWidth (screenWidth   )
      setitemHeight ((screenWidth* 9 )/ 16  )
       const { intent } = route.params;
       seriesId = intent.seriesId


       if (__DEV__) {
       }
         if (cacheData) {
           let matchingSeries;
           cacheData.some(item => {
             if (item.list && Array.isArray(item.list)) {
               // If the list exists, loop through it to find the seriesId
               return item.list.some(listItem => {
                 if (listItem.seriesId === intent.seriesId) {
                   matchingSeries = listItem;
                   return true; // Exit the loop if match is found
                 }
                 return false;
               });
             } else if (item.seriesId === intent.seriesId) {
               // Check if the current item itself matches the seriesId
               matchingSeries = item;
               return true; // Exit the loop if match is found
             }
             return false;
           });
   
           if (matchingSeries) {
             // If a match is found, store the data
            setSeriesData(matchingSeries)
             processSeriesdata(matchingSeries);
          
             setStatus("successful");
           } else {
             // If no match is found, make an API call to get series details
             const body = { "seriesid": intent.seriesId };
             const content = getSeriesDetails(body);
             content.then(x => {
              try {
                setSeriesData(x.data)
                processSeriesdata(x.data);
                setStatus("successful");
              } catch (error) {
                LogError("SeriesDetails2 getSeriesDetails matchingSeries else catch error",error)
              }
             }).catch(error => {
               setStatus("error");
             });
           }
         } 
         
         else {
           // If cacheData is empty, make an API call to get series details
           const body = { "seriesid": intent.seriesId }
           const content = getSeriesDetails(body);
           content.then(x => {
             //const result = x;
            try {
              processSeriesdata(x.data)
              setSeriesData(x.data)
              setStatus("successful");
            } catch (error) {
              LogError("SeriesDetails2 getSeriesDetails cacheData else catch error",error)
            }
             
           }).catch(error => {
             setStatus("error");
           });
         }
       }
     }
   }, [route.params]);

  // const processSeriesdata = (info: List )=>{

  //   try {
  //     APP_EVENTS_. content_view (info.title , info.seriesId , "Shows") 
  //   } catch (error) {
      
  //   }

  //   try {
       
  // //  const info: List = intent;

  //   settitle(info.title)
  //   if (info.actors){
  //       setCast(info.actors.split(','));
  //   }
  //   const formattedGenre = info.genre.split(',').map(genre => genre.trim()).join(', ');
  //   const videoInfo = `${formattedGenre} - ${info.certificate} - ${info.lang}`;
    
  //   setVideoGenre(videoInfo);
    

  //  // setVideoGenre(info.genre + " - "+info.certificate + " - "+ info.lang)
  //   //setseasonTitle(info.)
  //   setDirectorName(info.directors)
  //   if (info.producers){
  //     setProducers(info.producers.split(','))
  //   }
  //   setdescription(info.desc)

  //   if (info.media && info.media.trailer && info.media.trailer.length>0){
  //     setVideoUrl(info.media.trailer[0].url)
  //  }

  //  if (info.thumbnail && info.thumbnail.t16x9){
  //       setthumbnail(info.thumbnail.t16x9)
  //  }

  //   setepisodesList(info.clips)
  //       setVideoType(info.type)
  //       setVideoID(info.seriesId);


  //       processSesaonsData(info.clips)

  function normalizeStringArray(value: any): string[] {
  if (!value) return [];
  if (typeof value === 'string') {
    return value.split(',').map(s => s.trim()).filter(s => s);
  }
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        return item.name || item.actor || item.director || item.producer || item.label || JSON.stringify(item);
      }
      return String(item);
    }).filter(s => s);
  }
  return [];
}

  const processSeriesdata = (info: any)=>{
  try {
    APP_EVENTS_.content_view(info.title, info.seriesId, "Shows")

    settitle(info.title || '')
    
    // if (info.actors && typeof info.actors === 'string') {
    //   setCast(info.actors.split(','));
    // } else if (Array.isArray(info.actors)) {
    //   setCast(info.actors);
    // } else {
    //   setCast([]);
    // }

    if (info.actors && typeof info.actors === 'string') {
    setCast(info.actors.split(','));
} else if (Array.isArray(info.actors)) {
    setCast(normalizeStringArray(info.actors));
} else {
    setCast([]);
}


    const formattedGenre = info.genre && typeof info.genre === 'string' 
      ? info.genre.split(',').map(genre => genre.trim()).join(', ')
      : '';
    const videoInfo = `${formattedGenre} - ${info.certificate || ''} - ${info.lang || ''}`;
    setVideoGenre(videoInfo);

    // if (info.directors && typeof info.directors === 'string') {
    //   setDirectorName(info.directors)
    // } else if (Array.isArray(info.directors)) {
    //   setDirectorName(info.directors.join(', '))
    // } else {
    //   setDirectorName('')
    // }

    if (info.directors && typeof info.directors === 'string') {
    setDirectorName(info.directors)
} else if (Array.isArray(info.directors)) {
    setDirectorName(normalizeStringArray(info.directors).join(', '))
} else {
    setDirectorName('')
}


    // if (info.producers && typeof info.producers === 'string') {
    //   setProducers(info.producers.split(','))
    // } else if (Array.isArray(info.producers)) {
    //   setProducers(info.producers)
    // } else {
    //   setProducers([])
    // }

    if (info.producers && typeof info.producers === 'string') {
    setProducers(info.producers.split(','))
} else if (Array.isArray(info.producers)) {
    setProducers(normalizeStringArray(info.producers))
} else {
    setProducers([])
}

    setdescription(info.desc || '')

    if (info.media && info.media.trailer && info.media.trailer.length > 0) {
      setVideoUrl(info.media.trailer[0].url)
    }

    if (info.thumbnail && info.thumbnail.t16x9) {
      setthumbnail(info.thumbnail.t16x9)
    }

    setepisodesList(info.clips || [])
    setVideoType(info.type || '')
    setVideoID(info.seriesId || '');

    processSesaonsData(info.clips || [])

        
        if (useractivityDetails &&  useractivityDetails.likes && useractivityDetails.likes.series &&  
          useractivityDetails.likes.series.length>0) {
               if (useractivityDetails.likes?.series?.includes(info.seriesId)){
                 setIsLiked(true)
               }
               else{
                 setIsLiked(false);
               }
       }

        if (useractivityDetails &&  useractivityDetails.wishlist && useractivityDetails.wishlist.series &&  
           useractivityDetails.wishlist.series.length>0) {
              const ree = useractivityDetails.wishlist.series.filter(
                (series) => {
                  series.seriesId == info.seriesId
                
                })
                if (useractivityDetails.wishlist?.series?.some(series => series.seriesId === info.seriesId)){
                  setIsWishlist(true)
                }
                else{
                  setIsWishlist(false);
                }
        }
        // setIsWishlist()
        
    } catch (error) {
    }
   
  }


  const processSesaonsData =  (episodesList:any) => {
    try {
      const multiseasons: Multiseasons = {};
 
      episodesList.forEach((value:any) => {
        const season = 'Season ' + value.season;
    
        if (multiseasons.hasOwnProperty(season)) {
          multiseasons[season].push(value);
        } else {
          multiseasons[season] = [value];
        }
      });
      
      
      const sortedMultiseasons: Multiseasons = Object.fromEntries(
        Object.entries(multiseasons).sort()
      );
    
      for (const season in sortedMultiseasons) {
        sortedMultiseasons[season].sort((a, b) => a.episode - b.episode);
      }
    
      const seasons = Object.keys(sortedMultiseasons);
    
      setseasons(seasons)
    
  
         
         const { intent } = route.params;
         if (useractivityDetails && useractivityDetails?.watchhistory  &&  useractivityDetails?.watchhistory.clips && useractivityDetails?.watchhistory.clips.length>0) {
              const tempHistory = useractivityDetails?.watchhistory.clips

              let haswatchHisotry = false;
              for (let i = 0 ; i<tempHistory.length;i++)  {
                    if (tempHistory[i].seriesId == intent.seriesId) {
                        
                        const season = tempHistory[i].season
                        const episode = parseInt( tempHistory[i].episode)

                       
                        if ((episode-1) < sortedMultiseasons["Season "+season].length) {
                          haswatchHisotry = true;
                          setwatchResumeFlag("Resume");                          
                          const currVideo = sortedMultiseasons["Season "+season][episode-1]
                          currVideo.resume =  tempHistory[i].resume                          
                          setCurrentPLayingVideo(currVideo)
                          break;
                        }                         
                        
                    }
              }

              if (!haswatchHisotry) {
                  setwatchResumeFlag("Watch");
                  if (sortedMultiseasons["Season 1"] && sortedMultiseasons["Season 1"].length>0) {                      
                      setCurrentPLayingVideo(sortedMultiseasons["Season 1"][0])
                  }
              }

         } else {
            setwatchResumeFlag("Watch");
            if (sortedMultiseasons["Season 1"] && sortedMultiseasons["Season 1"].length>0) {                
                setCurrentPLayingVideo(sortedMultiseasons["Season 1"][0])
            }
         }

      setsortedMultiseasons({...sortedMultiseasons})
      
    } catch (error) {
    }
  }


  interface Multiseasons {
    [key: string]: Array<any>; // Replace YourItemType with the actual type of your data items
  }
 

  const handleLikeAPI =  (clicked:string) => {

    try {
      if (clicked === 'like') {
        try {
          APP_EVENTS_.add_to_likes(title,videoID,'show')
        } catch (error) {
        }
      
      } else if (clicked === 'unlike') {
        try {
          APP_EVENTS_.remove_from_likes(title,videoID,'show')
        } catch (error) {
        }
      } else if (clicked === 'dislike') {
        try {
          APP_EVENTS_.add_to_unlikes(title,videoID,'show')
        } catch (error) {
        }
      } else if (clicked === 'rmdislike') {
        try {
          APP_EVENTS_.remove_from_unlikes(title,videoID,'show')
        } catch (error) {
        }
      }
    } catch (error) {
    }

    
    try {
      let response;
  
      if (clicked === 'like') {
        setIsLiked(true);
        setIsDisliked(false);
        if(useractivityDetails?.likes?.series?.includes(videoID))
        {
          return;
        }
        response =  doUserAction('like', UUID, profileid, videoType, videoID);
      } else if (clicked === 'unlike') {
        setIsLiked(false);
        setIsDisliked(false); // Reset dislike state when unliking
        response =  doUserAction('unlike', UUID, profileid, videoType, videoID);
      } else if (clicked === 'dislike') {
        setIsLiked(false);
        setIsDisliked(true);
        response =  doUserAction('dislike', UUID, profileid, videoType, videoID);
      } else if (clicked === 'rmdislike') {
        setIsDisliked(false);
        response =  doUserAction('rmdislike', UUID, profileid, videoType, videoID);
      }
  
  
      response.then((x) => {
        try {
          if ('data' in x) {
            if (x.data.resultcode === '101') 
            {
              if (clicked === 'like') {
                // Check if 'likes' object exists in userActivityDetails
                if (useractivityDetails.likes && useractivityDetails.likes.series) {
  
                  useractivityDetails.likes.series.push(videoID);
                } else {
                  useractivityDetails.likes.series =  [];
                  useractivityDetails.likes.series.push(videoID);
                }
                // useractivityDetails.likes = useractivityDetails.likes || {};
                //useractivityDetails.likes.series = useractivityDetails.likes.series || [];
                
              } 
              else if (clicked === 'unlike' || clicked === 'rmdislike'|| clicked === 'dislike') {
                if( useractivityDetails.likes &&  useractivityDetails.likes.series)
                {
                  useractivityDetails.likes.series = useractivityDetails.likes.series.filter(
                    (id) => id !== videoID
                  );
                }
                // Remove seriesId from 'likes' series
               
              }
             
            }
           else {
            }
          } else {
          }
        } catch (error) {
          LogError("SeriesDetails2 handleLikeAPI doUserAction catch error inside",error)
        }
      });
    } catch (error) {
      LogError("SeriesDetails2 handleLikeAPI doUserAction catch error outside",error)
    }
  };
  


  const handleWishlistAPI =  (action: string) => {

    try {
      
      if (action === 'addwishlist') {
        try {
          APP_EVENTS_.add_to_wishlist(title, videoID, 'show');
        } catch (error) {
        }
      }
      if (action === 'removewishlist') {
        try {
          APP_EVENTS_.remove_from_wishlist(title, videoID, 'show');
        } catch (error) {
        }
      }
    } catch (error) {
    }

    try {
      // Determine the action based on the current state of isInWatchlist
      let response;
  
      if (action === 'addwishlist') {
      setIsWishlist(true)
      if(useractivityDetails?.wishlist?.series?.some((series) => series.seriesId === videoID))
      {
        return
      }
      response =  doUserAction('addwishlist', UUID, profileid, videoType, videoID);
      }
       else  {
        setIsWishlist(false)
        response =  doUserAction('removewishlist', UUID, profileid, videoType, videoID);
      }
      // 'addwishlist' or 'removewishlist'

      response.then((x) => {
        try {
          if ('data' in x) {
            if (x.data.resultcode === '101')
              {
  
          if (action === 'addwishlist') {
            if (useractivityDetails && useractivityDetails?.wishlist && useractivityDetails?.wishlist.series) {
  
              useractivityDetails.wishlist.series.push(seriesData);
            } 
            else {
              useractivityDetails.wishlist.series =  [];
              useractivityDetails.wishlist.series.push(seriesData);
            }
            // useractivityDetails.likes = useractivityDetails.likes || {};
            //useractivityDetails.likes.series = useractivityDetails.likes.series || [];
            
          } 
          else {
            // Remove seriesId from 'likes' series
            useractivityDetails.wishlist.series = useractivityDetails.wishlist.series.filter(
              (series) => series.seriesId !== videoID
            );
          }
         
        } else {
        }
      } else {
      }
          
        } catch (error) {
          LogError("SeriesDetails2 handleWishlistAPI doUserAction catch error inside",error)
        }
  });
} catch (error) {
  LogError("SeriesDetails2 handleWishlistAPI doUserAction catch error outside",error)
}
};


 // const isnInwishlist = useractivityDetails.wishlist?.series?.some(series => series.seriesId === videoID);



  const handleShare = () => {
    try {
      const shareresp =   createShareLink( videoID , "shows" , title)
  
      shareresp.then(resp=>{
        try {
          if ("data" in resp ){
            
            if (resp.data.resultcode == 101){
              const options = {
                title: APP_NAME,
                message: resp.data.url,
          
              };
          
              Share.open(options)
                .then((res) => {
                  try {

                  } catch (error) {
                    LogError("SeriesDetails2 handleShare Share.open catch error inside",error)
                  }
                })
                .catch((err) => {
                  err && LogError("SeriesDetails2 handleShare Share.open catch error outside",err)
                });
            } else {
    
            }
          } else {
          }
          
        } catch (error) {
          LogError("SeriesDetails2 handleShare createShareLink catch error inside",error)
  
        }
      })
    } catch (error) {
      LogError("SeriesDetails2 handleShare createShareLink catch error outside",error)
    }
  };

  const renderCast = () => {
    const visibleCast = cast.slice(0, maxVisibleCast).join(', ');

    if (cast.length > maxVisibleCast) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={styles.castHeading}>Cast: </Text>
          <Text style={styles.castText}>{visibleCast}</Text>
          <TouchableOpacity onPress={toggleModal}>
            <Text style={styles.moreButton}>...More</Text>
          </TouchableOpacity>
          <ModalComponent
          title={title}
  data={[
    { title: 'Cast', content: cast },
    { title: 'Genres', content: videoGenre },
    { title: 'Director', content: DirectorName },
    { title: 'Producers', content: producers },
  ]}
  isModalVisible={isModalVisible}
  toggleModal={toggleModal}
/>

        </View>
      );
    } else {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={styles.castHeading}>Cast: </Text>
          <Text style={styles.castText}>{visibleCast}</Text>
        </View>
      );
    }
  };

  function onfullscreenclick(){

    const params = {videoUrl,title}

    handleTrailerVideoPlay(navigation ,params )
  }

  const getposter =() =>{
    if (videoUrl != "" &&  videoUrl != null) {
        return (
        <TrailerPlayer
          onfullscreenclick = {onfullscreenclick}
          posterUrl = {thumbnail}
          showfullscreenicon={true}
          videoUrl={videoUrl}
          forcePaused={pauseInlineTrailer}
        />
        )
    } else  if (thumbnail != "" &&  thumbnail != null){
      return(
          <Image  source={{uri:thumbnail}}  style={{width:itemWidth , height : itemHeight}} />
      )
    } else {
      return (
        <View style={{ width: itemWidth, height: itemHeight, backgroundColor: "#17171D" }} />
      )
    }
  }

  const getContent = () => {
    return (
      <View style={styles.container}>
  
        <ScrollView    >
  
         {getposter() } 
         
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.videoGenre}>{videoGenre}</Text>
            {/* <TouchableOpacity
            activeOpacity={0.9}
              style={[styles.button, { backgroundColor: 'red' }]}
              onPress={() =>{
                const seriesdetails = {"seriestitle" : title}
                // handleVideoPlay(navigation ,currentPLayingVideo ,seriesdetails )
                handlePlayPress()
              } }>
              <Image
                source={require('../../../app_assets/res_15.png')}
                style={{ width: 15, height: 20, tintColor: 'white', marginEnd: 10 }}
              />
             {currentPLayingVideo &&  <Text style={styles.buttonText}> {watchResumeFlag +" S"+ currentPLayingVideo.season + ":" + "E"+currentPLayingVideo.episode }</Text> }
            </TouchableOpacity> */}
               <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handlePlayPress()}
            >
              <LinearGradient
                colors={colors.gradients.primaryButton}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={[styles.button, { borderRadius: 8 }]} // or whatever borderRadius your styles.button uses
              >
                <Image
                  source={require("../../../app_assets/res_15.png")}
                  style={{
                    width: 15,
                    height: 20,
                    tintColor: "white",
                    marginEnd: 10,
                  }}
                />
                <Text style={styles.buttonText}>
             {currentPLayingVideo &&  <Text style={styles.buttonText}> {watchResumeFlag +" S"+ currentPLayingVideo.season + ":" + "E"+currentPLayingVideo.episode }</Text> }
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            {/* {currentPLayingVideo && <Text style={styles.seasonTitle}>  {"S"+ currentPLayingVideo.season + ":" + "E"+currentPLayingVideo.episode  + " - "+ currentPLayingVideo.title}</Text> } */}
            {/* <Text style={styles.seasonTitle}>HIII</Text> */}
            <Text style={styles.description}>{description}</Text>
            {renderCast()}
            <View style={styles.directorContainer}>
              <Text style={styles.directorHeading}>Director: </Text>
              <Text style={styles.directorText}>{DirectorName}</Text>
            </View>
  
            <View style={styles.videoIconsContainer}>
            <View>
                <TouchableOpacity activeOpacity={0.9} onPress={() => handleLikeAPI(isLiked ? 'unlike' : 'like')}>
                {isLiked ? (
                    <Image
                      source={require('../../../app_assets/symbols/sym_86.png')}
                      style={styles.imageIconsStyle}
                    />

                  ) : (

                    <Image
                      source={require('../../../app_assets/symbols/sym_85.png')}
                      style={styles.imageIconsStyle}
                    />
                  )}
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity activeOpacity={0.9} onPress={() => handleLikeAPI(isDisliked ? 'rmdislike' : 'dislike')}>
                  {isDisliked ? (
                    <Image
                      source={require('../../../app_assets/symbols/sym_84.png')}
                      style={styles.imageIconsStyle}
                    />
                  ) : (
                    <Image
                      source={require('../../../app_assets/symbols/sym_83.png')}
                      style={styles.imageIconsStyle}
                    />
                  )}
                </TouchableOpacity>
              </View>
              <View>
                <View>
                  <TouchableOpacity activeOpacity={0.9} onPress={() => handleWishlistAPI(isWishlist? 'removewishlist' : 'addwishlist')}>
                    {(isWishlist ) ? (
                      <Image
                        source={require('../../../app_assets/symbols/sym_82.png')}
                        style={[styles.imageIconsStyleShare, { tintColor: 'white' }]}
  
                      />
                    ):(<Image
                      source={require('../../../app_assets/symbols/sym_81.png')}
                      style={styles.imageIconsStyleShare}
                    />)}
                  </TouchableOpacity>
  
          
                </View>
  
  
              </View>
  
              {/* <View>
                <TouchableOpacity activeOpacity={0.9} onPress={handleShare}>
                  <Image
                    source={require('../../../app_assets/symbols/sym_80.png')}
                    style={styles.imageIconsStyleShare}
                    resizeMode='contain'
                  />
                </TouchableOpacity>
              </View> */}
              {/*<View>
                <TouchableOpacity activeOpacity={0.9} onPress={handleShare}>
                  <Image
                    source={require('../../../app_assets/symbols/download-circular-button.png')}
                    style={styles.imageIconsStyle}
                    resizeMode='contain'
                  />
                </TouchableOpacity>
                    </View> */}
  
            </View>
            <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold',marginVertical: 10 }}>Episodes</Text>
            <View>
            <TouchableOpacity activeOpacity={0.9} style={styles.dropDownStyle} onPress={toggleSeasonModal}>
                <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>{selectedSeason}</Text>
                <Image
                  style={{ width: 15, height: 15 }}
                  source={require('../../../app_assets/res_08.png')}
                  tintColor="#fff"
                />
              </TouchableOpacity>
            </View>
            <SeasonData
          isModalVisible={isSeason1ModalVisible}
          toggleModal={toggleSeasonModal}
          seasons={seasons}
          onSelectSeason={handleSeasonSelection}
          // selectedSeason={selectedSeason}
        />
          </View>
          {sortedMultiseasons &&  sortedMultiseasons[selectedSeason] && (
          <ScrollView>
            {sortedMultiseasons &&   sortedMultiseasons[selectedSeason].map((item:any, index:number) => (
              <View key={index}>
                <DetailLayout param={item} seriesDetails={{"seriesTitle":title} } playVideoCallBack={handleVideoPlayInternal}/>
              </View>
            ))}
          </ScrollView>
        )}
        </ScrollView>
      </View>
    );
  }



function handleVideoPlayInternal(param){
  try {
    setShowVideoLoading(true)
    setPauseInlineTrailer(true)
    setCurrentPlayingVideo(param)
    var  resume = 0
  
    try {
      if (param.resume){
        resume = parseInt(param.resume)
      }
    } catch (error) {
      
    }
  
    var subtitleArray=""
    if(param && param.media && param.media.subtitles){
      const data= {"subtitles" : param.media.subtitles}
      subtitleArray= JSON.stringify(data)
    }
    const seriesdetails = {seriestitle: title};
   
    const contentaccess =   handleVideoPlayAsync(navigation, param, seriesdetails);
  
    contentaccess.then(resp=>{
      try {
        setShowVideoLoading(false)
     
        if (resp && resp.videourl){
          openResolvedVideoPlayer(navigation, {
            videourl: resp.videourl,
            title: resp.title,
            dwnid: resp.dwnid,
            resume,
            subtitleArray,
            clipDetails: param,
            seriesDetails: seriesdetails,
          });
        } else {
          LogError("SeriesDetails2 handleVideoPlayInternal handleVideoPlayAsync else error inside",resp)
        }
      } catch (error) {
        LogError("SeriesDetails2 handleVideoPlayInternal handleVideoPlayAsync catch error inside",error)
  
      }
  
    },isRejected=>{
     setShowVideoLoading(false)
    }).catch(err=>{
     setShowVideoLoading(false)
    })
    
  } catch (error) {
    LogError("SeriesDetails2 handleVideoPlayInternal handleVideoPlayAsync catch error outside",error)
 
  }


}




  return (
    <>
      {status === 'loading' && <LoadingSpinner />}
      {status === 'failed' && <EmptyState />}
      {status === 'successful' && getContent()}


      <Modal
        visible={showVideoLoading}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View >
            <Loader/>
          </View>
        </View>
      </Modal>


    </>
  );


};

const styles = StyleSheet.create({
  container: {
    flex:1,
    flexDirection: 'column',
    backgroundColor: '#000000',


  },
  videoContainer: {
    //height: 210,
    backgroundColor: 'black',
  },
  video: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    paddingHorizontal: 15

  },
  title: {
    fontSize: 25,
    color: 'white',
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 8,
  },
  videoGenre: {
    fontSize: 11,
    color: 'white',
    marginBottom: 8,
  },
  videoIconsContainer: {
    marginVertical: 12,
    marginBottom: 8,
    marginStart: -7,
    flexDirection: 'row',
  },
  imageIconsStyle: {
    marginHorizontal: 10,
    width: 34,
    height: 34,
    flexDirection: 'row',
    tintColor: '#ffffff',
    marginRight: 10
  },
    imageIconsStyleShare: {
    marginHorizontal: 10,
    width: 32,
    height: 32,
    flexDirection: 'row',
    tintColor: '#ffffff',
        marginRight: 10

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
    //     fontSize: 12,
    // letterSpacing: 1,
    // color: '#fff',
    // marginVertical: 10,
    // fontWeight: '300',
    // fontStyle: 'normal',
    // fontFamily: "Rokkitt-Medium",
       letterSpacing: 0.5,
    color: "#fff",
    marginVertical: 11,
    fontWeight: "300",
    fontFamily: "Rokkitt-Medium",

  },
  button: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  playIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 14,
    color: 'white',
  },
  directorContainer: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  directorHeading: {
    fontSize: 13,
    color: 'white',
    fontWeight: '300',
  },
  directorText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '300',
  },
  castHeading: {
    fontSize: 13,
    color: 'white',
    fontWeight: '300',
    marginBottom: 6
  },
  castText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '300',
    letterSpacing: 1,
  },
  moreButton: {
    fontSize: 12.5,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 5,
  },
  dropDownStyle: {
    backgroundColor: '#17171D',
    padding: 5,
    flexDirection: 'row', width: 120,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 6,
    marginVertical: 10,
  },
  
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContents: {
    backgroundColor: '#111111',
    padding: 20,
    borderRadius: 3,
    width: '50%',
  },
});

export default SeriesViewerAlt;