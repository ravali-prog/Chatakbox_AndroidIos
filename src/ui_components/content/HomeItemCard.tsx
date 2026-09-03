import React, {useCallback, useEffect, useRef, useState} from 'react';
import GridContainer from '../widgets/GridContainer';
import LoadingSpinner from '../widgets/LoadingSpinner';
import BrandView from '../widgets/ListCardPrimary';
import EmptyState from '../widgets/EmptyState';
import { useNavigation } from '@react-navigation/native';
import { getHomeContent, getTabs} from '../../state_mgmt/AppCommonSlice';
import { ContentData, ContentResponse } from '../../data_models/ContentDataTypes';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ContentScroller from '../widgets/ContentScroller';
import { useDispatch, useSelector } from 'react-redux';
//import { store } from '../../state_mgmt/ReduxStore';
import { FlashList } from '@shopify/flash-list';
import HorizontalScrollMenu, { RouteProps } from '@nyashanziramasanga/react-native-horizontal-scroll-menu';
import LayoutVariantA from '../widgets/LayoutVariantA';
import LayoutVariantB from '../widgets/LayoutVariantB';
import { LOCAL_EVENTS, LogError, USER_UUID, global_content_group, handleNavigation, isUserSubscribed, openReelsIfReelsSourced, removeEventListener, selectedUserProfile, setCacheData, showPayWall, useractivityDetails } from '../../app_config/AppConstants';
import { EventRegister } from 'react-native-event-listeners';
import { APP_EVENTS_ } from '../../app_config/AnalyticsConfig';
import Layout5 from '../widgets/LayoutImageOnly';
import Layout32 from '../widgets/LayoutImageWithText';
import { colors } from '../../theming/colors';
import LinearGradient from 'react-native-linear-gradient';
// import getlistrender from './ListRenderer';

var  selectedTab = 0;
var  selectedTabID = -1;
var  selectedTabName = "";
var  counterr = 0;

function HomeItem(/*{navigation}: {navigation: any}*/) {

  const navigation: any = useNavigation();
  const [status, setStatus] = useState('idle');
  const[contentList,setContentList] = useState<ContentData[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshHIstory, setRefreshHIstory] = useState(0);

  
  const [selectedIndex, setSelectedIndex] = useState(1);

  const [NavigationTabs, setNavigationTabs] = useState<any>([]);
 
  const stateRef = useRef();
  stateRef.current = NavigationTabs

  //const dispatch = useDispatch<any>();
 // const count = useSelector((state : any  )=> state.count);
 // const { configdata, status } = config;

 const handleContainerPress = (index : any) => {
    const itemclicked = contentList[index]
    handleItemPress(itemclicked)
};

const isMiniSeriesContent = (ct: any) =>
    typeof ct === 'string' && ct.toLowerCase().replace(/\s+/g, '') === 'miniseries';

const handleItemPress = (item: any, parent?: any) => {
    const itemIsMini = isMiniSeriesContent(item && item.contenttype);
    const parentIsMini = isMiniSeriesContent(parent && parent.contenttype);
    if (itemIsMini || parentIsMini) {
        const source =
            item && item.clips && item.clips.length > 0 ? item : parent;
        if (source && source.clips && source.clips.length > 0) {
            handleReelsPress(source, item);
        }
        return;
    }
    openReelsIfReelsSourced(navigation, item).then((opened: boolean) => {
        if (!opened) {
            handleNavigation(navigation, item);
        }
    });
};

const handleReelsPress = (item: any, tappedItem?: any) => {
    try {
        const clips = (item && item.clips) || [];
        if (clips.length === 0) {
            return;
        }
        const seriesId =
            item.seriesId ||
            item.id ||
            (tappedItem && tappedItem.seriesId) ||
            (clips[0] && clips[0].seriesId);
        if (!seriesId) {
            return;
        }
        navigation.navigate('reelsplayer', {
            intent: { seriesId },
            startItemId: (tappedItem && tappedItem.id) || (clips[0] && clips[0].id),
        });
    } catch (error) {
        LogError("HomeContent handleReelsPress catch error", error);
    }
};

useEffect(()=>{
    const evenid =  EventRegister.addEventListener(LOCAL_EVENTS.EVENT_WATCHHISTORY_UPDATE, () => {
      //if (selectedTab == 0) 
      {
        counterr++
        //setRefreshHIstory(counterr++)
      // contentList[1].clips =  useractivityDetails?.watchhistory.clips
      // setContentList([...contentList])
      }
  });
},[])

useEffect(() => {



},[refreshHIstory])


useEffect(() => {

  selectedTab = activeTab
  //setActiveTab(activeTab)
  if (NavigationTabs && NavigationTabs.length>0) {
   

     //  if (NavigationTabs[activeTab].pageid == "subscribe" ) {
     //   showPayWall(navigation)
     //   return
     //  }

       selectedTabID = NavigationTabs[activeTab].pageid
       selectedTabName = NavigationTabs[activeTab].name
       fetchContent(NavigationTabs[activeTab].pageid)
  }
  

},[activeTab])

  useEffect(() => {
    let isMounted = true;
    if (status === 'idle') {
        setStatus("loading");
        fetchTabs()
       
    }
    
    
    return () => {
      isMounted = false;
    };
  }, [status]);


  function updateNavTabs(){
    try {


        if (isUserSubscribed(global_content_group)) {
            const allitems =  stateRef.current
            if (allitems.length == 4){
                allitems.pop()
                const newitems = allitems
                setNavigationTabs([...newitems])
            }
        } else {
          const allitems =  stateRef.current
          if (allitems.length == 3) {
            //  allitems.push({pageid : "subscribe" ,name:"Subscribe" })
              setNavigationTabs([...allitems])
          }
        }
      
    } catch (error) {
    }
  }

  //var profileEvenId :string|Boolean = "";

  useEffect(() => {

    const unsubscribe = navigation.addListener('focus', (obj:any) => {
      if (selectedTab == 0 && counterr!=0) {
        //  contentList[1].clips = [...useractivityDetails?.watchhistory.clips]
         
         //setContentList([])
         //setContentList([...contentList])
         counterr = 0;
         fetchContent(selectedTabID)
      }
      updateNavTabs()
    });



    return () => {
      unsubscribe()
    }
  }, [])


  function fetchTabs () {
    try {
      const tabsdata =  getTabs(USER_UUID,selectedUserProfile.profileid);
    tabsdata.then (x=>{
      try {
       if (x && x.data) {

           setNavigationTabs([...x.data]) 
          selectedTabID = x.data[0].pageid
          selectedTabName = x.data[0].name
           fetchContent(x.data[0].pageid)
          } else {
           setStatus("failed");
          }
      } catch (error) {
        LogError("HomeContent fetchTabs getTabs inside catch error",error)
      }
     
    })  
    } catch (error) {
      LogError("HomeContent fetchTabs getTabs outside catch error",error)

    }
  
  }

  const fetchContent = (pageid:number) => {
    try {     

      try {
        APP_EVENTS_.content_view_list(selectedTabName)
       } catch (error) {
     
       }
  
  
  

    setStatus("loading");
    
    const content =   getHomeContent(pageid);
    content.then(x =>{

      try {
        if (x && x.data) {
  
        
       
          if (activeTab == 0) {
            var  watchhistoryitem = null
             if (useractivityDetails && useractivityDetails?.watchhistory  && useractivityDetails?.watchhistory.clips && useractivityDetails?.watchhistory.clips.length>0){
                watchhistoryitem = {container:'scroller',title:"Continue Watching" , clips :useractivityDetails?.watchhistory.clips ,
               imgper : 60,imghratio : 9 , imgwratio:16, isHistory:true}  
       
       
             }
       
             if (watchhistoryitem!=null) {
                 x.data.splice(1, 0, watchhistoryitem);
                 //x.data.splice(2, 0, watchhistoryitem);
             }
           }
       
              //setContentList([watchhistoryitem , ...x.data])
              setContentList(x.data)
       
              setCacheData(x.data) // cache the data 
          
              setStatus("successful");
           } else {
             setStatus("failed");
           }
         
      } catch (error) {
        LogError("HomeContent fetchContent getHomeContent inside catch error",error)
      }
     
     
    })

  
      
    } catch (error) {
      LogError("HomeContent fetchContent getHomeContent outside catch error",error)
    }
  }

  const onItemSelected = (brand : any ) =>{
    navigation.navigate("")
  }
   
  const handleTabPress = (index: number) => {
      setActiveTab(index);

    };
    
  

//   const getlistrender =  ({ item ,index}: any) => {

//     if (item.container == "scroller"){
//       return (
//         <View  style = {{backgroundColor:'#000000'}} >
//         <Text   style = {styles.text}>
//            { item.title + ""}
//          </Text>
  
//         {item.list && <ContentScroller prop = {item.list} isHistory= {item.isHistory}   imgratio = {{ imgper : item.imgper,imghratio : item.imghratio , imgwratio:item.imgwratio }} ></ContentScroller> }
//         {item.clips && <ContentScroller prop = {item.clips} isHistory= {item.isHistory}    imgratio = {{ imgper : item.imgper, imghratio : item.imghratio , imgwratio:item.imgwratio }}></ContentScroller> }
//         </View>
//       )
//     } else if (item.container == "item") {

//       if (item.rendertype == "37") {
//         return (
//           <View  style = {{backgroundColor:'#000000'}} >
//          <LayoutVariantA  
//          listIndex = {index}
//           onClick = {handleContainerPress}
//           image = {item.thumbnail}  imgratio = {{ imgper : item.imgper,imghratio : item.imghratio , imgwratio:item.imgwratio }}   />
    
//           </View>
//         )
//       } 
//       else if (item.rendertype == "38") {
//         return (
//           <View  style = {{backgroundColor:'#000000'}} >
//          <LayoutVariantB 
//           listIndex = {index}
//           dataitem = {{"genre": item.genre, "lang":item.lang, "certificate":item.certificate}}
//            onClick = {handleContainerPress}

//            image = {item.thumbnail}   imgratio = {{ imgper : item.imgper,imghratio : item.imghratio , imgwratio:item.imgwratio }} />
    
//           </View>
//         )
//       } 
//          else if (item.rendertype == "5") {
//         return (
//           <View style={{ backgroundColor: '#000000' }}>
//             <Layout5
//               listIndex={index}
//               onClick={handleContainerPress}
//               image={item.thumbnail}
//               imgratio={{ imgper: item.imgper, imghratio: item.imghratio, imgwratio: item.imgwratio }}
//             />
//           </View>
//         )
//       }
//       else if (item.rendertype == "32") {
//   return (
//     <View style={{ backgroundColor: '#000000' }}>
//       <Layout32
//         listIndex={index}
//         onClick={handleContainerPress}
//         image={item.thumbnail}
//         text={item.itemHighLightText || item.title}
//         imgratio={{ imgper: item.imgper, imghratio: item.imghratio, imgwratio: item.imgwratio }}
//       />
//     </View>
//   )
// }
//       else {
//         return null
//       }
  
    
//     } else {
//       return null
//     }
  
//   }

const getlistrender =  ({ item ,index}: any) => {

    if (item.container == "scroller"){
      return (
        <View  style = {{backgroundColor:'#000000'}} >
        <Text   style = {styles.text}>
           { item.title + ""}
         </Text>
  
        {item.list && <ContentScroller prop = {item.list} isHistory= {item.isHistory} rendertype={item.rendertype}  imgratio = {{ imgper : item.imgper,imghratio : item.imghratio , imgwratio:item.imgwratio }} onItemPress={(listItem) => handleItemPress(listItem, item)}></ContentScroller> }
        {item.clips && <ContentScroller prop = {item.clips} isHistory= {item.isHistory} rendertype={item.rendertype}   imgratio = {{ imgper : item.imgper, imghratio : item.imghratio , imgwratio:item.imgwratio }} onItemPress={(clip) => handleItemPress(clip, item)}></ContentScroller> }
        </View>
      )
    } else if (item.container == "item") {

      if (item.rendertype == "37") {
        return (
          <View  style = {{backgroundColor:'#000000'}} >
         <LayoutVariantA  
         listIndex = {index}
          onClick = {handleContainerPress}
          image = {item.thumbnail}  imgratio = {{ imgper : item.imgper,imghratio : item.imghratio , imgwratio:item.imgwratio }}   />
    
          </View>
        )
      } 
      else if (item.rendertype == "38") {
        return (
          <View  style = {{backgroundColor:'#000000'}} >
         <LayoutVariantB 
          listIndex = {index}
          dataitem = {{"genre": item.genre, "lang":item.lang, "certificate":item.certificate}}
           onClick = {handleContainerPress}

           image = {item.thumbnail}   imgratio = {{ imgper : item.imgper,imghratio : item.imghratio , imgwratio:item.imgwratio }} />
    
          </View>
        )
      } 
         else if (item.rendertype == "5") {
        return (
          <View style={{ backgroundColor: '#000000' }}>
            <Layout5
              listIndex={index}
              onClick={handleContainerPress}
              image={item.thumbnail}
              imgratio={{ imgper: item.imgper, imghratio: item.imghratio, imgwratio: item.imgwratio }}
            />
          </View>
        )
      }
      else if (item.rendertype == "32") {
        return (
          <View style={{ backgroundColor: '#000000' }}>
            <Layout32
              listIndex={index}
              onClick={handleContainerPress}
              image={item.thumbnail}
              text={item.itemHighLightText || item.title}
              imgratio={{ imgper: item.imgper, imghratio: item.imghratio, imgwratio: item.imgwratio }}
            />
          </View>
        )
      }
      else {
        return null
      }

    
    } else {
      return null
    }
  
  }

const onPress = (route: RouteProps) => {
   setSelectedIndex(route.id);
 };


  const getContent = () => {
    return (
      <SafeAreaView style={{ flex:1 , backgroundColor:'#000000' }}>

      
      <FlatList    
        data={contentList}
        renderItem={          
          getlistrender         
          
        }
        initialNumToRender={5}
      />
      
      </SafeAreaView>
      
    );
  };

  const onRetryClick =  ()=> {
      fetchTabs()
  }


//   return (
//     <View style={{backgroundColor:"#000000",flex:1}} >
//     <SafeAreaView >

// <ScrollView 
// horizontal
// style={styles.scrollView}
// >

 

//         { NavigationTabs.map((item:any, index:number) => {
//         return (
//           activeTab === index ? (
//             <LinearGradient
//               key={item.pageid+index}
//               colors={colors.gradients.primaryButton}
//               start={{x: 0, y: 0}}
//               end={{x: 1, y: 0}}
//               style={[styles.tabText, { borderRadius: 6 }]}
//             >
//               <Text
//                 key={index+item.key}
//                 style={{ color: '#fff', paddingHorizontal: 14, paddingVertical: 8 }}
//                 onPress={() => handleTabPress(index)}
//               >
//                 {item.name}
//               </Text>
//             </LinearGradient>
//           ) : (
//             <View
//               key={item.pageid+index}
//               style={[
//                 styles.tabText,
//                 { backgroundColor: colors.background_surface },
//               ]}
//             >
//               <Text
//                 key={index+item.key}
//                 style={{ color: '#fff', paddingHorizontal: 14, paddingVertical: 8 }}
//                 onPress={() => handleTabPress(index)}
//               >
//                 {item.name}
//               </Text>
//             </View>
//           )
//         );
//     })}
    
// </ScrollView>
// </SafeAreaView> 
//       {status === 'loading' && <LoadingSpinner  ></LoadingSpinner>}
//       {status === 'failed' && <EmptyState   onRetryClick={onRetryClick} />}
//       {status === 'successful' && getContent()}
//     </View>
//   );


return (
  <View style={{backgroundColor:"#000000",flex:1}} >
    {NavigationTabs.length > 1 && (
      <SafeAreaView>
        <ScrollView horizontal style={styles.scrollView}>
          {NavigationTabs.map((item:any, index:number) => {
            return (
              activeTab === index ? (
                <LinearGradient
                  key={item.pageid+index}
                  colors={colors.gradients.primaryButton}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={[styles.tabText, { borderRadius: 6 }]}
                >
                  <Text
                    key={index+item.key}
                    style={{ color: '#fff', paddingHorizontal: 14, paddingVertical: 8 }}
                    onPress={() => handleTabPress(index)}
                  >
                    {item.name}
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  key={item.pageid+index}
                  style={[
                    styles.tabText,
                    { backgroundColor: colors.background_surface },
                  ]}
                >
                  <Text
                    key={index+item.key}
                    style={{ color: '#fff', paddingHorizontal: 14, paddingVertical: 8 }}
                    onPress={() => handleTabPress(index)}
                  >
                    {item.name}
                  </Text>
                </View>
              )
            );
          })}
        </ScrollView>
      </SafeAreaView>
    )}
    {status === 'loading' && <LoadingSpinner></LoadingSpinner>}
    {status === 'failed' && <EmptyState onRetryClick={onRetryClick} />}
    {status === 'successful' && getContent()}
  </View>
);
}

const styles = StyleSheet.create ({
  scrollView: {
    flexDirection:'row',
    marginLeft : 10,
    backgroundColor:'#000000',
    height: undefined,
},
  tabContainer:{
    backgroundColor:'#000000'
  },
  toptabs: {
    // backgroundColor : '#111111',
     flexGrow: 0 ,
     height : 50,
     alignContent: 'center',
     
  },
  text: {
     marginBottom : 6, 
     marginLeft :5,
     color: '#FFFFFF',         
     backgroundColor:'#000000',
     fontSize:16,
     fontWeight : 'bold'
  },

  tabText : {
  /*  marginVertical:20,
    marginHorizontal : 10,
    color: '#41cdf4',     
    alignContent: 'center',
    justifyContent :'center',
    height: 40,
    textAlign: 'center', 
    flex:1,
    verticalAlign : 'middle'*/


    // backgroundColor: '#f9c2ff',
    backgroundColor: '#ffffff',
    color: '#000',
    marginVertical: 5,
    marginHorizontal: 3,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    
    borderRadius: 6,

  }
});

export default HomeItem;