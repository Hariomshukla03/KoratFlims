import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Modal,
  SafeAreaView,
  BackHandler,
  RefreshControl,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import NothingFound from './NothingFound';
import {APIS} from '../../utils/Apis';
import QuotationShimmer from './Loaders/QuotationShimmer';
import {fonts} from '../../utils/fonts';

const StaffPayment = () => {
  const navigation = useNavigation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (!data) {
        setLoading(true);
      }
      getQuotation();
    }, []),
  );
  useEffect(() => {
    const backAction = () => {
      if (selectedQuotation) {
        setSelectedQuotation(null);
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
    return () => subscription.remove();
  }, [selectedQuotation]);
  const staffPayments = [
  {
    id: "1",
    staff_name: "Rahul Sharma",
    amount: 5000,
    payment_date: "12-04-2026",
    payment_type: "UPI",
    program_name: "Wedding Shoot",
    notes: "Advance payment"
  },
  {
    id: "2",
    staff_name: "Amit Patel",
    amount: 3000,
    payment_date: "13-04-2026",
    payment_type: "Cash",
    program_name: "Birthday Event",
    notes: "Full payment"
  },
  {
    id: "3",
    staff_name: "Suresh Yadav",
    amount: 7000,
    payment_date: "14-04-2026",
    payment_type: "Cheque",
    program_name: "Pre-Wedding Shoot",
    notes: "Pending clearance"
  },
  {
    id: "4",
    staff_name: "Vikas Singh",
    amount: 4500,
    payment_date: "15-04-2026",
    payment_type: "Bank Transfer",
    program_name: "Corporate Event",
    notes: ""
  },
  {
    id: "5",
    staff_name: "Rohit Verma",
    amount: 2500,
    payment_date: "16-04-2026",
    payment_type: "UPI",
    program_name: "Engagement",
    notes: "Half payment"
  }
];
  const getQuotation = async () => {
    const url = APIS.GET_QUOTATION;
    const res = await fetch(url);
    const data = await res.json();
    // console.log(data.payload)
    setData(staffPayments);
    setLoading(false);
  };
  const handleback = () => {
    if (!selectedQuotation) {
      navigation.goBack();
    } else {
      setSelectedQuotation(null);
    }
  };

  const filteredQuotation = data?.filter(item =>
    item?.party_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = () => {
    if (selectedQuotation) {
      navigation.navigate('QuotationForm', {item: selectedQuotation});
      setSelectedQuotation(null);
    }
  };

  const handleDeleteConfirm = async id => {
    console.log(id);
    const res = await fetch(APIS.DELETE_QUOTATION, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quotation_id: id,
      }),
    });
    const data = await res.json();
    console.log(data);
    if (data.code == 200) {
      setDeleteVisible(false);
      setSelectedQuotation(null);
      getQuotation();
      navigation.navigate('QuotationScreen');
    }

    setDeleteVisible(false);
    console.log('Deleted product:', data);
    setSelectedQuotation(null);
    setDeleteVisible(false);
  };

  const renderProduct = ({item}) => {
    const isSelected = selectedQuotation?.quotation_id === item.quotation_id;

    const getStatusColor = status => {
      switch (status?.toLowerCase()) {
        case 'complete':
        case 'converted':
        case 'approved':
          return '#22C55E'; // softer green

        case 'pending':
          return '#F97316'; // modern orange

        case 'rejected':
        case 'cancelled':
          return '#EF4444'; // clean red

        case 'draft':
          return '#64748B'; // slate gray

        default:
          return '#94A3B8'; // neutral gray
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[
          styles.card,
          {
            borderLeftColor: getStatusColor(item.quotation_status),
            overflow: 'hidden', 
          },
          isSelected && styles.cardSelected,
        ]}
        onLongPress={() => setSelectedQuotation(item)}
        onPress={() => setSelectedQuotation(null)}>
        <View
          style={{
            position: 'absolute',
            top: -1.5,
            right: -3,
            zIndex: 10,
            backgroundColor: `${getStatusColor(item.quotation_status)}18`,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderBottomLeftRadius: 4,
          }}>
          <Text
            style={{
              fontSize: 10,
              fontFamily: fonts.semiBold,
              color: getStatusColor(item.quotation_status),
              letterSpacing: 0.4,
              textTransform: 'capitalize',
            }}>
            {item.quotation_status}
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={2}>
            Quotation Date:{' '}
            <Text style={{fontFamily: fonts.regular}}>
              {item.quotation_date}
            </Text>
          </Text>

          <Text style={styles.name} numberOfLines={2}>
            Party Name:{' '}
            <Text style={{fontFamily: fonts.regular}}>{item.party_name}</Text>
          </Text>

          <Text style={styles.name} numberOfLines={2}>
            Couple Name:{' '}
            <Text style={{fontFamily: fonts.regular}}>{item.couple_name}</Text>
          </Text>

          {/* Bottom pills: Grand Total | Discount | Total */}
          <View style={{flexDirection: 'row', gap: 6, marginTop: 9}}>
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
                Grand Total
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 11,
                  fontFamily: fonts.bold,
                  color: '#1a1a1a',
                }}>
                ₹ {item.sub_total || '0'}
              </Text>
            </View>

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
                Discount
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 11,
                  fontFamily: fonts.bold,
                  color: '#1a1a1a',
                }}>
                {item.discount || '0'}%
              </Text>
            </View>

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
                Total
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 11,
                  fontFamily: fonts.bold,
                  color: '#1a1a1a',
                }}>
                ₹ {item.quotation_total || '0'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('QuotationProileScreen', {item})}
            activeOpacity={0.8}>
            <View
              style={{
                height: 26,
                width: 26,
                borderRadius: 18,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 4,
                marginBottom: 14, // 👈 moves arrow up
              }}>
              <Icon name="chevron-right" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header – changes when item is selected */}
      <View style={styles.header}>
        <>
          <TouchableOpacity onPress={handleback} style={styles.backBtn}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitleNormal]}>Staff Payment</Text>
          {selectedQuotation && (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerAction}
                onPress={handleEdit}>
                <Icon name="pencil-outline" size={22} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerAction}
                onPress={() => setDeleteVisible(true)}>
                <Icon name="delete-outline" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Icon name="magnify" size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Search by party name"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#9CA3AF"
        />
        {search?.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      {loading && <QuotationShimmer />}
      <FlatList
        data={filteredQuotation}
        renderItem={renderProduct}
        keyExtractor={item => item.quotation_id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<NothingFound />}
        refreshing={loading}
        onRefresh={() => {
          setData(null);
          getQuotation();
        }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              setLoading(true);
              getQuotation();
            }}
            colors={['#F05A28', '#FF8A65', '#F05A28']}
            progressBackgroundColor="#ffffff"
          />
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.addBtn}
        onPress={() => {
          navigation.navigate('StaffPaymentForm');
        }}>
        <Icon name="plus" size={26} color="#fff" />
        <Text style={styles.addBtnText}>Add Staff Payment</Text>
      </TouchableOpacity>

      {/* Delete Confirmation Modal (unchanged logic) */}
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
              Delete Quotation?
            </Text>

            <Text style={{color: '#555', marginBottom: 20}}>
              Are you sure you want to delete this Quotation?
            </Text>

            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <TouchableOpacity
                onPress={() => setDeleteVisible(false)}
                style={{marginRight: 20}}>
                <Text style={{color: '#666'}}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  handleDeleteConfirm(selectedQuotation.quotation_id);
                }}>
                <Text style={{color: '#FF4D4F', fontFamily: fonts.bold}}>
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

export default StaffPayment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  header: {
    height: 56,
    backgroundColor: '#F05A28',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 4,
  },

  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },

  headerTitleNormal: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontFamily: fonts.semiBold,
    // textAlign: '',
    paddingLeft: '25%',
  },

  backBtn: {
    padding: 8,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },

  // headerAction: {
  //   padding: 12,
  // },

  listContent: {
    paddingVertical: 8,
    paddingBottom: 100,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderLeftWidth: 5, // a bit thicker looks better
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 14,
    paddingLeft: 12, // ← slightly less left padding
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },

  cardSelected: {
    backgroundColor: '#fff4ec',
    borderColor: '#fed7aa',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
    height: 48,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#111827',
  },

  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  codeBadge: {
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },

  codeText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: '#000',
  },

  name: {
    fontSize: 12.5,
    fontFamily: fonts.semiBold,
    color: '#111827',
    marginBottom: 0.5,
  },

  price: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: '#111827',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIcon: {
    padding: 8,
    marginLeft: 4,
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
