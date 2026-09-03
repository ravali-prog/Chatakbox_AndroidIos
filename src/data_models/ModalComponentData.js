import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';

const ModalComponent = ({ title,data, isModalVisible, toggleModal }) => {
  return (
    <Modal
      transparent={true}
      visible={isModalVisible}
      onRequestClose={toggleModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{title}</Text>
            {data.map((item, index) => (
              <View key={index}>
                <Text style={styles.modalTitle}>{item.title}</Text>
                {Array.isArray(item.content) ? (
                  item.content.map((contentItem, idx) => (
                    <Text key={idx} style={styles.modalContentText}>{contentItem}</Text>
                  ))
                ) : (
                  <Text style={styles.modalContentText}>{item.content}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
      <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
            <Image
              source={require('../../app_assets/symbols/sym_21.png')}
              style={styles.closeIcon}
            />
          </TouchableOpacity>
    </Modal>
  );
};

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding:10
  },
  modalContent: {
    backgroundColor: '#111111',
    width: deviceWidth,
    height: deviceHeight,
    justifyContent: 'center',
    alignItems: 'center',
   
  },
  closeButton: {
    position:'absolute',
   alignSelf:'flex-end',
   padding:20
  },
  closeIcon: {
    width: 40,
    height: 40,
    tintColor: 'white',
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    color: 'white',
    alignSelf:'center',
    padding:20
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '400',
    color: 'white',
    alignSelf:'center',
    padding:5
  },
  modalContentText: {
    fontSize: 16,
    fontWeight: '200',
    marginBottom: 5,
    color: 'white',
    textAlign: 'center',
    padding:5
  },
  scrollViewContent: {
    // flexGrow: 1,
    top:0,
    justifyContent: 'center',
  },
});

export default ModalComponent;