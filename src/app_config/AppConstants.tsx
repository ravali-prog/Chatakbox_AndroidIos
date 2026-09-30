import images from "./ImageAssets";
import icons from "./IconAssets";
import { COLORS, FONT, SIZES, SHADOWS } from "./ThemeConfig";
import { Config } from "../data_models/AppConfigTypes";
import { useNavigation } from "@react-navigation/native";
import { UserProfile, UserprofileData } from "../data_models/UserProfileTypes";
import { UserPrivilage } from "../data_models/UserPrivilegeTypes";
import { NativeModules, Platform } from "react-native";
import { CountryCode, device, setCountryCode } from "./DeviceInfo"; 
import { CONST_ALL_PROFILES, CONST_SELECTED_PROFILE, getData, getSelectedProfile, storeData } from "../persistence/AsyncStorage";
//import {DeviceEventEmitter} from "react-native"

import { EventRegister } from 'react-native-event-listeners'
import type from 'type-detect'
import { APP_EVENTS_ } from "./AnalyticsConfig";
import axios from "axios";
import { customerUsage } from "../state_mgmt/AppCommonSlice";
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import { useState } from "react";
import { StackActions } from '@react-navigation/native';




// export const global_content_group = ["c3c"];
export const global_content_group = ["c2c"];


export { images, icons, COLORS, FONT, SIZES, SHADOWS };

// export const CONFIG_URL = "https://chatakbox.com/vbs/web/v3/proxy.php";
export const CONFIG_URL = "https://api.chatakbox.com/web/v3/proxy.php";
export var API_URL = "";
export var LOCALE_URL = "";
export var USER_UUID = "";
export var VIDEO_ANALYTICS = "";
export var APP_NAME = "Chatak Box";
export var API_GOOGLE_SUB_SYNC = "";
export var API_IOS_SUB_SYNC = "";
export var FB_APP_ID = "";
export var FB_CLIENT_TOKEN = "";
export const APP_KEY = "4ToUgfHmqmzqoirt88RE4xXGSzgdgrb";
export const API_KEY = "nx_e4c06be7990f1d28ec9624180d325884";
export const API_SECRET = "71b7607451f2b0d923fa56193aec8f67efdf17ec77f284ca4aedeacd990d18f9";
export var GENTOKEN_URL = "";
export var CUSTOMER_SESSION_URL = "";
export var VIDEO_EVENTS_URL = "";

export var configData: Config;
export var userProfiles: UserprofileData = {} as UserprofileData;
export var selectedUserProfile: UserProfile = {} as UserProfile;
export var userPrivilages: UserPrivilage = {} as UserPrivilage;
export var useractivityDetails = null;
// export var useractivityDetails = {
//   likes: { clip: [] },
//   wishlist: { clips: [] },
//   watchhistory: { clips: [] }
// };
export var currentPlayingVideo = null;
export var currentPlayingResumeVal = "0";

export var firebaseLoginParams = {};
export var cacheData = null;

export var currDeeplinkParam = null;



export const API_MODE: 'A' | 'B' = 'A'; 
export var TOKEN_EXPIRY = false;

export function setCurrDeeplinkParam(param: any) {
    try {
        currDeeplinkParam = param
    } catch (error) {

    }
}

export function setFirebaseLoginParams(param: any) {
    firebaseLoginParams = param
};

export function getCurrentPlayingResumeVal() {
    return currentPlayingResumeVal
};

export function setCurrentPlayingResumeVal(value: string) {

    currentPlayingResumeVal = value
};


export const LOCAL_EVENTS = {
    EVENT_SUBSCRIPTION: "substatus",
    EVENT_PROFILE_CHNAGE: "profilechange",
    EVENT_WATCHHISTORY_UPDATE: "updatewatchhis",
    EVENT_EMAIL_REGISTRATION: "emailregistration",
    EVENT_UPGRADE_AVAILABLE: "updateapp",
    EVENT_HANDLE_DEEPLINK: "deeplink",
    EVENT_SELECTED_DELETE_REASSIGN_PROFILE: "reassignprofile",
    EVENT_HANDLE_SHOWTOASTMESSAGE: "showtoast",
    EVENT_WATCHHISTORY_UPDATE_SCROLLER: "updatewatchhistoryscroller",
    EVENT_UPDATE_LOADING_MODAL: "updateloadingmodal",
    EVENT_CHANGE_SCREEN: "changescreen"

}

export function setCurrentPlayingVideo(currentVideo: any) {
    try {

        if (currentVideo != null || currentVideo != undefined) {
            currentPlayingVideo = JSON.parse(JSON.stringify(currentVideo))
        }
    } catch (error) {

    }
}

export function getCurrentPlayingVideo() {
    return currentPlayingVideo
}

export function setUserPrivilages(privilages: any) {
    try {
        if (privilages) {
            userPrivilages = privilages
        }
    } catch (error) {
    }

}

export function isTvPlatform() {
    // return true

    if (Platform.OS === 'android' && Platform.isTV) {
        return true
    }

}

export function setUseractivityDetails(activitydata: any) {
    try {
        if (activitydata != null || activitydata != undefined) {
            useractivityDetails = JSON.parse(JSON.stringify(activitydata))
        }
    } catch (error) {

    }

}


export function setConfigData(config: Config) {
    configData = config
    setCountryCode(config.data.cc)
    API_URL = config.data.config.apiurl
    VIDEO_ANALYTICS = config.data.config.videoanalytics
    // API_URL = "https://screengamez.mobi/vbs_new/web/v3/proxy.php"
    API_GOOGLE_SUB_SYNC = config.data.config.googlesync
    API_IOS_SUB_SYNC = config.data.config.applesync
    LOCALE_URL = config.data.config.localeurl
    GENTOKEN_URL = config.data.config.gentokenurl;
    CUSTOMER_SESSION_URL = config.data.config.customersession;
    VIDEO_EVENTS_URL = config.data.config.videoanalytics; 

}

export function setUserProfiles(userProfileINfo: UserprofileData) {
    userProfiles = userProfileINfo
    USER_UUID = userProfileINfo.uuid
    try {
    } catch (error) {
    }

}

export function logoutCurrentProfile() {
    try {
        userProfiles = {} as UserprofileData
        useractivityDetails = null;
        USER_UUID = ""
        storeData(CONST_ALL_PROFILES, {})
        setSelectedUserProfile({} as UserProfile)
        setUserPrivilages({})
    } catch (error) {
    }


    try {
    } catch (error) {
    }

}

export function updateSelectedProfile(profiles: []) {

    try {
        for (let i = 0; i < profiles.length; i++) {
            if (profiles[i].profileid === selectedUserProfile.profileid) {
                setSelectedUserProfile(profiles[i])
                break; 
            }
        }
    } catch (error) {

    }
}

export function setSelectedUserProfile(profile: UserProfile) {
    selectedUserProfile = profile

    storeData(CONST_SELECTED_PROFILE, profile)
}

export const handleTrailerVideoPlay = (navobj: any, params: any) => {
    navobj.navigate("trailervideoplayer", { intent: params });
}


export var toHHMMSS = (secs: string) => {

    try {
        var sec_num = parseInt(secs, 10)
        var hours = Math.floor(sec_num / 3600)
        var minutes = (Math.floor(sec_num / 60) % 60)
        var seconds = (sec_num % 60)
        if (hours == 0) {
            return minutes + "m" + ":" + seconds + "s"
        }
        if (minutes == 0) {
            return seconds + "s"
        }

        if (hours > 0 && minutes > 0 && seconds > 0) {
            return hours + "h" + ":" + minutes + "m" + ":" + seconds + "s"
        }

    } catch (error) {

    }

    return "0s";

}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}





export const handleVideoPlayAsync = async (navobj: any, clipDetails: any, seriesDetails: any) => {

    var showPaywall = false;
    var allowContent = false;

    if (clipDetails && clipDetails.license == 1) {
        allowContent = true
    }
    else if (userPrivilages && userPrivilages.inactive && userPrivilages.inactive.contentgroup) {
        const inActivePrivilages = userPrivilages.inactive.contentgroup;

        if (inActivePrivilages && inActivePrivilages.length > 0) {

            for (let i = 0; i < inActivePrivilages.length; i++) {
                const vall = inActivePrivilages[i];
                if (clipDetails.contentgroup.includes(vall)) {
                    navobj.navigate("subscriptions");
                    return;
                }
            }
        } else {
            return;
        }
    }
    else if (userPrivilages && userPrivilages.active && userPrivilages.active.contentgroup) {

        const activePrivilages = userPrivilages.active.contentgroup

        if (activePrivilages && activePrivilages.length > 0) {
            let hasContentAccess = false;
            for (let i = 0; i < activePrivilages.length; i++) {
                const vall = activePrivilages[i]
                if (clipDetails.contentgroup.includes(vall)) {
                    hasContentAccess = true;
                    break
                }
            }

            if (hasContentAccess) {
                allowContent = true

            } else {
                showPaywall = true
            }
        } else {
            showPaywall = true
        }

    }


    else {
        showPaywall = true

    }

    if (showPaywall) {

        const evenid = EventRegister.addEventListener(LOCAL_EVENTS.EVENT_SUBSCRIPTION, () => {
            onPaymentCallback()
        });

        const onPaymentCallback = () => {



            if (userPrivilages) {
                const activePrivilages = userPrivilages.active.contentgroup
                if (activePrivilages && activePrivilages.length > 0) {
                    let hasContentAccess = false;
                    for (let i = 0; i < activePrivilages.length; i++) {
                        const vall = activePrivilages[i]
                        if (clipDetails.contentgroup.includes(vall)) {
                            hasContentAccess = true;
                            break
                        }
                    }

                    if (hasContentAccess) {
                        allowContent = true
                    } else {
                        navobj.goBack()
                    }
                } else {
                    navobj.goBack()
                }

            } else {
                navobj.goBack()
            }

            if (type(evenid) === 'string') {
                EventRegister.removeEventListener(evenid as string)
            }

        }



        navobj.navigate('PayWall', {
            intent: {
                url: configData.data.config.paywallurl, title: "Subscription",
                contentgroup: clipDetails.contentgroup
            }
        });
    }

    if (allowContent) {

        try {

            var attr_content = ""
            var attr_content_id = ""
            var attr_content_type = ""

            const id = clipDetails.id

            const cid = clipDetails.cid
            var title = ""
            const season = clipDetails.season
            const episode = clipDetails.episode

            try {
                APP_EVENTS_.screen("videoplayer")
            } catch (error) {
            }


            if (seriesDetails != null && !isEmpty(seriesDetails)) {
                title = seriesDetails.seriestitle + " S" + season + ": " + "E" + episode + " - " + clipDetails.title
                attr_content_type = "Show"
            } else {
                title = clipDetails.title
                attr_content_type = "Video"
            }
            attr_content = title
            attr_content_id = cid


            try {
                APP_EVENTS_.content_play(attr_content, attr_content_id, attr_content_type)
            } catch (error) {
            }

            try {

                // if (clipDetails && clipDetails.media && clipDetails.media.video && clipDetails.media.video[0] && clipDetails.media.video[0].url) {
                //     //  const mediaurlrespone  =   getContentToken(USER_UUID , id, selectedUserProfile.profileid,cid )



                //     const data = { data: { uuid: USER_UUID, id: id, device: device, action: 'getaccesstoken', profileid: selectedUserProfile.profileid, cid } }

                //     const res = await axios.post(API_URL, data);
                //     const configresp = res.data;
                //     if (configresp) {



                //         //  https://aptifun.com/media2/{accesstoken}/{useridentity}/34759463/hls/playlist.m3u8

                //         if (configresp && configresp.data && configresp.data.token) {

                //             var mediaurl = clipDetails.media.video[0].url
                //             // todo :  need logic for {useridentity} paramter 
                //             let url = mediaurl.replace("{accesstoken}", configresp.data.token).replace("{useridentity}", USER_UUID);



                //             customerUsageAction(attr_content_type, title)



                //             return { "videourl": url, "dwnid": configresp.data.did, "title": title }
                //             ///    setvideourl (url )
                //             //   setdownloadid(x.data.did)
                //             //   setShowLoading(false)

                //         } else {
                //             //  fail condition
                //         }


                //     } else {
                //         // fail condition
                //     }
                // }
// const gentokenUrl = `https://cms.chatakbox.com/api-admin/serve/gentoken.php?clientId=2&contentId=${clipDetails.id || id}&uuid=${USER_UUID}&deviceId=${device.id}&profileId=${selectedUserProfile.profileid}`;
// const gentokenUrl =  'https://cms.chatakbox.com/api-admin/serve/gentoken.php?clientId=2&contentId=97951147&uuid=n13y3-2b6a2-6c40b-95256&deviceId=21b5966407352693&profileId=1339'

let gentokenurl = GENTOKEN_URL;
gentokenurl = gentokenurl
  .replace("{clientId}", "2")
  .replace("{id}", String(clipDetails.id || id))
  .replace("{uuid}", USER_UUID)
  .replace("{deviceid}", device.id)
  .replace("{profileid}", String(selectedUserProfile.profileid));

const res = await axios.get(gentokenurl, {
  headers: {
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-App-Key": APP_KEY
  }
});

const result = res.data;

if (result && result.ok && result.masterPlaylistUrl) {
    customerUsageAction(attr_content_type, title)
    return { "videourl": result.masterPlaylistUrl, "dwnid": String(result.did), "title": title }
}


            } catch (error) {
            }



        } catch (err) {
            return { error: err.message };
        }

    }
}


const customerUsageAction = (attr_content_type: string, title: string) => {
    try {
      const sessionId = getSessionId(); 
      if (sessionId) {

        const response = customerUsage(getFormattedISODateTime(), USER_UUID, attr_content_type, title, sessionId);

        response.then(x => {
        });
      }
    } catch (error) {
    }
  };



/**
 * Android uses a native ExoPlayer activity (ActivityStarter).
 * iOS has no ActivityStarter module — open the RN videoplayer with the resolved URL.
 */
export const openResolvedVideoPlayer = (
  navobj: any,
  options: {
    videourl: string;
    title: string;
    dwnid: string | number;
    resume?: string | number;
    subtitleArray?: string;
    clipDetails?: any;
    seriesDetails?: any;
  }
) => {
  const {
    videourl,
    title,
    dwnid,
    resume = 0,
    subtitleArray = "",
    clipDetails,
    seriesDetails,
  } = options;

  if (Platform.OS === "android") {
    const { ActivityStarter } = NativeModules;
    if (ActivityStarter?.navigateToVideo) {
      const analyticsBase =
        (configData &&
          configData.data &&
          configData.data.config &&
          configData.data.config.videoanalytics) ||
        "";
      ActivityStarter.navigateToVideo(
        videourl,
        title,
        String(dwnid),
        String(resume),
        subtitleArray,
        analyticsBase + "?"
      );
      return;
    }
  }

  // Android uses ActivityStarter above. iOS opens RN videoplayer;
  // orientation is locked once inside VideoPlayerFullscreen.
  navobj.navigate("videoplayer", {
    intent: {
      clipDetails,
      seriesDetails,
      resolvedUrl: videourl,
      dwnid: String(dwnid),
      title,
      resume,
    },
  });
};

export const handleVideoPlay = (navobj: any, params: any, seriesdetails: any) => {



    var showPaywall = false;


    if (__DEV__) {
    }
    if (params && params.license == 1) {
        navobj.navigate("videoplayer", { intent: { clipDetails: params, seriesDetails: seriesdetails } });
        return
    }

    if (userPrivilages) {

        const activePrivilages = userPrivilages.active.contentgroup
        if (activePrivilages && activePrivilages.length > 0) {
            let hasContentAccess = false;
            for (let i = 0; i < activePrivilages.length; i++) {
                const vall = activePrivilages[i]
                if (params.contentgroup.includes(vall)) {
                    hasContentAccess = true;
                    break
                }
            }

            if (hasContentAccess) {
                navobj.navigate("videoplayer", { intent: { clipDetails: params, seriesDetails: seriesdetails } });
            } else {
                showPaywall = true
            }
        } else {
            showPaywall = true
        }

    } else {
        showPaywall = true
    }

    if (showPaywall) {

        const evenid = EventRegister.addEventListener(LOCAL_EVENTS.EVENT_SUBSCRIPTION, () => {
            onPaymentCallback()
        });

        const onPaymentCallback = () => {



            if (userPrivilages) {
                const activePrivilages = userPrivilages.active.contentgroup
                if (activePrivilages && activePrivilages.length > 0) {
                    let hasContentAccess = false;
                    for (let i = 0; i < activePrivilages.length; i++) {
                        const vall = activePrivilages[i]
                        if (params.contentgroup.includes(vall)) {
                            hasContentAccess = true;
                            break
                        }
                    }

                    if (hasContentAccess) {
                        navobj.replace("videoplayer", { intent: { clipDetails: params, seriesDetails: seriesdetails } });
                    } else {
                        navobj.goBack()
                    }
                } else {
                    navobj.goBack()
                }

            } else {
                navobj.goBack()
            }

            if (type(evenid) === 'string') {
                EventRegister.removeEventListener(evenid as string)
            }

        }



        navobj.navigate('PayWall', {
            intent: {
                url: configData.data.config.paywallurl, title: "Subscription",
                contentgroup: params.contentgroup
            }
        });
    }


}

export function showPayWall(navobj: any) {
    try {

        // const contentgrp = ["c3c"];
        const contentgrp = ["c2c"];


        const evenid = EventRegister.addEventListener(LOCAL_EVENTS.EVENT_SUBSCRIPTION, () => {
            onPaymentCallback()
        });

        const onPaymentCallback = () => {



            if (userPrivilages) {
                const activePrivilages = userPrivilages.active.contentgroup
                if (activePrivilages && activePrivilages.length > 0) {
                    let hasContentAccess = false;
                    for (let i = 0; i < activePrivilages.length; i++) {
                        const vall = activePrivilages[i]
                        if (contentgrp.includes(vall)) {
                            hasContentAccess = true;
                            break
                        }
                    }

                    if (hasContentAccess) {
                        navobj.goBack()
                    } else {
                        navobj.goBack()
                    }
                } else {
                    navobj.goBack()
                }

            } else {
                navobj.goBack()
            }

            if (type(evenid) === 'string') {
                EventRegister.removeEventListener(evenid as string)
            }

        }


        navobj.navigate('PayWall', {
            intent: {
                url: configData.data.config.paywallurl, title: "Subscription",
                contentgroup: contentgrp
            }
        });

    } catch (error) {
    }

}


export function isUserSubscribed(contentgrp: any) {
    try {
        if (userPrivilages && userPrivilages.active && userPrivilages.active.contentgroup) {
            const activePrivilages = userPrivilages.active.contentgroup
            if (activePrivilages && activePrivilages.length > 0) {
                let hasContentAccess = false;
                for (let i = 0; i < activePrivilages.length; i++) {
                    const vall = activePrivilages[i]
                    if (contentgrp.includes(vall)) {
                        hasContentAccess = true;
                        break
                    }
                }

                if (hasContentAccess) {
                    return true
                } else {
                    return false
                }
            } else {
                return false
            }

        } else {
            return false
        }
    } catch (error) {
        return false
    }
}


export function handleDeeplinkNavigation(navobj: any) {
    try {
        if (currDeeplinkParam) {
            const deeplinkparam = currDeeplinkParam
            setCurrDeeplinkParam(null)
            if (deeplinkparam)
            var temp = {}

            if (deeplinkparam.type == "auth") {
                return null;
            } 
            if (deeplinkparam.type == "shows") {
                temp.seriesId = deeplinkparam.id
            } else {
                temp.seriesId = "0"
                temp.ext_contentid = deeplinkparam.id
            }
            handleNavigation(navobj, temp)
        }


    } catch (error) {
    }
}


export const handleNavigation = (navobj: any, params: any) => {

    try {

        // if (params.seriesId != "0") {
        //     navobj.push("SeriesViewerAlt", { intent: params });
        // } else if (params.seriesId == "0") {
        //     navobj.push("PlaylistViewer", { intent: params });
        // }

        if (params.contenttype == "series") {
    navobj.push("SeriesViewerAlt", { intent: params });
} else if (params.contenttype == "videos") {
    navobj.push("PlaylistViewer", { intent: params });
} else if (params.seriesId != "0") {
    navobj.push("SeriesViewerAlt", { intent: params });
} else if (params.seriesId == "0") {
    navobj.push("PlaylistViewer", { intent: params });
}

    } catch (error) {
    }

}

export const setTokenExpiry =(token: any )=>{

    TOKEN_EXPIRY=token;
}

export const getTokenExpiry =()=>{

    return TOKEN_EXPIRY;
}


export const handleScreenTokenExpiry = (navobj: any) => {

    try {
        setTokenExpiry(true);
            navobj.reset({
                index: 0,  // Start stack at index 0
                routes: [{ name: "Login" }],  // New stack with only this screen
              })

    } catch (error) {
    }


}


export function removeEventListener(evenid: any) {
    if (type(evenid) === 'string') {
        EventRegister.removeEventListener(evenid as string)
    }
}

export function processWatchHistory(clipDetails: any) {

    try {
        var playedVideo = {}
        if (clipDetails != null || clipDetails != undefined) {
            if (getCurrentPlayingResumeVal() != "") {
                playedVideo.resume = getCurrentPlayingResumeVal()
                playedVideo.contentID = clipDetails.id
                playedVideo.seriesId = clipDetails.seriesId
                playedVideo.season = clipDetails.season
                playedVideo.episode = clipDetails.episode
                clipDetails.resume = getCurrentPlayingResumeVal()
                setCurrentPlayingResumeVal("0")
            }
            if (useractivityDetails && useractivityDetails?.watchhistory && useractivityDetails?.watchhistory.clips) {

                if (useractivityDetails?.watchhistory.clips.length > 0) {
                    const tempHistory = useractivityDetails?.watchhistory.clips
                    var remainingItems = []
                    remainingItems = tempHistory.filter(
                        (clip: any, index: number) => {
                            return clipDetails.id != clip.id
                        }
                    );

                    remainingItems.splice(0, 0, clipDetails);
                    useractivityDetails.watchhistory.clips = [...remainingItems]
                    EventRegister.emitEvent(LOCAL_EVENTS.EVENT_WATCHHISTORY_UPDATE_SCROLLER, playedVideo)

                } else {
                    useractivityDetails?.watchhistory.clips.push(clipDetails)
                    EventRegister.emitEvent(LOCAL_EVENTS.EVENT_WATCHHISTORY_UPDATE, playedVideo)

                }
                setCurrentPlayingVideo({})
            }
            else {
                const tempuseractivityDetails =
                {
                    "wishlist": {
                        "series": [],
                        "clips": []
                    },
                    "likes": [],
                    "watchhistory": {
                        "clips": [clipDetails]
                    }
                }
                setUseractivityDetails(tempuseractivityDetails)
                setCurrentPlayingVideo({})
                EventRegister.emitEvent(LOCAL_EVENTS.EVENT_WATCHHISTORY_UPDATE, playedVideo)
            }


        }
    } catch (error) {
    }
}

export const REELS_REGISTRY_KEY_PREFIX = 'reels_registry_';

export const getReelsRegistry = async (profileid: string) => {
  try {
    const key = `${REELS_REGISTRY_KEY_PREFIX}${profileid || 'default'}`;
    const registry = await getData(key);
    return registry || { seriesContexts: {} };
  } catch (error) {
    return { seriesContexts: {} };
  }
};

export const saveReelsRegistry = async (profileid: string, registry: any) => {
  try {
    const key = `${REELS_REGISTRY_KEY_PREFIX}${profileid || 'default'}`;
    await storeData(key, registry);
  } catch (error) {
    LogError('saveReelsRegistry error', error);
  }
};

export const markReelsWatched = async (seriesId: string, series: any, episodes: any[]) => {
  try {
    if (!series || !episodes || episodes.length === 0) {
      return;
    }
    const profileid = selectedUserProfile?.profileid || 'default';
    const registry = await getReelsRegistry(profileid);
    if (!registry.seriesContexts) {
      registry.seriesContexts = {};
    }
    const keys = new Set<string>();
    if (seriesId) {
      keys.add(seriesId);
    }
    if (series?.id) {
      keys.add(series.id);
    }
    episodes.forEach((ep: any) => {
      if (ep?.seriesId) {
        keys.add(ep.seriesId);
      }
    });
    keys.forEach((key) => {
      registry.seriesContexts[key] = { series, episodes };
    });
    await saveReelsRegistry(profileid, registry);
  } catch (error) {
    LogError('markReelsWatched error', error);
  }
};

export const openReelsIfReelsSourced = async (navigation: any, item: any) => {
  try {
    const id = item?.id;
    const seriesId = item?.seriesId || (item?.type === 'series' ? item?.id : null);
    if (!seriesId) {
      return false;
    }
    const profileid = selectedUserProfile?.profileid || 'default';
    const registry = await getReelsRegistry(profileid);
    const ctx = registry?.seriesContexts?.[seriesId];
    if (!ctx || !ctx.episodes || ctx.episodes.length === 0) {
      return false;
    }
    navigation.navigate('reelsplayer', {
      intent: { seriesId },
      startItemId: id,
    });
    return true;
  } catch (error) {
    LogError('openReelsIfReelsSourced error', error);
    return false;
  }
};

export function setCacheData(contentData: any) {
    try {
        if (contentData != null || contentData != undefined) {
            cacheData = JSON.parse(JSON.stringify(contentData))
        }
    } catch (error) {

    }

}



export function checkAppUpgrade(configResp: any) {
    try {
        const upgradeValue = configResp?.data?.upgrade;
        const dlink = configResp?.data?.dlink;

        EventRegister.emitEvent(LOCAL_EVENTS.EVENT_UPGRADE_AVAILABLE, {})
        return { upgradeValue, dlink };

    } catch (error) {
    }
}

export function removeExtension(param: String) {
    try {
        return param.replace(/\.[^/.]+$/, "")
        // return param.split(".")[0]
    } catch (error) {
        return param
    }
}

function formatLogParam(param: unknown): string {
    if (typeof param === 'string') {
        return param;
    }
    if (param instanceof Error) {
        return param.stack ?? param.message;
    }
    try {
        return JSON.stringify(param, null, 2);
    } catch {
        return String(param);
    }
}

export function LogData(tag: string, param: unknown) {
    if (__DEV__) {
        console.log(`[${tag}]`, formatLogParam(param));
    }
}

export function LogError(tag: string, param: unknown) {
    if (__DEV__) {
        console.error(`[${tag}]`, formatLogParam(param));
    }
}

export function isInActiveUser(contentgrp: any) {
    try {
        if (contentgrp && userPrivilages && userPrivilages.inactive && userPrivilages.inactive.contentgroup) {
            const inActivePrivilages = userPrivilages.inactive.contentgroup
            if (inActivePrivilages && inActivePrivilages.length > 0) {
                return true
            } else {
                return false
                // navobj.goBack()
            }

        } else {
            return false
        }
    } catch (error) {

        return false
    }
}

export const ERROR_CODES = {
    NETWORK_ERROR_CODE: 400
}

export const ERROR_MESSAGES = {
    NETWORK_ERROR_MESSAGE: "Network Error"
}



export const getFormattedISODateTime = () => {
    const now = new Date();
  
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0'); 
  
    // Combine into the ISO format with 'T' and 'Z'
    return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  };

let sessionId: string | null = null; // Store the session ID


export const generateSessionId = (): string => {
    if (!sessionId) { // Check if sessionId has already been generated
      const timestamp = Date.now(); // Current timestamp in milliseconds
      const randomPart = Math.floor(Math.random() * 1000000); // Random number between 0-999999
      sessionId = `${timestamp}-${randomPart}`; // Store session ID globally
    } else {
    }
    return sessionId;
  };
  
  // Function to retrieve the session ID
  export const getSessionId = (): string | null => {
    return sessionId; // Return the stored session ID
  };


  export async function checkTokenExpiry(): Promise<boolean> {
    if (!userProfiles?.token_expiry) return true; 


    
    const tokenExpiry = userProfiles.token_expiry;
    const currentTime = Math.floor(Date.now() / 1000); 

    const daysLeft = Math.floor((tokenExpiry - currentTime) / (60 * 60 * 24));


    const alreadyEmitted = await AsyncStorage.getItem("tokenExpiredEvent") === "true";

    if (daysLeft <= 0) {
        if (!alreadyEmitted) {
            EventRegister.emitEvent(LOCAL_EVENTS.EVENT_CHANGE_SCREEN, {});
            AsyncStorage.setItem("tokenExpiredEvent", "true"); 
        }
        return false;
    }

    AsyncStorage.removeItem("tokenExpiredEvent"); 
    return true;
}


export function shouldShowPaywall(): boolean {
  const isSubscribed = isUserSubscribed(global_content_group);
  const isInactive = isInActiveUser(global_content_group);
  return !(isSubscribed || isInactive);
}
 








//"http://139.59.180.162/aptifun/cms/tests/generatejson.php"



// === REQUEST ===> {
//   "url": "https://cms.chatakbox.com/api-admin/serve/gentoken.php?clientId=2&contentId=25725932&uuid=b75mj-m76a3-181d1-3ce4c&deviceId=21b5966407352693&profileId=1377",
//   "method": "get",
//   "headers": {
//     "Accept": "application/json, text/plain, */*",
//     "Content-Type": "application/json",
//     "X-App-Key": "4ToUgfHmqmzqoirt88RE4xXGSzgdgrb",
//     "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3ODE2MzQwNzUsImlzcyI6InZicyIsIm5iZiI6MTc4MTYzNDA3NSwiZXhwIjoxNzg5NDEwMDc1LCJpZCI6ImU0YmI2OGZhNGYzOWIyODQ5ZDQxODhlMmVjNWUxMmRkMjhjMjg3MTlhOGQyZTBkZWRiYzkxYTkxNGU1MWU4NjEifQ._Jdsr22i-vq8i1cwMOGkuHa0GYSQTcg71ob1cvKe2UA"
//   }
// }



// == REQUEST ===> {
//   "url": "https://cms.chatakbox.com/api-admin/serve/gentoken.php?clientId=2&contentId=25725932&uuid=n7hya-rp6a2-2dd9e-3b417&deviceId=21b5966407352693&profileId=1330",
//   "method": "get",
//   "headers": {
//     "Accept": "application/json, text/plain, */*",
//     "Content-Type": "application/json",
//     "X-App-Key": "4ToUgfHmqmzqoirt88RE4xXGSzgdgrb",
//     "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3ODE2MzQxNjQsImlzcyI6InZicyIsIm5iZiI6MTc4MTYzNDE2NCwiZXhwIjoxNzg5NDEwMTY0LCJpZCI6Ijc0MTMxOTU2N2RiZmI0ZGY0NGU5NGE3YThkOTNkYzljZWE2NzBlZTZjNWVmYzliNmVmNWEwYTg0ODAxOGIyNDAifQ.08_fHe_IqxGaWPVuyddgz36bIdBDIlYPHnvguFyDyCQ"
//   }
// }
// App.tsx:340 <=== RESPONSE === {
//   "url": "https://cms.chatakbox.com/api-admin/serve/gentoken.php?clientId=2&contentId=25725932&uuid=n7hya-rp6a2-2dd9e-3b417&deviceId=21b5966407352693&profileId=1330",
//   "status": 200,
//   "data": {
//     "ok": true,
//     "token": "eyJ1aWQiOjIsImNpZCI6IjI1NzI1OTMyIiwiZGlkIjozNzAyLCJleHAiOjE3ODE2Mzc3NzN9.BnTZy_YUP0L6CoI3tXP9qDFE6H15V01DYLwIDtURYDo",
//     "clientId": 2,
//     "contentId": "25725932",
//     "did": 3702,
//     "iAfUserID": 634,
//     "profileId": 1330,
//     "deviceId": "21b5966407352693",
//     "accessToken": "eyJ1aWQiOjIsImNvbnRlbnRJZCI6IjI1NzI1OTMyIiwiZXhwIjoxNzgxNjQ0OTczLCJ1dWlkIjoibjdoeWEtcnA2YTItMmRkOWUtM2I0MTcifQ.gS-kecL7e1EF8fNUq0cr2lzyMNUKY5_1d6jFVRNvKt4",
//     "expiresAt": "2026-06-16T21:22:53+00:00",
//     "expiresIn": 10800,
//     "masterPlaylistUrl": "https://cms.chatakbox.com/api-admin/serve/vdodeliver.php?token=eyJ1aWQiOjIsImNvbnRlbnRJZCI6IjI1NzI1OTMyIiwiZXhwIjoxNzgxNjQ0OTczLCJ1dWlkIjoibjdoeWEtcnA2YTItMmRkOWUtM2I0MTcifQ.gS-kecL7e1EF8fNUq0cr2lzyMNUKY5_1d6jFVRNvKt4&file=playlist.m3u8",
//     "deliverBaseUrl": "https://cms.chatakbox.com/api-admin/serve/vdodeliver.php?token=eyJ1aWQiOjIsImNvbnRlbnRJZCI6IjI1NzI1OTMyIiwiZXhwIjoxNzgxNjQ0OTczLCJ1dWlkIjoibjdoeWEtcnA2YTItMmRkOWUtM2I0MTcifQ.gS-kecL7e1EF8fNUq0cr2lzyMNUKY5_1d6jFVRNvKt4"
//   }
// }