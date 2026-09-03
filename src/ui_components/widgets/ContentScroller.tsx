import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native"; 

import {
  LOCAL_EVENTS,
  LogError,
  handleNavigation,
  isUserSubscribed,
  useractivityDetails,
} from "../../app_config/AppConstants";
import { useNavigation } from "@react-navigation/native";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
import ProgressBar from "react-native-progress/Bar";
import { EventRegister } from "react-native-event-listeners";
import type from 'type-detect';
import { colors } from "../../theming/colors";

const Scroller = (propdata: any) => {
  const [data, setdata] = useState<any>([]); //useState<List[] | Clip[]>([]);  // useState<List | Clip>(null);
  const initWidth = (screenWidth * Number(propdata.imgratio?.imgper || 40)) / 100;
  const [itemWidth, setitemWidth] = useState(initWidth);
  const [itemHeight, setitemHeight] = useState(
    (initWidth * Number(propdata.imgratio?.imghratio || 9)) / Number(propdata.imgratio?.imgwratio || 16)
  );

  useEffect(() => {

    try {
      if (propdata.prop) {
        setdata([...propdata.prop]);

        if (propdata.isHistory) {
          try {
            const eventListener = () => {
              
              if (
                useractivityDetails &&
                useractivityDetails?.watchhistory &&
                useractivityDetails?.watchhistory.clips &&
                useractivityDetails?.watchhistory.clips.length > 0
              ) {
                setdata([...useractivityDetails?.watchhistory.clips]);
              }
            };

         var eventid = EventRegister.addEventListener(
              LOCAL_EVENTS.EVENT_WATCHHISTORY_UPDATE_SCROLLER,
              eventListener
            );

            return()=> {
              if ( type (eventid) === 'string') {                
                EventRegister.removeEventListener(eventid as string)
               }
            }
          } catch (error) {
            LogError("scroller event listener error", error);
          }
        }
      }
    } catch (error) {
      LogError("scroller error", error);
    }
  }, [propdata.prop]);

  useEffect(() => {
    if (propdata && propdata.imgratio) {
      const w = (screenWidth * Number(propdata.imgratio.imgper)) / 100;
      setitemWidth(w);
      setitemHeight(
        (w * Number(propdata.imgratio.imghratio)) /
          Number(propdata.imgratio.imgwratio)
      );
    }
  }, [propdata.imgratio?.imgper, propdata.imgratio?.imghratio, propdata.imgratio?.imgwratio]);

  const navigationObject: any = useNavigation();

  const handleContainerPress = (itemselected: any) => {
    if (propdata.onItemPress) {
      propdata.onItemPress(itemselected);
    } else {
      handleNavigation(navigationObject, itemselected);
    }
  };

  const renderItem = ({ item }: any) => {
    let isSubscribed = isUserSubscribed(item.contentgroup);
    var resume = -1;
    try {
      if (item.resume != undefined && item.dur != undefined) {
        resume = parseInt(item.resume) / parseInt(item.dur);
      }
    } catch (error) {
    }
    // var imgurl =
    //   item.thumbnail[
    //     "t" + propdata.imgratio.imgwratio + "x" + propdata.imgratio.imghratio
    //   ]; 

    var imgurl = item.thumbnail["t" + propdata.imgratio.imgwratio + "x" + propdata.imgratio.imghratio] || item.thumbnail.t2x3 || item.thumbnail.t16x9 || item.thumbnail.t3x4 || item.thumbnail.t5x3 || "";

    return (
      <View>
        <TouchableOpacity
        activeOpacity={0.9}
          onPress={() => handleContainerPress(item)}
          style={styles.container}
        > 
          {
            <View>
              {imgurl != "" ? (
                <Image
                  source={{ uri: imgurl }}
                  width={itemWidth}
                  height={itemHeight}
                  style={{
                    marginHorizontal: 6,
                    borderRadius: 5,
                    backgroundColor:"#17171D",
                  }}
                />
              ) : (
                <View style={{
                  width: itemWidth,
                  height: itemHeight,
                  marginHorizontal: 6,
                  borderRadius: 5,
                  backgroundColor: "#17171D",
                }} />
              )}
              {resume > 0 && (
                <ProgressBar
                  progress={resume}
                  width={itemWidth}
                  height={3}
                  color={colors.action_primary}
                  backgroundColor="#EEEEEE"
                  borderWidth={0}
                  style={styles.progressBar}
                />
              )}
              {item.license == 1 && !isSubscribed && (
                <View style={styles.freeImageContainer}>
                  {/* <Image source={require('../../../app_assets/IconAssetsTv/free.png')} style={styles.freeImage}/> */}
                  <Text style={styles.freeImage}>Free</Text>
                </View>
              )}
              {/* <View style={styles.freeContent}>
              <Text style={styles.freeText}>FREE</Text>
            </View>  */}
            </View>
          }
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        initialNumToRender={2}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 6,
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    color: colors.action_primary,
    marginHorizontal: 6,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  freeImageContainer: {
    position: "absolute",
    backgroundColor: colors.action_primary,
    width: "30%", // Set the width to 50%
    marginHorizontal: 6,
    borderTopEndRadius: 5,
    right: 0,
  },

  freeImage: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
  },
});

export default Scroller;