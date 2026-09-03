import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
import CheckBox from "@react-native-community/checkbox";
import { useNavigation } from "@react-navigation/native";
import {
  USER_UUID,
  selectedUserProfile,
  handleNavigation,
  LOCAL_EVENTS,
  userProfiles,
  useractivityDetails,
  LogError,
  openReelsIfReelsSourced,
} from "../../app_config/AppConstants";
import LoadingSpinner from "../../ui_components/widgets/LoadingSpinner";
import CustomModal from "../../data_models/CustomDialogTypes";
import { watchHistoryAction } from "../../state_mgmt/AppCommonSlice";
import { EventRegister } from "react-native-event-listeners";
import { APP_EVENTS_ } from "../../app_config/AnalyticsConfig";
import { colors } from "../../theming/colors";

const ViewingHistory = () => {
  const navigation = useNavigation();
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [imageWidth, setImageWidth] = useState(0);
  const UUID = USER_UUID;
  const profileid = selectedUserProfile ? selectedUserProfile.profileid : "";
  const [combinedData, setCombinedData] = useState([]);
  const [action, setAction] = useState("watchhistory");
  const [cidsToDelete, setCidsToDelete] = useState([]);
  const [status, setStatus] = useState("loading");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const toggleSelectAll = () => {
    if (!selectAll) {
      const allIds = combinedData.map((item) => item.cid);
      setSelectedIds(allIds);
      setCidsToDelete(allIds);
    } else {
      setSelectedIds([]);
      setCidsToDelete([]);
    }
    setSelectAll(!selectAll);
  };

  const toggleSelect = (item) => {
    const cid = item.cid;

    if (selectedIds.includes(cid)) {
      setSelectedIds((prevIds) =>
        prevIds.filter((selectedId) => selectedId !== cid)
      );
      setCidsToDelete((prevCids) =>
        prevCids.filter((selectedCid) => selectedCid !== cid)
      );
    } else {
      setSelectedIds((prevIds) => [...prevIds, cid]);
      setCidsToDelete((prevCids) => [...prevCids, cid]);
    }
  };

  useEffect(() => {
  }, [selectedIds, cidsToDelete]);

  const handleModalClose = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  const calculateImageWidth = () => {
    const screenWidth = Dimensions.get("window").width;
    const padding = 10;
    const imagesPerRow = 3;
    const width = (screenWidth - padding * imagesPerRow) / imagesPerRow;
    setImageWidth(width);
  };

  useEffect(() => {
    try {
      APP_EVENTS_.screen("ViewingHistory");
    } catch (error) {
    }

    calculateImageWidth();

    getWatchHistory();
  }, []);
  
  const getWatchHistory = () => {
    try {
      // Determine the action based on the current state of isInWatchlist
      const action = "watchhistory";
      // Dispatch getUserData action
      const response = watchHistoryAction(action, UUID, profileid);

      response.then((x) => {
        try {
          if (x.data.resultcode === "101") {
            setStatus("successful");
            setCombinedData(x.data.clips);
            // setSeries(response.data.series);
            // setClips(response.data.clips);
          } else {
            setStatus("failed");
            setLoadingMessage("NO DATA");
            setError("No response from the server");
            setModalVisible(true);
            // Handle error response from getUserData if needed
          }
        } catch (error) {
          LogError("WatchHistory getWatchHistory watchHistoryAction catch inside",error)                    
        }
      });
    } catch (error) {
      setStatus("failed");
      setLoadingMessage("NO DATA");
      setError("No response from the server");
      setModalVisible(true);
      LogError("WatchHistory getWatchHistory watchHistoryAction catch outside",error)                 
    }
  };

  
  const deleteSelectedItems = async () => {
    try {
      let action = "";
      let cidsToDelete = [];

      if (selectAll) {
        // Delete all items
        if (combinedData.length == selectedIds.length) {
          action = "clearwatchhistory";
        } else {
          action = "deletewatchhistory";
          cidsToDelete = cidsToDelete.length > 0 ? cidsToDelete : selectedIds;
        }
      } else {
        // Delete only selected items
        action = "deletewatchhistory";
        cidsToDelete = cidsToDelete.length > 0 ? cidsToDelete : selectedIds;
      }

      const response = await watchHistoryAction(
        action,
        UUID,
        profileid,
        cidsToDelete
      );

      if (response.data.resultcode === "101") {

        const updatedCombinedData = combinedData.filter(
          (item) => !cidsToDelete.includes(item.cid)
        );
        // setCombinedData([...updatedCombinedData]);

        // Emit event based on selection status
        if (selectAll) {
          // setCombinedData(updatedCombinedData);
          // If all items were selected before deleting
          if (combinedData.length == selectedIds.length) {
            useractivityDetails.watchhistory.clips = [];
            setCombinedData([]);
            EventRegister.emitEvent(LOCAL_EVENTS.EVENT_WATCHHISTORY_UPDATE, {});
          }
          //Only some items are deleted from watchhistory
          else {
            setCombinedData([...updatedCombinedData]);
            useractivityDetails.watchhistory.clips = [...updatedCombinedData];
            EventRegister.emitEvent(
              LOCAL_EVENTS.EVENT_WATCHHISTORY_UPDATE_SCROLLER,
              {}
            );
          }
        } else {
          // If some items were selected before deleting
          setCombinedData(updatedCombinedData);
          if (updatedCombinedData.length > 0) {
            useractivityDetails.watchhistory.clips = [...updatedCombinedData];
            EventRegister.emitEvent(
              LOCAL_EVENTS.EVENT_WATCHHISTORY_UPDATE_SCROLLER,
              {}
            );
          }
          //When no items are left in watch history need to refresh home
          else {
            setCombinedData([]);
            useractivityDetails.watchhistory.clips = [];
            EventRegister.emitEvent(LOCAL_EVENTS.EVENT_WATCHHISTORY_UPDATE, {});
          }
        }
      } else {
      }
    } catch (error) {
    }

    setSelectedIds([]);
    setCidsToDelete([]);
  };

  const renderItem = ({ item, type }) => {
    let aspectRatio;
    let thumbnail;
    let videoID;
    let videoType;
    if (item.seriesId != "0") {
      videoID = item.seriesId;
      videoType = "series";
    } else if (item.seriesId == "0") {
      // aspectRatio = 16 / 9;
      // thumbnail = item.thumbnail['t16x9'];
      videoID = item.id;
      videoType = "clip";
    }
    aspectRatio = 2 / 3;
    thumbnail = item.thumbnail["t2x3"];

    return (
      <View style={[styles.imageContainer, { aspectRatio }]}>
        {/* Use the item data to display images */}
        <TouchableOpacity
        activeOpacity={0.9}
          onPress={() =>
            openReelsIfReelsSourced(navigation, { type: videoType, ...item }).then((opened) => {
              if (!opened) {
                handleNavigation(navigation, { type: videoType, ...item });
              }
            })
          }
        >
          <Image
            source={{ uri: thumbnail }}
            style={[styles.image, { aspectRatio }]}
          />
        </TouchableOpacity>

        <CheckBox
          value={selectedIds.includes(item.cid)}
          onValueChange={() => toggleSelect(item)}
          style={styles.checkbox}
          tintColors={{ true: "red", false: "black" }}
        />
      </View>
    );
  };

  const getContent = () => {
    return (
      <>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.headerText}>Watch History</Text>
            </View>
            <TouchableOpacity
            activeOpacity={0.9}
              onPress={handleBackPress}
              style={{
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
                left: 0,
              }}
            >
              <Image
                source={require("../../../app_assets/symbols/sym_06.png")}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            {combinedData.length > 0 && (
              <TouchableOpacity
              activeOpacity={0.9}
                onPress={toggleSelectAll}
                style={styles.selectButton}
              >
                <Text style={styles.selectText}>
                  {selectAll ? "Unselect All" : "Select All"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {combinedData.length > 0 ? (
            <FlatList
              data={combinedData}
              renderItem={renderItem}
              keyExtractor={(item) =>
                item.item ? item.item.seriesId : item.id
              } // Extract ID based on type
              numColumns={2}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No Data</Text>
            </View>
          )}
          <TouchableOpacity
          activeOpacity={0.9}
            style={styles.deleteIconContainer}
            onPress={() => deleteSelectedItems()}
          >
            <Image
              source={require("../../../app_assets/symbols/sym_07.png")}
              style={styles.deleteIcon}
            />
          </TouchableOpacity>
        </View>

        <CustomModal
          visible={modalVisible}
          message={loadingMessage}
          error={error}
          onClose={handleModalClose}
        />
      </>
    );
  };

  return (
    <>
      {status === "loading" && <LoadingSpinner />}
      {status === "failed" && (
        <CustomModal
          visible={modalVisible}
          message={loadingMessage}
          error={error}
          onClose={handleModalClose}
        />
      )}
      {status === "successful" && getContent()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    //paddingRight:5,
    backgroundColor: "#000000",
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: "white",
  },
  titleContainer: {
    left: 0,
    right: 0,
    position: "absolute",
    flex: 1,
    alignItems: "center",

    left: 0,
    right: 0,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    alignItems: "center",
  },
  backButton: {
    width: 100,
  },
  selectButton: {
    width: 100,
    position: "absolute",
    right: 0,
    padding: 15,
  },
  selectText: {
    fontSize: 13,
    color: colors.action_primary,
    fontWeight: "bold",
    textAlign: "center",
  },
  imageContainer: {
    flexDirection: "row",
    height: "100%",
    width: "50%",
    justifyContent: "center",
    position: "relative", // Make the container relative for absolute positioning of CheckBox
    padding: 10,
  },
  image: {
    height: "100%",
    resizeMode: "cover",
    width: "100%",
    marginTop: 10,
   backgroundColor:"#17171D",
    borderRadius:12,


  },
  checkbox: {
    position: "absolute",
    // bottom: 10,
    top: 25,
    right: 15,
    borderBlockColor: colors.action_primary,
  },
  deleteIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    padding: 10,
  },
  deleteIcon: {
    width: 25,
    height: 25,
    tintColor: "white",
    padding: 10,
    margin: 10,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 20,
    color: "#fff",
  },
});

export default ViewingHistory;
