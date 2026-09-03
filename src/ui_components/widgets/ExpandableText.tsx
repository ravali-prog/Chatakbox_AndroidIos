import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  numberOfLines?: number;
  style?: any;
  readMoreText?: string;
  readLessText?: string;
  readMoreStyle?: any;
  readLessStyle?: any;
  children: string;
}

const ReadMoreText = ({
  numberOfLines = 3,
  style,
  readMoreText = 'More',
  readLessText = 'Less',
  readMoreStyle,
  readLessStyle,
  children,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const [measured, setMeasured] = useState(false);

  return (
    <View>
      {/* Hidden Text to measure full line count */}
      {!measured && (
        <Text
          style={[style, { position: 'absolute', opacity: 0 }]}
          onTextLayout={(e) => {
            setShowToggle(e.nativeEvent.lines.length > numberOfLines);
            setMeasured(true);
          }}
        >
          {children}
        </Text>
      )}

      {/* Visible Text */}
      <Text
        style={style}
        numberOfLines={expanded ? undefined : numberOfLines}
      >
        {children}
      </Text>

      {/* More / Less toggle */}
      {showToggle && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={expanded ? readLessStyle : readMoreStyle}>
            {expanded ? readLessText : readMoreText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ReadMoreText;