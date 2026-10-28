import React from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../theming/colors";

interface CustomModalProps {
  visible: boolean;
  loading: boolean;
  message?: string;
  subtitle?: string;
  error?: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

const ConfirmModal: React.FC<CustomModalProps> = ({
  visible,
  message = "Are you sure you want to exit?",
  subtitle = "Your plan is just a step away. Stay and continue watching.",
  error,
  onConfirm,
  onDismiss,
}) => (
  <Modal transparent animationType="fade" visible={visible}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        {message ? <Text style={styles.messageText}>{message}</Text> : null}
        {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onDismiss}
            style={[styles.button, styles.stayButton]}
          >
            <Text style={styles.stayButtonText}>Stay</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onConfirm}
            style={[styles.button, styles.exitButton]}
          >
            <Text style={styles.exitButtonText}>Yes, Exit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.88)",
    paddingHorizontal: 28,
  },
  modalContent: {
    backgroundColor: "#1A1C24",
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 22,
    borderRadius: 20,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 24,
  },
  subtitleText: {
    color: "#9AA0B4",
    fontSize: 13,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 19,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  errorText: {
    color: "#FF6B6B",
    marginTop: 10,
    fontWeight: "400",
    textAlign: "center",
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    marginTop: 22,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stayButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#6B7280",
  },
  stayButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  exitButton: {
    backgroundColor: colors.action_primary || "#E93354",
  },
  exitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default ConfirmModal;
