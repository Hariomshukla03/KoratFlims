
import React from 'react'
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';


const ProductShimmer = () => {
  return (
    <View style={{marginTop:12}}>
      {[1, 2, 3, 4, 5,6,7,8,9,10,11,12].map((item) => (
        <View
          key={item}
          style={styles.rowContainer}
        >
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

            
           
          </View>
          <View style={styles.iconsContainer}>
            {[1].map((icon) => (
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
  )
}

export default ProductShimmer
const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth:0.6 ,
    borderColor: '#D1D5DB',
    paddingHorizontal: 8,
    paddingVertical:12,
    width:"94%",
    maxWidth:400,
    marginLeft:10,
    borderRadius:12,


  },

  // Avatar
  avatar: {
    width: 46,
    height: 26,
    borderRadius: 23,
    marginRight: 22,
    borderWidth: 0.7,
    borderColor: '#D1D5DB', // visible light gray border
    backgroundColor: '#F9FAFB', // subtle background so border stands out
  },

  // Text block
  textContainer: {
    flex: 1,
    gap: 12,
  },
  nameLine: {
    width: '60%',
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  subtitleLine: {
    width: '80%',
    height: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  smallLine: {
    width: '40%',
    height: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },

  // Icons
  iconsContainer: {
    flexDirection: 'row',
    marginLeft: 12,
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
