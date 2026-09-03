import React, {useState} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  TouchableHighlight,
  TouchableNativeFeedback,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTVEventHandler} from 'react-native-tvos';

const DetailsTv = () => {
  const handlePlayPress = () => {
  };

  const [selectedIcon, setSelectedIcon] = useState('Play');

  const handleIconPress = iconName => {
    setSelectedIcon(iconName);
    // ...rest of your handleIconPress logic
  };
  const handleIconFocus = iconName => {
    setSelectedIcon(iconName);
  };

  useTVEventHandler(event => {
    if (event && event.eventType === 'focus') {
      handlePlayPress(); // Handle focus event as needed
    }
  });

  const TouchableComponent =
    Platform.OS === 'android' ? TouchableNativeFeedback : TouchableHighlight;

  const getIconStyle = iconName => {
    if (iconName === selectedIcon) {
      return [styles.iconContainer, styles.selectedIcon];
    }
    return styles.iconContainer;
  };

  return (
    <TouchableComponent
      activeOpacity={1}
      style={styles.container}
      onFocus={handlePlayPress}
      hasTVPreferredFocus={true}
      tvParallaxProperties={{magnification: 1.2, pressMagnification: 0.8}}
      // underlayColor="rgba(255, 0, 0, 0.5)"
    >
      <View style={styles.touchable}>
        <Image
          source={require('../../app_assets/pictures/pic_07.jpg')}
          style={styles.image}
        />

        <LinearGradient
          colors={[
            'rgba(0,0,0,1)',
            'rgba(0,0,0,1)',
            'rgba(0,0,0,1)',
            'rgba(0,0,0,1)',
            'rgba(0,0,0,1)',
            'rgba(0,0,0,1)',
            'rgba(0,0,0,0)',
          ]}
          start={{x: 0, y: 0.5}}
          end={{x: 1, y: 0.5}}
          style={styles.overlay}
        />

        <View style={styles.scrollview}>
          <Text style={styles.title}>VideoName</Text>

          <Text style={styles.type}>Romantic,comedy,hindi</Text>
          <Text style={styles.videoConetntText}>S1:E1-RR17</Text>
          <Text style={styles.videoConetntText}>
            One morning in an ordinary town, five people are shot dead in a
            seemingly random attack. All evidence points to a single suspect: an
            ex-military sniper who is quickly brought into custody. The man's
            interrogation yields one statement: Get Jack Reacher
          </Text>
          <Text style={styles.videoConetntText}>Cast: Unknown</Text>
          <Text style={styles.videoConetntText}>Director: Unknown</Text>
          <Text style={styles.videoConetntText}>Producer: unknown</Text>

          <ScrollView
            contentContainerStyle={{flexGrow: 1}}
            showsVerticalScrollIndicator={false}>
            <TouchableComponent
              activeOpacity={1}
              onPress={() => handleIconPress('Play')}
              onFocus={() => handleIconFocus('Play')}>
              <View style={getIconStyle('Play')}>
                <Image
                  source={require('../../app_assets/symbols/sym_58.png')}
                  style={styles.icon}
                />
                <Text style={styles.iconText}>Play S1:E1</Text>
              </View>
            </TouchableComponent>

            <TouchableComponent
              activeOpacity={1}
              onPress={() => handleIconPress('Video')}
              onFocus={() => handleIconFocus('Video')}>
              <View style={getIconStyle('Video')}>
                <Image
                  source={require('../../app_assets/symbols/sym_76.png')}
                  style={styles.icon}
                />
                <Text style={styles.iconText}>Watch Trailer</Text>
              </View>
            </TouchableComponent>

            <TouchableComponent
              activeOpacity={1}
              onPress={() => handleIconPress('MoreEpisode')}
              onFocus={() => handleIconFocus('MoreEpisode')}
              hasTVPreferredFocus={true}
              tvParallaxProperties={{
                magnification: 1.2,
                pressMagnification: 0.8,
              }}

              // underlayColor="rgba(255, 0, 0, 1)"
            >
              <View style={getIconStyle('MoreEpisode')}>
                <Image
                  source={require('../../app_assets/symbols/sym_54.png')}
                  style={styles.icon}
                />
                <Text style={styles.iconText}>More Episodes</Text>
              </View>
            </TouchableComponent>

            <TouchableComponent
              activeOpacity={1}
              onPress={() => handleIconPress('Heart')}
              onFocus={() => handleIconFocus('Heart')}
              hasTVPreferredFocus={true}
              tvParallaxProperties={{
                magnification: 1.2,
                pressMagnification: 0.8,
              }}>
              <View style={getIconStyle('Heart')}>
                <Image
                  source={require('../../app_assets/symbols/sym_37.png')}
                  style={styles.icon}
                />
                <Text style={styles.iconText}>Add to Wishlist</Text>
              </View>
            </TouchableComponent>

            <TouchableComponent
              activeOpacity={1}
              onPress={() => handleIconPress('Add')}
              onFocus={() => handleIconFocus('Add')}>
              <View style={getIconStyle('Add')}>
                <Image
                  source={require('../../app_assets/symbols/sym_03.png')}
                  style={styles.icon}
                />
                <Text style={styles.iconText}>More like this</Text>
              </View>
            </TouchableComponent>

            <View>
              <View style={{flexDirection: 'row'}}>
                <TouchableComponent
                  activeOpacity={1}
                  onPress={() => handleIconPress('Like')}
                  onFocus={() => handleIconFocus('Like')}>
                  <View style={getIconStyle('Like')}>
                    <Image
                      source={require('../../app_assets/symbols/sym_44.png')}
                      style={styles.icon}
                    />
                    <Text style={styles.iconText}>Like</Text>
                  </View>
                </TouchableComponent>

                <TouchableComponent
                  activeOpacity={1}
                  onPress={() => handleIconPress('unlike')}
                  onFocus={() => handleIconFocus('unlike')}>
                  <View style={getIconStyle('unlike')}>
                    <Image
                      source={require('../../app_assets/symbols/sym_24.png')}
                      style={styles.icon}
                    />
                    <Text style={styles.iconText}>Unlike</Text>
                  </View>
                </TouchableComponent>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </TouchableComponent>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  touchable: {
    flex: 1,
  },
  scrollview: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  image: {
    flex: 1,
    width: null,
    height: null,
    marginStart: 300,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    width: '60%',
  },
  title: {
    fontSize: 19,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 20,
    padding: 5,
    marginTop: 40,
  },
  type: {
    fontSize: 12,
    color: 'white',
    padding: 5,
    marginLeft: 20,
  },
  videoConetntText: {
    fontSize: 13,
    color: 'white',
    padding: 5,
    marginRight: 60,
    marginLeft: 20,
  },
  playContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginTop: 10,
  },
  playBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  playText: {
    fontSize: 14,
    color: 'white',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 40,
    marginTop: 10,
  },
  icon: {
    width: 15,
    height: 15,
    tintColor: 'white',
    marginRight: 10,
  },
  iconText: {
    fontSize: 14,
    color: 'white',
  },

  selectedIcon: {
    borderColor: 'red',
    borderWidth: 1,
    backgroundColor: 'red',
    overflow: 'hidden',

    width: 200,
    padding: 5,
    borderRadius: 3,
  },
});

export default DetailsTv;
