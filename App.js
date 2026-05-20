import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import StackNav from './src/Navigation/StackNav'

import { PaperProvider } from 'react-native-paper';
const App = () => {
  return (
      <PaperProvider>
    <NavigationContainer>
      <StackNav/>
    </NavigationContainer>
    </PaperProvider>
  )
}

export default App