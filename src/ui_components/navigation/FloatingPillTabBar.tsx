import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  LayoutAnimation,
  UIManager,
  Animated,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Icon } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../theming/colors";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TAB_ICONS: Record<string, string> = {
  Home: "home",
  Search: "magnify",
  Profile: "account",
};

/** Extra bottom space so last list items / version text clear the floating bar. */
export const FLOATING_TAB_BAR_CLEARANCE = 100;

/**
 * Flip to false in one place to restore the old flat black bottom tab bar.
 * Used by HomePage (+ optional content padding elsewhere).
 */
export const USE_WEB_STYLE_TAB_BAR = true;

/**
 * Web-style floating glass pill tab bar (matches Chanajor_Web MobileBottomNav).
 */
export default function FloatingPillTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const prevIndex = useRef(state.index);

  useEffect(() => {
    if (prevIndex.current !== state.index) {
      LayoutAnimation.configureNext({
        duration: 280,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
      prevIndex.current = state.index;
    }
  }, [state.index]);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        // Sit low / near bottom edge
        { paddingBottom: Math.max(insets.bottom * 0.15, 2) },
      ]}
    >
      <View style={styles.pill}>
        {/* Gloss highlight wash */}
        <View pointerEvents="none" style={styles.glossTop} />
        <View pointerEvents="none" style={styles.glossSheen} />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined &&
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;
          const iconName = TAB_ICONS[route.name] || "circle";

          const onPress = () => {
            LayoutAnimation.configureNext({
              duration: 280,
              update: { type: LayoutAnimation.Types.easeInEaseOut },
              create: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity,
              },
              delete: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity,
              },
            });

            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TabItem
              key={route.key}
              label={String(label)}
              iconName={iconName}
              isFocused={isFocused}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabItem({
  label,
  iconName,
  isFocused,
  accessibilityLabel,
  onPress,
  onLongPress,
}: {
  label: string;
  iconName: string;
  isFocused: boolean;
  accessibilityLabel?: string;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={1}
        style={[styles.item, isFocused ? styles.itemActive : styles.itemInactive]}
      >
        <Icon
          source={iconName}
          size={22}
          color={isFocused ? "#FFFFFF" : "rgba(255,255,255,0.55)"}
        />
        {isFocused ? (
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 6,
    paddingHorizontal: 8,
    borderRadius: 999,
    overflow: "hidden",
    // Dark gray glossy glass
    backgroundColor: "rgba(18, 18, 22, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.75,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 14 },
      },
      android: {
        elevation: 20,
      },
    }),
  },
  glossTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12, 12, 16, 0.82)",
  },
  glossSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  item: {
    height: 44,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 1,
  },
  itemActive: {
    backgroundColor: colors.action_primary || "#D6111E",
    paddingHorizontal: 22,
    ...Platform.select({
      ios: {
        shadowColor: colors.action_primary || "#D6111E",
        shadowOpacity: 0.55,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  itemInactive: {
    width: 52,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    maxWidth: 96,
  },
});
