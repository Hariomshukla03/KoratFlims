import React from 'react';
import {View, StyleSheet} from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const SaleShimmer = () => {
  return (
    <View>
      {[1, 2, 3, 4, 5, 6].map(item => (
        <View key={item} style={styles.rowContainer}>
          {/* ── Status Badge Top Right ── */}
          <ShimmerPlaceHolder
            LinearGradient={LinearGradient}
            style={styles.iconsec}
            shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
            shimmerDirection="right"
            autoRun
            visible={false}
            duration={900}
          />

          {/* ── Text Lines ── */}
          <View style={styles.textContainer}>
            {/* Sale Date */}
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={[styles.nameLine, {width: item % 2 === 0 ? '60%' : '50%'}]}
              shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
              shimmerDirection="right"
              autoRun
              visible={false}
              duration={900}
            />

            {/* Delivery Date */}
            

            {/* Party Name */}
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={[
                styles.subtitleLine,
                {width: item % 3 === 0 ? '65%' : '72%'},
              ]}
              shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
              shimmerDirection="right"
              autoRun
              visible={false}
              duration={900}
            />

            {/* Couple Name */}
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={[styles.subtitleLine, {width: '55%'}]}
              shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
              shimmerDirection="right"
              autoRun
              visible={false}
              duration={900}
            />

            {/* ── Bottom Pills: Grand Total | Discount | Total ── */}
            <View style={styles.pillsRow}>
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.pill}
                shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                shimmerDirection="right"
                autoRun
                visible={false}
                duration={900}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.pill}
                shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                shimmerDirection="right"
                autoRun
                visible={false}
                duration={900}
              />
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.pill}
                shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                shimmerDirection="right"
                autoRun
                visible={false}
                duration={900}
              />
            </View>
          </View>

          {/* ── Chevron Icon ── */}
          <View style={styles.iconsContainer}>
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={styles.icon}
              shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
              shimmerDirection="right"
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

export default SaleShimmer;

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    borderWidth: 0.6,
    borderColor: '#D1D5DB',
    paddingHorizontal: 22,
    paddingVertical: 10,
    width: '94%',
    maxWidth: 400,
    marginLeft: 12,
    borderRadius: 12,
    marginTop: 14,
    overflow: 'hidden',
  },

  textContainer: {
    flex: 1,
    gap: 12,
  },

  nameLine: {
    height: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    marginLeft: -4,
  },

  subtitleLine: {
    height: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    marginLeft: -4,
  },

  // ── 3 pills row ──
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },

  pill: {
    flex: 1,
    height: 36,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },

  // ── Status badge top right ──
  iconsec: {
    position: 'absolute',
    top: -1.5,
    right: -3,
    zIndex: 10,
    width: 58,
    height: 16,
    borderBottomLeftRadius: 4,
    borderTopRightRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },

  iconsContainer: {
    flexDirection: 'row',
    marginRight:-8,
    alignSelf: 'flex-end',
    marginBottom: 42,
  },

  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
});