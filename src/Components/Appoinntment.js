import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Modal,
  Pressable,
  BackHandler,
  ScrollView,
  Linking,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Divider, Menu} from 'react-native-paper';
import FIcon from 'react-native-vector-icons/FontAwesome';
import {fonts} from '../../utils/fonts';
import {APIS} from '../../utils/Apis';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ExpenseShimmer from './Loaders/ExpenseShimmer'; // rename/reuse ExpenseShimmer if needed

const Appointment = ({route}) => {
  const {item} = route.params || {};
  const navigation = useNavigation();

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [startDateString, setStartDateString] = useState('08-07-2024');
  const [endDate, setEndDate] = useState(new Date());
  const [endDateString, setEndDateString] = useState('');

  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [menuVisible, setMenuVisible] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const data = [
    {
      appointment_id: 1,
      party_name: 'Rahul Sharma',
      phone: '9876543210',
      event_type: 'Wedding',
      booking_date: '2026-04-10',
      function_date: '2026-04-15',
      time: '10:00 AM',
      location: 'Surat',
      status: 'Confirmed',
      notes: 'Full day shoot',
    },
    {
      appointment_id: 2,
      party_name: 'Amit Patel',
      phone: '9823456789',
      event_type: 'Pre-Wedding',
      booking_date: '2026-04-08',
      function_date: '2026-04-18',
      time: '4:00 PM',
      location: 'Ahmedabad',
      status: 'Pending',
      notes: 'Outdoor shoot',
    },
    {
      appointment_id: 3,
      party_name: 'Neha Verma',
      phone: '9812345670',
      event_type: 'Birthday',
      booking_date: '2026-04-12',
      function_date: '2026-04-20',
      time: '6:30 PM',
      location: 'Mumbai',
      status: 'Cancelled',
      notes: 'Indoor event',
    },
    {
      appointment_id: 4,
      party_name: 'Rohan Mehta',
      phone: '9898989898',
      event_type: 'Engagement',
      booking_date: '2026-04-11',
      function_date: '2026-04-22',
      time: '5:00 PM',
      location: 'Vadodara',
      status: 'Confirmed',
      notes: 'Evening function',
    },
    {
      appointment_id: 5,
      party_name: 'Priya Singh',
      phone: '9765432109',
      event_type: 'Reception',
      booking_date: '2026-04-09',
      function_date: '2026-04-25',
      time: '8:00 PM',
      location: 'Delhi',
      status: 'Pending',
      notes: 'Night shoot',
    },
    {
      appointment_id: 6,
      party_name: 'Karan Shah',
      phone: '9123456780',
      event_type: 'Corporate Event',
      booking_date: '2026-04-07',
      function_date: '2026-04-19',
      time: '11:00 AM',
      location: 'Pune',
      status: 'Confirmed',
      notes: 'Office coverage',
    },
    {
      appointment_id: 7,
      party_name: 'Sneha Joshi',
      phone: '9001122334',
      event_type: 'Baby Shower',
      booking_date: '2026-04-13',
      function_date: '2026-04-27',
      time: '3:00 PM',
      location: 'Nashik',
      status: 'Cancelled',
      notes: 'Family function',
    },
  ];
  useEffect(() => {
    setAppointments(data);
  }, []);
  // Date format helpers
  const formatApiDate = date => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  const formatDisplayDate = dateStr => {
    if (!dateStr) return '—';
    try {
      const [y, m, d] = dateStr.split('T')[0].split('-');
      return `${d}-${m}-${y}`;
    } catch {
      return dateStr || '—';
    }
  };

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const todayStr = formatApiDate(today);

    if (item?.Booking_date) {
      const bd = new Date(item.Booking_date);
      setStartDate(bd);
      setStartDateString(formatApiDate(bd));
    } else {
      setStartDate(today);
    }

    setEndDate(today);
    setEndDateString(todayStr);
  }, [item]);

  const fetchAppointments = useCallback(async () => {
    if (!startDateString || !endDateString) return;
    setLoading(true);
    try {
      const res = await fetch(APIS.GET_APPOINTMENT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          start_date: startDateString,
          end_date: endDateString,
        }),
      });
      const json = await res.json();
      //   setAppointments(json?.payload || []);
    } catch (err) {
      console.error(err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [startDateString, endDateString]);

  useFocusEffect(
    useCallback(() => {
      setSelectedAppointment(null);

      if (route.params?.refresh) {
        fetchAppointments();
        navigation.setParams({refresh: false});
      }
    }, [route.params?.refresh]),
  );

  const handleDeleteConfirm = async id => {
    const res = await fetch(APIS.DELETE_APPOINTMENT, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({appointment_id: id}),
    });
    const data = await res.json();
    if (data.code == 200) {
      setSelectedAppointment(null);
      fetchAppointments();
      setDeleteVisible(false);
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (selectedAppointment) {
        setSelectedAppointment(null);
        return true; // handled
      } else {
        navigation.goBack(); // manually go back
        return true; // prevent default
      }
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => subscription.remove();
  }, [selectedAppointment, navigation]);

  const handleBackAction = () => {
    if (selectedAppointment) {
      setSelectedAppointment(null);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    const errs = {};
    if (!startDateString) errs.start = 'Required';
    if (!endDateString) errs.end = 'Required';
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      fetchAppointments();
    }
  };

  const ORANGE = '#F05A28';
  const ORANGE_LIGHT_BG = '#FFF1EB';
  const ORANGE_BORDER = '#f0d5c8';
  const ORANGE_DIVIDER = '#f5e8e3';

  // Map appointment status to color
  const getStatusColor = status => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return {bg: '#EDFAF3', text: '#1A9E5C'};
      case 'pending':
        return {bg: '#FFF8ED', text: '#D4870A'};
      case 'cancelled':
        return {bg: '#FFF0F0', text: '#D93636'};
      case 'completed':
        return {bg: '#EDF3FF', text: '#2B5BD9'};
      default:
        return {bg: '#F5F5F5', text: '#888'};
    }
  };

  const renderItem = ({item}) => {
    const isSelected =
      selectedAppointment?.appointment_id === item?.appointment_id;
    const statusColors = getStatusColor(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => setSelectedAppointment(item)}
        onPress={() => setSelectedAppointment(null)}
        style={[
          {
            backgroundColor: '#fff',
            borderRadius: 14,
            borderWidth: isSelected ? 1 : 0.5,
            borderColor: isSelected ? ORANGE : '#ebebeb',
            marginHorizontal: 16,
            marginVertical: 3.5,
            overflow: 'hidden',
            elevation: isSelected ? 2 : 1,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.05,
            shadowRadius: 3,
            flexDirection: 'row',
          },
          isSelected && styles.cardSelected,
        ]}>
        {/* ── Colored side panel with vertical status label ── */}
        <View
          style={{
            width: 24,
            backgroundColor: statusColors.bg,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            gap: 6,
          }}>
          <Text
            style={{
              fontSize: 7,
              fontFamily: fonts.bold,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: statusColors.text,
              transform: [{rotate: '270deg'}],
              width: 50,
              textAlign: 'center',
            }}>
            {item.status || 'N/A'}
          </Text>
        </View>

        {/* Thin divider line */}
        <View
          style={{
            width: 0.5,
            backgroundColor: isSelected ? '#fad5c5' : '#ebebeb',
          }}
        />

        {/* ── Main content ── */}
        <View
          style={{
            flex: 1,
            minWidth: 0,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 8,
              marginBottom: 6,
            }}>
            <View style={{flex: 1}}>
              {/* Name + Call Icon Row */}
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    fontSize: 13,
                    fontFamily: fonts.bold,
                    color: '#1a1a1a',
                    marginBottom: 2,
                  }}>
                  {item.party_name || 'No Name'}
                </Text>
              </View>

              {/* Sub text (unchanged) */}
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 10,
                  fontFamily: fonts.regular,
                  color: '#aaa',
                }}>
                {item.event_type || '—'}
              </Text>
            </View>

            <View style={{alignItems: 'flex-end', gap: 2}}>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: fonts.bold,
                  color: '#000',
                }}>
                {item.time || '—'}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: fonts.regular,
                  color: '#aaa',
                }}>
                {formatDisplayDate(item.booking_date)}
              </Text>
            </View>

            {/* ── Menu ── */}
            <Menu
              visible={menuVisible === item.appointment_id}
              onDismiss={() => setMenuVisible(null)}
              anchor={
                <TouchableOpacity
                  onPress={() => setMenuVisible(item.appointment_id)}
                  hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                  <EntypoIcon
                    name="dots-three-vertical"
                    size={14}
                    color={isSelected ? ORANGE : '#bbb'}
                  />
                </TouchableOpacity>
              }
              style={{width: 120, height: 42, paddingLeft: 8}}
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: 10,
                elevation: 6,
                borderWidth: 0.5,
                borderColor: ORANGE_BORDER,
              }}>
              <Menu.Item
                onPress={() => {
                  navigation.navigate('AppointmentForm', {item});
                  setMenuVisible(null);
                }}
                leadingIcon={({color}) => (
                  <View>
                    <MaterialCommunityIcons
                      name="pencil"
                      size={22}
                      color={color}
                    />
                  </View>
                )}
                title="Edit"
                titleStyle={{color: '#000', fontSize: 14, marginLeft: -8}}
                style={{
                  backgroundColor: '#fff',
                  height: 30,
                  paddingVertical: 0,
                }}
              />
              <Divider style={{backgroundColor: ORANGE_DIVIDER, height: 0.5}} />
              <Menu.Item
                onPress={() => {
                  setDeleteVisible(true);
                  setMenuVisible(null);
                  setSelectedAppointment(item);
                }}
                leadingIcon={({color}) => (
                  <MaterialCommunityIcons
                    name="delete"
                    size={22}
                    color={color}
                  />
                )}
                title="Delete"
                titleStyle={{color: '#000', fontSize: 14, marginLeft: -8}}
                style={{
                  backgroundColor: '#fff',
                  height: 30,
                  paddingVertical: 0,
                }}
              />
            </Menu>
          </View>

          {/* Bottom pills: Token No | Notes */}
          <View style={{flexDirection: 'row', gap: 6}}>
            <View
              style={{
                flex: 1.5,
                backgroundColor: '#fbfbfb',
                borderRadius: 7,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}>
              <Text
                style={{
                  fontSize: 8,
                  color: '#aaa',
                  fontFamily: fonts.bold,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  marginBottom: 1,
                }}>
                Notes
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 11,
                  fontFamily: fonts.regular,
                  color: '#555',
                }}>
                {item.notes || '—'}
              </Text>
            </View>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#fbfbfb',
                borderRadius: 7,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
              onPress={() => Linking.openURL(`tel:${item.phone}`)}>
              <Text
                style={{
                  fontSize: 8,
                  color: '#aaa',
                  fontFamily: fonts.bold,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  marginBottom: 1,
                }}>
                Mobile Number
              </Text>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Icon name="phone" size={12} color="#666" />

                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 11,
                    fontFamily: fonts.bold,
                    color: '#1f1a1a',
                  }}>
                  {item.phone || '—'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        {/* Header */}
        <View style={styles.header}>
          {/* Left: Back button */}
          <TouchableOpacity
            onPress={handleBackAction}
            style={styles.headerLeft}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Center: Title */}
          <Text style={[styles.headerTitle, {fontFamily: fonts.bold}]}>
            Appointments
          </Text>

          {/* Right: Actions or placeholder */}
          <View style={styles.headerRight}>
            {selectedAppointment ? (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={() =>
                    navigation.navigate('AppointmentForm', {
                      item: selectedAppointment,
                    })
                  }>
                  <Icon name="pencil-outline" size={20} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={() => setDeleteVisible(true)}>
                  <Icon name="delete-outline" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{width: 80}} />
            )}
          </View>
        </View>

        {/* Filter */}
        <View style={styles.filterContainer}>
          <View style={styles.dateInputs}>
            <View style={styles.dateField}>
              <Text style={styles.label}>
                From <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowStartDate(true)}>
                <Icon name="calendar" size={18} color="#666" />
                <Text style={styles.dateText}>
                  {startDateString || 'DD-MM-YYYY'}
                </Text>
              </TouchableOpacity>
              {showStartDate && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  maximumDate={new Date()}
                  onChange={(e, date) => {
                    setShowStartDate(false);
                    if (date) {
                      setStartDate(date);
                      setStartDateString(formatApiDate(date));
                    }
                  }}
                />
              )}
              {errors.start && (
                <Text style={styles.errorText}>{errors.start}</Text>
              )}
            </View>

            <View style={styles.dateField}>
              <Text style={styles.label}>
                To <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowEndDate(true)}>
                <Icon name="calendar" size={18} color="#666" />
                <Text style={styles.dateText}>
                  {endDateString || 'DD-MM-YYYY'}
                </Text>
              </TouchableOpacity>
              {showEndDate && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  maximumDate={new Date()}
                  onChange={(e, date) => {
                    setShowEndDate(false);
                    if (date) {
                      setEndDate(date);
                      setEndDateString(formatApiDate(date));
                    }
                  }}
                />
              )}
              {errors.end && <Text style={styles.errorText}>{errors.end}</Text>}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}>
              <Text style={styles.buttonText}>
                <FIcon name="search" size={20} />
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List */}
        {loading && <ExpenseShimmer />}
        <FlatList
          data={appointments}
          renderItem={renderItem}
          keyExtractor={item =>
            item.appointment_id?.toString() || Math.random().toString()
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {loading ? '' : 'No appointments found'}
            </Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchAppointments}
              colors={['#F05A28', '#FF8A65', '#F05A28']}
              progressBackgroundColor="#ffffff"
            />
          }
        />

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.addBtn}
          onPress={() => {
            navigation.navigate('AppointmentForm');
          }}>
          <Icon name="plus" size={26} color="#fff" />
          <Text style={styles.addBtnText}>Add Appointment</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Delete Modal */}
      <Modal transparent visible={deleteVisible} animationType="fade">
        <Pressable
          onPress={() => {
            setDeleteVisible(false);
            setSelectedAppointment(null);
          }}
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
                fontFamily: fonts.semiBold,
                marginBottom: 18,
                color: '#000',
              }}>
              Delete Appointment?
            </Text>

            <Text style={{color: '#555', marginBottom: 20}}>
              Are you sure you want to delete this appointment?
            </Text>

            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <TouchableOpacity
                onPress={() => {
                  setDeleteVisible(false);
                  setSelectedAppointment(null);
                }}
                style={{marginRight: 20}}>
                <Text style={{color: '#666'}}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  handleDeleteConfirm(selectedAppointment?.appointment_id);
                }}>
                <Text style={{color: '#FF4D4F', fontFamily: fonts.semiBold}}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Appointment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F05A28',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  headerLeft: {
    padding: 2,
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    flex: 1,
    marginLeft: '14%',
  },
  headerRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    padding: 4,
  },
  filterContainer: {
    padding: 12,
    paddingBottom: 0.1,
  },
  dateInputs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dateField: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
  },
  required: {
    color: '#e63946',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
  },
  dateText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#F05A28',
    borderRadius: 8,
    marginTop: 22,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    width: 45,
    paddingLeft: 13,
  },
  errorText: {
    color: '#e63946',
    fontSize: 12,
    marginTop: 3,
  },
  list: {
    paddingBottom: 90,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    elevation: 0.9,
  },
  cardSelected: {
    backgroundColor: '#fff4ec',
    borderColor: '#fed7aa',
  },
  cardContent: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingRight: 6,
  },
  title: {
    fontSize: 15,
    fontFamily: fonts.bold,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 0.1,
    alignItems: 'center',
  },
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  compactItem: {
    flex: 1,
    alignItems: 'center',
  },
  compactLabel: {
    fontSize: 11.5,
    color: '#666',
    marginBottom: 2,
  },
  compactValue: {
    fontSize: 14,
    color: '#111',
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  value: {
    fontSize: 13,
    color: '#111',
    flex: 1,
  },
  amountValue: {
    fontSize: 13.5,
    fontFamily: fonts.bold,
    color: '#111',
  },
  description: {
    fontSize: 12.5,
    color: '#555',
    marginTop: 2,
    lineHeight: 16,
  },
  menuBtn: {
    paddingHorizontal: 8,
    paddingTop: '25%',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
    fontSize: 15,
  },
  addBtn: {
    position: 'absolute',
    bottom: 30,
    right: 16,
    backgroundColor: '#F05A28',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 50,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 100,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.semiBold,
    marginLeft: 8,
  },
});
