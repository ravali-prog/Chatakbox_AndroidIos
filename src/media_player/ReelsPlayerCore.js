import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  AppState,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import { Icon } from 'react-native-paper';
import { LogData, LogError } from '../app_config/AppConstants';

const ShareArrowIcon = require('../../app_assets/symbols/shareArrow.png');
const EpisodeIcon = require('../../app_assets/symbols/episode.png');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONTROLS_AUTO_HIDE_DELAY = 3500;
const DOUBLE_TAP_WINDOW = 300;
const PENDING_SEEK_HOLD_MS = 2500;

const EPISODE_GRID_GAP = 10;
const EPISODE_CELL_WIDTH = (SCREEN_WIDTH - 32 - EPISODE_GRID_GAP * 4) / 5;
const EPISODE_RANGE_CHUNK = 35;

const buildRanges = (total) => {
  const ranges = [];
  for (let start = 1; start <= total; start += EPISODE_RANGE_CHUNK) {
    const end = Math.min(start + EPISODE_RANGE_CHUNK - 1, total);
    ranges.push({ start, end });
  }
  return ranges;
};

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const ReelsPlayerCore = ({
  videoUrl,
  posterUrl,
  videoTitle = '',
  initialResume = 0,
  wishlistActive = false,
  active = true,
  onBack,
  onToggleWishlist,
  onShare,
  onOpenEpisodes,
  series = null,
  episodes = [],
  currentEpisodeIndex = 0,
  onSelectEpisode,
  onEpisodesVisibleChange,
}) => {
  const videoRef = useRef(null);
  const hideTimerRef = useRef(null);
  const tapTimeoutRef = useRef(null);
  const lastTapRef = useRef({ time: 0 });

  const [paused, setPaused] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState({ currentTime: 0, seekableDuration: 0 });
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [seekIndicator, setSeekIndicator] = useState(0);
  const [appState, setAppState] = useState(AppState.currentState);
  const [episodesOpen, setEpisodesOpen] = useState(false);

  // Tracks whether the video was actually playing right before we lost
  // foreground (e.g. opening the native Share sheet), so returning to the
  // app doesn't blindly flip play/pause state.
  const wasPlayingRef = useRef(!paused);

  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const seekIndicatorOpacity = useRef(new Animated.Value(0)).current;

  const actuallyPaused = active === false ? true : paused;

  const animateControls = (visible) => {
    Animated.timing(controlsOpacity, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const clearTapTimer = () => {
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }
  };

  const scheduleAutoHide = () => {
    clearHideTimer();
    if (!actuallyPaused) {
      hideTimerRef.current = setTimeout(() => {
        if (!actuallyPaused) {
          setControlsVisible(false);
          animateControls(false);
        }
      }, CONTROLS_AUTO_HIDE_DELAY);
    }
  };

  const showControls = () => {
    setControlsVisible(true);
    animateControls(true);
    scheduleAutoHide();
  };

  const toggleControls = () => {
    if (controlsVisible) {
      clearHideTimer();
      setControlsVisible(false);
      animateControls(false);
    } else {
      showControls();
    }
  };

  const seekBy = (seconds) => {
    const target = Math.max(0, progress.currentTime + seconds);
    if (videoRef.current) {
      videoRef.current.seek(target);
    }
    setProgress((prev) => ({ ...prev, currentTime: target }));
    setSeekValue(target);
  };

  const flashSeekIndicator = (dir) => {
    setSeekIndicator(dir);
    seekIndicatorOpacity.setValue(1);
    Animated.timing(seekIndicatorOpacity, {
      toValue: 0,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleTap = (event) => {
    // Ignore background taps entirely while the episodes sheet is open so
    // they can never race with a button underneath it.
    if (episodesOpen) {
      return;
    }

    const now = Date.now();
    const x = event.nativeEvent.pageX;
    const isDoubleTap = now - lastTapRef.current.time < DOUBLE_TAP_WINDOW;

    if (isDoubleTap) {
      clearTapTimer();
      const dir = x < SCREEN_WIDTH / 2 ? -10 : 10;
      seekBy(dir);
      flashSeekIndicator(dir);
      lastTapRef.current = { time: 0 };
      scheduleAutoHide();
    } else {
      lastTapRef.current = { time: now };
      clearTapTimer();
      tapTimeoutRef.current = setTimeout(() => {
        toggleControls();
      }, DOUBLE_TAP_WINDOW);
    }
  };

  const togglePlay = () => {
    if (!active) {
      return;
    }
    setPaused((prev) => {
      const next = !prev;
      if (!next) {
        scheduleAutoHide();
      } else {
        clearHideTimer();
      }
      return next;
    });
  };

  const onSeekSlidingStart = () => {
    setIsSeeking(true);
    clearHideTimer();
  };

  const onSeekSlidingComplete = (value) => {
    setIsSeeking(false);
    setSeekValue(value);
    if (videoRef.current) {
      videoRef.current.seek(value);
    }
    scheduleAutoHide();
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    showControls();
  };

  const handleWishlistPress = () => {
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 0.6,
        speed: 30,
        bounciness: 4,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        speed: 30,
        bounciness: 18,
        useNativeDriver: true,
      }),
    ]).start();
    if (onToggleWishlist) {
      onToggleWishlist();
    }
  };

  // Cancel any pending single-tap timer before firing Share, so a Share tap
  // can never be reinterpreted as a background tap that also toggles the
  // episodes sheet.
  const handleSharePress = () => {
    if (episodesOpen) {
      return;
    }
    clearTapTimer();
    if (onShare) {
      onShare();
    }
  };

  // Same guard for opening episodes: kill any queued tap-timer first so a
  // stray second tap can't fire the fallback overlay's toggleControls while
  // the sheet is animating in.
  const handleEpisodesPress = () => {
    clearTapTimer();
    setEpisodesOpen(true);
    if (onEpisodesVisibleChange) {
      onEpisodesVisibleChange(false);
    }
    if (onOpenEpisodes) {
      onOpenEpisodes();
    }
  };

  useEffect(() => {
    showControls();
    return () => {
      clearHideTimer();
      clearTapTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setVideoLoading(true);
  }, [videoUrl]);

  useEffect(() => {
    if (active) {
      setPaused(false);
      showControls();
    } else {
      clearHideTimer();
      setPaused(true);
      setControlsVisible(false);
      animateControls(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // Restore whatever state we actually had before backgrounding
        // (e.g. opening the native Share sheet) instead of blindly
        // toggling pause/play.
        setPaused(!wasPlayingRef.current);
      } else if (nextAppState.match(/inactive|background/)) {
        wasPlayingRef.current = !paused;
      }
      setAppState(nextAppState);
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState, paused]);

  const sliderMax = duration > 0 ? duration : progress.seekableDuration;

  return (
    <View style={styles.container}>
      {videoUrl ? (
        <Video
          ref={(ref) => (videoRef.current = ref)}
          source={{ uri: videoUrl, type: 'm3u8' }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          paused={actuallyPaused}
          muted={isMuted}
          repeat={true}
          useTextureView={true}
          onLoadStart={() => {
            setVideoLoading(true);
            LogData('[ReelsPlayer] onLoadStart', videoUrl);
          }}
          onLoad={(data) => {
            setVideoLoading(false);
            if (data && data.duration) {
              setDuration(data.duration);
            }
            if (initialResume > 0 && videoRef.current) {
              videoRef.current.seek(initialResume);
            }
            LogData('[ReelsPlayer] onLoad', data);
          }}
          onPlaying={() => {
            LogData('[ReelsPlayer] onPlaying', {});
          }}
          onBuffer={({ isBuffering }) => {
            LogData('[ReelsPlayer] onBuffer', isBuffering);
          }}
          onError={(error) => {
            setVideoLoading(false);
            LogError('[ReelsPlayer] onError', JSON.stringify(error));
          }}
          onProgress={(x) => {
            if (!isSeeking) {
              setProgress({
                currentTime: x.currentTime,
                seekableDuration: x.seekableDuration,
              });
            }
          }}
        />
      ) : (
        posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : null
      )}

      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'transparent', 'transparent', 'rgba(0,0,0,0.55)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {videoUrl && videoLoading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#FF7A00" />
        </View>
      )}

      {seekIndicator !== 0 && (
        <Animated.View
          style={[
            styles.seekIndicatorWrap,
            {
              opacity: seekIndicatorOpacity,
              left: seekIndicator > 0 ? '80%' : '18%',
            },
          ]}
          pointerEvents="none"
        >
          <View style={styles.seekIndicatorBox}>
            <Text style={styles.seekIndicatorText}>
              {seekIndicator > 0 ? '+10' : '-10'}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Disabled while the episodes sheet is open so it can never
          intercept / race with a tap on Share or the episodes button. */}
      <TouchableWithoutFeedback onPress={handleTap} disabled={episodesOpen}>
        <View style={StyleSheet.absoluteFill} pointerEvents={episodesOpen ? 'none' : 'auto'} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.header, { opacity: controlsOpacity }]}
        pointerEvents={controlsVisible && !episodesOpen ? 'box-none' : 'none'}
      >
        <TouchableOpacity
          style={styles.headerBack}
          activeOpacity={0.7}
          onPress={onBack}
        >
          <Icon source="arrow-left" size={26} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {videoTitle}
        </Text>
        <View style={styles.headerBack} />
      </Animated.View>

      <Animated.View
        style={[styles.bottomSection, { opacity: controlsOpacity }]}
        pointerEvents={controlsVisible && !episodesOpen ? 'box-none' : 'none'}
      >
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={handleWishlistPress}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Icon
                source={wishlistActive ? 'heart' : 'heart-outline'}
                size={30}
                color={wishlistActive ? '#e50914' : '#ffffff'}
              />
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={handleSharePress}
          >
            <Image
              source={ShareArrowIcon}
              style={styles.actionIconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={handleEpisodesPress}
          >
            <Image
              source={EpisodeIcon}
              style={styles.actionIconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.muteRow}>
          <TouchableOpacity
            style={styles.muteButton}
            activeOpacity={0.7}
            onPress={toggleMute}
          >
            <Icon
              source={isMuted ? 'volume-off' : 'volume-high'}
              size={18}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.seekRow}>
          <Text style={styles.timeText}>
            {formatTime(isSeeking ? seekValue : progress.currentTime)}
          </Text>
          <Slider
            style={styles.seekBar}
            minimumValue={0}
            maximumValue={sliderMax || 1}
            value={isSeeking ? seekValue : progress.currentTime}
            onValueChange={(value) => {
              if (isSeeking) {
                setSeekValue(value);
              }
            }}
            onSlidingStart={onSeekSlidingStart}
            onSlidingComplete={onSeekSlidingComplete}
            minimumTrackTintColor="#FF3830"
            maximumTrackTintColor="rgba(255, 255, 255, 0.48)"
            thumbTintColor="#FF7A00"
          />
          <Text style={styles.timeText}>{formatTime(sliderMax)}</Text>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.controlButton}
            activeOpacity={0.7}
            onPress={() => {
              seekBy(-10);
              flashSeekIndicator(-10);
              scheduleAutoHide();
            }}
          >
            <Icon source="rewind-10" size={30} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.playButton}
            activeOpacity={0.7}
            onPress={togglePlay}
          >
            <Icon
              source={actuallyPaused ? 'play' : 'pause'}
              size={34}
              color="#ffffff"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            activeOpacity={0.7}
            onPress={() => {
              seekBy(10);
              flashSeekIndicator(10);
              scheduleAutoHide();
            }}
          >
            <Icon source="fast-forward-10" size={30} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <EpisodeSelector
        visible={episodesOpen}
        posterUrl={posterUrl}
        videoTitle={videoTitle}
        series={series}
        episodes={episodes}
        currentEpisodeIndex={currentEpisodeIndex}
        onClose={() => {
          setEpisodesOpen(false);
          if (onEpisodesVisibleChange) {
            onEpisodesVisibleChange(true);
          }
        }}
        onSelectEpisode={(index) => {
          setEpisodesOpen(false);
          if (onEpisodesVisibleChange) {
            onEpisodesVisibleChange(true);
          }
          if (onSelectEpisode) {
            onSelectEpisode(index);
          }
        }}
      />
    </View>
  );
};

const EpisodeSelector = ({
  visible,
  posterUrl,
  videoTitle,
  series,
  episodes,
  currentEpisodeIndex,
  onClose,
  onSelectEpisode,
}) => {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const totalEpisodes = episodes.length;
  const ranges = buildRanges(totalEpisodes);
  const currentEpisodeNumber = currentEpisodeIndex + 1;

  const [activeRangeIndex, setActiveRangeIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      const containing = ranges.findIndex(
        (r) => currentEpisodeNumber >= r.start && currentEpisodeNumber <= r.end,
      );
      if (containing >= 0) {
        setActiveRangeIndex(containing);
      }
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const seasonSet = new Set();
  episodes.forEach((ep) => {
    if (ep && ep.clipDetails && ep.clipDetails.season != null) {
      seasonSet.add(String(ep.clipDetails.season));
    }
  });
  const seasonCount = seasonSet.size > 0 ? seasonSet.size : 1;
  const firstSeason = episodes[0]?.clipDetails?.season || 1;

  const title = (series && series.title) || videoTitle || 'Episodes';
  const subtitle = `${seasonCount} season(s) • ${totalEpisodes} Eps`;
  const tags = ((series && series.subtitle) || '')
    .split('·')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const description =
    (series && series.description) ||
    episodes
      .slice(0, 4)
      .map((ep) => ep.title)
      .filter(Boolean)
      .join(' • ');

  const range = ranges[activeRangeIndex] || ranges[0];
  const gridNumbers = [];
  if (range) {
    for (let num = range.start; num <= range.end; num += 1) {
      gridNumbers.push(num);
    }
  }

  return (
    <View style={styles.epOverlay} pointerEvents={visible ? 'box-none' : 'none'}>
      <Animated.View
        style={[styles.epBackdrop, { opacity: backdropOpacity }]}
        onStartShouldSetResponder={() => true}
      />
      <Animated.View style={[styles.epPanel, { transform: [{ translateY }] }]}>
        <View style={styles.epHandle} />
        <TouchableOpacity
          style={styles.epClose}
          activeOpacity={0.7}
          onPress={onClose}
        >
          <Icon source="close" size={22} color="#ffffff" />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.epScroll}
        >
            <View style={styles.epInfoRow}>
              <View style={styles.epPosterWrap}>
                {posterUrl ? (
                  <Image
                    source={{ uri: posterUrl }}
                    style={styles.epPoster}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.epPoster, styles.epPosterFallback]}>
                    <Icon source="film" size={20} color="rgba(255,255,255,0.4)" />
                  </View>
                )}
              </View>
              <View style={styles.epInfo}>
                <Text style={styles.epTitle} numberOfLines={1}>
                  {title}
                </Text>
                <Text style={styles.epSubtitle}>{subtitle}</Text>
                {tags.length > 0 && (
                  <View style={styles.epTagRow}>
                    {tags.map((tag) => (
                      <View key={tag} style={styles.epTagPill}>
                        <Text style={styles.epTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {description ? (
              <Text style={styles.epDescription} numberOfLines={2}>
                {description}
              </Text>
            ) : null}

            <View style={styles.epSeasonRow}>
              <View style={styles.epSeasonPill}>
                <Text style={styles.epSeasonText}>
                  {`Season ${firstSeason}`}
                </Text>
                <Icon source="chevron-down" size={16} color="#FF7A00" />
              </View>
            </View>

            {ranges.length > 1 && (
              <View style={styles.epRangeRow}>
                {ranges.map((r, index) => {
                  const isActive = index === activeRangeIndex;
                  return (
                    <TouchableOpacity
                      key={`${r.start}-${r.end}`}
                      activeOpacity={0.7}
                      onPress={() => setActiveRangeIndex(index)}
                    >
                      <View style={styles.epRangeTab}>
                        <Text
                          style={[
                            styles.epRangeText,
                            isActive && styles.epRangeTextActive,
                          ]}
                        >
                          {`${r.start}-${r.end}`}
                        </Text>
                        <View
                          style={[
                            styles.epRangeUnderline,
                            isActive && styles.epRangeUnderlineActive,
                          ]}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.epGrid}>
              {gridNumbers.map((num) => {
                const isCurrent = num === currentEpisodeNumber;
                return (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.epCell,
                      isCurrent && styles.epCellCurrent,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (onSelectEpisode) {
                        onSelectEpisode(num - 1);
                      }
                    }}
                  >
                    <Text style={styles.epCellText}>{num}</Text>
                    {isCurrent && (
                      <Icon source="chart-bar" size={12} color="#FFC107" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerBack: {
    width: 44,
    height: 44,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: 26,
  },
  actionRow: {
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 20,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },
  actionIconImage: {
    width: 25,
    height: 25,
  },
  muteRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: 27,
    marginBottom: 15,
  },
  muteButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:"#111111b1",
    borderRadius: 20,

  },
  seekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  seekBar: {
    flex: 1,
    height: 36,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 25,
    // marginTop: 4,
  },
  controlButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 55,
    height: 55,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: '#ffffff',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    minWidth: 42,
  },
  seekIndicatorWrap: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.42,
    transform: [{ translateX: -32 }],
  },
  seekIndicatorBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekIndicatorText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  epOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    // Sits above header/bottomSection/share/episode buttons so it can never
    // render (or receive taps) behind them, or behind a native share sheet.
    zIndex: 999,
    elevation: 999,
  },
  epBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  epPanel: {
    height: '78%',
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 6,
  },
  epHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginBottom: 8,
  },
  epClose: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  epScroll: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  epInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  epPosterWrap: {
    width: 76,
    height: 76,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1C1C1F',
    marginRight: 12,
  },
  epPoster: {
    width: 76,
    height: 76,
  },
  epPosterFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  epInfo: {
    flex: 1,
  },
  epTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  epSubtitle: {
    color: '#9A9A9E',
    fontSize: 13,
    marginTop: 3,
  },
  epTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  epTagPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  epTagText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  epDescription: {
    color: '#B8B8BD',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
  },
  epSeasonRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  epSeasonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#FF7A00',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  epSeasonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  epRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 20,
  },
  epRangeTab: {
    alignItems: 'center',
  },
  epRangeText: {
    color: '#9A9A9E',
    fontSize: 13,
    fontWeight: '600',
  },
  epRangeTextActive: {
    color: '#FF7A00',
  },
  epRangeUnderline: {
    marginTop: 5,
    height: 2,
    width: 34,
    borderRadius: 1,
    backgroundColor: 'transparent',
  },
  epRangeUnderlineActive: {
    backgroundColor: '#22C55E',
  },
  epGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: EPISODE_GRID_GAP,
    marginTop: 18,
  },
  epCell: {
    width: EPISODE_CELL_WIDTH,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#1C1C1F',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  epCellCurrent: {
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  epCellText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});

export default ReelsPlayerCore;