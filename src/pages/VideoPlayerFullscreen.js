import React, { useState, useEffect, useRef } from "react";
import { StatusBar, Platform, InteractionManager } from 'react-native'
import Orientation from 'react-native-orientation-locker';
import TrailerPlayerLandscape from "../media_player/TrailerPlayerLand";
import SystemNavigationBar from 'react-native-system-navigation-bar';
import LoadingSpinner from "../ui_components/widgets/LoadingSpinner";
import { getContentToken } from "../state_mgmt/AppCommonSlice";
import { LogError, USER_UUID, getCurrentPlayingVideo, processWatchHistory, selectedUserProfile, setCurrentPlayingVideo } from "../app_config/AppConstants";
import { APP_EVENTS_ } from "../app_config/AnalyticsConfig";
import { btoa } from 'react-native-quick-base64';
import { useNavigation } from '@react-navigation/native';

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

var attr_content = ""
var attr_content_id = ""
var attr_content_type = ""

const LandScapeVideoplayer = ({ route }) => {
  const navigation = useNavigation();
  const didLockLandscape = useRef(false);
  const isLeaving = useRef(false);
  const didRestorePortrait = useRef(false);
  const portraitRetryTimers = useRef([]);

  const intent = route?.params?.intent || {}
  const clipDetails = { ...(intent.clipDetails || {}) }
  const seriesDetails = { ...(intent.seriesDetails || {}) }
  const resolvedUrl = typeof intent.resolvedUrl === 'string' ? intent.resolvedUrl : ''
  const id = clipDetails.id
  const cid = clipDetails.cid

  const season = clipDetails.season
  const episode = clipDetails.episode
  var subtitles = null

  if (clipDetails && Object.keys(clipDetails).length > 0) {
    setCurrentPlayingVideo(clipDetails)
  }

  var title = intent.title || ""

  subtitles = clipDetails.media ? clipDetails.media.subtitles : null

  if (!title) {
    if (seriesDetails != null && !isEmpty(seriesDetails)) {
      title = seriesDetails.seriestitle + " S" + season + ": " + "E" + episode + " - " + clipDetails.title
      attr_content_type = "Show"
    } else {
      title = clipDetails.title
      attr_content_type = "Video"
    }
  } else if (seriesDetails != null && !isEmpty(seriesDetails)) {
    attr_content_type = "Show"
  } else {
    attr_content_type = "Video"
  }
  attr_content = title
  attr_content_id = cid

  var resume = 0

  if (intent.resume != null && intent.resume !== '') {
    resume = parseInt(intent.resume, 10) || 0
  } else if (clipDetails.resume) {
    resume = parseInt(clipDetails.resume)
  }


  const [downloadid, setdownloadid] = useState(intent.dwnid ? String(intent.dwnid) : "")
  const [videourl, setvideourl] = useState(resolvedUrl)
  const [showloading, setShowLoading] = useState(true)

  const clearPortraitRetries = () => {
    portraitRetryTimers.current.forEach((t) => clearTimeout(t));
    portraitRetryTimers.current = [];
  };

  const restorePortrait = () => {
    if (Platform.OS !== 'ios') return;
    isLeaving.current = true;
    if (didRestorePortrait.current) {
      // Still reinforce portrait lock if a late landscape call raced us.
      try {
        Orientation.lockToPortrait();
      } catch (e) {}
      return;
    }
    didRestorePortrait.current = true;
    clearPortraitRetries();
    try {
      // iOS sometimes ignores a single lock while the pop animation is mid-flight.
      Orientation.lockToPortrait();
      SystemNavigationBar.navigationShow();
      StatusBar.setHidden(false);
      processWatchHistory(getCurrentPlayingVideo());
      [50, 200, 450].forEach((ms) => {
        const t = setTimeout(() => {
          try {
            Orientation.lockToPortrait();
          } catch (e) {}
        }, ms);
        portraitRetryTimers.current.push(t);
      });
    } catch (e) {}
  };

  const lockLandscapeOnce = () => {
    if (Platform.OS !== 'ios') return;
    // Never re-lock after user started leaving — this was causing intermittent
    // landscape UI stuck when returning to the details screen.
    if (isLeaving.current || didLockLandscape.current) return;
    didLockLandscape.current = true;
    try {
      StatusBar.setHidden(true);
      Orientation.lockToLandscape();
    } catch (e) {}
  };

  useEffect(() => {
    // Delay landscape lock until AFTER the push animation finishes.
    // Locking immediately rotates the still-visible details screen for a second.
    let fallbackTimer = null;
    let cancelled = false;

    const unsubTransition = navigation.addListener('transitionEnd', (e) => {
      // Only lock when this screen finished opening — not when it finishes closing.
      if (cancelled || isLeaving.current) return;
      if (e?.data?.closing) return;
      if (!navigation.isFocused()) return;
      lockLandscapeOnce();
    });

    const task = InteractionManager.runAfterInteractions(() => {
      // Fallback if transitionEnd is missed
      fallbackTimer = setTimeout(() => {
        if (!cancelled && !isLeaving.current && navigation.isFocused()) {
          lockLandscapeOnce();
        }
      }, 350);
    });

    const unsubRemove = navigation.addListener('beforeRemove', () => {
      restorePortrait();
    });

    const unsubBlur = navigation.addListener('blur', () => {
      // Safety: gesture back / fast pops can miss beforeRemove timing.
      restorePortrait();
    });

    return () => {
      cancelled = true;
      isLeaving.current = true;
      unsubTransition();
      unsubRemove();
      unsubBlur();
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
      if (task && typeof task.cancel === 'function') {
        task.cancel();
      }
      clearPortraitRetries();
      // Final restore if we tore down while still landscape.
      if (didLockLandscape.current) {
        try {
          Orientation.lockToPortrait();
        } catch (e) {}
      }
    };
  }, [navigation]);

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

      if (resolvedUrl) {
        setvideourl(resolvedUrl)
        if (intent.dwnid) {
          setdownloadid(String(intent.dwnid))
        }
        setShowLoading(false)
      } else if (clipDetails && clipDetails.media && clipDetails.media.video && clipDetails.media.video[0] && clipDetails.media.video[0].url) {
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
                setShowLoading(false)
                LogError("FullscreenVideoPlayer getContentToken else inside",x)
              }
            } catch (error) {
            setShowLoading(false)
            LogError("FullscreenVideoPlayer getContentToken catch inside",error)
            }

          });
        } else {
          setShowLoading(false)
          LogError("FullscreenVideoPlayer getContentToken else outside")

        }
      } else {
        setShowLoading(false)
        LogError("FullscreenVideoPlayer missing media url and resolvedUrl")
      }
    }
    catch (error) {
      setShowLoading(false)
      LogError("FullscreenVideoPlayer getContentToken catch outside",error)

    }
  }, [route.params]);


  return (
    <>
      {showloading && <LoadingSpinner />}
      {!showloading && !!videourl && <TrailerPlayerLandscape
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
