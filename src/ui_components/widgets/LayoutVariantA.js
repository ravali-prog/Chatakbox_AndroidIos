import React from "react";
import {
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
  Text,
  Dimensions,
} from "react-native";
import { Icon } from "react-native-elements";
import LinearGradient from "react-native-linear-gradient";

const Layout37 = (propdata) => {
  const { onClick, listIndex, dataitem = {} } = propdata;
  const screenWindowWidth = Dimensions.get("window").width;
  const screenWidth = screenWindowWidth - 15;
  let imageWidth = 0;
  let imageHeight = 0;
  let imageurl = "";

  try {
    imageWidth = (screenWidth * Number(propdata.imgratio.imgper)) / 100;
    imageHeight =
      (imageWidth * Number(propdata.imgratio.imghratio)) /
      Number(propdata.imgratio.imgwratio);
    imageurl =
      propdata.image[
        "t" + propdata.imgratio.imgwratio + "x" + propdata.imgratio.imghratio
      ];
  } catch (error) {}

  const title = dataitem.title || "";
  const rating = dataitem.rating ? String(dataitem.rating) : "";
  const year = dataitem.year
    ? String(dataitem.year)
    : dataitem.release_date
      ? String(dataitem.release_date).split("-")[0]
      : "";
  const category =
    dataitem.type === "series" || dataitem.type === "seriesdetails"
      ? "Series"
      : dataitem.genre
        ? String(dataitem.genre).split(",")[0].trim()
        : dataitem.type
          ? "Movies"
          : "";
  const certificate = dataitem.certificate
    ? String(dataitem.certificate)
    : "";
  const rawDesc = dataitem.ldesc || dataitem.desc || "";
  const description =
    rawDesc.length > 140 ? `${rawDesc.slice(0, 140).trim()}...` : rawDesc;

  const pills = [
    rating ? { key: "rating", label: rating, star: true } : null,
    year ? { key: "year", label: year } : null,
    category ? { key: "cat", label: category } : null,
    certificate ? { key: "cert", label: certificate, outline: true } : null,
  ].filter(Boolean);

  const open = () => onClick(listIndex);

  return (
    <View style={styles.outer}>
      <View style={[styles.card, { width: imageWidth }]}>
        <TouchableOpacity activeOpacity={0.95} onPress={open}>
          <View style={[styles.imageWrap, { height: imageHeight }]}>
            <Image
              source={{ uri: imageurl }}
              style={styles.image}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(12,12,14,0.5)", "#121214"]}
              locations={[0.35, 0.72, 1]}
              style={styles.imageFade}
              pointerEvents="none"
            />
          </View>
        </TouchableOpacity>

        <View style={styles.copy}>
          <Text style={styles.spotlight}>SPOTLIGHT</Text>
          {!!title && (
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
          )}

          {pills.length > 0 && (
            <View style={styles.pillsRow}>
              {pills.map((pill) => (
                <View
                  key={pill.key}
                  style={[styles.pill, pill.outline && styles.pillOutline]}
                >
                  {pill.star ? (
                    <Text style={styles.pillStar}>★ {pill.label}</Text>
                  ) : (
                    <Text style={styles.pillText}>{pill.label}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {!!description && (
            <Text style={styles.desc} numberOfLines={3}>
              {description}
            </Text>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={open}
              style={styles.watchBtn}
            >
              <Icon
                name="play-arrow"
                type="material"
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.watchText}>Start Watching</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={open}
              style={styles.circleBtn}
            >
              <Text style={styles.infoText}>𝒊</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    marginVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#121214",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  imageWrap: {
    width: "100%",
    backgroundColor: "#111",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "40%",
  },
  copy: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  spotlight: {
    color: "rgba(198,40,40,0.85)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
    lineHeight: 30,
    marginBottom: 10,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  pill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pillOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  pillStar: {
    color: "rgba(232,210,140,0.9)",
    fontSize: 12,
    fontWeight: "700",
  },
  pillText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
  },
  desc: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  watchBtn: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#C62828",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 16,
  },
  watchText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Layout37;
