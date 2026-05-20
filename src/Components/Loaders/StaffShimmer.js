import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const StaffShimmer = () => {
  return (
    <View style={styles.mainContainer}>
      {[1, 2, 3, 4, 5,6,7,8].map((item) => (
        <View
          key={item}
          style={styles.rowContainer}
        >
          {/* Name + Subtitle - Left side */}
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

          {/* Right icons / actions */}
          <View style={styles.iconsContainer}>
            {[1, 2].map((icon) => (
              <ShimmerPlaceHolder
                key={icon}
                LinearGradient={LinearGradient}
                style={styles.icon}
                shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
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
    paddingHorizontal: 10,
    width: '100%',
  },

  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',   // ← Yeh important hai
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    width: '100%',                     // ← Fixed
    maxWidth: 400,                     // Larger screens pe control
    alignSelf: 'center',               // Center on all devices
    borderWidth: 0.6,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#fff',
  },

  // Text block
  textContainer: {
    flex: 1,                           // Yeh line bahut zaroori hai
    gap: 6,
    marginRight: 12,
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
    alignItems: 'center',
  },

  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 10,
    borderWidth: 0.4,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
});

export default StaffShimmer;