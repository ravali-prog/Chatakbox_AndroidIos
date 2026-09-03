import React, { useEffect, useRef, useState  } from 'react';
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
  Platform,
  TouchableHighlight,
  TouchableNativeFeedback,
  DeviceEventEmitter,


} from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Orientation from 'react-native-orientation-locker';
import ModalDropdown from 'react-native-modal-dropdown';

import { Title } from 'react-native-paper';
// import styles from '../theming/SearchStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogData, LogError } from '../app_config/AppConstants';






 
const TrailerPlayerLandscapeTv = ({ showfullscreenicon }) => {
 
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
  const [resizeMode, setReSizeMode] = useState('contain');
  const [selectedVideoTrack, setSelectedVideoTrack] = useState(null);
  const [selectedSubtitle, setSelectedSubtitle] = useState('');
  // const [forceUpdate, setForceUpdate] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const ref = useRef();
  const durationInSeconds = 120;
  const subtitles = ['English', 'Hindi', 'Telugu', 'Tamil'];
  const [videoUri, setVideoUri] = useState(
    'https://mytoonz.club/cms/content/1/11310058/hls_testing/playlist.m3u8');
  const [videoComponentKey, setVideoComponentKey] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [lastSelectedOption, setLastSelectedOption] = useState(null);
  const [currentPlaybackPosition, setCurrentPlaybackPosition] = useState(0);

 
 
  const showDataModal = (option) => {
    setSelectedOption(option);
    setModalVisible(true);
  };
 
  const hideDataModal = () => {
    setSelectedOption(null);
    setModalVisible(false);
  };
 
  useEffect(() => {
    if (fullScreen) {
      SystemNavigationBar.navigationShow()
      StatusBar.setHidden(false)
      Orientation.lockToPortrait();
    } else {
      SystemNavigationBar.navigationHide();
      StatusBar.setHidden(true)
      Orientation.lockToLandscape();
    }
    setFullScreen(!fullScreen);
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
    // Initialize selectedVideoTrack with the first available video track
    if (videoTracks.length > 0) {
      setSelectedVideoTrack({
        type: 'resolution',
        value: videoTracks[0].height,
      });
    }
  }, [videoTracks]);
 
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
    // setControlsVisible((prev) => !prev);
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
 
    if (audioTracks.length > 0) {
      setSelectedAudioOption({
        type: 'title',
        value: audioTracks[0].title,
      });
    }
 
    if (videoTracks.length > 0) {
      setSelectedVideoTrack({
        type: 'resolution',
        value: videoTracks[0].height,
      });
    }
    if (currentPlaybackPosition > 0) {
        // Seek to the stored playback position
        ref.current.seek(currentPlaybackPosition);
      }
  };
 
 
 
  const onProgress = (progress) => {
    setCurrentPlaybackPosition(progress.currentTime);
    setProgress(progress);
  };
 
  const onSelectAudio = (index, value) => {
 
    if (audioTracks.length > index) {
      const selectedTrack = audioTracks[index];
      const selectedAudioTrack = {
        type: 'title',
        value: selectedTrack.title,
      };
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
    // Save last selected option to AsyncStorage
    AsyncStorage.setItem('lastSelectedOption', lastSelectedOption)
      .then(() => 
        LogData('Last selected option saved to AsyncStorage'))
      .catch((error) => LogError('Error saving last selected option to AsyncStorage:', error));
  };
 

  
 
  return (
    <View style={{ flex: 1, backgroundColor: '#111111' }}>
      <TouchableOpacity
        activeOpacity={1}
 
        style={{ width: '100%', height: fullScreen ? '100%' : 200 }}
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
            // uri: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
          }}
 
          ref={(videoRef) => (ref.current = videoRef)}
          onProgress={onProgress}
          selectedAudioTrack={selectedAudioOption}
          selectedVideoTrack={selectedVideoTrack}
          onLoad={onLoad}
          style={{ width: '100%', height: fullScreen ? windowheight : 200 }}
          // style={{width: 'auto',  height: 'auto'}}
          // resizeMode="contain"
          resizeMode={resizeMode}
          useTextureView={true}
        />
        {progress &&  (
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
 
                navigation.goBack();
              }}>
                <Image source={require('../../../app_assets/res_11.png')}
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
              <TouchableOpacity
                onPress={() => {
                  showDataModal('Subtitle');
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
            </View>
          </TouchableWithoutFeedback>
        )}
 
      </TouchableOpacity>
 
      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={hideDataModal}
 
        >
          <View style={{
          width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,.5)'
          }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 5, height:"auto", width: windowWidth * 0.4 }}>
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
                            onSelectVideoQuality(index);
                            closeSettings();
                            toggleControls();
                          }}
                        />
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        onSelectSubtitle(index);
                        closeSettings();
                        toggleControls();
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
        </Modal>
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
    color:'#000',
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
 
export default TrailerPlayerLandscapeTv