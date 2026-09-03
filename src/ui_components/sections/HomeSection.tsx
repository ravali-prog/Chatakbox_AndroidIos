import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeItem from '../content/HomeItemCard';
import ContentDetails from '../content/ContentDetailView';
import ContentListing from '../content/ContentListView';
import SearchScreen from '../content/SearchInterface'

const Stack = createNativeStackNavigator();

const Home = () => {
  return (
    /*<Stack.Navigator
      initialRouteName={`HomeItem`}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="HomeItem" component={HomeItem} />
      <Stack.Screen name="contentdetails" component={ContentDetails} />
      <Stack.Screen name="contentlisting" component={ContentListing} />
      
      <Stack.Screen name="searchscreen" component={SearchScreen} />

    </Stack.Navigator> */
    <HomeItem></HomeItem>
  );
};

export default Home;
