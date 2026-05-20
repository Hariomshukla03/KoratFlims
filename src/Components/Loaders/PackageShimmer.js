import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const PackageShimmer = () => {
  return (
    <View>
      {[1, 2, 3, 4, 5, 6,7,8,9].map((item) => (
        <View key={item} style={styles.rowContainer}>
          <View style={styles.textContainer}>
            
            {/* Line 1 */}
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={[styles.line, { width: item % 2 === 0 ? '65%' : '50%' }]}
              shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
              autoRun
              visible={false}
              duration={900}
            />

            {/* Line 2 */}
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={[styles.line, { width: '80%' }]}
              shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
              autoRun
              visible={false}
              duration={900}
            />

            {/* Line 3 */}
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={[styles.line, { width: '55%' }]}
              shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
              autoRun
              visible={false}
              duration={900}
            />
          </View>

          {/* Right Icon */}
          <View style={styles.iconsContainer}>
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={styles.icon}
              shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
              autoRun
              visible={false}
              duration={900}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

export default PackageShimmer;

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 0.6,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 22, // 🔥 reduced height
    width: "93%",
    maxWidth:400,
    marginLeft: 12,
    borderRadius: 16,
    marginTop: 13,
  },

  textContainer: {
    flex: 1,
    gap: 6, // 🔥 tighter spacing
  },

  line: {
    height: 9, // 🔥 thinner lines
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },

  iconsContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },

  icon: {
    width: 30, // 🔥 smaller icon
    height: 30,
    borderRadius: 51,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
});