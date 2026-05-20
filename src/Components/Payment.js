import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  BackHandler,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {APIS} from '../../utils/Apis';
import {fonts} from '../../utils/fonts';
import NothingFound from './NothingFound';
import PaymentShimmer from './Loaders/PaymentShimmer';

const Payment = ({route}) => {
  const navigation = useNavigation();
  const [error, setError] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [searching, setSearching] = useState(false);
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(false);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);

      const response = await fetch(APIS.GET_BOOKING, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      const items = json?.payload || [];

      const formatted = items.map(item => ({
        label: `${item.outdoor_id || '—'} (${item.couple_name || '—'}) ${
          item.party_mobile || '—'
        }`,
        value: item.outdoor_id,
        raw: item,
      }));

      setBookings(formatted);
    } catch (err) {
      console.error('Fetch bookings failed:', err);
      Alert.alert('Error', 'Failed to load bookings.');
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (selectedItem) {
        setSelectedItem(null);
        return true;
      } else {
        navigation.goBack(); // manually go back
        return true;
      }
    };
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
  }, [selectedItem]);

  useEffect(() => {
    fetchBookings();
  }, []);
  const handleBack = () => {
    if (selectedItem == null) {
      navigation.goBack();
    } else {
      setSelectedItem(null);
    }
  };
  const handleEdit = item => {
    navigation.navigate('PaymentForm', {item});
    setSelectedItem('');
  };

  const handleDeleteConfirm = async id => {
    console.log(id);
    const res = await fetch(APIS.DELETE_PAYMENT, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        outdoor_payment_id: id,
      }),
    });
    const data = await res.json();
    console.log(data);
    if (data.code == 200) {
      setDeleteVisible(false);
      setSelectedItem(null);
      handleSearch();
    }
  };
  useFocusEffect(
    useCallback(() => {
      if (route.params?.refresh && selectedBooking) {
        handleSearch();
        navigation.setParams({refresh: false});
      }
    }, [route.params?.refresh, selectedBooking]),
  );

  const handleSearch = async () => {
    if (!selectedBooking) {
      Alert.alert('Required', 'Please select a booking first');
      return;
    }
    setData([]);

    setSearching(true);

    try {
      const res = await fetch(APIS.GET_PAYMENT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          outdoor_id: selectedBooking,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();

      // Important: save the array directly
      const paymentsArray = json.payload || json.data || json || []; // fallback in case structure varies
      setData(paymentsArray);
    } catch (error) {
      console.error('Fetch payments failed:', error);
      Alert.alert('Error', 'Failed to load payments. Please try again.');
      setData([]); // clear on error
    } finally {
      setSearching(false);
    }
  };

  const ORANGE = '#F05A28';
  const ORANGE_LIGHT_BG = '#FFF1EB';
  const ORANGE_BORDER = '#f0d5c8';

  const renderPaymentItem = ({item}) => {
    const received = Number(item.received || 0);
    const outstanding = Number(item.outstanding || 0);
    const isSelected =
      selectedItem?.outdoor_payment_id === item.outdoor_payment_id;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSelectedItem(null)}
        onLongPress={() => setSelectedItem(item)}
        style={[
          {
            backgroundColor: isSelected ? ORANGE_LIGHT_BG : '#ffffff',
            borderRadius: 12,
            marginHorizontal: 0,
            marginVertical: 5,
            borderWidth: isSelected ? 1.5 : 0.6,
            borderColor: isSelected ? ORANGE : '#e3e3e3',
            overflow: 'hidden',
            shadowColor: '#7777',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: isSelected ? 0.15 : 0.06,
            shadowRadius: 6,
            elevation: isSelected ? 4 : 2,
          },
          isSelected && styles.cardSelected,
        ]}>
        {/* Top accent bar */}
        {/* <View style={{ height: 3, backgroundColor: ORANGE }} /> */}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 10,
            gap: 12,
          }}>
          {/* ── LEFT: Date + Party + Mobile ── */}
          <View style={{flex: 1}}>
            <Text
              style={{
                fontSize: 10,
                color: ORANGE,
                fontFamily: fonts.bold,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                marginBottom: 2,
              }}>
              {item.payment_date || '—'}
            </Text>

            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                fontFamily: fonts.bold,
                color: '#1a1a1a',
                marginBottom: 2,
              }}>
              <Text
                style={{
                  fontFamily: fonts.regular,
                  color: '#888',
                  fontSize: 12,
                }}>
                Party:{' '}
              </Text>
              {item.party_name || '—'}
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: '#555',
                fontFamily: fonts.regular,
              }}>
              <Text style={{color: '#888'}}>Mob: </Text>
              {item.mobile_no || '—'}
            </Text>
          </View>

          {/* Vertical divider */}
          <View
            style={{
              width: 0.5,
              height: 52,
              backgroundColor: isSelected ? '#f5c9b8' : '#f5e8e3',
            }}
          />

          {/* ── RIGHT: Payment type + Amount + Due ── */}
          <View style={{alignItems: 'flex-end', gap: 4}}>
            {/* Payment type badge */}
            <View
              style={{
                backgroundColor: isSelected ? ORANGE : ORANGE_LIGHT_BG,
                paddingHorizontal: 9,
                paddingVertical: 2,
                borderRadius: 20,
              }}>
              <Text
                style={{
                  fontSize: 10,
                  color: isSelected ? '#fff' : ORANGE,
                  fontFamily: fonts.bold,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}>
                {item.payment_type || '—'}
              </Text>
            </View>

            {/* Received amount */}
            <Text
              style={{
                fontSize: 15,
                fontFamily: fonts.bold,
                color: '#1a1a1a',
              }}>
              ₹ {received.toLocaleString('en-IN')}
            </Text>

            {/* Outstanding */}
            <Text
              style={{
                fontSize: 11,
                fontFamily: outstanding > 0 ? fonts.bold : fonts.regular,
                color: outstanding > 0 ? '#d32f2f' : '#aaa',
              }}>
              Due: ₹ {outstanding.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Booking Payment</Text>

        <View style={styles.rightHeader}>
          {selectedItem ? (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionIcon}
                onPress={() => handleEdit(selectedItem)}>
                <Icon name="pencil-outline" size={22} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionIcon}
                onPress={() => setDeleteVisible(true)}>
                <Icon name="delete-outline" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{width: 40}} />
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, {marginTop: -4}]}>
          Select Booking <Text style={styles.required}>*</Text>
        </Text>

        <View style={styles.rowContainer}>
          {
            <Dropdown
              style={styles.dropdownRow}
              autoScroll={false}
              searchPlaceholderTextColor="#000"
              itemTextStyle={{
                color: '#000',
                fontSize: 14.5,
                marginVertical: -8,
              }}
              placeholderStyle={{color: '#777'}}
              selectedTextStyle={{color: '#000'}}
              inputSearchStyle={{
                color: '#000',
                height: 40,
                fontSize: 13,
                padding: -10,
              }}
              data={bookings}
              search
              keyboardType="phone-pad"
              maxHeight={300}
              activeColor="#fef1e6"
              labelField="label"
              valueField="value"
              placeholder="Select Couple..."
              searchPlaceholder="Search..."
              value={selectedBooking || null}
              onChange={item => setSelectedBooking(item.value)}
              containerStyle={styles.dropdownContainer}
              disable={searching}
            />
          }

          <TouchableOpacity
            style={[
              styles.searchButtonRow,
              (!selectedBooking || loadingBookings || searching) &&
                styles.buttonDisabled,
            ]}
            onPress={handleSearch}
            disabled={!selectedBooking || loadingBookings || searching}>
            {searching ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <FontAwesome
                name="search"
                size={18}
                color={
                  !selectedBooking || loadingBookings || searching
                    ? '#000'
                    : '#fff'
                }
              />
            )}
          </TouchableOpacity>
        </View>

        {data?.length > 0 && (
          <View style={{marginTop: 24}}>
            <Text style={styles.sectionTitle}>Payment History</Text>

            <FlatList
              data={data}
              renderItem={renderPaymentItem}
              keyExtractor={item => item.outdoor_payment_id}
              scrollEnabled={false} // important: disable nested scrolling
              contentContainerStyle={{paddingBottom: 90}}
              ListEmptyComponent={
                <Text style={styles.noDataText}>
                  No payments found for this booking
                </Text>
              }
            />
          </View>
        )}
        {searching && <PaymentShimmer />}
        {data?.code == 400 && (
          <View>
            <NothingFound />
          </View>
        )}
        <Modal transparent visible={deleteVisible} animationType="fade">
          <Pressable
            onPress={() => setDeleteVisible(false)}
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.8)',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Pressable
              style={{
                width: '80%',
                backgroundColor: '#ffffff',
                borderRadius: 14,
                padding: 20,
              }}>
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: fonts.bold,
                  marginBottom: 18,
                  color: '#000',
                }}>
                Delete Payment?
              </Text>

              <Text style={{color: '#555', marginBottom: 20}}>
                Are you sure you want to delete this Payment?
              </Text>

              <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                <TouchableOpacity
                  onPress={() => setDeleteVisible(false)}
                  style={{marginRight: 20}}>
                  <Text style={{color: '#666'}}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    handleDeleteConfirm(selectedItem.outdoor_payment_id);
                  }}>
                  <Text style={{color: '#FF4D4F', fontFamily: fonts.bold}}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>

      {/* FLOAT BUTTON */}
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.addBtn}
        onPress={() => navigation.navigate('PaymentForm')}>
        <Icon name="plus" size={26} color="#fff" />
        <Text style={styles.addBtnText}>Add Payment</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Payment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F05A28',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
  },

  cardSelected: {
    backgroundColor: '#fff4ec',
    borderColor: '#fed7aa',
  },

  backButton: {
    padding: 4,
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: fonts?.bold || 'bold',
    color: '#fff',
    letterSpacing: 0.4,
    padding: 4,
    marginLeft: '20%',
  },

  scroll: {
    flex: 1,
  },
  rightHeader: {
    width: 80,
    alignItems: 'flex-end',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    paddingHorizontal: 8,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1.5,
  },

  label: {
    fontSize: 15.5,
    fontFamily: fonts?.medium || '600',
    color: '#1f2937',
    marginBottom: 10,
  },

  required: {
    color: '#dc2626',
  },

  dropdown: {
    height: 54,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },

  placeholderStyle: {
    fontSize: 15,
    color: '#9ca3af',
  },

  selectedTextStyle: {
    fontSize: 15,
    color: '#111827',
  },

  inputSearchStyle: {
    height: 50,
    fontSize: 15,
    color: '#111827',
  },

  dropdownContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  loadingContainer: {
    height: 54,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
  },

  loadingText: {
    color: '#6b7280',
    fontSize: 14.5,
    marginLeft: 10,
  },

  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F05A28',
    borderRadius: 10,
    height: 52,
    marginTop: 28,
  },

  buttonDisabled: {
    backgroundColor: '#d0d0d0',
    color: '#000',
    opacity: 0.75,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts?.medium || '600',
  },

  addBtn: {
    position: 'absolute', // ← Yeh important hai
    bottom: 30, // bottom se distance
    right: 16, // right side se distance
    backgroundColor: '#F05A28', // Tumhara original color (blue)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 50, // Fully rounded (pill shape)
    elevation: 8, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 100, // Sabke upar dikhe
  },

  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownRow: {
    flex: 1,
    height: 45,
    width: 320,
    marginLeft: 1,
    backgroundColor: '#FFF',
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
  },
  searchButtonRow: {
    height: 45,
    width: 52,
    backgroundColor: '#F05A28',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  loadingContainerRow: {
    flex: 1,
    height: 52,
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: fonts?.bold || 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
});
