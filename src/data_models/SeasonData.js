import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { colors } from '../theming/colors';
import LinearGradient from 'react-native-linear-gradient';
const SeasonData = ({ isModalVisible, toggleModal, seasons, onSelectSeason, selectedSeason }) => {
  return (
    <Modal
      transparent={true}
      visible={isModalVisible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={toggleModal}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Season</Text>
            {/* <TouchableOpacity
              style={styles.closeBtn}
              onPress={toggleModal}
              activeOpacity={0.7}
            >
              <Image
                source={require('../../app_assets/symbols/sym_06.png')}
                style={styles.closeIcon}
              />
            </TouchableOpacity> */}
          </View>
          {/* Season List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {seasons.map((season, index) => {
              const isSelected = selectedSeason === season;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.row,
                    isSelected && styles.rowSelected,
                  ]}
                  onPress={() => {
                    onSelectSeason(season);
                    toggleModal();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.rowText,
                      isSelected && styles.rowTextSelected,
                    ]}
                  >
                    {season}
                  </Text>
                  {isSelected && <View style={styles.indicator} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
           <TouchableOpacity
            onPress={toggleModal}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={colors.gradients.primaryButton}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1c1c1e',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2c2c2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    width: 14,
    height: 14,
    tintColor: '#a1a1aa',
  },
  list: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  rowSelected: {
    borderColor: '#e50914',
    backgroundColor: 'rgba(229, 9, 20, 0.08)',
  },
  rowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  rowTextSelected: {
    color: '#e50914',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e50914',
  },
  cancelBtn: {
    marginTop: 10,
    paddingVertical: 12,
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
  },
});
export default SeasonData;