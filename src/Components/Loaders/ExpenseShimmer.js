import React from 'react';
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const ExpenseShimmer = () => {
  return (
    <View style={{ marginTop: 0 }}>
      {[1,2,3,4,5,6,7,8].map((item) => (
        <View key={item} style={styles.card}>

          {/* LEFT COLOR STRIP */}
          <View style={styles.sideStrip}>
            <ShimmerPlaceHolder
              LinearGradient={LinearGradient}
              style={styles.verticalText}
              shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
              autoRun
              visible={false}
              duration={900}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* MAIN CONTENT */}
          <View style={styles.content}>

            {/* TOP ROW */}
            <View style={styles.topRow}>

              {/* LEFT TEXT */}
              <View style={{ flex: 1 }}>
                <ShimmerPlaceHolder
                  LinearGradient={LinearGradient}
                  style={styles.title}
                  shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                  autoRun
                  visible={false}
                  duration={900}
                />

                <ShimmerPlaceHolder
                  LinearGradient={LinearGradient}
                  style={styles.category}
                  shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                  autoRun
                  visible={false}
                  duration={900}
                />
              </View>

              {/* RIGHT AMOUNT */}
              <View style={{ alignItems: 'flex-end' }}>
                <ShimmerPlaceHolder
                  LinearGradient={LinearGradient}
                  style={styles.amount}
                  shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                  autoRun
                  visible={false}
                  duration={900}
                />

                <ShimmerPlaceHolder
                  LinearGradient={LinearGradient}
                  style={styles.date}
                  shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                  autoRun
                  visible={false}
                  duration={900}
                />
              </View>

              {/* MENU DOT */}
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.menu}
                shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                autoRun
                visible={false}
                duration={900}
              />
            </View>

            {/* BOTTOM PILLS */}
            <View style={styles.bottomRow}>

              {/* BALANCE */}
              <View style={styles.pill}>
                <ShimmerPlaceHolder
                  LinearGradient={LinearGradient}
                  style={styles.pillTitle}
                  shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                  autoRun
                  visible={false}
                  duration={900}
                />

                <ShimmerPlaceHolder
                  LinearGradient={LinearGradient}
                  style={styles.pillValue}
                  shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                  autoRun
                  visible={false}
                  duration={900}
                />
              </View>

              {/* DETAILS */}
              <View style={[styles.pill, { flex: 2 }]}>
                <ShimmerPlaceHolder
                  LinearGradient={LinearGradient}
                  style={styles.pillTitle}
                  shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                  autoRun
                  visible={false}
                  duration={900}
                />

                <ShimmerPlaceHolder
                  LinearGradient={LinearGradient}
                  style={styles.details}
                  shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                  autoRun
                  visible={false}
                  duration={900}
                />
              </View>

            </View>

          </View>
        </View>
      ))}
    </View>
  );
};

export default ExpenseShimmer;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 0.6,
    borderColor: '#D1D5DB',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    
    backgroundColor: '#fff',
    overflow: 'hidden',
  },

  sideStrip: {
    width: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },

  verticalText: {
    width: 40,
    height: 10,
    borderRadius: 4,
    transform: [{ rotate: '270deg' }],
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  divider: {
    width: 0.5,
    backgroundColor: '#E5E7EB',
  },

  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },

  title: {
    width: 120,
    height: 12,
    borderRadius: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  category: {
    width: 80,
    height: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  amount: {
    width: 70,
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  date: {
    width: 60,
    height: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  menu: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  bottomRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop:4
  },

  pill: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 4,

  },

  pillTitle: {
    width: 50,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  pillValue: {
    width: 60,
    height: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  details: {
    width: '90%',
    height: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
});