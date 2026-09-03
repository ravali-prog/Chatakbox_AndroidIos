import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native';
export const AccountDialog = ({ showDialog, setShowDialog, value, dataType, title, updateProfile }) => {
  const [input, setInput] = useState(value);
  const [keyboardType, setKeyboardType] = useState('default');
  const [placeholder, setPlaceholder] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (showDialog) {
      if (value) {
        setInput(value)
      }
      if (dataType == 'name') {
        setKeyboardType('default')
        setPlaceholder("Name")
      }
      else if (dataType == 'mobileNumber') {
        setKeyboardType('number-pad')
        setPlaceholder("Mobile Number")
      }
      else if (dataType == 'email') {
        setKeyboardType('email-address')
        setPlaceholder("Email")
      }
    }
    return () => {
      setInput("")
      setKeyboardType("default")
      setPlaceholder("")
    }
  }, [value, dataType, showDialog])
  useEffect(() => {
    return () => {
      setInput('')
      setKeyboardType('')
      setPlaceholder('')
    }
  }, [])
  const validateName = (input) => {
    if (!input) {
      setError("Please enter your name");
      return false;
    }
    if (/\s/.test(input)) {
      setError("Name should not contain spaces");
      return false;
    }
    return true;
  };
  const validateMobile = (input) => {
    if (!input) {
      setError("Enter Your Mobile Number");
      return false;
    }
    if (input.length < 10) {
      setError("Phone number should be at least 10 digits");
      return false;
    }
    return true;
  };
  const validateEmail = (input) => {
    if (!input) {
      setError("Please enter your email address");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };
  const handleOkPress = () => {
    let isValid = false;
    if (dataType === 'mobileNumber') {
      isValid = validateMobile(input);
    } else if (dataType === 'email') {
      isValid = validateEmail(input);
    } else if (dataType === 'name') {
      isValid = validateName(input);
    }
    if (isValid) {
      setShowDialog(false);
      updateProfile(input, dataType);
    }
    else {
      return 
    }
  };
  const handleCancel = () => {
    setInput("");
    setError("");
    setKeyboardType("default");
    setPlaceholder("");
    setShowDialog(false);
  };
  return (<>
    <Modal visible={showDialog} animationType="fade" transparent statusBarTranslucent onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior="padding" style={styles.avoiding}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              {/* <TouchableOpacity style={styles.closeBtn} onPress={handleCancel} activeOpacity={0.7}>
                <Image
                  source={require('../../app_assets/symbols/sym_06.png')}
                  style={styles.closeIcon}
                />
              </TouchableOpacity> */}
            </View>
            {/* Input */}
            <View style={styles.inputRow}>
              <TextInput
                placeholder={placeholder}
                value={input}
                onChangeText={(text) => {
                  setInput(text)
                  setError("")
                }}
                keyboardType={keyboardType}
                autoCapitalize="none"
                underlineColorAndroid={'#ffffff00'}
                style={styles.input}
                placeholderTextColor="#6b6b6b"
              />
            </View>
            {/* Error */}
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
            {/* <View style={styles.cancelWrap}>
            <TouchableOpacity onPress={handleCancel} activeOpacity={0.7} style={styles.ctaCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cta} onPress={handleOkPress} activeOpacity={0.8}>
              <Text style={styles.ctaText}>Save Changes</Text>
            </TouchableOpacity>
            </View> */}
            <View style={styles.modalActions}>
                          <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGhost]} onPress={handleCancel}>
                            <Text style={[styles.modalBtnText, styles.modalBtnTextGhost]}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.modalBtn} onPress={handleOkPress}>
                            <Text style={styles.modalBtnText}>Save Changes</Text>
                          </TouchableOpacity>
             </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  </>)
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  avoiding: {
    width: '100%',
    alignItems: 'center',
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
  // header: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   marginBottom: 24,
  //   marginStart: 5
  // },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
},
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2c2c2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 14,
    height: 14,
    tintColor: '#a1a1aa',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2e',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 54,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
  },
  errorText: {
    color: '#ff453a',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
    marginLeft: 4,
  },
  cancelWrap: {
    alignSelf: 'center',
    flexDirection: 'row',
     justifyContent: 'center',
     alignItems: 'center',
     marginTop: 10,
  },
  cancelText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  cta: {
    backgroundColor: '#e50914',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    width: "49%",
    marginStart: 3,
  },
    ctaCancel: {
    backgroundColor: '#3b3b3b',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    width: "49%",
    marginEnd: 3,

  },
  ctaText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
    modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#e50914',
    alignItems: 'center',
  },
  modalBtnGhost: {
    backgroundColor: 'transparent',
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