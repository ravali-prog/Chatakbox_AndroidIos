import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';

const DOT_COLORS = ['#e50914', '#e87c16', '#ffffff', '#e87c16', '#e50914'];

const Dot = ({ color, delay }: { color: string; delay: number }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -28,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.35,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    };

    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: -28, duration: 350, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 0, duration: 350, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.35, duration: 350, useNativeDriver: true }),
        ]),
        Animated.delay(1100 - delay - 700),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color, transform: [{ translateY }], opacity },
      ]}
    />
  );
};

const Loader = () => {
  const labelOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(labelOpacity, { toValue: 0.9, duration: 1000, useNativeDriver: true }),
        Animated.timing(labelOpacity, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {DOT_COLORS.map((color, i) => (
          <Dot key={i} color={color} delay={i * 150} />
        ))}
      </View>
      <Animated.Text style={[styles.label, { opacity: labelOpacity }]}>
        LOADING
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   backgroundColor: '#000000',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   gap: 28,
  // },
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgb(0, 0, 0)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    zIndex: 999,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    height: 44,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: 12,
    color: '#c1c1c1',
    letterSpacing: 3,
    fontWeight: '500',
  },
});

export default Loader;