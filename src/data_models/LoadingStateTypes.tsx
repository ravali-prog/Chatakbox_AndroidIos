import React from 'react';
import { View, Text, Modal, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingModalProps {
  visible: boolean;
  message?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ visible, message }) => (
  <Modal transparent animationType="slide" visible={visible}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <ActivityIndicator size="large" color="#fff" />
        {message && <Text style={styles.messageText}>{message}</Text>}
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  messageText: {
    color: '#fff',
    marginTop: 10,
  },
});

export default LoadingModal;