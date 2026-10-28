import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  global_content_group,
  isInActiveUser,
  isUserSubscribed,
  showPayWall,
} from "../../app_config/AppConstants";
import { colors } from "../../theming/colors";
import LinearGradient from 'react-native-linear-gradient';
import { USE_WEB_STYLE_TAB_BAR } from "./FloatingPillTabBar";


function HomeHeader() {
  const navigation: any = useNavigation();
  const [showSub, setShowSub] = useState(false);

  const onSearch = () => {
    navigation.push("SearchScreen");
  };

  function checkSub() {
    try {
      if (
        isUserSubscribed(global_content_group) ||
        isInActiveUser(global_content_group)
      ) {
        setShowSub(false);
      } else {
        setShowSub(true);
      }
    } catch (error) {}
  }

  useEffect(() => {
    checkSub();
    const unsubscribe = navigation.addListener("focus", (obj: any) => {
      checkSub();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.linearGradient}>
      <View style={styles.parent}>
        <Image
          // source={require("../../../app_assets/pictures/headerLogo_nobg.png")}
          source={require("../../../app_assets/pictures/logo_home_150.png")}
          style={{
            resizeMode: "contain",
            width: 140,
          }}
        />
         {showSub && (
          <TouchableOpacity
            onPress={() => {
              showPayWall(navigation);
            }}
            style={{
              position: "absolute",
              right: USE_WEB_STYLE_TAB_BAR ? 12 : 60,
            }}
          >
            <LinearGradient
              colors={colors.gradients.primaryButton}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={{
                paddingVertical: 3,
                paddingHorizontal: 18,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "400",
                  color: "white",
                  textTransform: "uppercase",
                }}
              >
                Subscribe
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {!USE_WEB_STYLE_TAB_BAR && (
          <TouchableOpacity
            style={{
              marginLeft: "auto",
              justifyContent: "center",
              width: 45,
              height: 45,
            }}
            onPress={onSearch}
          >
            <Image
              source={require("../../../app_assets/symbols/sym_64.png")}
              style={{
                alignSelf: "center",
                width: 25,
                height: 25,
                tintColor: "#ffffff",
              }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

var styles = StyleSheet.create({
  parent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  linearGradient: {
    //  backgroundColor: '#282828',
    backgroundColor: "#000000",
    flex: 1,

    paddingRight: 4,
  },
  button: {
    alignSelf: "center",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
});

export default HomeHeader;
