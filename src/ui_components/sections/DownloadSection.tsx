import React, { useEffect } from 'react'
import { Text } from 'react-native'
import { btoa, atob } from 'react-native-quick-base64';
import CryptoAesCbc from 'react-native-crypto-aes-cbc';
import WebViewExample from '../../examples/WebViewExample';
import VEncrypt from '../../core_crypto/CipherVE';
import { LogError } from '../../app_config/AppConstants';


const Downloads = () => {



  var secretKey = "I?IF7t[cR@7B%iYc#yX6A5ztF.2FmH;&"// old key --- > '6Io06yqr1jx9fA4V';
  var iv = '1111111234567890';
  var secretKeyInBASE64 = '';
  var ivInBASE64 =  '';//'MTExMTExMTIzNDU2Nzg5MA==';
  var keysize128 = '128';
  var keysize256 = '256';
  var text = 'hellooooo';

  useEffect(()=>{

   const dataa =  {
                "uuid": "kj7v1-z865b-cfd68-d8623",
        "device": {
          "appver": "1.0",
          "os": "Android",
          "ua": "Mozilla/5.0 (Linux; Android 11; RMX3268 Build/RP1A.201005.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/121.0.6167.143 Mobile Safari/537.36",
          "ip": "127.0.0.1",
          "cc": "IN",
          "type": "Handset",
          "apptype": "Android",
          "id": "d57e537dfdbcc04c"
        },
        "profileid":168,
        "action": "config"
      }
    
    const decryptedvalue =   VEncrypt.decrypt("I?IF7t[cR@7B%iYc#yX6A5ztF.2FmH;&" ,"WEF6WVNPMm5GU1pNU1lxQzl2QmtGQT09OjNGTFFvSm1sMDIyNTlFUzllV0dRQ3BteUNnSmRiZmgvY09Oc3loVnQ1TjYyN3lSYnZucS9wd01sMjVwdnAyZ2FneVEyeVcwZVNKVmhoY1hSM2ZzVTBEckNETnE3RStHWjdyaGZ0S1NtM3hodzJrVEpqWm9rS1ZoZ2RKUGxRMWxHVnVCOUZSNlZha3hqMGVITVBVdXl1Q21yeHBLT201YTYyZXJGVjZOZGdOS3NUL3JMS3BnUTlLZGw0ZkFodlc4MjBNT2tCTlVFb0ErSCtuak1TcE5CYmJqOUxSbDVGUVBZMzdCL2pOdDlDZW1CODVnOStOQmp0VEdYSndER0RKc0ZteXB3MWZFYzZwSzZBYnV2VWNvSFo1VDBBWUhoc2c4b3RRakVSR0RJV0Q4S2RPYTlld0tmNGg2bWRGbHl0ejNsOFg4UG84WDNPb0VqRGo2c0pDMkw5WnFHMS9MUnA3UkJoMUxOK0ErYWgxUlhEM01hTVBma0Z1d3FrOVN3Z2JUZ05IejZxNVRObHdCV3VKMEZHb3JkckNTQ1loVnRwWjdqVjgvcVQrclFBR0hsRjMyRkFVay9vMzJ5K2RaOHhuME9mVU9nSUhZejA4TUtZTnRkSzl6ZVZFeWI5YXh5RkJVVDlLRzFvLzVtY25Hb0NwQW4rbGM3VXpHRVJPa1RWZHBDa25YUzlWUE5rdWVIWFhoSU5jcUJNclQ5aFVEZVRta3ZKdlFEVzFjZDhieE9ZY3FYK2JBa2VpUHNLemsxeDBoVThNZEZubm5SWnI1RjlGSC9GVTY5ZVdVVjNCU0gvWWlvUnRzSjlqUXlXNEYrSThVd2podWt4SUFxN1p3SXNPQnVEaDNjVVVBSWxrNzVWOFVna3N3bXZqQXlUaEIxOUNTeGttT0V5UzhPMVlFYnBBWjR6c0p1NkVwYjhUVHJ0WmVoOVR5NVVQR2JUbFFaZU5KSjkyU2MvRXI3emFzVzRSak9lV0F1bHJxeDIvd05qRXBhaUczZkdQWTJyMHB2SlFnZ3J3V2xsMUd3V3NlYTZQZGUyZkFnL2VQSHhiUjJkMFQxNWEvR3IwN3NFZjhUUFR0TlcxTzlLSHMxRTk3MVA1ckowNFNqQ29pMjMxc21ZS1FMMk5rczBCMGhOZFVEMHYxMjNWT2VPVE1xRGFhWlg5aVdVWlNhbjBVVlMycjVJMkRpVDN2UTNLU2YzYjYzeWhhRllVQmdwUlovZEJtZk53N2lwMmNjeS9XbnY0V3hWU3BBTjEzeDMwczBtVmJtZXg2SENKRU0vWDRBNmRKVkh1eGpKUnhBYytkc0hwM05sclZZYS94OHYweHlqNW5aWE9ITTN6UWFXeVhqWFBUcXFrTk5zdmk1WlRveW9ldE5hc2JiYW9nWUhnPT0=" )
        
    ivInBASE64 = btoa(iv);
    secretKeyInBASE64 = btoa(secretKey);

    CryptoAesCbc.encryptInBase64(
      ivInBASE64,
      secretKeyInBASE64,
      text,
      '256'
    ).then((encryptString) => {
      try {
      } catch (error) {
        LogError("Downloads useEffect encryptString catch error",error)
      }
    });


    CryptoAesCbc.decryptByBase64(
      ivInBASE64,
      secretKeyInBASE64,
      'jA6oB+qSxBdswN8Lr7oSEA==',
      '256'
    ).then((decryptString) => {
      try {
      } catch (error) {
        LogError("Downloads useEffect decryptString catch error",error)
      }
    });
    
    // jA6oB+qSxBdswN8Lr7oSEA==

     
  },[])


  return (
    <>
    <Text style={{color:'red'}} >Downloads</Text>
    <WebViewExample></WebViewExample>
    </>
  )
}



export default Downloads