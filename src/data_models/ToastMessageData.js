import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EventRegister } from 'react-native-event-listeners';
import { LOCAL_EVENTS } from '../app_config/AppConstants';
 
export var toastMsg = ""
 
 export function setToastmsg(message) {
  toastMsg=message;  
};
 
const ToastMessage = ({ }) => {
  const [visible, setVisible] = useState(false);
 
  useEffect(() => {
 
   
    const evenid =  EventRegister.addEventListener(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE , (param) => {
        setToastmsg(param.msg)
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            clearTimeout(timer)
          }, 3000);
     
    });
   // return () => clearTimeout(timer);
   
 
  }, []);
 
  return (
    <>
    {visible && (
    <View style={[styles.toastContainer]}>
    <Text style={styles.toastMessage}>{toastMsg}</Text>
  </View>)
    }
    </>
  );
};
 
const styles = StyleSheet.create({
    toastContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginLeft:'auto',
        marginRight:'auto',
        alignSelf:'center',
        borderRadius: 20,
        backgroundColor: '#E9ECEF',
      },
      toastMessage: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
        textAlign: 'center',
      },
});
 
export default ToastMessage;