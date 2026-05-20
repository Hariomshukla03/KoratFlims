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
import ExpenseShimmer from './Loaders/ExpenseShimmer';
const ManageExpense = ({route}) => {
  const {item} = route.params || {};
  console.log('This is the Params Data', item);
  const navigation = useNavigation();

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [startDateString, setStartDateString] = useState('08-07-2024');
  const [endDate, setEndDate] = useState(new Date());
  const [endDateString, setEndDateString] = useState('');

  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  const [expenses, setExpenses] = useState([]);
  const [menuVisible, setMenuVisible] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);

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
      // setStartDateString(todayStr);
    }

    setEndDate(today);
    setEndDateString(todayStr);
  }, [item]);

  const fetchExpenses = useCallback(async () => {
    if (!startDateString || !endDateString) return;
    setLoading(true);
    try {
      const res = await fetch(APIS.GET_EXPENSE, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          start_date: startDateString,
          end_date: endDateString,
        }),
      });
      const json = await res.json();
      setExpenses(json?.payload || []);
    } catch (err) {
      console.error(err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [startDateString, endDateString]);

  useFocusEffect(
    useCallback(() => {
      setSelectedExpense(null);

      if (route.params?.refresh) {
        fetchExpenses();
        navigation.setParams({refresh: false});
      }
    }, [route.params?.refresh]),
  );

  // Optional: initial fetch when dates are first set

  const handleDeleteConfirm = async id => {
    const res = await fetch(APIS.DELETE_EXPENSE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({income_expense_id: id}),
    });
    const data = await res.json();
    if (data.code == 200) {
      setSelectedExpense(null);
      fetchExpenses();
      setDeleteVisible(false);
    }
  };
  useEffect(() => {
    const backAction = () => {
      if (selectedExpense) {
        setSelectedExpense(null);
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
  }, [selectedExpense, navigation]);

  const handleBackAction = () => {
    if (selectedExpense) {
      setSelectedExpense(null);
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
      fetchExpenses();
    }
  };

  const ORANGE = '#F05A28';
  const ORANGE_LIGHT_BG = '#FFF1EB';
  const ORANGE_BORDER = '#f0d5c8';
  const ORANGE_DIVIDER = '#f5e8e3';

  const renderItem = ({item}) => {
    const isSelected =
      selectedExpense?.income_expense_id === item?.income_expense_id;
    const isExpense = item.ex_in_type?.toLowerCase() === 'expense';

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => setSelectedExpense(item)}
        onPress={() => setSelectedExpense(null)}
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
        {/* ── Colored side panel with vertical type label ── */}
        <View
          style={{
            width: 24,
            backgroundColor: isExpense ? '#FFF3ED' : '#EDFAF3',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            gap: 6,
          }}>
          <Text
            style={{
              fontSize: 8,
              fontFamily: fonts.bold,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: isExpense ? '#D95F2B' : '#1A9E5C',
              transform: [{rotate: '270deg'}],
              width: 50,
              textAlign: 'center',
            }}>
            {item.ex_in_type || 'N/A'}
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
          {/* Top row: Title | Amount | Menu */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 8,
              marginBottom: 6,
            }}>
            <View style={{flex: 1, minWidth: 0}}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 13,
                  fontFamily: fonts.bold,
                  color: '#1a1a1a',
                  marginBottom: 2,
                }}>
                {item.title || 'No title'}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 10,
                  fontFamily: fonts.regular,
                  color: '#aaa',
                }}>
                {item.category || '—'}
              </Text>
            </View>

            <View style={{alignItems: 'flex-end', gap: 2}}>
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: fonts.bold,
                  // color: isExpense ? '#D95F2B' : '#1A9E5C',
                  color: '#000',
                }}>
                ₹ {item.amount || '0'}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: fonts.regular,
                  color: '#aaa',
                }}>
                {formatDisplayDate(item.ex_in_date)}
              </Text>
            </View>

            {/* ── Menu (unchanged) ── */}
            <Menu
              visible={menuVisible === item.income_expense_id}
              onDismiss={() => setMenuVisible(null)}
              anchor={
                <TouchableOpacity
                  onPress={() => setMenuVisible(item.income_expense_id)}
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
                  navigation.navigate('ManageExpenseForm', {item});
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
                  setSelectedExpense(item);
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

          {/* Bottom pills: Balance | Details */}
          <View style={{flexDirection: 'row', gap: 6}}>
            <View
              style={{
                flex: 1,
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
                Balance
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 11,
                  fontFamily: fonts.bold,
                  color: '#1a1a1a',
                }}>
                ₹ {item.balance || '0'}
              </Text>
            </View>
            <View
              style={{
                flex: 2,
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
                Details
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 11,
                  fontFamily: fonts.regular,
                  color: '#555',
                }}>
                {item.in_ex_description || '—'}
              </Text>
            </View>
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
            Income & Expense
          </Text>

          {/* Right: Actions or placeholder */}
          <View style={styles.headerRight}>
            {selectedExpense ? (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionIcon}
                  onPress={() =>
                    navigation.navigate('ManageExpenseForm', {
                      item: selectedExpense,
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
              <View style={{width: 80}} /> // ← wider placeholder to balance title
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
          data={expenses}
          renderItem={renderItem}
          keyExtractor={item =>
            item.income_expense_id?.toString() || Math.random().toString()
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {loading ? '' : 'No records found'}
            </Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchExpenses}
              colors={['#F05A28', '#FF8A65', '#F05A28']}
              progressBackgroundColor="#ffffff"
            />
          }
        />

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.addBtn}
          onPress={() => {
            navigation.navigate('ManageExpenseForm');
          }}>
          <Icon name="plus" size={26} color="#fff" />
          <Text style={styles.addBtnText}>Add Income/Expense</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
      <Modal transparent visible={deleteVisible} animationType="fade">
        <Pressable
          onPress={() => {
            setDeleteVisible(false);
            setSelectedExpense(null);
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
              Delete Expense?
            </Text>

            <Text style={{color: '#555', marginBottom: 20}}>
              Are you sure you want to delete this expense?
            </Text>

            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <TouchableOpacity
                onPress={() => {
                  setDeleteVisible(false);
                  setSelectedExpense(null);
                }}
                style={{marginRight: 20}}>
                <Text style={{color: '#666'}}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  handleDeleteConfirm(selectedExpense?.income_expense_id);
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

export default ManageExpense;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // ← key for left-center-right
    backgroundColor: '#F05A28',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56, // optional: fixed height looks cleaner
  },

  headerLeft: {
    padding: 2, // bigger touch area
  },

  headerTitle: {
    fontSize: 18, // slightly bigger looks better
    color: '#fff',
    textAlign: 'center',
    flex: 1, // ← allows it to take available space
    marginLeft: '14%', // breathing room
  },

  headerRight: {
    alignItems: 'flex-end',
    minWidth: 80, // prevents jump when icons appear/disappear
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // space between edit & delete
  },

  actionIcon: {
    padding: 4, // bigger touch target
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
    marginTop: 16,
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
    borderRadius: 14, // slightly smaller radius
    marginVertical: 5, // was 6 → now tighter between cards
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
    paddingVertical: 10, // was 12 → reduced
    paddingHorizontal: 12,
    paddingRight: 6, // even less right padding (menu button side)
  },

  title: {
    fontSize: 15, // keep readable
    fontFamily: fonts.bold, // ← make title stand out
    marginBottom: 4, // was 6 → tighter
  },

  row: {
    flexDirection: 'row',
    marginBottom: 0.1, // was 3 → very tight now
    alignItems: 'center',
  },

  label: {
    width: 64, // was 70 → save some space
    fontSize: 12.5, // slightly smaller
    color: '#666',
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
    fontFamily: fonts.medium, // or fonts.bold if you prefer
    textAlign: 'center',
  },

  value: {
    fontSize: 13, // was 13.5 → tiny reduction
    color: '#111',
    flex: 1,
  },

  // Amount – make it stand out more (optional but recommended)
  amountValue: {
    fontSize: 13.5,
    fontFamily: fonts.bold, // ← bold amount
    color: '#111',
  },

  description: {
    fontSize: 12.5, // smaller
    color: '#555',
    marginTop: 2, // was 4
    lineHeight: 16, // tighter line height
  },

  menuBtn: {
    paddingHorizontal: 8, // was 12
    paddingTop: '25%', // slightly taller touch area
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
    fontSize: 15,
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
});
