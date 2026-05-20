import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  Animated,
  StatusBar, // ← added
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import {APIS, BASE_URL} from '../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {fonts} from '../../utils/fonts';
import StartupAnimation from './StartupAnimation';
import LottieView from 'lottie-react-native';
const Login = () => {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('123456');
  const [secure, setSecure] = useState(true);
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigation = useNavigation(); // for gentle breathing after reveal

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const userId = await AsyncStorage.getItem('userId');
    setTimeout(() => {
      if (userId) {
        navigation.reset({index: 0, routes: [{name: 'DashboardScreen'}]});
      } else {
        setChecking(false);
      }
    }, 2200);
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  const validateAndLogin = async () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Please enter your email');
      valid = false;
    }
    if (!password) {
      setPasswordError('Please enter your password');
      valid = false;
    }

    if (valid) {
      setLoading(true);
      const url = APIS.LOGIN;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: email,
          password: password,
        }),
      });
      const data = await res.json();
      console.log(data);

      if (data.code == 400) {
        setLoading(false);
        setPasswordError('Incorrect email or password');
        setEmailError('Incorrect email or password');
      }

      if (data.code === 200) {
        setLoading(false);

        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: 'Welcome back! Redirecting to dashboard…',
          position: 'bottom',
          visibilityTime: 2500,
          autoHide: true,
          topOffset: 50,
        });
        await AsyncStorage.setItem('userId', data.payload.admin_id.toString());

        navigation.reset({
          index: 0,
          routes: [{name: 'DashboardScreen'}],
        });
      }
    }
  };

  if (checking) {
    return (
      <StartupAnimation
        onFinish={() => {
          setChecking(false);
        }}
      />
    );
  }

  if (!checking) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        {/* Using ImageBackground for the subtle pattern */}

        <StatusBar backgroundColor={'#F05A28'} barStyle="light-content" />
        <View style={[styles.logoContainer, {backgroundColor: '#FFF'}]}>
          <Image
            source={require('/KoratFlims/assets/Images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Text style={[styles.welcomeText, {fontFamily: 'Inter_18pt-Bold'}]}>
            Login
          </Text>

          {/* EMAIL */}
          <View
            style={[
              styles.inputWrapper,
              {borderColor: emailError ? 'red' : '#e2e8f0'},
            ]}>
            <Icon
              name="mail-outline"
              size={20}
              color={focused === 'email' ? '#F05A28' : '#64748b'}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your Email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              maxLength={30}
            />
          </View>
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          {/* PASSWORD */}
          <View
            style={[
              styles.inputWrapper,
              {borderColor: passwordError ? 'red' : '#e2e8f0'},
            ]}>
            <Icon
              name="lock-closed-outline"
              size={20}
              color={focused === 'password' ? '#F05A28' : '#64748b'}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              secureTextEntry={secure}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              maxLength={10}
            />
            <TouchableOpacity
              onPress={() => setSecure(!secure)}
              activeOpacity={0.7}>
              <Icon
                name={secure ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.signInButton,
              {backgroundColor: loading ? '#e79174' : '#F05A28'},
            ]}
            activeOpacity={0.8}
            onPress={validateAndLogin}>
            <Text style={styles.signInButtonText}>
              {loading ? (
                <ActivityIndicator size={20} color={'#c4c4c4'} />
              ) : (
                'Sign In'
              )}
            </Text>
          </TouchableOpacity>
        </ScrollView>
        {!focused && (
          <View style={styles.bottomPatternWrapper}>
            <ImageBackground
              source={{
                uri: 'https://static.vecteezy.com/system/resources/previews/051/125/826/large_2x/fire-flow-hand-drawn-doodle-art-with-orange-lines-filling-the-paper-creative-abstract-illustration-suitable-for-wallpaper-drawing-books-covers-isolated-on-white-background-free-vector.jpg',
              }}
              // resizeMode="cover"
              style={StyleSheet.absoluteFillObject}
              imageStyle={{opacity: 0.03}}
            />
          </View>
        )}

        {/* {!focused && (
          <View style={styles.bottomPatternWrapper}>
           <LottieView
        source={require('./Loaders/animation.json')}
        autoPlay
        loop
        style={{width: "100%", height: 200}}
      />
          </View>
        )} */}
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F05A28" />
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },

  logoContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  bottomPatternWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250, // how much height from bottom you want visible
    overflow: 'hidden',
    // zIndex: -1,
    borderRadius: 150,
  },

  logo: {
    width: 420,
    height: 220,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },

  welcomeText: {
    fontSize: 18,
    // fontWeight: '700',
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginVertical: 10,
    color: '#000',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  input: {
    flex: 1,
    paddingVertical: 10,
    paddingLeft: 10,
    fontSize: 14,
    color: '#000',
    fontFamily: fonts.medium,
  },

  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 4,
  },

  signInButton: {
    backgroundColor: '#F05A28',
    borderRadius: 8,
    paddingVertical: 12,
    marginVertical: 15,
    alignItems: 'center',
  },

  signInButtonText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: fonts.semiBold,
    // fontWeight: '600',
  },

  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
});
