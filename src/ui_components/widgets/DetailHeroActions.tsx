import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

type Props = {
  isWishlist: boolean;
  isLiked: boolean;
  isDisliked: boolean;
  onWishlist: () => void;
  onLike: () => void;
  onDislike: () => void;
};

/**
 * Web-style labeled action tiles for details (no Share on Android).
 */
export default function DetailHeroActions({
  isWishlist,
  isLiked,
  isDisliked,
  onWishlist,
  onLike,
  onDislike,
}: Props) {
  return (
    <View style={styles.row}>
      <ActionTile
        label={isWishlist ? "In Watchlist" : "Watchlist"}
        active={isWishlist}
        onPress={onWishlist}
        icon={
          isWishlist
            ? require("../../../app_assets/symbols/sym_82.png")
            : require("../../../app_assets/symbols/sym_81.png")
        }
      />
      <ActionTile
        label={isLiked ? "Liked" : "Like"}
        active={isLiked}
        onPress={onLike}
        icon={
          isLiked
            ? require("../../../app_assets/symbols/sym_86.png")
            : require("../../../app_assets/symbols/sym_85.png")
        }
      />
      <ActionTile
        label={isDisliked ? "Disliked" : "Dislike"}
        active={isDisliked}
        onPress={onDislike}
        icon={
          isDisliked
            ? require("../../../app_assets/symbols/sym_84.png")
            : require("../../../app_assets/symbols/sym_83.png")
        }
      />
    </View>
  );
}

function ActionTile({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon: any;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.tile, active && styles.tileActive]}
    >
      <Image source={icon} style={styles.icon} resizeMode="contain" />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    marginBottom: 12,
  },
  tile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  tileActive: {
    borderColor: "rgba(198,40,40,0.5)",
    backgroundColor: "rgba(198,40,40,0.15)",
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: "#FFFFFF",
  },
  label: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
