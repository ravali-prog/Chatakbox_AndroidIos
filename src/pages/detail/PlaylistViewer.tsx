import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
  NativeModules,
  Modal,
  Platform,
} from "react-native";
import DetailLayout from "../../ui_components/widgets/DetailLayout";
import TrailerPlayer from "../../media_player/TrailerPlayerCore";
import { useNavigation } from "@react-navigation/native";
import Orientation from "react-native-orientation-locker";
import { Clip, List } from "../../data_models/ContentDataTypes";
import ModalComponent from "../../data_models/ModalComponentData";
import {
  APP_NAME,
  LogData,
  USER_UUID,
  handleTrailerVideoPlay,
  handleVideoPlay,
  selectedUserProfile,
  useractivityDetails,
  handleVideoPlayAsync,
  configData,
  setCurrentPlayingVideo,
  LOCAL_EVENTS,
  LogError,
  openResolvedVideoPlayer,

} from "../../app_config/AppConstants";
import {
  createShareLink,
  doUserAction,
  getContentDetails,
  getSimilarContent,
  similarVideos,
} from "../../state_mgmt/AppCommonSlice";
import Share from "react-native-share";
import SeasonModal from "../../data_models/SeasonData";
import ContentScroller from "../../ui_components/widgets/ContentScroller";
import ListRender from "../../ui_components/content/ListRenderer";
// import ClipDetails from '../../ui_components/widgets/ClipDetails';
import { ContentData } from "../../data_models/ContentDataTypes";
import EmptyState from "../../ui_components/widgets/EmptyState";
import LoadingSpinner from "../../ui_components/widgets/LoadingSpinner";
import { APP_EVENTS_ } from "../../app_config/AnalyticsConfig";
import { EventRegister } from "react-native-event-listeners";
import Loader from "../../ui_components/widgets/LoadingSpinner";
import LinearGradient from "react-native-linear-gradient";
import { colors } from "../../theming/colors";


const PlaylistViewer = ({ route }: any) => {
  const navigation = useNavigation();
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
  const [thumnail, setthumnail] = useState("");
  const [title, settitle] = useState("");
  const [videoGenre, setVideoGenre] = useState("");
  const [videoType, setVideoType] = useState("");
  const [videoID, setVideoID] = useState("");
  const [cast, setCast] = useState<string[]>([]);
  const [producers, setProducers] = useState<string[]>([]);
  const [DirectorName, setDirectorName] = useState("");
  const [description, setdescription] = useState("");
  const profileid = selectedUserProfile ? selectedUserProfile.profileid : "";
  const UUID = USER_UUID;
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [selectedWishlist, setSelectedWishlist] = useState("removewishlist");
  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  const [currentClip, setcurrentClip] = useState<any>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);

  const [showVideoLoading, setShowVideoLoading] = useState(false);


  const maxVisibleCast = 2;
  const [showAllCast, setShowAllCast] = useState(false);

  const toggleShowAllCast = () => {
    setShowAllCast(!showAllCast);
  };

  const navigateToCastDetails = (castinfo: any) => {
    //navigation.navigate('CastDetails', {cast});
  };
  const [itemWidth, setitemWidth] = useState(0);
  const [itemHeight, setitemHeight] = useState(0);
  const [similarShowsData, setSimilarShowsData] = useState<string[]>([]);
  const [similarVideoTitle, setSimilarVideoTitle] = useState("");
  const [groupId, setGroupId] = useState("");
  const [watchResumeFlag, setwatchResumeFlag] = useState("Watch");
  const [status, setStatus] = useState("loading");

  const { ActivityStarter } = NativeModules;

  useEffect(() => {

    const updateWatchHistory = EventRegister.addEventListener(
      LOCAL_EVENTS.EVENT_WATCHHISTORY_UPDATE,
      (param) => {
        LogData("updateWatchHistory in DetailsPlaylistTv", param);
        try {
          setcurrentClip((obj) => {
            setwatchResumeFlag(param.contentID == obj.id ? "Resume" : "Play");
            return {
              ...obj,
              resume:
                param.contentID == obj.id ? param.resume + "" : obj.resume + "",
            };
          });
        } catch (error) {
          LogError("updateWatchHistory_scroller in DetailsPlaylistTv", error);
        }
      }
    );

    const updateWatchHistory_scroller = EventRegister.addEventListener(
      LOCAL_EVENTS.EVENT_WATCHHISTORY_UPDATE_SCROLLER,
      (param) => {
        LogData("updateWatchHistory_scroller in DetailsPlaylistTv", param);
        try {
          setcurrentClip((obj) => {
            setwatchResumeFlag(param.contentID == obj.id ? "Resume" : "Play");
            return {
              ...obj,
              resume:
                param.contentID == obj.id ? param.resume + "" : obj.resume + "",
            };
          });
        } catch (error) {
          LogError("updateWatchHistory_scroller in DetailsPlaylistTv", error);
        }
      }
    );

    return () => {
      EventRegister.removeEventListener(updateWatchHistory);
      EventRegister.removeEventListener(updateWatchHistory_scroller);
    };
  }, []);

  const handlePlayPress = () => {
    try {
      setShowVideoLoading(true)
      setPauseInlineTrailer(true)
      setCurrentPlayingVideo(currentClip);
      var resume = 0;
  
      try {
        if (currentClip.resume) {
          resume = parseInt(currentClip.resume);
        }
      } catch (error) {}
  
      var subtitleArray = "";
      if (currentClip && currentClip.media && currentClip.media.subtitles) {
        const data = { subtitles: currentClip.media.subtitles };
        subtitleArray = JSON.stringify(data);
      }
  
      const contentaccess = handleVideoPlayAsync(navigation, currentClip, null);
  
      contentaccess
        .then(
          (resp) => {
            try {
              setShowVideoLoading(false)
  
              if (resp && resp.videourl) {
                openResolvedVideoPlayer(navigation, {
                  videourl: resp.videourl,
                  title: resp.title,
                  dwnid: resp.dwnid,
                  resume,
                  subtitleArray,
                  clipDetails: currentClip,
                  seriesDetails: null,
                });
              } else {
              }
            } catch (error) {
              LogError("PlaylistViewer handlePlayPress handleVideoPlayAsync catch error inside",error)
            }
        
          },
          (isRejected) => {
            setShowVideoLoading(false)
          }
        )
        .catch((err) => {
          setShowVideoLoading(false)
        });
    } catch (error) {
      LogError("PlaylistViewer handlePlayPress handleVideoPlayAsync catch error outside",error)
    }
  };


//   const handlePlayPress = () => {
//   const testUrl =
//     "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8";

//   ActivityStarter.navigateToVideo(
//     testUrl,
//     "Test Video",
//     "123",
//     "0",
//     "",
//     configData.data.config.videoanalytics + "?"
//   );
// };

  // function setDetails(intent) {
  //   const info: Clip = intent;

  //   try {
  //     APP_EVENTS_.content_view(info.title, info.id, "Video");
  //   } catch (error) {}

  //   setcurrentClip(info);

  //   settitle(info.title);
  //   setCast(info.actors.split(","));

  //   const formattedGenre = info.genre
  //     .split(",")
  //     .map((genre) => genre.trim())
  //     .join(", ");
  //   const videoInfo = `${formattedGenre} - ${info.certificate} - ${info.lang}`;

  //   setVideoGenre(videoInfo);
  //   // setVideoGenre(info.genre + " - "+info.certificate + " - "+ info.lang)
  //   //setseasonTitle(info.)
  //   setDirectorName(info.directors);
  //   setProducers(info.producers.split(","));
  //   setdescription(info.desc);
  //   let tempGroupid = info.groupId;
  //   setGroupId(info.groupId);

  //   setitemWidth(screenWidth);
  //   setitemHeight((screenWidth * 9) / 16);

  //   if (info.media && info.media.trailer && info.media.trailer.length > 0) {
  //     setVideoUrl(info.media.trailer[0].url);
  //   }

  //   if (info.thumbnail && info.thumbnail.t16x9) {
  //     setthumnail(info.thumbnail.t16x9);
  //   }

  //   setVideoType(info.type);
  //   setVideoID(info.id);

  //   handleSimilarContentAPI(tempGroupid);

  //   checkWatchHistory(info);
  //   if (
  //     useractivityDetails &&
  //     useractivityDetails.likes &&
  //     useractivityDetails.likes.clip &&
  //     useractivityDetails.likes.clip.length > 0
  //   ) {
  //     if (useractivityDetails.likes?.clip?.includes(info.id)) {
  //       setIsLiked(true);
  //     } else {
  //       setIsLiked(false);
  //     }
  //   }

  //   if (
  //     useractivityDetails &&
  //     useractivityDetails.wishlist &&
  //     useractivityDetails.wishlist.clips &&
  //     useractivityDetails.wishlist.clips.length > 0
  //   ) {

  //     if (
  //       useractivityDetails.wishlist?.clips?.some((clip) => clip.id === info.id)
  //     ) {
  //       setIsWishlist(true);
  //     } else {
  //       setIsWishlist(false);
  //     }
  //   }
  //   setStatus("successful");
  // }

  function normalizeStringArray(value: any): string[] {
  if (!value) return [];
  if (typeof value === 'string') {
    return value.split(',').map(s => s.trim()).filter(s => s);
  }
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        // Common object patterns: {name: "..."}, {id: 1, name: "..."}
        return item.name || item.actor || item.director || item.producer || item.label || JSON.stringify(item);
      }
      return String(item);
    }).filter(s => s);
  }
  return [];
}

  function setDetails(intent) {
  const info: Clip = intent;

  try {
    APP_EVENTS_.content_view(info.title, info.id, "Video");
  } catch (error) {}

  setcurrentClip(info);

  settitle(info.title || '');
  
  if (info.actors && typeof info.actors === 'string') {
    setCast(info.actors.split(","));
  } else if (Array.isArray(info.actors)) {
    // setCast(info.actors);
    setCast(normalizeStringArray(info.actors));
  } else {
    setCast([]);
  }

  const formattedGenre = info.genre && typeof info.genre === 'string'
    ? info.genre.split(",").map((genre) => genre.trim()).join(", ")
    : '';
  const videoInfo = `${formattedGenre} - ${info.certificate || ''} - ${info.lang || ''}`;

  setVideoGenre(videoInfo);
  
  if (info.directors && typeof info.directors === 'string') {
    // setDirectorName(info.directors);
    setDirectorName(normalizeStringArray(info.directors).join(', ') || info.directors || '');

  }  else if (Array.isArray(info.directors)) {
    setDirectorName(normalizeStringArray(info.directors).join(', '))
}
  else {
    setDirectorName('');
  }
  
  if (info.producers && typeof info.producers === 'string') {
    setProducers(info.producers.split(","));
  } else if (Array.isArray(info.producers)) {
    // setProducers(info.producers);
    setProducers(normalizeStringArray(info.producers));
  } else {
    setProducers([]);
  }
  
  setdescription(info.desc || '');
  let tempGroupid = info.groupId;
  setGroupId(info.groupId);

  setitemWidth(screenWidth);
  setitemHeight((screenWidth * 9) / 16);

  if (info.media && info.media.trailer && info.media.trailer.length > 0) {
    setVideoUrl(info.media.trailer[0].url);
  }

  if (info.thumbnail && info.thumbnail.t16x9) {
    setthumnail(info.thumbnail.t16x9);
  }

  setVideoType(info.type || '');
  setVideoID(info.id || '');

  handleSimilarContentAPI(tempGroupid);

  checkWatchHistory(info);
  
  if (
    useractivityDetails &&
    useractivityDetails.likes &&
    useractivityDetails.likes.clip &&
    useractivityDetails.likes.clip.length > 0
  ) {
    if (useractivityDetails.likes?.clip?.includes(info.id)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  }

  if (
    useractivityDetails &&
    useractivityDetails.wishlist &&
    useractivityDetails.wishlist.clips &&
    useractivityDetails.wishlist.clips.length > 0
  ) {
    if (
      useractivityDetails.wishlist?.clips?.some((clip) => clip.id === info.id)
    ) {
      setIsWishlist(true);
    } else {
      setIsWishlist(false);
    }
  }
  setStatus("successful");
}

  useEffect(() => {
    try {
      APP_EVENTS_.screen("VideoDetails");
    } catch (error) {
    }
  }, []);

  // useEffect(() => {
  //   const { intent } = route.params;
  //   LogData("videodetails", intent);

  //   if (intent.ext_contentid) {
  //     const body = { clipid: intent.ext_contentid };
  //     const content = getContentDetails(body);
  //     content.then((x) => {
  //       try {
  //         if ("data" in x) {
  //           setDetails(x.data);
  //         }
  //       } catch (error) {
  //         LogError("PlaylistViewer getContentDetails catch error",error);
  //         setStatus("failed");
  //       }
  //     });
  //   } else {
  //     setDetails(intent);
  //   }
  // }, [route.params]);

  useEffect(() => {
  const { intent } = route.params;
  LogData("videodetails", intent);

  if (intent.ext_contentid) {
    const body = { clipid: intent.ext_contentid };
    const content = getContentDetails(body);
    content.then((x) => {
      try {
        if ("data" in x) {
          let clipData = x.data;
          // If the response is an array of groups, extract the clip
          if (Array.isArray(clipData)) {
            // Find the clip inside the groups
            // for (const group of clipData) {
            //   if (group.list && Array.isArray(group.list)) {
            //     const found = group.list.find((item) => item.id === intent.ext_contentid || item.id === intent.id);
            //     if (found) {
            //       clipData = found;
            //       break;
            //     }
            //   }
            // }
            for (const group of clipData) {
  const items = group.list || group.clips;
  if (items && Array.isArray(items)) {
    const found = items.find((item) => item.id === intent.ext_contentid || item.id === intent.id);
    if (found) { clipData = found; break; }
  }
}
            // If not found in list, try direct find
            if (Array.isArray(clipData)) {
              const found = clipData.find((item) => item.id === intent.ext_contentid || item.id === intent.id);
              if (found) clipData = found;
            }
          }
          if (clipData && clipData.id) {
            setDetails(clipData);
          } else {
            setStatus("failed");
          }
        } else {
          setStatus("failed");
        }
      } catch (error) {
        LogError("PlaylistViewer getContentDetails catch error", error);
        setStatus("failed");
      }
    });
  } else {
    setDetails(intent);
  }
}, [route.params]);

  function checkWatchHistory(currClipInfo: Clip) {
    try {
      if (
        useractivityDetails &&
        useractivityDetails?.watchhistory &&
        useractivityDetails?.watchhistory.clips &&
        useractivityDetails?.watchhistory.clips.length > 0
      ) {
        const tempHistory = useractivityDetails?.watchhistory.clips;
        let haswatchHisotry = false;
        for (let i = 0; i < tempHistory.length; i++) {
          if (tempHistory[i].id == currClipInfo.id) {
            haswatchHisotry = true;
            setwatchResumeFlag("Resume");
            currClipInfo.resume = tempHistory[i].resume;
            break;
          }
        }

        if (!haswatchHisotry) {
          setwatchResumeFlag("Watch");
        }
      } else {
        setwatchResumeFlag("Watch");
      }
    } catch (error) {}
  }

  const handleSimilarContentAPI = (groupid: any) => {
    try {
      const body = { uuid: USER_UUID, groupid: groupid };
      const res = getSimilarContent(body);
      res.then((response) => {
        try {
          if (response && response !== null && response.data != null) {
            setSimilarShowsData(response.data); // Assuming the data structure is an array
            if (response.data[0]) {
              setSimilarVideoTitle(response.data[0].title);
            }
          } else {
          }
        } catch (error) {
          LogError("PlaylistViewer handleSimilarContentAPI getSimilarContent catch error inside",error)
        }
      
      });
    } catch (error) {
    }
  };

  const handleLikeAPI = (clicked: string) => {
    try {
      if (clicked === "like") {
        try {
          APP_EVENTS_.add_to_likes(title, videoID, "video");
        } catch (error) {
        }
      } else if (clicked === "unlike") {
        try {
          APP_EVENTS_.remove_from_likes(title, videoID, "video");
        } catch (error) {
        }
      } else if (clicked === "dislike") {
        try {
          APP_EVENTS_.add_to_unlikes(title, videoID, "video");
        } catch (error) {
        }
      } else if (clicked === "rmdislike") {
        try {
          APP_EVENTS_.remove_from_unlikes(title, videoID, "video");
        } catch (error) {
        }
      }
    } catch (error) {
    }

    try {
      let response;

      if (clicked === "like") {
        setIsLiked(true);
        setIsDisliked(false);
        response = doUserAction("like", UUID, profileid, videoType, videoID);
      } else if (clicked === "unlike") {
        setIsLiked(false);
        setIsDisliked(false); // Reset dislike state when unliking
        response = doUserAction("unlike", UUID, profileid, videoType, videoID);
      } else if (clicked === "dislike") {
        setIsLiked(false);
        setIsDisliked(true);
        response = doUserAction("dislike", UUID, profileid, videoType, videoID);
      } else if (clicked === "rmdislike") {
        setIsDisliked(false);
        response = doUserAction(
          "rmdislike",
          UUID,
          profileid,
          videoType,
          videoID
        );
      }

      response.then((x) => {

        try {
          
                  if ("data" in x) {
                    if (x.data.resultcode === "101") {
      
          
                      // Handle adding or removing clips based on the action
                      if (clicked === "like") {
                        // Check if 'likes' object exists in userActivityDetails
                        if (useractivityDetails.likes && useractivityDetails.likes.clip) {
                          useractivityDetails.likes.clip.push(videoID);
                        } else {
                          useractivityDetails.likes.clip = [];
                          useractivityDetails.likes.clip.push(videoID);
                        }
                        // useractivityDetails.likes = useractivityDetails.likes || {};
                        //useractivityDetails.likes.clips = useractivityDetails.likes.clips || [];
                      } else if (
                        clicked === "unlike" ||
                        clicked === "rmdislike" ||
                        clicked === "dislike"
                      ) {
                        // Remove id from 'likes' clips
                        if (useractivityDetails.likes && useractivityDetails.likes.clip) {
                          useractivityDetails.likes.clip =
                            useractivityDetails.likes.clip.filter(
                              (id: string) => id !== videoID
                            );
                        }
                      }
                    } else {
                    }
                  } else {
                  }
          
        } catch (error) {
          LogError("PlaylistViewer handleLikeAPI doUserAction catch error inside",error)

        }
      });
    } catch (error) {
      LogError("PlaylistViewer handleLikeAPI doUserAction catch error outside",error)
    }
  };

 
  const handleWishlistAPI = (action: string) => {
    try {
      if (action === "addwishlist") {
        try {
          APP_EVENTS_.add_to_wishlist(title, videoID, "video");
        } catch (error) {
        }
      }

      if (action === "removewishlist") {
        try {
          APP_EVENTS_.remove_from_wishlist(title, videoID, "video");
        } catch (error) {
        }
      }
    } catch (error) {
    }

    try {
      // Determine the action based on the current state of isInWatchlist
      let response;

      if (action === "addwishlist") {
        setIsWishlist(true);
        response = doUserAction(
          "addwishlist",
          UUID,
          profileid,
          videoType,
          videoID
        );
      } else {
        setIsWishlist(false);
        response = doUserAction(
          "removewishlist",
          UUID,
          profileid,
          videoType,
          videoID
        );
      }
      response.then((x) => {

        try {
          if ("data" in x) {
            if (x.data.resultcode === "101") {
  
              if (action === "addwishlist") {
                // Check if 'likes' object exists in userActivityDetails
                if (
                  useractivityDetails &&
                  useractivityDetails?.wishlist &&
                  useractivityDetails?.wishlist.clips
                ) {
                  useractivityDetails.wishlist.clips.push(currentClip);
                } else {
                  useractivityDetails.wishlist.clips = [];
                  useractivityDetails.wishlist.clips.push(currentClip);
                }
                // useractivityDetails.likes = useractivityDetails.likes || {};
                //useractivityDetails.likes.clips = useractivityDetails.likes.clips || [];
              } else {
                // Remove id from 'likes' clips
                useractivityDetails.wishlist.clips =
                  useractivityDetails.wishlist.clips.filter(
                    (clips) => clips.id !== videoID
                  );
              }
            } else {
            }
          } else {
          } 
        } catch (error) {
          LogError("PlaylistViewer handleWishlistAPI doUserAction catch error inside",error)
        }
      
      });
    } catch (error) {
      LogError("PlaylistViewer handleWishlistAPI doUserAction catch error outside",error)
    }
  };


  const handleShare = () => {
    try {
      const shareresp = createShareLink(videoID, "videos", title);

      shareresp.then((resp) => {
  
        try {
          if ("data" in resp) {
            if (resp.data.resultcode == 101) {
              const options = {
                title: APP_NAME,
                message: resp.data.url,
              };
    
              Share.open(options)
                .then((res) => {
                  try {
                  } catch (error) {
                    LogError("PlaylistViewer handleShare Share.open catch error inside",error) 
                  }
                })
                .catch((err) => {
                  err && LogData("PlaylistViewer handleShare Share.open catch error outside", err);
                });
            } else {
            }
          } else {
          }
        } catch (error) {
          LogError("PlaylistViewer handleShare createShareLink catch error inside",error)
  
        }
      }); 
    } catch (error) {
      LogError("PlaylistViewer handleShare createShareLink catch error outside",error)
    }
 
  };

  const renderCast = () => {
    const visibleCast = cast.slice(0, maxVisibleCast).join(", ");

    if (cast.length > maxVisibleCast) {
      return (
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text style={styles.castHeading}>Cast: </Text>
          <Text style={styles.castText}>{visibleCast}</Text>
          <TouchableOpacity activeOpacity={0.9} onPress={toggleModal}>
            <Text style={styles.moreButton}>...More</Text>
          </TouchableOpacity>
          <ModalComponent
            title={title}
            data={[
              { title: "Cast", content: cast },
              { title: "Genres", content: videoGenre },
              { title: "Director", content: DirectorName },
              { title: "Producers", content: producers },
            ]}
            isModalVisible={isModalVisible}
            toggleModal={toggleModal}
          />
        </View>
      );
    } else {
      return (
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text style={styles.castHeading}>Cast: </Text>
          <Text style={styles.castText}>{visibleCast}</Text>
        </View>
      );
    }
  };

  function onfullscreenclick() {
    const params = { videoUrl, title };

    handleTrailerVideoPlay(navigation, params);
  }

  const getposter = () => {
    if (videoUrl != "" && videoUrl != null) {
      return (
        <TrailerPlayer
          onfullscreenclick={onfullscreenclick}
          posterUrl={thumnail}
          showfullscreenicon={true}
          videoUrl={videoUrl}
          forcePaused={pauseInlineTrailer}
        />
      );
    } else if (thumnail != "" && thumnail != null) {
      return (
        <Image
          source={{ uri: thumnail }}
          style={{ width: itemWidth, height: itemHeight }}
        />
      );
    } else {
      return (
        <View style={{ width: itemWidth, height: itemHeight, backgroundColor: "#17171D" }} />
      );
    }
  };

  const getContent = () => {
    return (
      <ScrollView>
        {getposter()}

        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.videoGenre}>{videoGenre}</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handlePlayPress()}
              // Keep other props if any
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
                  {watchResumeFlag}
                  {/* For SeriesViewerAlt, keep the season/episode text concatenation as is */}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          <Text style={styles.description}>{description}</Text>
          {renderCast()}
          <View style={styles.directorContainer}>
            <Text style={styles.directorHeading}>Director: </Text>
            <Text style={styles.directorText}>{DirectorName}</Text>
          </View>

          <View style={styles.videoIconsContainer}>
            <View>
              <TouchableOpacity
              activeOpacity={0.9}
                onPress={() => handleLikeAPI(isLiked ? "unlike" : "like")}
              >
                {isLiked ? (
                  <Image
                    source={require("../../../app_assets/symbols/sym_86.png")}
                    style={styles.imageIconsStyle}
                  />
                ) : (
                  <Image
                    source={require("../../../app_assets/symbols/sym_85.png")}
                    style={styles.imageIconsStyle}
                  />
                )}
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity
              activeOpacity={0.9}
                onPress={() =>
                  handleLikeAPI(isDisliked ? "rmdislike" : "dislike")
                }
              >
                {isDisliked ? (
                  <Image
                    source={require("../../../app_assets/symbols/sym_84.png")}
                    style={styles.imageIconsStyle}
                  />
                ) : (
                  <Image
                    source={require("../../../app_assets/symbols/sym_83.png")}
                    style={styles.imageIconsStyle}
                  />
                )}
              </TouchableOpacity>
            </View>
            <View>
              <View>
                <TouchableOpacity
                activeOpacity={0.9}
                  onPress={() =>
                    handleWishlistAPI(
                      isWishlist ? "removewishlist" : "addwishlist"
                    )
                  }
                >
                  {isWishlist ? (
                    <Image
                      source={require("../../../app_assets/symbols/sym_82.png")}
                      style={[styles.imageIconsStyleShare, { tintColor: "white" }]}
                    />
                  ) : (
                    <Image
                      source={require("../../../app_assets/symbols/sym_81.png")}
                      style={styles.imageIconsStyleShare}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* <View>
              <TouchableOpacity activeOpacity={0.9} onPress={handleShare}>
                <Image
                  source={require("../../../app_assets/symbols/sym_80.png")}
                  style={styles.imageIconsStyleShare}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View> */}
          </View>
          <Text style={{ color: "white", fontSize: 15, fontWeight: "bold", marginBottom: 5 }}>
            {similarVideoTitle}
          </Text>

          <FlatList
            data={similarShowsData}
            renderItem={({ item, index }) => (
              <ListRender item={item} index={index} />
            )}
          />
        </View>

        {/* <ContentScroller prop = {route.clips}   imgratio = {{ imgper : route.imgper,imghratio : route.imghratio , imgwratio:route.imgwratio }}></ContentScroller>
         */}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {status === "loading" && <LoadingSpinner />}
      {status === "failed" && <EmptyState />}
      {status === "successful" && getContent()}


      <Modal
        visible={showVideoLoading}
        animationType="slide"
        transparent={true}>
        <View style={styles.modalContainer}>
          <View >
            <Loader />
          </View>
        </View>
      </Modal>


    </View>
    
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#000000",
  },
  videoContainer: {
    backgroundColor: "black",
  },
  video: {
    flex: 1,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 25,
    color: "white",
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 8,
  },
  videoGenre: {
    fontSize: 11,
    color: "white",
    marginBottom: 8,
  },
  videoIconsContainer: {
    marginVertical: 12,
    marginBottom: 8,
    marginStart: -7,
    flexDirection: "row",
  },
  imageIconsStyle: {
    marginHorizontal: 10,
    width: 34,
    height: 34,
    flexDirection: "row",
    tintColor: "#ffffff",
            marginRight: 10

  },
    imageIconsStyleShare: {
    marginHorizontal: 10,
    width: 32,
    height: 32,
    flexDirection: "row",
    tintColor: "#ffffff",
    marginRight: 10

  },
  imageIconsPlus: {
    width: 55,
    height: 55,
    marginTop: -2,
    marginHorizontal: 7,
    flexDirection: "row",
  },
  seasonTitle: {
    fontSize: 13,
    fontWeight: "400",
    marginTop: 10,
    color: "#fff",
  },
  description: {
    // fontSize: 12,
    // fontWeight:'100',
    // color: 'white',
    // fontFamily:'Times New Roman',
    // fontSize: 13,
    letterSpacing: 0.5,
    color: "#fff",
    marginVertical: 11,
    fontWeight: "300",
    fontFamily: "Rokkitt-Medium",

  },
  button: {
    height: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8
  },
  playIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 18,
    color: "white",
  },
  directorContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  directorHeading: {
    fontSize: 13,
    color: "white",
    fontWeight: "300",
  },
  directorText: {
    fontSize: 12,
    color: "white",
    fontWeight: "300",
  },
  castHeading: {
    fontSize: 13,
    color: "white",
    fontWeight: "300",
    marginBottom: 6,
  },
  castText: {
    fontSize: 12,
    color: "white",
    fontWeight: "300",
    letterSpacing: 1,
  },
  moreButton: {
    fontSize: 12.5,
    fontWeight: "bold",
    color: "white",
    marginLeft: 5,
  },
  dropDownStyle: {
    backgroundColor: "#3d3c3b",
    padding: 5,
    flexDirection: "row",
    width: 120,
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.73)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlaylistViewer;