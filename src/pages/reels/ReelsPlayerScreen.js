import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import Share from 'react-native-share';
import { Icon } from 'react-native-paper';
import ReelsPlayerCore from '../../media_player/ReelsPlayerCore';
import LoadingSpinner from '../../ui_components/widgets/LoadingSpinner';
import EmptyState from '../../ui_components/widgets/EmptyState';
import {
  APP_NAME,
  LOCAL_EVENTS,
  LogData,
  LogError,
  USER_UUID,
  handleVideoPlayAsync,
  isUserSubscribed,
  markReelsWatched,
  selectedUserProfile,
  useractivityDetails,
} from '../../app_config/AppConstants';
import { createShareLink, doUserAction, getSeriesDetails } from '../../state_mgmt/AppCommonSlice';
import { EventRegister } from 'react-native-event-listeners';

const getPosterUrl = (thumbnail) => {
  try {
    return (thumbnail && (thumbnail.t2x3 || thumbnail.t16x9 || thumbnail.t3x4 || thumbnail.t5x3)) || '';
  } catch (error) {
    return '';
  }
};

const buildEpisodesFromSeries = (seriesData) => {
  try {
    const clips = (seriesData && seriesData.clips) || [];
    return clips
      .map((clip) => ({
        id: clip.id,
        title: clip.title,
        subtitle: clip.subtitle || clip.title,
        poster: getPosterUrl(clip.thumbnail),
        clipDetails: clip,
        seriesId: clip.seriesId,
        resume: clip.resume || '0',
      }))
      .filter((ep) => ep.id);
  } catch (error) {
    return [];
  }
};

const buildStartIndex = (episodeList, fallbackIndex, itemId) => {
  if (itemId && episodeList.length > 0) {
    const found = episodeList.findIndex((ep) => ep.id === itemId);
    if (found >= 0) {
      return found;
    }
  }
  return fallbackIndex || 0;
};

const ReelsPlayerScreen = ({ route }) => {
  const navigation = useNavigation();
  const seriesId = route.params?.intent?.seriesId || null;
  const startItemId = route.params?.startItemId || null;
  const startIndexParam = route.params?.startIndex ?? 0;

  // Legacy path: callers may still pass a fully built series + episodes
  // (e.g. the demo ReelsSection). When only a seriesId is passed, we fetch
  // the details via getSeriesDetails (action "content"), mirroring
  // SeriesViewerAlt.
  const passedSeries = route.params?.intent?.series || null;
  const passedEpisodes = route.params?.intent?.episodes || passedSeries?.episodes || [];

  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const listRef = useRef(null);

  // Pinned ONCE at mount. We intentionally do NOT resync this from onLayout
  // on every render — that was the cause of the "shifts down a little on
  // every close" bug: opening/closing the episodes sheet or the native
  // share sheet briefly changes safe-area/inset measurements, which fired
  // onLayout with a slightly different height each time, and the FlatList's
  // getItemLayout/snapToInterval used that new height to recompute the
  // scroll offset for the *same* index — nudging the list a few px each time.
  const [viewportHeight, setViewportHeight] = useState(SCREEN_HEIGHT);
  const hasSetInitialHeight = useRef(false);

  const [series, setSeries] = useState(passedSeries);
  const [episodes, setEpisodes] = useState(passedEpisodes);
  const [fetchStatus, setFetchStatus] = useState(
    passedSeries && passedEpisodes.length > 0 ? 'success' : seriesId ? 'idle' : 'error',
  );
  const [currentIndex, setCurrentIndex] = useState(startIndexParam);
  const [episodesVisible, setEpisodesVisible] = useState(false);
  const [listScrollEnabled, setListScrollEnabled] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(() => new Set());
  const [resolvedUrls, setResolvedUrls] = useState({});
  const [subscriptionRetry, setSubscriptionRetry] = useState(0);

  const profileid = selectedUserProfile ? selectedUserProfile.profileid : '';

  const currentEpisodeRef = useRef(null);
  useEffect(() => {
    currentEpisodeRef.current = episodes[currentIndex];
  }, [episodes, currentIndex]);

  useEffect(() => {
    try {
      if (series && episodes && episodes.length > 0) {
        markReelsWatched(series.seriesId || series.id, series, episodes);
      }
    } catch (error) {
      LogError('ReelsPlayerScreen markReelsWatched error', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, episodes]);

  // Fetch series details by seriesId (action "content"), exactly like
  // SeriesViewerAlt does with getSeriesDetails, when only a seriesId was
  // passed to the route.
  useEffect(() => {
    if (!seriesId) {
      return;
    }
    let cancelled = false;
    setFetchStatus('loading');
    const loadSeriesDetails = async () => {
      try {
        const res = await getSeriesDetails({ seriesid: seriesId });
        if (cancelled) {
          return;
        }
        const data = res && res.data;
        if (data && data.clips && data.clips.length > 0) {
          const built = buildEpisodesFromSeries(data);
          const idx = buildStartIndex(built, startIndexParam, startItemId);
          setSeries(data);
          setEpisodes(built);
          setCurrentIndex(idx);
          setFetchStatus('success');
        } else {
          setFetchStatus('error');
        }
      } catch (error) {
        if (!cancelled) {
          setFetchStatus('error');
        }
        LogError('ReelsPlayerScreen getSeriesDetails error', error);
      }
    };
    loadSeriesDetails();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesId]);

  useEffect(() => {
    Orientation.lockToPortrait();
    SystemNavigationBar.navigationHide();
    StatusBar.setHidden(true);
    return () => {
      Orientation.lockToPortrait();
      SystemNavigationBar.navigationShow();
      StatusBar.setHidden(false);
    };
  }, []);

  useEffect(() => {
    try {
      if (useractivityDetails?.wishlist?.clips?.length > 0) {
        setWishlistIds(
          new Set(useractivityDetails.wishlist.clips.map((clip) => clip.id)),
        );
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    const eventId = EventRegister.addEventListener(
      LOCAL_EVENTS.EVENT_SUBSCRIPTION,
      () => {
        const episode = currentEpisodeRef.current;
        if (
          episode &&
          episode.clipDetails &&
          isUserSubscribed(episode.clipDetails.contentgroup)
        ) {
          setSubscriptionRetry((x) => x + 1);
        }
      },
    );
    return () => {
      try {
        if (typeof eventId === 'string') {
          EventRegister.removeEventListener(eventId);
        }
      } catch (error) {}
    };
  }, []);

  useEffect(() => {
    const episode = episodes[currentIndex];
    if (!episode || !episode.clipDetails) {
      return;
    }
    setResolvedUrls((prev) => ({ ...prev, [episode.id]: undefined }));
    try {
      const seriesDetails = episode.seriesId
        ? { seriestitle: series.title }
        : null;
      handleVideoPlayAsync(navigation, episode.clipDetails, seriesDetails)
        .then((resp) => {
          if (resp && resp.videourl) {
            setResolvedUrls((prev) => ({ ...prev, [episode.id]: resp.videourl }));
            LogData('[Reels] resolved videoUrl', resp.videourl);
          }
        })
        .catch((error) => {
          LogError('ReelsPlayerScreen resolveVideo catch error', error);
        });
    } catch (error) {
      LogError('ReelsPlayerScreen resolveVideo outside catch error', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, subscriptionRetry, episodes]);

  // If the height genuinely changes (real rotation, split-screen, etc.),
  // re-sync the list's scroll position to the *current* index explicitly
  // instead of letting the offset silently drift.
  useEffect(() => {
    if (!hasSetInitialHeight.current) {
      return;
    }
    if (listRef.current) {
      listRef.current.scrollToOffset({
        offset: currentIndex * viewportHeight,
        animated: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewportHeight]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const idx = viewableItems[0].index;
      if (idx != null) {
        setCurrentIndex(idx);
      }
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleToggleWishlist = (item) => {
    try {
      const active = wishlistIds.has(item.id);
      const action = active ? 'removewishlist' : 'addwishlist';
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (active) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
        return next;
      });
      const response = doUserAction(action, USER_UUID, profileid, 'clip', item.id);
      response.then((x) => {
        try {
          if ('data' in x && x.data.resultcode === '101') {
            EventRegister.emit(LOCAL_EVENTS.EVENT_WATCHHISTORY_UPDATE, {});
          }
        } catch (error) {}
      });
    } catch (error) {}
  };

  const handleShare = (item) => {
    try {
      const shareresp = createShareLink(item.id, 'clip', item.title);
      shareresp.then((resp) => {
        try {
          if ('data' in resp && resp.data.resultcode == 101) {
            const options = {
              title: APP_NAME,
              message: resp.data.url,
            };
            Share.open(options).catch(() => {});
          }
        } catch (error) {}
      });
    } catch (error) {}
  };

  const handleOpenEpisodes = () => {
    // setEpisodesVisible(true);
  };

  const handleEpisodeSelect = (index) => {
    setEpisodesVisible(false);
    if (index === currentIndex) {
      return;
    }
    setCurrentIndex(index);
    if (listRef.current) {
      listRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const renderItem = ({ item, index }) => {
    const videoUrl = resolvedUrls[item.id] || item.mediaUrl || null;
    return (
      <View style={[styles.page, { height: viewportHeight }]}>
        <ReelsPlayerCore
          active={index === currentIndex}
          videoUrl={videoUrl}
          posterUrl={item.poster}
          videoTitle={item.title}
          initialResume={parseInt(item.resume || '0', 10) || 0}
          wishlistActive={wishlistIds.has(item.id)}
          onBack={handleBack}
          onToggleWishlist={() => handleToggleWishlist(item)}
          onShare={() => handleShare(item)}
          onOpenEpisodes={handleOpenEpisodes}
          series={series}
          episodes={episodes}
          currentEpisodeIndex={index}
          onSelectEpisode={handleEpisodeSelect}
          onEpisodesVisibleChange={setListScrollEnabled}
        />
      </View>
    );
  };

  const renderEpisodesSheet = () => {
    return (
      <Modal
        visible={episodesVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEpisodesVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle} numberOfLines={1}>
                {series ? series.title : 'Episodes'}
              </Text>
              <TouchableOpacity
                style={styles.sheetClose}
                activeOpacity={0.7}
                onPress={() => setEpisodesVisible(false)}
              >
                <Icon source="close" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {episodes.map((episode, index) => {
                const active = index === currentIndex;
                return (
                  <TouchableOpacity
                    key={episode.id}
                    style={styles.episodeRow}
                    activeOpacity={0.8}
                    onPress={() => handleEpisodeSelect(index)}
                  >
                    <View style={styles.episodeMeta}>
                      <Text style={styles.episodeTitle} numberOfLines={1}>
                        {episode.title}
                      </Text>
                      {episode.subtitle ? (
                        <Text style={styles.episodeSubtitle}>{episode.subtitle}</Text>
                      ) : null}
                    </View>
                    <Icon
                      source={active ? 'play-circle' : 'play-circle-outline'}
                      size={24}
                      color={active ? '#e50914' : '#ffffff'}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (fetchStatus === 'idle' || fetchStatus === 'loading') {
    return <LoadingSpinner />;
  }

  if (fetchStatus === 'error' || !series || episodes.length === 0) {
    return <EmptyState />;
  }

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        // Only used to capture the height ONCE, on first real layout pass.
        // Ignored on every subsequent layout event (sheet open/close, inset
        // changes, etc.) so the FlatList's scroll math never gets recomputed
        // against a slightly different height mid-session.
        if (hasSetInitialHeight.current) {
          return;
        }
        const h = e.nativeEvent.layout.height;
        if (h > 0) {
          hasSetInitialHeight.current = true;
          if (Math.abs(h - viewportHeight) > 1) {
            setViewportHeight(h);
          }
        }
      }}
    >
      <FlatList
        ref={listRef}
        data={episodes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={listScrollEnabled}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={viewportHeight}
        snapToAlignment="start"
        disableIntervalMomentum
        initialScrollIndex={currentIndex}
        getItemLayout={(data, index) => ({
          length: viewportHeight,
          offset: viewportHeight * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollToIndexFailed={({ index }) => {
          if (listRef.current) {
            listRef.current.scrollToOffset({
              offset: index * viewportHeight,
              animated: false,
            });
          }
        }}
      />
      {renderEpisodesSheet()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  page: {
    backgroundColor: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '70%',
    paddingBottom: 30,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sheetTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginRight: 12,
  },
  sheetClose: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  episodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  episodeMeta: {
    flex: 1,
    marginRight: 12,
  },
  episodeTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  episodeSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
});

export default ReelsPlayerScreen;