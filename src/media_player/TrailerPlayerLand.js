import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  AppState,
  Button,
  Dimensions,
  StatusBar,
  Modal,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { useNavigation } from '@react-navigation/native';
import Video, { SelectedTrackType, TextTrackType } from 'react-native-video';
import Slider from '@react-native-community/slider';
import Orientation from 'react-native-orientation-locker';
import ModalDropdown from 'react-native-modal-dropdown';

import { Title } from 'react-native-paper';
import { LogData, LogError, configData, currentPlayingResumeVal, getCurrentPlayingVideo, setCurrentPlayingResumeVal } from '../app_config/AppConstants';
import { fireVideoTracking } from '../state_mgmt/AppCommonSlice';
import Loader from '../ui_components/widgets/LoadingSpinner';

// import AsyncStorage from '@react-native-async-storage/async-storage';


// analytics logic here
var progressRef = null
let maxWatchedTime = 0;
let elapsedTime = 0;
var onVideoEnd = false
let VideoEventLink = ""
let totalWatchedTime = 0;
let sessionID = ""
//let lastResumeTime = ""

const TrailerPlayerLandscape = ({ showfullscreenicon, mediaUrl, videoTitle, downloadID, resume, subtitlesParam, player }) => {
  const { width: windowWidth, height: windowheight } = useWindowDimensions();
  const [clicked, setClicked] = useState(player === 'videoplayer');
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(null);
  const [fullScreen, setFullScreen] = useState(player === 'videoplayer');
  const [showSettings, setShowSettings] = useState(false);
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [selectedAudioOption, setSelectedAudioOption] = useState(null);
  const [resizeMode, setReSizeMode] = useState('contain');
  const [selectedVideoTrack, setSelectedVideoTrack] = useState(null);
  const [selectedSubtitle, setSelectedSubtitle] = useState('');
  const [controlsVisible, setControlsVisible] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const ref = useRef();
  const durationInSeconds = 120;
  const subtitles = ['English', 'Hindi', 'Telugu', 'Tamil'];
  const [videoUri, setVideoUri] = useState(mediaUrl)
  //useState("https://aptifun.com/media2/Umk0NjNkVloxV1VFRTMrRlFwaW9UbkNtS21BdjFlNVFjay94UmVHalRpUVlkVGIzaGwxK05OOElkYllmRys4dg/789123/35945669/hls/playlist.m3u8")
  //useState('https://mytoonz.club/cms/content/1/11310058/hls_testing/playlist.m3u8');
  const [videoComponentKey, setVideoComponentKey] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [lastSelectedOption, setLastSelectedOption] = useState(null);
  const [currentPlaybackPosition, setCurrentPlaybackPosition] = useState(0);

  const [isBuffering, setisBuffering] = useState(true);

  const [videoLoaded, setvideoLoaded] = useState(true);

  const showDataModal = (option) => {
    setSelectedOption(option);
    setModalVisible(true);
  };

  const hideDataModal = () => {
    setSelectedOption(null);
    setModalVisible(false);
  };



  useEffect(() => {
    LogData("subbbb ", subtitlesParam)
  }, [subtitlesParam])

  useEffect(() => {
    fireVideoEvents(paused ? "pause" : "play")
  }, [paused])

  useEffect(() => {
    VideoEventLink = configData.data.config.videoanalytics + "?" //"http://192.168.1.16/tt.php?" //
    const d = new Date();
    sessionID = d.valueOf();

    // Fullscreen main player: stay landscape; do not toggle orientation (parent owns lock)
    if (player === 'videoplayer') {
      SystemNavigationBar.navigationHide();
      StatusBar.setHidden(true);
      setFullScreen(true);
    } else {
      // Trailer landscape screen only — do not flip portrait/landscape here on mount
      SystemNavigationBar.navigationHide();
      StatusBar.setHidden(true);
      setFullScreen(true);
    }

    return () => {
      clearInterval(totalWatchedTime);
      progressRef = null
      maxWatchedTime = 0;
      elapsedTime = 0;
    };
  }, []);


  const changeVideo = () => {
    // Change the video URL when the button is clicked
    setVideoComponentKey(1);
    setVideoUri('https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8');
  };

  const navigation = useNavigation();

  const RenderSamePageInNewWindow = () => {
    navigation.push('Player'); // Open a new instance of the Player component
  };



  useEffect(() => {
    // sai commented here 
    // Initialize selectedVideoTrack with the first available video track
    /*  if (videoTracks.length > 0) {
        setSelectedVideoTrack({
          type: 'resolution',
          value: videoTracks[0].height,
        });
      }*/
  }, [videoTracks]);

  useEffect(() => {
    // Prefer index on iOS — many HLS audio tracks have empty titles and crash native title matching
    if (audioTracks.length > 0) {
      const track = audioTracks[0];
      setSelectedAudioOption(
        track.title
          ? {type: 'title', value: track.title}
          : {type: 'index', value: '0'},
      );
    }
  }, [audioTracks]);


  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        // You can perform actions here, such as changing the play/pause state
        // For example, let's assume you have a function to toggle play/pause
        setPaused(!paused);
      }
      setAppState(nextAppState);
    };

    // Subscribe to app state changes
    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    // Clean up the subscription when component unmounts
    return () => {
      appStateSubscription.remove();
    };
  }, [appState, paused]);



  const toggleControls = () => {
    setControlsVisible((prev) => !prev);
  };


  const format = (seconds) => {
    if (!Number.isFinite(seconds)) {
      return 'Invalid duration';
    }

    let mins = parseInt(seconds / 60).toString().padStart(2, '0');
    let secs = (Math.trunc(seconds) % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };


  const onEnd = () => {
    onVideoEnd = true;
    setCurrentPlaybackPosition(0)
    setPaused(true)
    progressRef = null
    fireVideoEvents("ended")
  }
  const onError = (error) => {

  }


  const onBuffer = (buffer) => {
    if (buffer && typeof buffer.isBuffering === 'boolean') {
      setisBuffering(buffer.isBuffering);
    }
  }


  const onLoad = (data) => {

    try {
      // iOS often never sends onBuffer(false); clear overlay once media metadata is ready
      setisBuffering(false);

      const tracks = data.audioTracks || [];
      setAudioTracks(tracks);
      const videoTracks = data.videoTracks || [];
      setVideoTracks(videoTracks);

      if (tracks.length > 0) {
        const track = tracks[0];
        setSelectedAudioOption(
          track.title
            ? {type: 'title', value: track.title}
            : {type: 'index', value: '0'},
        );
      }

      if (videoTracks.length > 0) {
        /* setSelectedVideoTrack({
            type: 'resolution',
            value: videoTracks[0].height,
          });*/
      }
      // setvideoLoaded(true)
      if (resume > 0) {
        // Seek to the stored playback position
        ref.current.seek(resume);
      }
    } catch (error) {
      setisBuffering(false);
      LogError("videoplayer : ", error)
    }

  };



  const onProgress = (progress) => {
    // Safety net: if frames are advancing, hide stuck buffering UI (common on iOS HLS)
    if (progress?.currentTime > 0) {
      setisBuffering(false);
    }

    setCurrentPlaybackPosition(progress.currentTime);
    progressRef = progress

    setProgress(progress);
  };

  const onSelectAudio = (index, value) => {

    if (audioTracks.length > index) {
      const selectedTrack = audioTracks[index];
      const selectedAudioTrack = selectedTrack.title
        ? {type: 'title', value: selectedTrack.title}
        : {type: 'index', value: String(index)};
      setSelectedAudioOption(selectedAudioTrack);
      setModalVisible(true);
      setLastSelectedOption(value); // Set lastSelectedOption here
    };
  }

  const onSelectVideoQuality = (index) => {
    if (videoTracks.length > index) {
      const selectedTrack = videoTracks[index];
      const selectedVideoTrack = {
        type: 'resolution',
        value: selectedTrack.height,
      };
      setSelectedVideoTrack(selectedVideoTrack);
      setModalVisible(true);
      setReSizeMode("Contain");
      setLastSelectedOption(index.toString()); // Convert index to string
    }
  };

  const onSelectSubtitle = (index, value) => {
    setSelectedSubtitle(value);
    setModalVisible(true);
  };

  const closeSettings = () => {
    setShowSettings(false);
  };





  function startAnalyticsTimer() {
    totalWatchedTime = setInterval(function () {
      //elapsedTime++;
      timeupdateEvent();
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(totalWatchedTime);
  }


  function fireVideoEvents(action) {
    try {


      if (action == "ended") {

        url = VideoEventLink + "&videoevent=ended&ended=1";
        vidoeeventfire(url);
        sendAnalytics("video_event", { "action": "ended" });

      }

      else if (action == "loadstart") {

        url = VideoEventLink + "&videoevent=loadstart&loadstart=1";
        vidoeeventfire(url);
        sendAnalytics("video_event", { "action": "loadstart" });

      } else if (action == "play") {
        url = VideoEventLink + "&videoevent=play&play=1";
        vidoeeventfire(url);
        startAnalyticsTimer()
        sendAnalytics("video_event", { "action": "videoplay" });
      }
      else if (action == "pause") {
        url = VideoEventLink + "&videoevent=pause&pause=1";
        vidoeeventfire(url);
        pauseTimer();
        sendAnalytics("video_event", { "action": "videopause" });
      }

    } catch (error) {
    }
  }


  function timeupdateEvent() {
    if (progressRef == null) {
      return
    }
    elapsedTime++;

    let currentTime = progressRef.currentTime;
    if (Math.floor(currentTime) % 6 == 0) {
      if (currentTime > maxWatchedTime) {
        maxWatchedTime = Math.floor(currentTime);
      }
      const VideoCurrentPlayingTime = Math.floor(currentTime);
      setCurrentPlayingResumeVal(VideoCurrentPlayingTime + "");
      url = VideoEventLink + "&timeupdate=" + VideoCurrentPlayingTime + "&videoevent=timeupdate&maxWatchedTime=" + maxWatchedTime + "&totalWatchedTime=" + elapsedTime;
      vidoeeventfire(url);
    }
    var VideoLength = progressRef.seekableDuration;
    if (currentTime >= Math.floor((0.25 * VideoLength)) && currentTime <= Math.ceil((0.25 * VideoLength))) {
      sendAnalytics("video_event", { "action": "complete 25% of video" });
    }
    if (currentTime >= Math.floor((0.5 * VideoLength)) && currentTime <= Math.ceil((0.5 * VideoLength))) {
      sendAnalytics("video_event", { "action": "complete 50% of video" });
    }
    if (currentTime >= Math.floor((0.75 * VideoLength)) && currentTime <= Math.ceil((0.75 * VideoLength))) {
      sendAnalytics("video_event", { "action": "complete 75% of video" });
    }
    if (currentTime >= Math.ceil((VideoLength - 1))) {
      sendAnalytics("video_event", { "action": "complete 100% of video" });
      if (onVideoEnd) {
        progressRef = null
      }
    }
  }

  function sendAnalytics(eventname, param) {

  }

  function vidoeeventfire(Url) {
    try {
      if (progressRef == null) {
        return;
      }
      var VideoLength = progressRef.seekableDuration;
      Url = Url + "&videoLength=" + VideoLength + "&did=" + downloadID + "&session=" + sessionID;


      fireVideoTracking(Url)
      // var request = new XMLHttpRequest();
      // request.open("GET", Url);
      // request.send();
    } catch (error) {
    }

  }

    const handlePress = () => {
  if (!clicked) {
    setClicked(true);
    setControlsVisible(true);
  } else {
    setControlsVisible(prev => !prev);
  }
};

  const handleBackPress = () => {
    try {
      // Lock portrait before pop; VideoPlayerFullscreen also retries on beforeRemove/blur.
      Orientation.lockToPortrait();
      StatusBar.setHidden(false);
      SystemNavigationBar.navigationShow();
    } catch (e) {}
    if (navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('HomeScreen');
    }
  };


  ///


  return (

    <View style={{ flex: 1, backgroundColor: '#111111' }}>

      <View
        style={{ width: '100%', height: fullScreen ? '100%' : 200, flex: fullScreen ? 1 : undefined }}
        >


        {videoLoaded &&
          <Video
            onLoadStart={(obj) => {
              setisBuffering(true);
              fireVideoEvents("loadstart")
            }}
            key={videoComponentKey}
            paused={paused}
            source={{
              uri: videoUri,
            }}
        

            ref={(videoRef) => (ref.current = videoRef)}
            onProgress={onProgress}
            selectedAudioTrack={selectedAudioOption}
            selectedVideoTrack={selectedVideoTrack}
            onLoad={onLoad}
            onReadyForDisplay={() => setisBuffering(false)}

            onEnd={onEnd}
            onVideoTracks={(dataa) => {
            }}
            onError={(error) => {
              setisBuffering(false);
              onError(error);
            }}
            onBuffer={(buffer) => onBuffer(buffer)}
            style={{ width: '100%', height: fullScreen ? windowheight : 200 }}
            resizeMode={resizeMode}
            useTextureView={true}
          />
        }
        {/* Only capture taps to toggle controls when chrome is hidden — avoids blocking back on iOS */}
        {!(clicked && progress && controlsVisible) && (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handlePress}
          />
        )}
        <View
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            //  backgroundColor: 'rgba(0,0,0,.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          pointerEvents="box-none"
          >

          {isBuffering && <Loader />}

        </View>

        {clicked && progress && controlsVisible && (
          <>

            <View
              pointerEvents="box-none"
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                backgroundColor: 'rgba(0,0,0,.5)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 20,
              }}>

              <Pressable style={StyleSheet.absoluteFill} onPress={toggleControls} />

              {/*  <Progress.Circle size={50} indeterminate={true} borderWidth={4} style={{position:"absolute", marginLeft: 40,} } /> */}

              <View style={{ flexDirection: 'row', zIndex: 21 }}>
                <TouchableOpacity
                  onPress={() => {
                    ref.current.seek(parseInt(progress.currentTime) - 10);
                  }}>
                  <Image
                    source={require('../../app_assets/res_02.png')}
                    style={{ width: 30, height: 30, tintColor: 'white' }} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {

                    if (onVideoEnd) {
                      progressRef = null
                      onVideoEnd = false;

                      setCurrentPlaybackPosition(0)

                    }
                    setPaused(!paused);



                  }}>
                  <Image
                    source={paused
                      ? require('../../app_assets/res_15.png')
                      : require('../../app_assets/res_13.png')}
                    style={{
                      width: 30,
                      height: 30,
                      tintColor: 'white',
                      marginLeft: 50,
                    }} />



                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    ref.current.seek(parseInt(progress.currentTime) + 10);
                  }}>
                  <Image
                    source={require('../../app_assets/res_05.png')}
                    style={{
                      width: 30,
                      height: 30,
                      tintColor: 'white',
                      marginLeft: 50,
                    }} />
                </TouchableOpacity>

              </View>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  position: 'absolute',
                  bottom: 0,
                  paddingLeft: 20,
                  paddingRight: 20,
                  alignItems: 'center',
                  zIndex: 21,
                }}>
                <Text style={{ color: 'white' }}>
                  {progress && format(progress.currentTime)}
                </Text>
                {progress && (
                  <Slider
                    style={{
                      flex: 1,
                      height: Platform.OS === 'ios' ? 40 : 40,
                      marginHorizontal: 8,
                    }}
                    minimumValue={0}
                    maximumValue={progress.seekableDuration || 0}
                    minimumTrackTintColor="red"
                    maximumTrackTintColor="white"
                    // iOS stretches the default thumb; use a round image. tint breaks thumbImage on iOS.
                    {...(Platform.OS === 'ios'
                      ? { thumbImage: require('../../app_assets/slider_thumb.png') }
                      : { thumbTintColor: 'red' })}
                    onValueChange={(x) => {
                      ref.current.seek(x);
                    }}
                    value={progress.currentTime || 0} />
                )}
                <Text style={{ color: 'white' }}>
                  {progress && format(progress.seekableDuration)}
                </Text>

              </View>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  position: 'absolute',
                  top: 10,
                  paddingLeft: 20,
                  paddingRight: 20,
                  alignItems: 'center',
                  zIndex: 30,
                }}>
                <TouchableOpacity
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  onPress={handleBackPress}
                >
                  <Image source={require('../../app_assets/res_11.png')}
                    style={{ width: 24, height: 24, tintColor: 'white' }} />

                </TouchableOpacity>
              </View>
              <View
                pointerEvents="none"
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  position: 'absolute',
                  top: 10,
                  paddingLeft: 20,
                  paddingRight: 20,
                  alignItems: 'center'
                }}
              ><Text style={{ color: '#fff', fontSize: 15, }}>{videoTitle}</Text></View>
            </View>
            {player !== "trailer" && (
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  position: 'absolute',
                  top: 10,
                  paddingLeft: 20,
                  paddingRight: 20,
                  alignItems: 'center',
                  zIndex: 30,
                }}>
                <TouchableOpacity onPress={() =>
                  setShowSettings(!showSettings)}>
                  <Image
                    source={require('../../app_assets/res_16.png')}
                    style={{ width: 24, height: 24, tintColor: 'white' }} />
                </TouchableOpacity>

              </View>
            )}

          </>
        )}

        {/* Always-available back for videoplayer if controls chrome isn't up yet */}
        {player === 'videoplayer' && !(clicked && progress && controlsVisible) && (
          <View
            style={{
              position: 'absolute',
              top: 10,
              left: 20,
              zIndex: 40,
            }}>
            <TouchableOpacity
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              onPress={handleBackPress}
            >
              <Image source={require('../../app_assets/res_11.png')}
                style={{ width: 24, height: 24, tintColor: 'white' }} />
            </TouchableOpacity>
          </View>
        )}

        {modalVisible &&

          <TouchableOpacity
            onPress={() => {
              setModalVisible(false)
            }}
            style={{
              justifyContent: 'center', alignItems: 'center', flex: 1, width: '100%',
              height: '100%',
              position: 'absolute',
            }}
            animationType="none"
            transparent={true}

            onRequestClose={hideDataModal}

          >



            <View style={{
              width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,.5)'
            }}>
              <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 5, height: "auto", width: windowWidth * 0.4 }}>
                {selectedOption === 'Audio' && (
                  <>
                    <Title style={style.dropdownTitle}>Audio</Title>
                    <View>
                      {audioTracks.map((track) => (
                        <View key={track.title} style={{ flexDirection: 'row', alignItems: 'center' }}>


                          <RadioButton
                            selected={selectedAudioOption && selectedAudioOption.value === track.title}
                            onPress={() => {
                              onSelectAudio(audioTracks.indexOf(track), track.title);
                              closeSettings();
                            }}
                          />

                          <TouchableOpacity
                            onPress={() => {
                              onSelectAudio(
                                audioTracks.indexOf(track),
                                track.title
                              );
                              closeSettings();
                            }}
                          >

                            <Text style={{ color: '#000', fontSize: 16, marginTop: 10, marginBottom: 10, marginLeft: 10, }}>
                              {`${track.title}`}
                            </Text>
                          </TouchableOpacity>
                        </View>


                      ))}
                    </View>
                  </>
                )}

                {selectedOption === 'Quality' && (
                  <><Title style={style.dropdownTitle}>Quality</Title>
                    <View style={{ marginTop: 10, marginBottom: 10, }}>
                      {videoTracks.map((track, index) => (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <RadioButton
                            selected={selectedVideoTrack && selectedVideoTrack.value === track.height}
                            onPress={() => {
                              onSelectVideoQuality(index);
                              closeSettings();
                              toggleControls();
                            }}
                          />
                          <TouchableOpacity
                            key={index}
                            onPress={() => {
                              onSelectVideoQuality(index);
                              closeSettings();
                              toggleControls();
                            }}
                          >
                            <Text style={{ color: '#000', fontSize: 16 }}>
                              {`${track.width}x${track.height}`}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View></>

                )}

                {selectedOption === 'Subtitles' && (
                  <>
                    <Title style={style.dropdownTitle}>Subtitles</Title>
                    <View style={{ marginTop: 10, marginBottom: 10, }}>
                      {subtitles.map((subtitle, index) => (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <RadioButton
                            selected={lastSelectedOption == index}
                            onPress={() => {
                              //  onSelectVideoQuality(index);
                              //  closeSettings();
                              //  toggleControls();
                            }}
                          />
                          <TouchableOpacity
                            key={index}
                            onPress={() => {
                              // onSelectSubtitle(index);
                              // closeSettings();
                              // toggleControls();
                            }}
                          >
                            <Text style={{ color: '#000', fontSize: 16 }}>
                              {`${subtitle}`}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View></>
                )}

                <TouchableOpacity
                  style={style.closeButton}
                  onPress={() => {
                    hideDataModal()
                    closeSettings();
                  }}>
                  <Text style={{ textAlign: 'center', color: '#000' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        }

        {showSettings && controlsVisible && (
          <TouchableWithoutFeedback>
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'flex-end',
                position: 'absolute',
                marginTop: 30,
                width: '100%',
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  showDataModal('Audio');
                  setClicked(true);
                  toggleControls();
                }}
                style={{
                  width: 100,
                  marginTop: 10,
                  marginRight: 30,
                  padding: 10,
                  backgroundColor: 'rgba(0,0,0,.5)',
                }}
              >
                <Text style={{ color: '#fff' }}>Audio</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  showDataModal('Quality');
                  setClicked(true);
                  toggleControls();
                }}

                style={{
                  width: 100,
                  marginTop: 0,
                  marginRight: 30,
                  padding: 10,
                  backgroundColor: 'rgba(0,0,0,.5)',
                }}
              >
                <Text style={{ color: '#fff' }}>Quality</Text>
              </TouchableOpacity>
              {/* disabled subtitles
              <TouchableOpacity
                onPress={() => {
                  showDataModal('Subtitles');
                  setClicked(true);
                  toggleControls();
                }}
                style={{
                  width: 100,
                  marginTop: 0,
                  marginRight: 30,
                  padding: 10,
                  backgroundColor: 'rgba(0,0,0,.5)',
                }}
              >
                <Text style={{ color: '#fff' }}>Subtitles</Text>
              </TouchableOpacity>
              */ }
            </View>
          </TouchableWithoutFeedback>
        )}

      </View>

    </View>
  );
};


const RadioButton = ({ selected, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <View
      style={{
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#fd7f0c',
        backgroundColor: selected ? '#fd7f0c' : 'transparent',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
      }}
    />
  </TouchableOpacity>
);


const style = StyleSheet.create({
  dropdownTitle: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 5,
    borderRadius: 3,
    backgroundColor: '#fd7f0c',
    marginTop: 10,
    marginBottom: 10,
    width: '30%',
    alignSelf: 'center',

  },
});

export default TrailerPlayerLandscape