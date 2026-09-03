import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import DetailLayoutDummy from './DetailLayoutMock';

const MoreLikeThisTv = () => {
  const similarShowsData = [
    { title: 'Similar Show 1' },
    // { title: 'Similar Show 2' },
    // { title: 'Similar Show 3' },
    // { title: 'Similar Show 4' },
    // { title: 'Similar Show 5' },
    // { title: 'Similar Show 6' },
    // { title: 'Similar Show 7' },
    // { title: 'Similar Show 8' },
  ];

  const renderSimilarShowItem = ({ item }) => (
    <TouchableOpacity style={styles.SeasonButton}>
      <View style={styles.leftTextContainer}>
        <Text style={styles.SimilarShowStyle}>Similar shows</Text>
      </View>
      <View style={styles.rightTextContainer}>
        <Text style={styles.SimilarShowStyle}>8 Titles</Text>
      </View>
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
              data={similarShowsData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderSimilarShowItem}
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
    borderRadius: 5,
    alignContent:'space-between',
    justifyContent:'space-between',
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
  SimilarShowStyle: {
    color: 'white',
    fontSize: 17,
    margin: 3,
  },

});

export default MoreLikeThisTv;
