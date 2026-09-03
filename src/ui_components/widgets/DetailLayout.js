import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, Dimensions,
  TouchableOpacity, Modal, NativeModules
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  toHHMMSS, handleVideoPlayAsync,
  setCurrentPlayingVideo, configData, LogError
} from '../../app_config/AppConstants';

const windowWidth = Dimensions.get('window').width;

const DetailLayout = ({ param, seriesDetails, playVideoCallBack }) => {
  const navigation = useNavigation();
  const [seriesTitle] = useState(seriesDetails.seriesTitle);
  const [duration, setDuration] = useState('');
  const [desc, setDesc] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setDuration(toHHMMSS(param.dur) + '');
    setDesc(param.desc);
  }, [param]);

  const handlePlayPress = (param) => {
    playVideoCallBack(param);
  };

  return (
    <>
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handlePlayPress(param)}
        >
          <View style={styles.row}>

            <View style={styles.thumbContainer}>
              <Image
                source={{ uri: param.thumbnail['t16x9'] }}
                style={styles.thumb}
                resizeMode="cover"
              />
              <View style={styles.playOverlay}>
                <View style={styles.playCircle}>
                  <Image
                    source={require('../../../app_assets/res_14.png')}
                    style={styles.playIcon}
                    resizeMode="contain"
                    tintColor="#fff"
                  />
                </View>
              </View>
            </View>

            {/* <View style={styles.meta}>
              <Text style={styles.episodeNum}>Episode {param.episode}</Text>
              <Text style={styles.title} numberOfLines={2}>
                {param.title}
              </Text>
              <View style={styles.durationRow}>
                <Image
                  source={require('../../../app_assets/res_14.png')}
                  style={styles.clockIcon}
                  tintColor="#666"
                  resizeMode="contain"
                />
                <Text style={styles.duration}>{duration}</Text>
              </View>
              <Text style={styles.desc} numberOfLines={2} ellipsizeMode="tail">
                {desc}
              </Text>
            </View> */}
            <View style={styles.meta}>
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
    <Text style={styles.episodeNum}>Episode {param.episode}</Text>
    <View style={styles.durationRow}>
      <Image
        source={require('../../../app_assets/res_14.png')}
        style={styles.clockIcon}
        tintColor="#666"
        resizeMode="contain"
      />
      <Text style={styles.duration}>{duration}</Text>
    </View>
  </View>
  <Text style={styles.title} numberOfLines={2}>
    {param.title}
  </Text>
  <Text style={styles.desc} numberOfLines={2} ellipsizeMode="tail">
    {desc}
  </Text>
</View> 

          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Description</Text>
            <View style={styles.seasonsList}>
              <Text style={styles.seasonText}>{desc}</Text>
            </View>
            <TouchableOpacity
            activeOpacity={0.9}
              onPress={() => setShowModal(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const THUMB_WIDTH = windowWidth * 0.42;

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    marginHorizontal: 12,
    marginVertical: 4,
    borderWidth: 0.5,
    borderColor: '#2a2a2a',
    backgroundColor: '#17171D',
    overflow: 'hidden',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  thumbContainer: {
    width: THUMB_WIDTH,
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1e1e1e',
    flexShrink: 0,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    // backgroundColor: 'rgba(229, 9, 20, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    width: 20,
    height: 20,
    marginLeft: 2,
  },
  meta: {
    flex: 1,
    gap: 5,
    justifyContent: 'center',
  },
  episodeNum: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
    lineHeight: 18,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#111111',
    // alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  clockIcon: {
    width: 10,
    height: 10,
  },
  duration: {
    fontSize: 11,
    color: '#888888',
  },
  desc: {
    fontSize: 11,
    color: '#666666',
    lineHeight: 16,
    fontWeight: '300',
    fontFamily: 'Macklin', 

  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  modalContent: {
    backgroundColor: '#1c1c1e',
    width: '85%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 14,
  },
  seasonsList: {
    width: '100%',
    marginBottom: 14,
  },
  seasonText: {
    fontSize: 14,
    color: '#aaaaaa',
    lineHeight: 20,
  },
  cancelButton: {
    alignSelf: 'stretch',
    paddingVertical: 12,
    backgroundColor: '#e50914',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default DetailLayout;