import React, {useRef,useState,useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image
} from 'react-native';
import {WebView} from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';

const OttWebView = ({route}) => {

  const navigation = useNavigation();
  const [url, seturl] = useState("");
  const [title, setTitle] = useState("");

  const {intent} = route.params;
  
    
  useEffect(() => {
    seturl(intent.url)
    setTitle(intent.title)
  }, [route]);

  function onMessage(data) {
    alert(data.nativeEvent.data);
  }

  function sendDataToWebView() {
    webviewRef.current.postMessage('Data from React Native App');
  }

  const handleBackPress = () => {
     navigation.goBack();
  };

  const webviewRef = useRef();

  return (
    <SafeAreaView style={{flex: 1}}>
         <View style={styles.header}>
        
        <Text style={styles.headerText}>{title}</Text>
        <TouchableOpacity activeOpacity={0.9} onPress={handleBackPress}
         style={{position:'absolute', left:0, justifyContent:'center', alignItems:'center',width:50,height:50 }} >
          <Image
            source={require('../../../app_assets/symbols/sym_06.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      </View>
      <WebView
        ref={webviewRef}
        scalesPageToFit={false}
        mixedContentMode="compatibility"
        onMessage={onMessage}

        source={{uri:url}}

      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height:56,
    backgroundColor: '#000000',
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    position:'absolute',
    left:0,
    right:0
  }
  ,
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default OttWebView;

