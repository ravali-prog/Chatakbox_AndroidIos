import React, { useState, useEffect } from "react";
import { Text, StatusBar, Platform } from 'react-native'
import Orientation from 'react-native-orientation-locker';
import TrailerPlayerLandscape from "../media_player/TrailerPlayerLand";
import SystemNavigationBar from 'react-native-system-navigation-bar';
import LoadingSpinner from "../ui_components/widgets/LoadingSpinner";
import { getContentToken } from "../state_mgmt/AppCommonSlice";
import { LogData, LogError, USER_UUID, getCurrentPlayingVideo, processWatchHistory, selectedUserProfile, setCurrentPlayingVideo } from "../app_config/AppConstants";
import { ContentTokenResponse } from "../data_models/TokenResponseTypes"
import { APP_EVENTS_ } from "../app_config/AnalyticsConfig";
import { btoa } from 'react-native-quick-base64';

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

var attr_content = ""
var attr_content_id = ""
var attr_content_type = ""

const LandScapeVideoplayer = ({ route }) => {

  const clipDetails = { ...route.params.intent.clipDetails }
  const seriesDetails = { ...route.params.intent.seriesDetails }
  const id = clipDetails.id
  const cid = clipDetails.cid

  const season = clipDetails.season
  const episode = clipDetails.episode
  var subtitles = null

  setCurrentPlayingVideo(clipDetails)

  var title = "" 

  subtitles = clipDetails.media.subtitles

  if (seriesDetails != null && !isEmpty(seriesDetails)) {
    title = seriesDetails.seriestitle + " S" + season + ": " + "E" + episode + " - " + clipDetails.title
    attr_content_type = "Show"
  } else {
    title = clipDetails.title
    attr_content_type = "Video"
  }
  attr_content = title
  attr_content_id = cid

  var resume = 0

  if (clipDetails.resume) {
    resume = parseInt(clipDetails.resume)
  }


  const [downloadid, setdownloadid] = useState("")
  const [videourl, setvideourl] = useState("")
  const [showloading, setShowLoading] = useState(true)
  useEffect(() => {
    try {
      APP_EVENTS_.screen("VideoPlayer")
    } catch (error) {
    }
  }, []);

  useEffect(() => {
    try {
      try {
        APP_EVENTS_.content_play(attr_content, attr_content_id, attr_content_type)
      } catch (error) {
      }
  
      if (clipDetails && clipDetails.media && clipDetails.media.video && clipDetails.media.video[0] && clipDetails.media.video[0].url) {
        const mediaurlrespone = getContentToken(USER_UUID, id, selectedUserProfile.profileid, cid)
  
        if (mediaurlrespone) {
  
          mediaurlrespone.then((x) => {
            try {    
              if (x && x.data && x.data.token) {
    
                var mediaurl = clipDetails.media.video[0].url
                var userUniqId = "unique12345";
                if (Platform.OS === 'ios') {
                  userUniqId = btoa(USER_UUID + ':' + selectedUserProfile.profileid + ':' + '1');
                }
                let url = mediaurl.replace("{accesstoken}", x.data.token).replace("{useridentity}", userUniqId);
    
    
    
                setvideourl(url)
                setdownloadid(x.data.did)
                setShowLoading(false)
    
              } else {
                //  fail condition
                LogError("FullscreenVideoPlayer getContentToken else inside",x)                           
              }
            } catch (error) {
            LogError("FullscreenVideoPlayer getContentToken catch inside",error)                           
            }
  
          });
        } else {
          // fail condition
          LogError("FullscreenVideoPlayer getContentToken else outside")                           

        }
      }
    } 
    catch (error) {
      LogError("FullscreenVideoPlayer getContentToken catch outside",error)                           
      
    }
    Orientation.lockToLandscape();
    return () => {

      Orientation.lockToPortrait();
      SystemNavigationBar.navigationShow()
      StatusBar.setHidden(false)
      processWatchHistory(getCurrentPlayingVideo())
    }
  }, [route.params]);


  return (
    <>
      {showloading && <LoadingSpinner />}
      {!showloading && <TrailerPlayerLandscape
        showfullscreenicon={false}
        mediaUrl={videourl}
        downloadID={downloadid}
        videoTitle={title}
        resume={resume}
        subtitlesParam={subtitles}
        player="videoplayer"

      />}
    </>

  )
}

export default LandScapeVideoplayer