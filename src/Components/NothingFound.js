import {View, Text, Image, StyleSheet} from 'react-native';
import React, {useState, useEffect} from 'react';
import {fonts} from '../../utils/fonts';

const NothingFound = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);
  if (!show) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('/KoratFlims/assets/Images/Notfound.png')}
        style={styles.gif}
      />
      <Text style={styles.title}>Not Found</Text>
      <Text style={styles.subtitle}>
        We couldn’t find what you’re looking for.
      </Text>
    </View>
  );
};

export default NothingFound;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 20,
  },
  gif: {
    width: 120,
    height: 120,
    marginBottom: 0,
    marginTop: 80,
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: '#111827',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
