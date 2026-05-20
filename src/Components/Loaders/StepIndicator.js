import React from 'react';
import { View } from 'react-native';
import { ProgressBar, Text, Surface } from 'react-native-paper';

const StepIndicator = ({ step = 1 }) => {
  // 🔥 calculate progress (3 steps)
  const progress = (step - 1) / 2;

  return (
    <View style={{ paddingHorizontal: 20, marginVertical: 10 }}>
      
      {/* Progress Line */}
      <ProgressBar
        progress={progress}
        color="#F05A28"
        style={{
          height: 4,
          borderRadius: 4,
          backgroundColor: '#E5E7EB',
        }}
      />

      {/* Dots */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          position: 'absolute',
          top: -8,
          left: 20,
          right: 20,
        }}
      >
        {[1, 2, 3].map(item => (
          <Surface
            key={item}
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor:
              step >= item ? '#F05A28' : '#E5E7EB',
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 10, color: '#fff' }}>
              {step > item ? '✔' : item}
            </Text>
          </Surface>
        ))}
      </View>

      {/* Labels */}
      {/* <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 10,
        }}
      >
        <Text variant="labelSmall">Party</Text>
        <Text variant="labelSmall">Items</Text>
        <Text variant="labelSmall">Couple</Text>
      </View> */}
    </View>
  );
};

export default StepIndicator;