
import React from 'react'
import { View, StyleSheet } from 'react-native';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';


const ItemShimmer = () => {
  return (
    <View style={{marginTop:12}}>
      {[1, 2, 3, 4, 5,6,7,8,9].map((item) => (
        <View
          key={item}
          style={styles.rowContainer}
        >
          
          

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

           
          </View>

          {/* Right icons / actions */}
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

export default ItemShimmer
const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth:0.6 ,
    borderColor: '#D1D5DB',
    paddingHorizontal: 22,
    paddingVertical:18,
    width:"94%",
    maxWidth:400,
    marginLeft:10,
    borderRadius:12,
    

  },

  // Avatar
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 22,
    borderWidth: 0.7,
    borderColor: '#D1D5DB', // visible light gray border
    backgroundColor: '#F9FAFB', // subtle background so border stands out
  },

  // Text block
  textContainer: {
    flex: 1,
    gap: 6,
  },
  nameLine: {
    width: '60%',
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  subtitleLine: {
    width: '20%',
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
