import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

interface Props {
  length: number;
  value: string;
  onChange: (val: string) => void;
}

const OtpInput = ({ length, value, onChange }: Props) => {
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    // Only allow single digit
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    
    const otpArray = value.split('');
    otpArray[index] = digit;
    const newOtp = otpArray.join('').padEnd(length, '').slice(0, length);
    onChange(newOtp.trimEnd() === '' ? '' : newOtp);

    // Move to next box
    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      const otpArray = value.split('');
      
      if (otpArray[index]) {
        // Clear current box
        otpArray[index] = '';
        onChange(otpArray.join(''));
      } else if (index > 0) {
        // Move to previous box and clear it
        otpArray[index - 1] = '';
        onChange(otpArray.join(''));
        inputs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View style={styles.container}>
      {Array(length).fill(0).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputs.current[index] = ref)}
          style={[
            styles.box,
            value[index] ? styles.boxFilled : styles.boxEmpty,
          ]}
          keyboardType="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          selectTextOnFocus
        //   caretHidden
          placeholderTextColor="#555"
        //   placeholder="·"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
  },
  box: {
    width: 48,
    height: 53,
    borderWidth: 1,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  boxEmpty: {
    borderColor: '#7B7D7D',
    backgroundColor: 'transparent',
  },
  boxFilled: {
    // borderColor: '#fd7f0c',
    // backgroundColor: 'rgba(253,127,12,0.1)',
    borderColor: '#7B7D7D',
    backgroundColor: 'transparent',
  },
});

export default OtpInput;