import React, {useCallback, useEffect, useState} from 'react';
import GridView from '../ui_components/widgets/GridContainer';
import LoadingSpinner from '../ui_components/widgets/LoadingSpinner';
import BrandView from '../ui_components/widgets/ListCardPrimary';
import EmptyState from '../ui_components/widgets/EmptyState';
import { useNavigation } from '@react-navigation/native';
import { getHomeContent } from '../state_mgmt/AppCommonSlice';
import { ContentData, ContentResponse } from '../data_models/ContentDataTypes';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ContentScroller from '../ui_components/widgets/ContentScroller';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../state_mgmt/ReduxStore';
import { FlashList } from '@shopify/flash-list';
import HorizontalScrollMenu, { RouteProps } from '@nyashanziramasanga/react-native-horizontal-scroll-menu';
import LayoutVariantA from '../ui_components/widgets/LayoutVariantA';
import LayoutVariantBTv from './LayoutVariantBTv';
import { handleNavigation, LogError } from '../app_config/AppConstants';

function HomeContentTv(/*{navigation}: {navigation: any}*/) {

  
  const navigation: any = useNavigation();
  const [status, setStatus] = useState('idle');
  const[contentList,setContentList] = useState<ContentData[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const dispatch = useDispatch<any>();
  const count = useSelector((state : any  )=> state.count);
 // const { configdata, status } = config;

 const handleContainerPress = (index : any) => {
    const itemclicked = contentList[index]
   handleNavigation ( navigation, itemclicked)    
};

  useEffect(() => {
    let isMounted = true;
    try {
      if (status === 'idle') {
          setStatus("loading");
          const content =   getHomeContent(null);
          content.then(x =>{
            try {
              setContentList(x.data)
              setStatus("successful");
            } catch (error) {
              LogError("HomeContentTv getHomeContent catch inside",error)                                
            }
          })
      }
    } catch (error) {
      LogError("HomeContentTv getHomeContent catch outside",error)                           
    }
    return () => {
      isMounted = false;
    };
  }, [status]);

  const onItemSelected = (brand : any ) =>{
    navigation.navigate("")
  }
   
  const handleTabPress = (index: number) => {
      setActiveTab(index);
    };
    


  const getlistrender =  ({ item ,index}: any) => {

    if (item.container == "scroller"){
      return (
        <View  style = {{backgroundColor:'#111111'}} >
        <Text   style = {styles.text}>
           { item.title + ""}
         </Text>
  
        {item.list && <ContentScroller prop = {item.list} imgratio = {{ imgper : item.imgper,imghratio : item.imghratio , imgwratio:item.imgwratio }} ></ContentScroller> }
        {item.clips && <ContentScroller prop = {item.clips}   imgratio = {{ imgper : item.imgper,imghratio : item.imghratio , imgwratio:item.imgwratio }}></ContentScroller> }
        </View>
      )
    } else if (item.container == "item") {

      if (item.rendertype == "37"){
        return (
          <View  style = {{backgroundColor:'#111111'}} >
         <LayoutVariantA  
         listIndex = {index}
          onClick = {handleContainerPress}
          image = {item.thumbnail}  imgratio = {{ imgper : item.imgper,imghratio : item.imghratio , imgwratio:item.imgwratio }}   />
    
          </View>
        )
      } 
      else if (item.rendertype == "38"){
        return (
          <View  style = {{backgroundColor:'#111111'}} >
         <LayoutVariantBTv
          listIndex = {index}
           onClick = {handleContainerPress}
         image = {item.thumbnail}   imgratio = {{ imgper : item.imgper,imghratio : item.imghratio , imgwratio:item.imgwratio }} />
    
          </View>
        )
      } else {
        return null
      }
  
    
    } else {
      return null
    }


 
  
  }

  
 const [selectedIndex, setSelectedIndex] = useState(1);

 const NavigationTabs = [
   {
    id: 122,
     key: 0,
     name: 'Tab1',
   },
   {
    id: 123,
    key: 1,
     name: 'Tab2',
   },
   {
    id: 124,
    key: 2,
     name: 'Tab3',
   },
   {
    id: 125,
    key: 3,
     name: 'Tab4',
   },
   {
    id: 126,
    key: 4,
     name: 'Tab5',
   },
   {
    id: 127,
    key: 5,
     name: 'Tab6',
   },
   {
    id: 128,
    key: 6,
     name: 'Tab7',
   },
 ];

const onPress = (route: RouteProps) => {
   setSelectedIndex(route.id);
 };


  const getContent = () => {
    return (
      <SafeAreaView style={{ flex:1 , backgroundColor:'#111' }}>
 <TouchableOpacity 
                      key={1111}
                      
                      style={{ paddingHorizontal:3,paddingVertical:1 ,backgroundColor:'#111111',
                           
                        }}
                                          
                      ></TouchableOpacity>
<SafeAreaView >

            <View style={styles.scrollView}>

                { NavigationTabs.map((item, index) => {
                    return (
                    
                      <View  
                       key={item.id+index}
                      style={[
                        styles.tabText,
                        { backgroundColor: activeTab === index ? '#ffffff' : '#111111' },
                      ]}
                    >
                      <Text 
                      key={index+item.key}
                      
                      style={{ color: activeTab === index ? '#000000' : '#fff' ,paddingHorizontal:14,paddingVertical:10  }}
                      
                      onPress={() => handleTabPress(index)}
                      >{item.name}</Text>
                   
                   </View>
                    );
                })  }
                
            </View>
            </SafeAreaView> 


     { /*  <View style={styles.tabContainer}>
          <FlatList
           
            style={styles.toptabs}
            horizontal
            data={contentList}
            
            keyExtractor={(item:any,index :any ) =>  item.title + index}
            renderItem={({ item, index }) => (
              <View  
                
                style={[
                  styles.tabText,
                  { backgroundColor: activeTab === index ? '#ffffff' : '#111111' },
                ]}
              >
                <Text 
                  onPress={() => handleTabPress(index)}
                style={{ color: activeTab === index ? '#000' : '#fff' }}>{item.title}</Text>
              </View>
            )}
          />
        </View>

              */ }

      
      <FlashList
       
        estimatedItemSize={200}           
        data={contentList}
        renderItem={          
          getlistrender         
          
        }
      />
      
      </SafeAreaView>
      
    );
  };

  return (
    <>
      {status === 'loading' && <LoadingSpinner />}
      {status === 'failed' && <EmptyState />}
      {status === 'successful' && getContent()}
    </>
  );
}

const styles = StyleSheet.create ({
  scrollView: {
    flexDirection:'row',
    
    backgroundColor:'#111111',
    height: undefined,
},
  tabContainer:{
    backgroundColor:'#111111'
  },
  toptabs: {
    // backgroundColor : '#111111',
     flexGrow: 0 ,
     height : 50,
     alignContent: 'center',
     
  },
  text: {
     marginVertical : 2, 
     marginLeft :5,
     color: '#FFFFFF',         
     backgroundColor:'#111111',
     fontSize:14,
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
    marginHorizontal: 5,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    
    borderRadius: 20,

  }
});

export default HomeContentTv;