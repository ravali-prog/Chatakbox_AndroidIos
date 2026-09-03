import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Linking, Image, Animated
} from 'react-native';
import { deactivatePlan, getPrivileges, getSubscriptions } from '../../state_mgmt/AppCommonSlice';
import { LOCAL_EVENTS, LogData, LogError, USER_UUID } from '../../app_config/AppConstants';
import { useNavigation } from '@react-navigation/native';
import { getActiveGooglePurchases } from '../../payment/PurchaseHelper';
import { EventRegister } from 'react-native-event-listeners';
import { device } from '../../app_config/DeviceInfo';
import { colors } from '../../theming/colors';

var deviceId = device.id;

const DOT_COLORS = ['#e50914', '#e87c16', '#ffffff', '#e87c16', '#e50914'];

const Dot = ({ color, delay }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
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
        loaderStyles.dot,
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
    <View style={loaderStyles.container}>
      <View style={loaderStyles.dotsRow}>
        {DOT_COLORS.map((color, i) => (
          <Dot key={i} color={color} delay={i * 150} />
        ))}
      </View>
      <Animated.Text style={[loaderStyles.label, { opacity: labelOpacity }]}>
        LOADING
      </Animated.Text>
    </View>
  );
};

const loaderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
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
    color: '#dedede',
    letterSpacing: 3,
    fontWeight: '500',
  },
});

export function SubscriptionCard() {
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [planInfo, setPlanInfo] = useState(null);
  const [showLoading, setShowLoading] = useState(false);
  const navigation = useNavigation();
  const currentTimeMillis = Date.now();
  const currentTimeSeconds = Math.floor(currentTimeMillis / 1000);

  const getStatusConfig = (subscriptionData) => {
    const { expiry, deactivation } = subscriptionData;
    if (expiry > currentTimeSeconds) {
      return { color: '#4CAF50', bg: '#0d2e0d', border: '#1a4a1a', label: 'Active', accentColor: '#4CAF50' };
    } else if (expiry < currentTimeSeconds && deactivation !== null) {
      return { color: '#FF6B35', bg: '#2e1a0d', border: '#4a2e1a', label: 'Suspended', accentColor: '#FF6B35' };
    } else if (expiry < currentTimeSeconds && deactivation === null) {
      return { color: '#838383', bg: '#1f1f1f', border: '#2a2a2a', label: 'Expired', accentColor: '#838383' };
    }
    return { color: '#838383', bg: '#1f1f1f', border: '#2a2a2a', label: '', accentColor: '#838383' };
  };

  const handleDeactivate = () => {
    try {
      if (!subscriptionData) return;
      if (subscriptionData.deact_flow === 'api') {
        if (subscriptionData.deactivation) {
          setShowLoading(true);
          deactivatePlan(subscriptionData.deactivation)
            .then(resp => {
              try {
                setShowLoading(false);
                if (resp.data?.status === 101 && resp.data?.msg === 'Success') {
                  EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE, { msg: 'Deactivated Successfully' });
                  getPrivileges();
                  fetchSubscriptionData();
                } else if (resp.data?.status === 101 && resp.data?.msg === 'Already Deactivated') {
                  EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE, { msg: 'Already Deactivated' });
                } else {
                  EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE, { msg: 'Failed to deactivate' });
                }
              } catch (error) {
                LogError('Subscriptions handleDeactivate deactivatePlan catch inside', error);
              }
            })
            .catch(() => {
              setShowLoading(false);
              EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE, { msg: 'Something went wrong!' });
            });
        }
      } else if (subscriptionData.deact_flow === 'redirect') {
        if (subscriptionData.deactivation?.startsWith('https://')) {
          Linking.openURL(subscriptionData.deactivation)
            .catch(err => LogError('Failed to open URL:', err));
        }
      }
    } catch (error) {
      LogError('Subscriptions handleDeactivate deactivatePlan catch outside', error);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = () => {
    try {
      const response = getSubscriptions(USER_UUID);
      response.then((x) => {
        try {
          if (x.errorcode === 400) {
            EventRegister.emitEvent(LOCAL_EVENTS.EVENT_HANDLE_SHOWTOASTMESSAGE, { msg: 'Network error please try again' });
            return;
          }
          if (x && x.data && x.data.resultcode === '101') {
            setSubscriptionData(x.data.purchases[0]);
            if (x.data.purchases[0]?.planinfo?.[0]) {
              setPlanInfo(x.data.purchases[0].planinfo[0]);
            }
          } else {
            setSubscriptionData(null);
            setPlanInfo(null);
          }
        } catch (error) {
          LogError('Subscriptions fetchSubscriptionData getSubscriptions catch inside', error);
        }
      }).catch(() => {});
    } catch (error) {
      LogError('Subscriptions fetchSubscriptionData getSubscriptions catch outside', error);
    }
  };

  const formatUnixTimestamp = (timestamp) => {
    if (!isNaN(timestamp) && timestamp > 0) {
      const date = new Date(timestamp * 1000);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-IN', options);
    }
    return 'Invalid Date';
  };

  const statusConfig = subscriptionData ? getStatusConfig(subscriptionData) : null;

  return (
    <>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Image
              source={require('../../../app_assets/symbols/sym_06.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>Subscriptions</Text>
        </View>

        {subscriptionData ? (
          <View style={styles.content}>
            <View style={styles.card}>
              <View style={[styles.cardAccent, { backgroundColor: statusConfig.accentColor }]} />

              <View style={styles.cardHeader}>
                <View style={styles.planTitleBlock}>
                  <Text style={styles.planName}>{planInfo?.title}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: statusConfig.bg, borderColor: statusConfig.border }]}>
                  <View style={[styles.badgeDot, { backgroundColor: statusConfig.color }]} />
                  <Text style={[styles.badgeText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                </View>
              </View>

              <View style={styles.infoBlock}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Text style={styles.infoValue}>{planInfo?.validity}</Text>
                </View>

                {subscriptionData?.autorenew !== undefined && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Auto Renew</Text>
                    <Text style={styles.infoValue}>{subscriptionData?.autorenew ? 'On' : 'Off'}</Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Expiry Date</Text>
                  <Text style={styles.infoValue}>{formatUnixTimestamp(subscriptionData?.expiry)}</Text>
                </View>

                <View style={[styles.infoRow, styles.infoRowLast]}>
                  <Text style={styles.infoLabel}>Activated On</Text>
                  <Text style={styles.infoValue}>{formatUnixTimestamp(subscriptionData?.activated)}</Text>
                </View>
              </View>

              {subscriptionData.deact_msg_text ? (
                <View style={styles.deactMsgBox}>
                  <Text style={styles.deactMsgText}>{subscriptionData.deact_msg_text}</Text>
                </View>
              ) : null}

              {subscriptionData.deactivation ? (
                <TouchableOpacity onPress={handleDeactivate} style={styles.deactButton} activeOpacity={0.75}>
                  <Text style={styles.deactButtonText}>{subscriptionData.deact_btn_text}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Text style={{ fontSize: 32 }}>📭</Text>
            </View>
            <Text style={styles.emptyTitle}>No Active Subscriptions</Text>
            <Text style={styles.emptySub}>Subscribe to unlock and watch our content.</Text>
          </View>
        )}
      </View>

      {/* Floating restore button */}
      <TouchableOpacity
        style={styles.floatingButton}
        activeOpacity={0.8}
        onPress={() => {
          setShowLoading(true);
          getActiveGooglePurchases(() => setShowLoading(false));
        }}
      >
        <Text style={styles.floatingText1}>Already purchased but not reflecting?</Text>
        <Text style={styles.floatingText2}> Tap to Sync</Text>
      </TouchableOpacity>

      {/* Loading overlay with custom Loader */}
      {showLoading && (
        <View style={styles.loadingOverlay}>
          <Loader />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#1f1f1f',
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#141414',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
    marginTop: 8,
  },
  cardAccent: {
    height: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 14,
  },
  planTitleBlock: {
    flex: 1,
    marginRight: 12,
  },
  planName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  infoBlock: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 4,
    paddingHorizontal: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1f1f1f',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    color: '#888888',
    fontSize: 13,
  },
  infoValue: {
    color: '#e0e0e0',
    fontSize: 13,
    fontWeight: '500',
  },
  deactMsgBox: {
    backgroundColor: '#1a1111',
    borderWidth: 0.5,
    borderColor: '#3a1f1f',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 14,
  },
  deactMsgText: {
    color: '#e88888',
    fontSize: 13,
  },
  deactButton: {
    margin: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deactButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySub: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  floatingText1: {
    color: '#888888',
    fontSize: 13,
  },
  floatingText2: {
    color: colors.action_primary,
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
});