import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Easing,
  Modal,
  Pressable,
  BackHandler,
  Dimensions,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {fonts} from '../../utils/fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNExitApp from 'react-native-exit-app';

const {width} = Dimensions.get('window');

const MENU_ITEMS = [
  { title: 'Party Master',      icon: 'account-group',                  color: '#4B7BEC', screen: 'PartyScreen' },
  { title: 'Item Master',       icon: 'cube-outline',                   color: '#FF6B6B', screen: 'ItemScreen' },
  { title: 'Product Master',    icon: 'package-variant',                color: '#FFD93D', screen: 'ProdScreen' },
  { title: 'Staff Master',      icon: 'account-tie',                    color: '#6BCB77', screen: 'StaffScreen' },
  { title: 'Quotation',         icon: 'file-document-outline',          color: '#FF6AD5', screen: 'QuotationScreen' },
  { title: 'Sales Bill',        icon: 'receipt',                        color: '#45AAF2', screen: 'Sale' },
  { title: 'Final Booking',     icon: 'calendar-check-outline',         color: '#20BF6B', screen: 'FinalBooking' },
  { title: 'Booking Staff',     icon: 'account-multiple-check-outline', color: '#A55EEA', screen: 'BookingStaff' },
  { title: 'Booking Payment',   icon: 'credit-card-outline',            color: '#F7B731', screen: 'Payment' },
  { title: 'Appointment',       icon: 'calendar-clock-outline',         color: '#777718',   screen: 'Appointment' },
  { title: 'Program',           icon: 'clipboard-list',                 color: '#8B5CF6',   screen: '',  },
  { title: 'Package',           icon: 'gift-outline',                   color: '#FA8231', screen: 'Package' },
  { title: 'Manage Expense',    icon: 'cash-multiple',                  color: '#9d13a7b4', screen: 'ManageExpense' },
  { title: 'Expense Report',    icon: 'file-chart-outline',             color: '#4F46E5',   screen: 'ExpenseReport' },
  { title: 'Staff Payment',     icon: 'account-cash-outline',           color: '#F59E0B',   screen: '',  },
  { title: 'Income Entry',      icon: 'cash-plus',                      color: '#F43F5E',   screen: 'IncomeEntry' },
  { title: 'Expense Entry',     icon: 'cash-minus',                     color: '#06B6D4',   screen: '',  },
  { title: 'Income / Expense',  icon: 'chart-areaspline',               color: '#F97316',   screen: '',},
];

const ConfirmModal = ({visible, title, message, confirmLabel, confirmColor, onCancel, onConfirm}) => (
  <Modal transparent visible={visible} animationType="fade">
    <Pressable
      onPress={onCancel}
      style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Pressable
        onPress={() => {}}
        style={{
          width: '80%',
          backgroundColor: '#ffffff',
          borderRadius: 14,
          padding: 20,
        }}>
        <Text style={{
          fontSize: 20,
          fontFamily: fonts.bold,
          marginBottom: 18,
          color: '#000',
        }}>
          {title}
        </Text>
        <Text style={{color: '#555', marginBottom: 20}}>
          {message}
        </Text>
        <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
          <TouchableOpacity
            onPress={onCancel}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#D0D5DD',
              marginRight: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFFFFF',
            }}
            activeOpacity={0.8}>
            <Text style={{color: '#344054', fontFamily: fonts.semiBold, fontSize: 14}}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            style={{
              backgroundColor: '#FF4D4F',
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 3,
              minWidth: 70,
            }}
            activeOpacity={0.8}>
            <Text style={{color: '#FFFFFF', fontFamily: fonts.semiBold, fontSize: 14}}>
              {confirmLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Pressable>
  </Modal>
);

// Layout constants
const LOGO_SIZE   = 92;
const HERO_HEIGHT = 138;
const CURVE_H     = 24;

const AdminDash = () => {
  const navigation = useNavigation();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [exitVisible,   setExitVisible]   = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideUp   = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 480,
        easing: Easing.out(Easing.ease), useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0, duration: 480,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1, friction: 5, tension: 90, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const handleBack = () => { setExitVisible(true); return true; };
      const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => sub.remove();
    }, []),
  );

  const handleExit   = () => { setExitVisible(false); RNExitApp.exitApp(); };
  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({index: 0, routes: [{name: 'LoginScreen'}]});
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F05A28" barStyle="light-content" />

      {/* ── ORANGE HERO ── */}
      <View style={styles.hero}>
        {/* Top row: Title LEFT, buttons RIGHT — same row at the top */}
        <View style={styles.topBar}>
          <Text style={styles.appName}>KoratFilms</Text>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Icon name="bell-outline" size={21} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.7}
              onPress={() => setLogoutVisible(true)}>
              <Icon name="logout" size={21} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.appSub}>Admin Dashboard</Text>
      </View>

      {/* Curved bottom of orange */}
      <View style={styles.heroCurve} />

      {/* ── FLOATING LOGO — centred, half-in half-out of orange ── */}
      <Animated.View
        style={[
          styles.logoFloat,
          {transform: [{scale: logoScale}]},
        ]}>
        <View style={[styles.logoRing,]}>
          <Image
            source={require('/KoratFlims/assets/Images/KR.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      {/* ── DECORATIVE CIRCLES ── */}
      <View pointerEvents="none" style={styles.circleBL} />
      <View pointerEvents="none" style={styles.circleBR} />
      <View pointerEvents="none" style={styles.circleML} />

      {/* ── SCROLLABLE GRID ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        <Animated.View
          style={[
            styles.gridCard,
            {opacity: fadeAnim, transform: [{translateY: slideUp}]},
          ]}>
          <View style={styles.grid}>
            {MENU_ITEMS.map((item, index) => {
              const isDisabled = item.disable === 'true';
              const ic = isDisabled ? '#C8C8C8' : item.color;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.gridItem, isDisabled && styles.gridItemDisabled]}
                  onPress={() => { if (item.screen && !isDisabled) navigation.navigate(item.screen); }}
                  disabled={isDisabled}
                  activeOpacity={0.55}>
                  <View style={[styles.iconWrap, {backgroundColor: ic + '18'}]}>
                    <Icon name={item.icon} size={22} color={ic} />
                  </View>
                  <Text style={[styles.itemLabel, isDisabled && styles.itemLabelDisabled]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

      </ScrollView>

      <ConfirmModal
        visible={logoutVisible}
        title="Logout?"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Logout"
        confirmColor="#F05A28"
        onCancel={() => setLogoutVisible(false)}
        onConfirm={handleLogout}
      />
      <ConfirmModal
        visible={exitVisible}
        title="Exit App?"
        message="Are you sure you want to exit the application?"
        confirmLabel="Exit"
        confirmColor="#FF4D4F"
        onCancel={() => setExitVisible(false)}
        onConfirm={handleExit}
      />
    </View>
  );
};

export default AdminDash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },

  /* ── Orange hero ── */
  hero: {
    backgroundColor: '#F05A28',
    height: HERO_HEIGHT,
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 26,
    color: '#fff',
    fontFamily: fonts.bold,
    letterSpacing: 0.4,
  },
  appSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.light,
    marginTop: 3,
    letterSpacing: 0.5,
  },

  /* Curved bottom */
  heroCurve: {
    height: CURVE_H,
    backgroundColor: '#F05A28',
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
  },

  /* ── Floating logo ── */
  logoFloat: {
    position: 'absolute',
    top: HERO_HEIGHT + CURVE_H - LOGO_SIZE / 2,
    alignSelf: 'center',
    zIndex: 20,

  },
  logoRing: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: '#F05A28',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor:"#F05A28",
  borderBottomWidth:2.5

  },
  logoImg: {
    width: LOGO_SIZE - 6,   // inset by border width so it never bleeds
    height: LOGO_SIZE - 6,
    borderRadius: (LOGO_SIZE - 6) / 2,
  },

  /* ── Scroll ── */
  scrollContent: {
    paddingTop: LOGO_SIZE / 2 + 14,
    paddingHorizontal: 14,
    paddingBottom: 40,
  },

  /* ── White grid card — very subtle shadow ── */
  gridCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },

  /* ── Decorative circles ── */
  circleBL: {
    position: 'absolute',
    bottom: -55,
    left: -55,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(240, 90, 40, 0.08)',
    zIndex: 0,
  },
  circleBR: {
    position: 'absolute',
    bottom: -40,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(240, 90, 40, 0.06)',
    zIndex: 0,
  },
  circleML: {
    position: 'absolute',
    bottom: 160,
    right: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(240, 90, 40, 0.07)',
    zIndex: 0,
  },

  /* ── 4-col grid ── */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 3,
  },
  gridItemDisabled: {
    opacity: 0.38,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: 10,
    textAlign: 'center',
    color: '#374151',
    fontFamily: fonts.light,
    lineHeight: 12,
    marginTop: 0,
  },
  itemLabelDisabled: {
    color: '#ADADAD',
  },
});






/////////////////////////////////////////////////////////////////////////////////




// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
//   Animated,
//   Easing,
//   Modal,
//   Pressable,
//   BackHandler,
//   Dimensions,
// } from 'react-native';
// import React, {useCallback, useEffect, useRef, useState} from 'react';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import {useFocusEffect, useNavigation} from '@react-navigation/native';
// import {fonts} from '../../utils/fonts';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import RNExitApp from 'react-native-exit-app';
// const {width} = Dimensions.get('window');
// const AdminDash = () => {
//   const navigation = useNavigation();
//   const [logoutVisible, setLogoutVisible] = useState('false');
//   const [exitVisible, setExitVisible] = useState('false');

//   const translateY = useRef(new Animated.Value(400)).current;
//   useEffect(() => {
//     Animated.timing(translateY, {
//       toValue: 0,
//       duration: 400,
//       easing: Easing.out(Easing.ease),
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       const handleBack = () => {
//         setExitVisible(true);
//         return true;
//       };

//       const subscription = BackHandler.addEventListener(
//         'hardwareBackPress',
//         handleBack,
//       );

//       return () => subscription.remove();
//     }, []),
//   );

//   const handleExit = () => {
//     setExitVisible(false);
//     RNExitApp.exitApp();
//   };

//   const handleLogout = async () => {
//     await AsyncStorage.clear();
//     navigation.reset({
//       index: 0,
//       routes: [{name: 'LoginScreen'}],
//     });
//   };
//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor={'#F05A28'} barStyle="light-content" />
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>KoratFilms</Text>
//         <View style={{flexDirection: 'row', gap: 20}}>
//           <Text>
//             <Icon name="bell-outline" size={25} color="#FFF" />
//           </Text>
//           <TouchableOpacity
//             activeOpacity={0.6}
//             onPress={() => {
//               setLogoutVisible(true);
//             }}
//             style={{}}>
//             <Icon name="logout" size={25} color="#FFF" />
//           </TouchableOpacity>
//         </View>
//       </View>
//       <View style={styles.curvedBackground}>
//         <View style={styles.curveLayer} />
//       </View>

//       {/* Main Content */}
//       <ScrollView contentContainerStyle={styles.contentContainer}>
//         <Animated.View
//           style={[
//             styles.optionsContainer,
//             {
//               transform: [{translateY}],
//             },
//           ]}>
//           <View style={[styles.items]}>
//             {[
//               {
//                 title: 'Party Master',
//                 icon: 'account-group',
//                 color: '#4B7BEC',
//                 screen: 'PartyScreen',
//               },
//               {
//                 title: 'Item Master',
//                 icon: 'cube-outline',
//                 color: '#FF6B6B',
//                 screen: 'ItemScreen',
//               },
//               {
//                 title: 'Product Master',
//                 icon: 'package-variant',
//                 color: '#FFD93D',
//                 screen: 'ProdScreen',
//               },
//               {
//                 title: 'Staff Master',
//                 icon: 'account-tie',
//                 color: '#6BCB77',
//                 screen: 'StaffScreen',
//               },
//               {
//                 title: 'Quotation',
//                 icon: 'file-document-outline',
//                 color: '#FF6AD5',
//                 screen: 'QuotationScreen',
//               },
//               {
//                 title: 'Sales Bill',
//                 icon: 'receipt',
//                 color: '#45AAF2',
//                 screen: 'Sale',
//               },
//               {
//                 title: 'Final Booking',
//                 icon: 'calendar-check-outline',
//                 color: '#20BF6B',
//                 screen: 'FinalBooking',
//               },
//               {
//                 title: 'Booking Staff Assign',
//                 icon: 'account-multiple-check-outline',
//                 color: '#A55EEA',
//                 screen: 'BookingStaff',
//               },
//               {
//                 title: 'Booking Payment',
//                 icon: 'credit-card-outline',
//                 color: '#F7B731',
//                 screen: 'Payment',
//               },
//               {
//                 title: 'Appointment',
//                 icon: 'calendar-clock-outline',
//                 // color: '#3867D6',
//                 color: '#7777',
//                 screen: 'Appointment',
//                 // disable:"true"
//               },
//               {
//                 title: 'Program',
//                 icon: 'clipboard-list',
//                 // color: '#EB3B5A',
//                 color: '#7777',
//                 screen: '',
//                 disable: 'true',
//               },
//               {
//                 title: 'Package',
//                 icon: 'gift-outline',
//                 color: '#FA8231',
//                 screen: 'Package',
//               },
//               {
//                 title: 'Manage Expense',
//                 icon: 'cash-multiple',
//                 color: '#9d13a7b4',
//                 screen: 'ManageExpense',
//               },
//               {
//                 title: 'Expense Report',
//                 icon: 'file-chart-outline',
//                 // color: '#2D98DA',
//                 color: '#7777',
//                 screen: 'ExpenseReport',
//                 // disable:"true"
//               },
//               {
//                 title: 'Staff Payment',
//                 icon: 'account-cash-outline',
//                 color: '#26DE81',
//                 // color: '#7777',
//                 screen: 'StaffPayment',
//                 // disable: 'true',
//               },
//               {
//                 title: 'Income Entry',
//                 icon: 'cash-plus',
//                 // color: '#20BF6B',
//                 color: '#7777',
//                 screen: 'IncomeEntry',
//                 // disable: 'true',
//               },
//               {
//                 title: 'Expense Entry',
//                 icon: 'cash-minus',
//                 // color: '#EB3B5A',
//                 color: '#7777',
//                 screen: '',
//                 disable: 'true',
//               },
//               {
//                 title: 'Income / Expense Report',
//                 icon: 'chart-areaspline',
//                 // color: '#8854D0',
//                 color: '#7777',
//                 screen: '',
//                 disable: 'true',
//               },
//             ].map((item, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={styles.itemBox}
//                 onPress={() => {
//                   if (item.screen) navigation.navigate(item.screen);
//                 }}
//                 disabled={item.disable ? true : false}>
//                 <Icon name={item.icon} size={26} color={item.color} />
//                 <Text style={styles.itemText}>{item.title}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </Animated.View>
//       </ScrollView>
//       <Modal transparent visible={logoutVisible} animationType="fade">
//         <Pressable
//           onPress={() => setLogoutVisible(false)}
//           style={{
//             flex: 1,
//             backgroundColor: 'rgba(0,0,0,0.8)',
//             justifyContent: 'center',
//             alignItems: 'center',
//           }}>
//           {/* Modal Box */}
//           <Pressable
//             onPress={() => {}}
//             style={{
//               width: '80%',
//               backgroundColor: '#ffffff',
//               borderRadius: 14,
//               padding: 20,
//             }}>
//             <Text
//               style={{
//                 fontSize: 20,
//                 fontFamily: fonts.bold,
//                 marginBottom: 18,
//                 color: '#000',
//               }}>
//               Logout ?
//             </Text>

//             <Text style={{color: '#555', marginBottom: 20}}>
//               Are you sure you want to Logout ?
//             </Text>

//             <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
//               <TouchableOpacity
//                 onPress={() => setLogoutVisible(false)}
//                 style={{
//                   paddingVertical: 8,
//                   paddingHorizontal: 16,
//                   borderRadius: 8,
//                   borderWidth: 1,
//                   borderColor: '#D0D5DD',
//                   marginRight: 12,
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   backgroundColor: '#FFFFFF',
//                 }}
//                 activeOpacity={0.8}>
//                 <Text
//                   style={{
//                     color: '#344054',
//                     fontFamily: fonts.semiBold,
//                     fontSize: 14,
//                   }}>
//                   Cancel
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() => {
//                   handleLogout();
//                 }}
//                 style={{
//                   backgroundColor: '#FF4D4F',
//                   paddingVertical: 8,
//                   paddingHorizontal: 14,
//                   borderRadius: 8,
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   elevation: 3, // Android shadow
//                 }}
//                 activeOpacity={0.8}>
//                 <Text
//                   style={{
//                     color: '#FFFFFF',
//                     fontFamily: fonts.semiBold,
//                     fontSize: 14,
//                   }}>
//                   Logout
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </Pressable>
//         </Pressable>
//       </Modal>
//       <Modal transparent visible={exitVisible} animationType="fade">
//         <Pressable
//           onPress={() => setExitVisible(false)}
//           style={{
//             flex: 1,
//             backgroundColor: 'rgba(0,0,0,0.8)',
//             justifyContent: 'center',
//             alignItems: 'center',
//           }}>
//           {/* Modal Box */}
//           <Pressable
//             onPress={() => {}}
//             style={{
//               width: '80%',
//               backgroundColor: '#ffffff',
//               borderRadius: 14,
//               padding: 20,
//             }}>
//             <Text
//               style={{
//                 fontSize: 20,
//                 fontFamily: fonts.bold,
//                 marginBottom: 18,
//                 color: '#000',
//               }}>
//               Exit App ?
//             </Text>

//             <Text style={{color: '#555', marginBottom: 20}}>
//               Are you sure you want to Exit App ?
//             </Text>

//             <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
//               <TouchableOpacity
//                 onPress={() => setExitVisible(false)}
//                 style={{
//                   paddingVertical: 8,
//                   paddingHorizontal: 16,
//                   borderRadius: 8,
//                   borderWidth: 1,
//                   borderColor: '#D0D5DD',
//                   marginRight: 12,
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   backgroundColor: '#FFFFFF',
//                 }}
//                 activeOpacity={0.8}>
//                 <Text
//                   style={{
//                     color: '#344054',
//                     fontFamily: fonts.semiBold,
//                     fontSize: 14,
//                   }}>
//                   Cancel
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() => {
//                   handleExit();
//                 }}
//                 style={{
//                   backgroundColor: '#FF4D4F',
//                   paddingVertical: 8,
//                   paddingHorizontal: 14,
//                   borderRadius: 8,
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   elevation: 3,
//                   width: 85, // Android shadow
//                 }}
//                 activeOpacity={0.8}>
//                 <Text
//                   style={{
//                     color: '#FFFFFF',
//                     fontFamily: fonts.semiBold,
//                     fontSize: 14,
//                   }}>
//                   Exit
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </Pressable>
//         </Pressable>
//       </Modal>
//       <View
//         style={{
//           position: 'absolute',
//           bottom: -40,
//           right: -40,
//           backgroundColor: 'rgba(255, 235, 59, 0.16)', // very light yellow
//           width: 165,
//           height: 165,
//           borderRadius: 1000,
//           zIndex: -1,
//         }}
//       />

//       <View
//         style={{
//           position: 'absolute',
//           bottom: 120,
//           left: -30,
//           backgroundColor: '#ffd7001f', // even lighter
//           width: 85,
//           height: 85,
//           borderRadius: 1000,
//           zIndex: -10,
//         }}
//       />

//       <View
//         style={{
//           position: 'absolute',
//           bottom: 100,
//           right: -20,
//           backgroundColor: 'rgba(255, 215, 0, 0.12)', // even lighter
//           width: 65,
//           height: 65,
//           borderRadius: 1000,
//           zIndex: -10,
//         }}
//       />
//       <View
//         style={{
//           position: 'absolute',
//           right: -70,
//           top: -60,
//           backgroundColor: 'rgba(255, 215, 0, 0.14)', // even lighter
//           width: 220,
//           height: 220,
//           borderRadius: 1000,
//         }}
//       />
//     </View>
//   );
// };

// export default AdminDash;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f0f2f5',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     paddingTop: 10,
//     zIndex: 100,
//     paddingBottom: 20,
//   },
//   headerTitle: {
//     fontSize: 22,
//     color: '#FFF',
//     fontFamily: fonts.semiBold,
//   },
//   backgroundImage: {
//     width: '200%',
//     height: 550,
//     resizeMode: 'cover',
//     position: 'absolute',
//     top: -10,
//   },
//   curvedBackground: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 300,
//     backgroundColor: '#4B7BEC',
//     borderBottomLeftRadius: 80,
//     borderBottomRightRadius: 80,
//     overflow: 'hidden',
//   },
//   curveLayer: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: '#F05A28',
//   },
//   contentContainer: {
//     paddingTop: 130,
//     paddingHorizontal: 10,
//     alignItems: 'center',
//     paddingBottom: 50,
//   },
//   optionsContainer: {
//     backgroundColor: '#fff',
//     margin: 8,
//     borderRadius: 18,
//     paddingVertical: 8,
//     elevation: 5,
//   },
//   items: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//   },
//   itemBox: {
//     width: '30%',
//     alignItems: 'center',
//     marginVertical: 2,
//     marginBottom: 1,
//     paddingVertical: 8,
//   },
//   itemText: {
//     fontSize: 12,
//     textAlign: 'center',
//     color: '#444',
//     fontFamily: fonts.light,
//   },
// });
