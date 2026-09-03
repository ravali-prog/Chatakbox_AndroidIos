import React, { useState } from 'react';
import { Text, View, SafeAreaView, Image } from 'react-native';
import Carousel from 'react-native-snap-carousel';
import { Dimensions, StyleSheet } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// interface CarouselItem {
//   title: string;
//   text: string;
//   image: any; 
// }

// interface CarouselModalProps {
//   data: CarouselItem[];
// }

const CarouselModal = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const data = [];
  for (let i = 1; i <= 10; i++) {
    data.push({ id: `${i}`, text: `Item ${i}`, image: require(`../assests/ImageAssets/Obito.jpg`) });
    
  }

  const renderItem = ({ item }: any) => (
    <View>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.carouselContainer}>
        <Carousel
          layout={'default'}
          data={data}
          sliderWidth={screenWidth}
          itemWidth={300}
          renderItem={renderItem}
          onSnapToItem={(index) => setActiveIndex(index)}
        />
      </View>
      <View style={styles.activeIndexContainer}>
        <Text style={styles.activeIndexText}>
          Active Index: {activeIndex}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: '#6A0572',
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  carouselContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  
  image:{
    width: 300, 
    height: 200,
    borderRadius:20,
    marginTop: 5,
  },
  itemTitle:{
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000'
  },
  itemText:{
    fontSize: 16,
    color: '#000' 
  },
  activeIndexContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  activeIndexText: {
    color: 'white',
    fontSize: 20,
  },

});

export default CarouselModal;




  // import React, { useState } from "react";
  // import { View, Text, Image,StyleSheet } from "react-native";
  // import { FlashList } from "@shopify/flash-list";
  // import Carousel from "react-native-snap-carousel";

  // const MyCarousel = ({ data }) => {

  //   const renderItem = ({ item }) => (
  //     <Carousel
  //       data={item.carouselData}
  //       sliderWidth={300}
  //       itemWidth={300}
  //       renderItem={(carouselItem) => (
  //         <View>
  //           <Image source={carouselItem.image} style={styles.image}/>
  //           <Text style={styles.title}>{carouselItem.title}</Text>
  //           <Text style={styles.text}>{carouselItem.text}</Text>  
  //         </View>
  //       )} 
  //     />
  //   );

  //   return (
  //     <FlashList
  //       data={data}
  //       estimatedItemSize={800}
  //       renderItem={renderItem}
  //     />
  //   );
  // };

  // export default MyCarousel;


  // StyledCarousel.js

// import React from 'react';
// import { View, Text, Image, StyleSheet } from 'react-native';
// import { FlashList } from '@shopify/flash-list';
// import Carousel from 'react-native-snap-carousel';

// const CarouselItem = ({ data }) => {
//   const renderItem = ({ item }) => (
//     <View style={styles.carouselItem}>
//       <Image source={item.image} style={styles.image} />
//       <Text style={styles.title}>{item.title}</Text>
//       <Text style={styles.text}>{item.text}</Text>
//     </View>
//   );

//   return (
//     <FlashList
//       data={data}
//       estimatedItemSize={300}
//       renderItem={renderItem}
//       horizontal
//       getItemType={() => 'Carousel'}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   carouselItem: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 200,
//     borderWidth: 1,
//     borderColor: 'gray',
//     marginRight: 10,
//   },
//   image: {
//     width: 100,
//     height: 100,
//     resizeMode: 'cover',
//     marginBottom: 10,
//   },
//   title: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   text: {
//     fontSize: 14,
//     color: 'gray',
//   },
// });

// export default CarouselItem;
