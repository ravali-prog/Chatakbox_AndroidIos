import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';

const GridView = (props : any ) => {
  const {data, col = 2, renderItem} = props;
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {data.map((item :  any , index : any ) => {
          return (
            <View key={index} style = {{width: 100 / col + '%'}}>
              <View style={{padding: 5}}>{renderItem(item)}</View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {width: '100%', flexDirection: 'row', flexWrap: 'wrap'},
});

export default GridView;
