import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { fonts } from '../../../utils/fonts';

const PaymentShimmer = () => {
  return (
    <View style={{ marginTop: 24 }}>
       <Text style={styles.sectionTitle}>Payment History</Text>
      {[1,2,3,4,5,6].map((item) => (
        <View key={item} style={styles.card}>

          <View style={styles.row}>

            {/* LEFT SIDE */}
            <View style={{ flex: 1 }}>
              
              {/* Date */}
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.date}
                shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                autoRun
                visible={false}
                duration={900}
              />

              {/* Party */}
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.party}
                shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                autoRun
                visible={false}
                duration={900}
                
              />

              {/* Mobile */}
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.mobile}
                shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                autoRun
                visible={false}
                duration={900}
              />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* RIGHT SIDE */}
            <View style={styles.right}>

              {/* Badge */}
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.badge}
                shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                autoRun
                visible={false}
                duration={900}
              />

              {/* Amount */}
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.amount}
                shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                autoRun
                visible={false}
                duration={900}
              />

              {/* Due */}
              <ShimmerPlaceHolder
                LinearGradient={LinearGradient}
                style={styles.due}
                shimmerColors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                autoRun
                visible={false}
                duration={900}
                
              />

            </View>

          </View>
        </View>
      ))}
    </View>
  );
};

export default PaymentShimmer;

const styles = StyleSheet.create({
  card: {
    borderWidth: 0.6,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    marginBottom: 8,
    marginHorizontal: 1,
    backgroundColor: '#fff',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
      fontSize: 16,
      fontFamily: fonts?.bold || 'bold',
      color: '#1f2937',
      marginBottom: 12,
    },

  divider: {
    width: 0.6,
    height: 55,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
    marginLeft:18
    
  },

  right: {
    alignItems: 'flex-end',
  },

  // LEFT
  date: {
    width: 70,
    height: 10,
    borderRadius: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  party: {
    width: 140,
    height: 12,
    borderRadius: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  mobile: {
    width: 100,
    height: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  // RIGHT
  badge: {
    width: 45,
    height: 16,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  amount: {
    width: 65,
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  due: {
    width: 70,
    height: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
});