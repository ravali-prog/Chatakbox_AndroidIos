import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";

interface CustomModalProps {
  visible: boolean;
  message?: string;
  error?: string;
  onClose: () => void;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  message,
  error,
  onClose,
}) => {
  return (
    <>

      <Modal visible={visible} transparent>
        <View style={styles.container}>
          <View style={styles.dialogContainer}>
            {message && <Text style={styles.title}>{message}</Text>}
            {error && <Text style={styles.message}>{error}</Text>}
              <TouchableOpacity
                style={styles.okButton}
                onPress={() => onClose()}
              >
                <View style={styles.buttonBorder} /> 
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </>
  );
};

const windowWidth = Dimensions.get("window").width;

// Calculate 25% of the window width
const twentyFivePercent = windowWidth * 0.25;

// Calculate the remaining width after subtracting 25%
const remainingWidth = windowWidth - twentyFivePercent;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dialogContainer: {
    // backgroundColor: '#fff',
    backgroundColor: "#444444",
    // padding: 0,
    borderRadius: 10,
    width: remainingWidth,
    alignSelf: "center",
  },
  title: {
    color: "#fff",
    marginTop: 10,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    padding: 10,
  },
  message: {
    color: "#fff",
    // marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
    padding: 10,
  },
  okButton: {
    flexDirection: "column",
    justifyContent: "center",
    marginTop:20
  },
  buttonBorder: {
    borderBottomColor: "#00ffff", // Border color
    borderBottomWidth: 0.5, // Border width
    width: "100%", // Width to cover the entire button
    marginBottom: 5, // Spacing between border and text
  },
  buttonText: {
    color: "#00ffff", // Change the text color as needed
    fontSize: 20,
    fontWeight:'bold',
    textAlign:'center',
    padding: 10,
    marginBottom: 5
  },
});

export default CustomModal;
