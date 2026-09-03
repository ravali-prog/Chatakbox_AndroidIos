import React from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { colors } from "../theming/colors";

interface CustomModalProps {
  visible: boolean;
  loading: boolean;
  message?: string;
  error?: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

const ConfirmModal: React.FC<CustomModalProps> = ({
  visible,
  loading,
  message,
  error,
  onConfirm,
  onDismiss,
}) => (
  <Modal transparent animationType="slide" visible={visible}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        {message && <Text style={styles.messageText}>{message}</Text>}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onConfirm}
          style={{ width: "100%" }}
        >
          <LinearGradient
            colors={colors.gradients.disableButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.widthBorder, { width: "100%" }]}
          >
            <Text style={styles.cancelButton}>Confirm</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onDismiss}
          style={{ width: "100%" }}
        >
          <LinearGradient
            colors={colors.gradients.primaryButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.widthOutBorder, { width: "100%" }]}
          >
            <Text style={styles.exitButton}>Go back to payment</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.94)",
  },
  // modalContent: {
  //   backgroundColor: "#17171D",
  //   padding: 20,
  //   borderRadius: 10,
    
  //   //alignItems: 'center',
  // },
  modalContent: {
    backgroundColor: "#17171D",
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 360,
    alignItems: 'center',
},
  messageText: {
    justifyContent: "flex-start",
    color: "white",
    marginBottom: 10,
    fontSize: 16,
    marginTop: 15,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginTop: 10,
    marginBottom: 20,
    fontWeight: "400",
  },
  dialogActions: {
    justifyContent: "center",
    backgroundColor: "#9932cc",
    // paddingVertical: 10,
  },
  cancelButton: {
    color: "white",
    padding: 10,

    borderRadius: 5,
    textAlign: "center",
    fontWeight: "bold",
  },

  exitButton: {
    color: "white",
    padding: 10,

    borderRadius: 5,
    textAlign: "center",
    fontWeight: "bold",
  },
  widthBorder: {
    borderRadius: 10,
    marginTop: 15,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#444",
  },
  widthOutBorder: {
    borderColor: "black",
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: "#e50914",
  },
});

export default ConfirmModal;
