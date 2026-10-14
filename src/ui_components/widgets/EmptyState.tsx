// import React from 'react';
// import { Text, View ,StyleSheet, TouchableOpacity } from 'react-native';
// import Downloads from '../sections/DownloadSection';

// const NoData = ({onRetryClick}:any) => {
//   return (
//     <View style={styles.nodata}>
//       <Text style={styles.nodataText}>No data available!</Text>
//     <TouchableOpacity  onPress={()=>{onRetryClick()}}>
//       <Text style={{borderColor:'white', fontSize:14 , 
//       justifyContent: 'center',
//       alignItems: 'center',
//       borderWidth: 1,
//       padding:10,
//       borderRadius: 4,
//       color: 'white',
//       marginTop:10,
//       backgroundColor : '#000000' }}>Try again</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//     nodata: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       fontSize: 24,
//       color: 'red',
//       backgroundColor : '#000000'
//     },
//     nodataText: {
      
//       fontSize: 16,
//       color: 'white',
//       textAlign:'center'
//     },
//   });

// export default NoData;

import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../theming/colors';

type NoDataProps = {
  onRetryClick?: () => void;
  title?: string;
  message?: string;
};

const NoData = ({
  onRetryClick,
  title = 'No data available',
  message = "We couldn't find anything here. Check your connection and try again.",
}: NoDataProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>!</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onRetryClick && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onRetryClick}
          style={styles.buttonWrapper}>
          <LinearGradient
            colors={colors.gradients.primaryButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.background_base,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background_surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text_muteds,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text_primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text_secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text_primary,
  },
});

export default NoData;