import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

function Drawer() {
  return (
    <View style={styles.container}>
      <Text>Drawer</Text>
    </View>
  )
}

export default Drawer

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'red',
    zIndex: -1000,
  },
})
