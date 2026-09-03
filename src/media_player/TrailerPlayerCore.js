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
  StyleSheet,
  StatusBar,
  Pressable
} from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Orientation from 'react-native-orientation-locker';
import ModalDropdown from 'react-native-modal-dropdown';

import { handleNavigation, handleTrailerVideoPlay } from '../app_config/AppConstants';
import { colors } from '../theming/colors';

const TrailerPlayer = ({ showfullscreenicon, videoUrl, posterUrl, onfullscreenclick }) => {


  const windowWidth = Dimensions.get('window').width;
  const windowheight = Dimensions.get('window').height;

  const [clicked, setClicked] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [selectedAudioOption, setSelectedAudioOption] = useState(null);
  const [resizeMode, setReSizeMode] = useState('stretch');
  const [selectedVideoTrack, setSelectedVideoTrack] = useState(null);
  // const [forceUpdate, setForceUpdate] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const ref = useRef();
  const durationInSeconds = 120;
  const subtitles = ['English', 'Hindi', 'Telugu', 'Tamil'];
  const [videoUri, setVideoUri] = useState('');
  const [videoComponentKey, setVideoComponentKey] = useState(0);
  const [isMuted, setIsMuted] = useState(true);



  const changeVideo = () => {
    // Change the video URL when the button is clicked
    setVideoComponentKey(1);
    setVideoUri('<new video url>');
  };

  const navigation = useNavigation();

  const RenderSamePageInNewWindow = () => {
    navigation.push('Player'); // Open a new instance of the Player component
  };

  useEffect(() => {

    return () => {
      // setPaused(true)
    }

  }, [])

  useEffect(() => {
    // Initialize selectedVideoTrack with the first available video track
    if (audioTracks.length > 0) {
      setSelectedAudioOption({
        type: 'title',
        value: audioTracks[0].title,
      });
    }
  }, [audioTracks]);

  useEffect(() => {
    // Initialize selectedVideoTrack with the first available video track
    if (videoTracks.length > 0) {
      setSelectedVideoTrack({
        type: 'resolution',
        value: videoTracks[0].height,
      });
    }
  }, [videoTracks]);


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


  const onLoad = (data) => {
    const tracks = data.audioTracks || [];
    setAudioTracks(tracks);

    const videoTracks = data.videoTracks || [];
    setVideoTracks(videoTracks);

    if (videoTracks.length > 0) {
      setSelectedVideoTrack({
        type: 'resolution',
        value: videoTracks[0].height,
      });
    }
  };


  const onSelectAudio = (index, value) => {
    setSelectedAudioOption(value);
    // setForceUpdate(!forceUpdate);
  };


  const onSelectVideoQuality = (index) => {
    if (videoTracks.length > index) {
      const selectedTrack = videoTracks[index];
      const selectedVideoTrack = {
        type: 'resolution',
        value: selectedTrack.height,
      };
      setSelectedVideoTrack(selectedVideoTrack);
      setReSizeMode("Contain");
    }
  };


  const closeSettings = () => {
    setShowSettings(false);
  };

    const handlePress = () => {
  if (!clicked) {
    setClicked(true);
    setControlsVisible(true);
  } else {
    setControlsVisible(prev => !prev);
  }
};


  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <View
        activeOpacity={1}
        style={{ flex: 1 }}
        onPress={() => {
          setClicked(true);
          toggleControls();
        }}
      >
        <Video
          onEnd={() => {
            setPaused(true)
          }}
          posterResizeMode='cover'
          poster={posterUrl}
          key={videoComponentKey}
          paused={paused}
          source={{
            uri: videoUrl,
            // uri:'https://live-par-1-abr-cdn.livepush.io/live/bigbuckbunnyclip/AppConstants.m3u8',
            // uri:
            // 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
            //  uri:
            // 'https://mytoonz.club/cms/content/1/11310058/hls_testing/playlist.m3u8',
          }}
          ref={(videoRef) => (ref.current = videoRef)}
          onProgress={(x) => {
            setProgress(x);
          }}
          selectedAudioTrack={selectedAudioOption}

          selectedVideoTrack={
            selectedVideoTrack
          }
          volume={isMuted ? 0 : 1}
          onLoad={onLoad}
          style={{ width: '100%', height: 250 }}
          // style={{width: 'auto',  height: 'auto'}}
          resizeMode="contain"
          // resizeMode={resizeMode}
          useTextureView={true}

        />
        {/* <Pressable
  style={StyleSheet.absoluteFill}
  onPress={() => {
    setControlsVisible((prev) => !prev);
    setClicked(true);
  }}
/> */}
        <Pressable
  style={StyleSheet.absoluteFill}
  onPress={handlePress}
/>
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 5,
            left: 5,
            zIndex: 2,
            width: 30, height: 30, backgroundColor: '#17171D', borderRadius: 15, justifyContent: 'center', alignItems: 'center'
          }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image source={require('../../app_assets/symbols/sym_06.png')} style={{ width: 16, height: 16 }} />
        </TouchableOpacity>

        {clicked && progress && controlsVisible && (
          <>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                toggleControls();
              }}

              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                backgroundColor: 'rgba(0,0,0,.5)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>

              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {/* <TouchableOpacity
                onPress={() => {
                  ref.current.seek(parseInt(progress.currentTime) - 10);
                }}>
                <Image
                  source={require('../../app_assets/res_02.png')}
                  style={{ width: 30, height: 30, tintColor: 'white' }} />
              </TouchableOpacity> */}
                <TouchableOpacity
                  onPress={() => {
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

                    }} />
                </TouchableOpacity>

                {/*  <TouchableOpacity
              
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
                </TouchableOpacity> */}

              </View>


              <View
                style={{
                  flexDirection: 'row', // Align items in a row
                  justifyContent: 'space-between', // Distribute items evenly
                  position: 'absolute', // Position view absolutely
                  bottom: 50, // Position view at the bottom
                  width: '100%', // Full width
                  paddingHorizontal: 5, // Horizontal padding
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setIsMuted(!isMuted); // Toggle mute state
                  }}
                  style={{ left: 10, justifyContent: 'center', alignItems: 'center' }}
                >
                  <Image
                    source={isMuted
                      ? require('../../app_assets/symbols/sym_55.png') // Add a mute icon
                      : require('../../app_assets/symbols/sym_74.png')} // Add an unmute icon
                    style={{
                      width: 15,
                      height: 15,
                      tintColor: 'white',
                    }} />
                </TouchableOpacity>
                {showfullscreenicon && <TouchableOpacity onPress={() => {onfullscreenclick() }} style={{ width: 30, height: 30, backgroundColor: '#17171D', borderRadius: 15, justifyContent: 'center', alignItems: 'center' }}>
                  <Image source={require('../../app_assets/symbols/sym_33.png')}
                    style={{ width: 16, height: 16, tintColor: 'white' }} />
                </TouchableOpacity>}
              </View>



              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  position: 'absolute',
                  bottom: 0,
                  // paddingLeft: 20,
                  // paddingRight: 20,
                  alignItems: 'center',
                  justifyContent:'flex-end',
                  marginleft:10
                }}>
                {/* <Text style={{ color: 'white' }}>
                  {progress && format(progress.currentTime)}
                </Text> */}
                {progress && (
                  <Slider
                    tintColor="#111111"
                    style={{ width: '90%', height: 40,right:10}}
                    minimumValue={0}
                    maximumValue={progress.seekableDuration}
                    minimumTrackTintColor={colors.action_secondary}
                    maximumTrackTintColor="white"
                    thumbTintColor={colors.action_primary}
                    onValueChange={(x) => {
                      ref.current.seek(x);
                    }}
                    

                    value={progress.currentTime || 0} />
                )}
                <Text style={{ color: 'white',right:10,}}>
                  {progress && format(progress.seekableDuration-progress.currentTime)}
                </Text>

              </View>
            </TouchableOpacity>


          </>
        )}
        {showSettings && controlsVisible && (
          <TouchableWithoutFeedback>
            <View style={{
              flexDirection: 'column',
              alignItems: 'flex-end',
              position: 'absolute',
              marginTop: 30,
              width: '100%',

            }}>
              <ModalDropdown
                options={audioTracks.map((track) => track.title)}
                onSelect={(index, value) => {
                  onSelectAudio(index, value);
                  closeSettings();
                  toggleControls();
                }}
                style={{
                  width: 100,
                  marginTop: 0,
                  marginRight: 30,
                  padding: 10,
                  backgroundColor: 'rgba(0,0,0,.5)'
                }}

                showsVerticalScrollIndicator={true}
                dropdownPosition={-3}
                adjustFrame={(style) => {
                  style.top = style.top + 10; // Adjust top position
                  style.right = 30;

                  // Set the dropdown height based on the number of items
                  const dropdownHeight = Math.min(
                    300, // Set a maximum height if needed
                    audioTracks.length * 40 // Adjust the height per item as needed
                  );
                  style.height = dropdownHeight;

                  return style;
                }}

                dropdownTouchableStyle={{ flex: 1 }}
                dropdownTextHighlightStyle={{ backgroundColor: 'gray' }}
                renderButtonText={(rowData) => `Audio: ${rowData}`}
                renderRow={(rowData) => (
                  <View style={{ padding: 10, backgroundColor: 'white' }}>
                    <Text style={{ color: '#000', fontSize: 16 }}>{rowData}</Text>
                  </View>
                )}

              >
                <Text style={{ color: '#fff' }}>Audio</Text>
              </ModalDropdown>
              <ModalDropdown
                options={videoTracks.map((track) => `${track.width}x${track.height}`)}
                onSelect={(index, value) => {
                  onSelectVideoQuality(index);
                  closeSettings();
                  toggleControls();
                }}
                style={{
                  width: 100,
                  marginTop: 0,
                  marginRight: 30,
                  padding: 10,
                  backgroundColor: 'rgba(0,0,0,.5)'
                }}

                showsVerticalScrollIndicator={true}
                dropdownPosition={-3}
                adjustFrame={(style) => {
                  // Adjust top position
                  style.top = style.top + 10;
                  style.right = 30;

                  // Set the dropdown height based on the number of items
                  const dropdownHeight = Math.min(
                    300, // Set a maximum height if needed
                    videoTracks.length * 40 // Adjust the height per item as needed
                  );
                  style.height = dropdownHeight;

                  return style;
                }}
                dropdownTouchableStyle={{ flex: 1 }}
                dropdownTextHighlightStyle={{ backgroundColor: 'gray' }}
                renderButtonText={(rowData) => `Quality: ${rowData}`}
                renderRow={(rowData) => (

                  <View style={{ padding: 10 }}>
                    <Text style={{ color: 'black', fontSize: 16 }}>{rowData}</Text>
                  </View>

                )}
              >
                <Text style={{ color: '#fff' }}>Quality</Text>

              </ModalDropdown>
              <ModalDropdown
                options={subtitles}
                onSelect={(index, value) => {
                }}
                style={{
                  width: 100,
                  marginTop: 0,
                  marginRight: 30,
                  padding: 10,
                  backgroundColor: 'rgba(0,0,0,.5)'
                }}

                showsVerticalScrollIndicator={true}
                dropdownPosition={-3}
                adjustFrame={(style) => {
                  style.top = style.top + 20; // Adjust top position
                  return style;
                }}
                dropdownTouchableStyle={{ flex: 1 }}
                dropdownTextHighlightStyle={{ backgroundColor: 'gray' }}
                renderButtonText={(rowData) => `Subtitiles: ${rowData}`}
                renderRow={(rowData) => (

                  <View style={{ padding: 10 }}>
                    <Text style={{ color: 'black', fontSize: 16 }}>{rowData}</Text>
                  </View>

                )}
              >
                <Text style={{ color: '#fff' }}>Subtitiles</Text>
              </ModalDropdown>


            </View>
          </TouchableWithoutFeedback>

        )}
      </View>


    </View>
  );
};



export default TrailerPlayer