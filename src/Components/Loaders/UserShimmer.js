import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const UserShimmer = () => {
  return (
    <View style={styles.mainContainer}>
      {[1, 2, 3, 4, 5,6,7].map((item) => (
        <View
          key={item}
          style={styles.rowContainer}
        >
          {/* Avatar circle */}
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={styles.avatar}
            shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
            shimmerDirection="right"
            duration={900}
            autoRun
            visible={false}
          />

          {/* Name + Subtitle */}
          <View style={styles.textContainer}>
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={styles.nameLine}
              shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
              shimmerDirection="right"
              duration={900}
              autoRun
              visible={false}
            />

            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={styles.subtitleLine}
              shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
              shimmerDirection="right"
              duration={900}
              autoRun
              visible={false}
            />

            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={styles.smallLine}
              shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
              shimmerDirection="right"
              duration={900}
              autoRun
              visible={false}
            />
          </View>

          {/* Right icons */}
          <View style={styles.iconsContainer}>
            {[1, 2, 3].map((icon) => (
              <ShimmerPlaceHolder
                key={icon}
                LinearGradient={LinearGradient}
                style={styles.icon}
                shimmerColors={['#E5E7EB', '#fefefe', '#E5E7EB']}
                shimmerDirection="right"
                duration={900}
                autoRun
                visible={false}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: 10,     // overall safe padding
    width: '100%',
  },

  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    width: '100%',                    // ← Important
    maxWidth: 400,                    // ← Desktop/larger screen limit
    alignSelf: 'center',              // center karne ke liye
    borderWidth: 0.6,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#fff',          // better look
  },

  // Avatar
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 16,
    borderWidth: 0.4,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },

  // Text block
  textContainer: {
    flex: 1,
    gap: 6,
  },
  nameLine: {
    width: '82%',
    height: 14,
    borderRadius: 4,
    borderWidth: 0.4,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  subtitleLine: {
    width: '65%',
    height: 12,
    borderRadius: 4,
    borderWidth: 0.4,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  smallLine: {
    width: '45%',
    height: 10,
    borderRadius: 4,
    borderWidth: 0.4,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },

  // Icons
  iconsContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 8,
    borderWidth: 0.4,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
});

export default UserShimmer;