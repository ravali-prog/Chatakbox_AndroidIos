import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theming/colors';
import LinearGradient from 'react-native-linear-gradient';
export const LogoutDialog = ({ logoutDialogVisible, setLogoutDialogVisible, logout }) => {
  const handleLogout = () => {
    setLogoutDialogVisible(false);
    logout();
  };
  return (
    <Modal
      visible={logoutDialogVisible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
      onRequestClose={() => setLogoutDialogVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Logout</Text>
          </View>
          {/* Message */}
          <Text style={styles.message}>
            Are you sure you want to logout from this device?
          </Text>
          {/* Actions */}
  <View style={styles.modalActions}>
            <TouchableOpacity
            style={{ flex: 1 }} 
              activeOpacity={0.9}
              onPress={() => setLogoutDialogVisible(false)}
            >
              <LinearGradient
                colors={colors.gradients.disableButton}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={[styles.modalBtn, styles.modalBtnGhost]}
              >
                <Text style={[styles.modalBtnText, styles.modalBtnTextGhost]}>Cancel</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
            style={{ flex: 1 }} 
              activeOpacity={0.9}
              onPress={handleLogout}
            >
              <LinearGradient
                colors={colors.gradients.primaryButton}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.modalBtn}
              >
                <Text style={styles.modalBtnText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
export const LogoutDialogAll = ({ logoutAllDialogVisible, setLogoutAllDialogVisible, logoutAll }) => {
  const handleLogoutAll = () => {
    setLogoutAllDialogVisible(false);
    logoutAll();
  };
  return (
    <Modal
      visible={logoutAllDialogVisible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
      onRequestClose={() => setLogoutAllDialogVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Logout All Devices</Text>
          </View>
          <Text style={styles.message}>
            Are you sure you want to logout from all devices?
          </Text>
       <View style={styles.modalActions}>
            <TouchableOpacity
            style={{ flex: 1 }} 
              activeOpacity={0.9}
              onPress={() => setLogoutAllDialogVisible(false)}
            >
              <LinearGradient
                colors={colors.gradients.disableButton}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={[styles.modalBtn, styles.modalBtnGhost]}
              >
                <Text style={[styles.modalBtnText, styles.modalBtnTextGhost]}>Cancel</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
            style={{ flex: 1 }} 
              activeOpacity={0.9}
              onPress={handleLogoutAll}
            >
              <LinearGradient
                colors={colors.gradients.primaryButton}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.modalBtn}
              >
                <Text style={styles.modalBtnText}>Logout All</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1c1c1e',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginStart: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
 modalBtn: {
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnGhost: {
    borderWidth: 1,
    borderColor: '#444',
  },
  modalBtnText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
  },
  modalBtnTextGhost: {
    color: '#9ca3af',
  },
});