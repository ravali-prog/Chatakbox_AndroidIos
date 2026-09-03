import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { REELS_DEMO_SERIES, ReelsSeries } from '../../data_models/ReelsData';
import EmptyState from '../widgets/EmptyState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_GAP * 3) / 2;
const CARD_HEIGHT = CARD_WIDTH * (16 / 9);

const SeriesCard = ({ item, onPress }: { item: ReelsSeries; onPress: () => void }) => {
  const episodeCount = item.episodes ? item.episodes.length : 0;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      <Image source={{ uri: item.poster }} style={styles.poster} resizeMode="cover" />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.overlay}
      />
      <View style={styles.cardTextWrap}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {item.subtitle || ''}
          {episodeCount > 0 ? ` · ${episodeCount} Episode${episodeCount > 1 ? 's' : ''}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const ReelsSection = () => {
  const navigation: any = useNavigation();

  const handleOpenSeries = (item: ReelsSeries) => {
    navigation.navigate('reelsplayer', { intent: { series: item, episodes: item.episodes } });
  };

  const renderItem = ({ item }: { item: ReelsSeries }) => {
    return <SeriesCard item={item} onPress={() => handleOpenSeries(item)} />;
  };

  if (!REELS_DEMO_SERIES || REELS_DEMO_SERIES.length === 0) {
    return <EmptyState />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={REELS_DEMO_SERIES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContent: {
    paddingHorizontal: CARD_GAP,
    paddingTop: 4,
    paddingBottom: 24,
  },
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#17171D',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardTextWrap: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
  },
});

export default ReelsSection;
