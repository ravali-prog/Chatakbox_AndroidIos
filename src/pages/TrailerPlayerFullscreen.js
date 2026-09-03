import React, { useState, useEffect } from "react";
import { Text, StatusBar } from 'react-native'
import Orientation from 'react-native-orientation-locker';
import TrailerPlayerLandscape from "../media_player/TrailerPlayerLand";
import SystemNavigationBar from 'react-native-system-navigation-bar';
import LoadingSpinner from "../ui_components/widgets/LoadingSpinner";


const LandScapeTrailerplayer = ({ route }) => {


  const [videoUrl, setvideoUrl] = useState(route.params.intent.videoUrl)
  const [title, setTitle] = useState(route.params.intent.title)
  const [showloading, setShowLoading] = useState(false)

  useEffect(() => {


    // setvideoUrl(videoUrl)
    // setTitle(title)


    // Orientation.lockToLandscape();
    return () => {

      Orientation.lockToPortrait();
      SystemNavigationBar.navigationShow()
      StatusBar.setHidden(false)

    }
  }, []);



  return (
    <>
      {showloading && <LoadingSpinner />}
      {!showloading && <TrailerPlayerLandscape
        showfullscreenicon={false}
        mediaUrl={videoUrl}
        videoTitle={title}
        player="trailer"
      />}
    </>

  )
}

export default LandScapeTrailerplayer