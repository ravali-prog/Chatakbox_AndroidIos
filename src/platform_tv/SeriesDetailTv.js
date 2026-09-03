import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import DetailLayoutTv from './DetailLayoutTv';
import DetailLayoutDummy from './DetailLayoutMock';


const windowWidth = Dimensions.get('window').width;

const SeriesDetailsTv = () => {
  const seasonData = [
    { season: 'Season 1', episodes: 4 },
    { season: 'Season 2', episodes: 4 },
    { season: 'Season 3', episodes: 4 },
    { season: 'Season 4', episodes: 4 },
  ];

  const renderSeasonItem = ({ item }) => (
    <TouchableOpacity style={styles.SeasonButton}>
      <Text style={styles.SeasonStyle}>{item.season}</Text>
      <Text style={styles.SeasonStyle}>Episodes {item.episodes}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <View style={styles.containerScreen}>
          <View style={styles.leftContainer}>
            <View style={styles.VideoDetailsContainer}>
              <View style={styles.instructionGroup}>
                <Text style={styles.instructionsText}></Text>
                <Text style={styles.VideoTitle}>VideoTitle</Text>
              </View>
              <View style={styles.instructionGroup}>
                <Text style={styles.VideoType}>Comedy, thriller</Text>
              </View>
              <FlatList
              data={seasonData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderSeasonItem}
            />
          </View>
        </View>
        <View style={styles.rightContainer}>
            <ScrollView style={styles.scrollViewContainer}>
              <DetailLayoutDummy />
            </ScrollView>
          </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  containerScreen: {
    flex: 1,
    flexDirection: 'row',
    marginStart: 20,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftContainer: {
    flex: 4, 
  },
  rightContainer: {
    flex: 6,
  },
  VideoDetailsContainer: {
    flex: 1,
  },
  VideoTitle: {
    fontWeight: 'bold',
    fontSize: 27,
    color: 'white',
  },
  VideoType: {
    color: 'white',
    fontSize:12,
  },
  SeasonButton: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: 340,
    borderColor: 'white',
    marginTop: 10,
    borderWidth: 2,
    borderRadius: 30,
    marginStart:10,
    alignContent:'space-between',
    flexDirection:'row',
  },
  SeasonStyle: {
    color: 'white',
    fontSize: 17,
    marginStart: 10,
    margin: 3,
  },
  scrollViewContainer: {
    flex: 1,
  },

});

export default SeriesDetailsTv;
