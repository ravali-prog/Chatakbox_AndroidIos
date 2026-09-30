import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  AppState,
  Button,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Orientation from 'react-native-orientation-locker';
import ModalDropdown from 'react-native-modal-dropdown';

import { withAnchorPoint } from 'react-native-anchor-point';

const PlayerLandscape = () => {

    const windowWidth = Dimensions.get('window').width;
    const windowheight = Dimensions.get('window').height;

  const [clicked, setClicked] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [selectedAudioOption, setSelectedAudioOption] = useState('0');
  const [resizeMode, setReSizeMode] = useState('contain');
  const [selectedVideoTrack, setSelectedVideoTrack] = useState(null);
  // const [forceUpdate, setForceUpdate] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const ref = useRef();
  const durationInSeconds = 120;
  const subtitles = ['English', 'Hindi', 'Telugu', 'Tamil'];
  const [videoUri, setVideoUri] = useState(
    // 'https://mytoonz.club/cms/content/1/11310058/hls_testing/playlist.m3u8'
    'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
    );
  const [videoComponentKey, setVideoComponentKey] = useState(0);




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

  getTransform = () => {
    let transform = {
        transform: [{ perspective: 400 },  { rotateY: '90deg' }],
    };
    return withAnchorPoint(transform, { x: 0.5, y: 0 }, { width: windowheight, height: windowWidth });
};

const squareSize = windowWidth;
const anchorPointX = 0;
const anchorPointY = 0;

  return (
    <View style={{  backgroundColor:'#111111' ,  
 
    transform: [{ rotate: '90deg'},{translateY:windowWidth/2}],
    

    
    flex:1,
    
    
    alignItems: 'center',
    justifyContent: 'center',
    width: windowheight, height: windowWidth  }}>
      <TouchableOpacity
        activeOpacity={1}
        
        style={{ width: windowheight, height: windowWidth ,
        
        
        
        }}
        // style={{ width: '100%', height: '100%'}}
        onPress={() => {
          setClicked(true);
          toggleControls();
        }}
      >
        <Video
          key={videoComponentKey}
          paused={paused}
          source={{
            uri: videoUri,
            // uri:'https://live-par-1-abr-cdn.livepush.io/live/bigbuckbunnyclip/AppConstants.m3u8',
            // uri:
            // 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
            //  uri:
            // 'https://mytoonz.club/cms/content/1/11310058/hls_testing/playlist.m3u8',
          }}
          ref={(videoRef) => (ref.current = videoRef)}
          onProgress={(x) => {
            // .log(x);
            setProgress(x);
          }}
          selectedAudioTrack={{
            type: 'index',
            value: selectedAudioOption,
          }}

          selectedVideoTrack={
            selectedVideoTrack
          }


          onLoad={onLoad}
          style={{ width: windowheight, height: windowWidth  , }}
          //style={{ width: '100%', height: fullScreen ? '100%' : '100%' }}
          // style={{width: 'auto',  height: 'auto'}}
          // resizeMode="contain"
          resizeMode={resizeMode}
          useTextureView={true}
        />
        {clicked && progress && controlsVisible && (
          <><TouchableOpacity
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
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={() => {
                  ref.current.seek(parseInt(progress.currentTime) - 10);
                }}>
                <Image
                  source={require('../../../app_assets/res_02.png')}
                  style={{ width: 30, height: 30, tintColor: 'white' }} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setPaused(!paused);
                }}>
                <Image
                  source={paused
                    ? require('../../../app_assets/res_15.png')
                    : require('../../../app_assets/res_13.png')}
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
                  source={require('../../../app_assets/res_05.png')}
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
                alignItems: 'center'
              }}>
              <Text style={{ color: 'white' }}>
                {progress && format(progress.currentTime)}
              </Text>
              {progress && (
                <Slider
                  style={{ width: '80%', height: 40 }}
                  minimumValue={0}
                  maximumValue={progress.seekableDuration}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#fff"
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
                justifyContent: 'space-between',
                position: 'absolute',
                top: 10,
                paddingLeft: 20,
                paddingRight: 20,
                alignItems: 'center'
              }}>
              <TouchableOpacity onPress={() => {
                if (fullScreen) {
                  Orientation.lockToPortrait();
                } else {
                  Orientation.lockToLandscape();
                }
                setFullScreen(!fullScreen);
              }}>
                <Image source={fullScreen ? require('../../../app_assets/res_11.png') : require('../../../app_assets/pictures/pic_02.png')}
                  style={{ width: 24, height: 24, tintColor: 'white' }} />
              </TouchableOpacity>
            </View>



          </TouchableOpacity><View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              position: 'absolute',
              top: 10,
              paddingLeft: 20,
              paddingRight: 20,
              alignItems: 'center',
            }}>
              <TouchableOpacity onPress={() =>
                setShowSettings(!showSettings)}>
                <Image
                  source={require('../../../app_assets/res_16.png')}
                  style={{ width: 24, height: 24, tintColor: 'white' }} />
              </TouchableOpacity>

            </View></>
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
      </TouchableOpacity>
    
    
    </View>
  );
};

export default PlayerLandscape