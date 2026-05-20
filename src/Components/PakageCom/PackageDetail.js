import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Pressable,
  FlatList,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FIcon from 'react-native-vector-icons/FontAwesome6';
import PIcon from 'react-native-vector-icons/FontAwesome5';
import {useNavigation} from '@react-navigation/native';
import {fonts} from '../../../utils/fonts';
import {APIS} from '../../../utils/Apis';

const PackageDetails = ({route}) => {
  const {item} = route.params || {};
  const navigation = useNavigation();

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [data, setData] = useState(null);
  const [sendData, setSendData] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error && !data) {
      const timer = setTimeout(() => setShowError(true), 1800);
      return () => clearTimeout(timer);
    }
  }, [error, data]);

  const fetchDetails = async () => {
    if (!item?.package_master_code) {
      setError('No Package Master Code found');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(APIS.DETAILS_PACKAGE, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({package_master_code: item.package_master_code}),
      });
      const json = await res.json();
      console.log('Package API Response:', json);
      if (json.code == 200) {
        setSendData(json.payload[0]);
      }
      if (json?.status && Array.isArray(json?.payload) && json.payload.length > 0) {
        setData(json);
      } else {
        setError('No package details found for this master code.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load package details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const getProducts = pkg => {
    if (!pkg) return [];
    const ids = (pkg.product_id || '').split(',').map(s => s.trim());
    const names = (pkg.product_name || '').split(',').map(s => s.trim());
    const qtys = (pkg.total_qty || '').split(',').map(s => s.trim());
    const rates = (pkg.total_price || '').split(',').map(s => s.trim());
    const totals = (pkg.total_amount || '').split(',').map(s => s.trim());
    return ids
      .map((id, i) => ({
        product_id: id,
        name: names[i] || `Product ${id}`,
        qty: qtys[i] || '1',
        rate: rates[i] || '0',
        total: totals[i] || '0',
      }))
      .filter(p => p.product_id && p.product_id !== '');
  };

  const handleDeleteConfirm = async packageCode => {
    if (!packageCode) {
      Alert.alert('Error', 'No package code available');
      return;
    }
    try {
      const res = await fetch(APIS.DELETE_PACKAGE, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({package_master_code: packageCode}),
      });
      const resp = await res.json();
      console.log('Delete response:', resp);
      if (resp.code === 200 || resp.status === true) {
        setDeleteVisible(false);
        navigation.goBack();
      } else {
        Alert.alert('Delete Failed', resp.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      Alert.alert('Error', 'Failed to delete package');
    }
  };

  const handleEdit = () => {
    navigation.navigate('PackageForm', {sendData});
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Package Details</Text>
          <View style={styles.headerActions}>
            {showError || !data?.payload?.length ? (
              <View style={{width: 44}} />
            ) : (
              <>
                <TouchableOpacity onPress={handleEdit} style={{marginRight: 14}}>
                  <Icon name="pencil-outline" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDeleteVisible(true)}>
                  <Icon name="delete-outline" size={22} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* ── HEADER — unchanged ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Package Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit} style={{marginRight: 16}}>
            <Icon name="pencil-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDeleteVisible(true)}>
            <Icon name="delete-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ── Package Code + Booking No ── */}
        <View style={mid.twoCol}>
          <View style={mid.card}>
            <Text style={mid.label}>Package Code</Text>
            <Text style={mid.value}>{item.package_master_code || '—'}</Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Package Name</Text>
            <Text style={mid.value}>{item.package_master_name || '—'}</Text>
          </View>
        </View>

        {/* ── Entry Date ── */}
        <View style={[mid.card, mid.fullCard]}>
          <Text style={mid.label}>Entry Date</Text>
          <Text style={mid.value}>{item.entry_date?.split(' ')[0] || '—'}</Text>
        </View>

        {/* ── Section divider ── */}
        <View style={mid.sectionDivider} />

        {/* ── Package Entries — original qtnStyles ── */}
        <View style={{marginLeft: 10, marginTop: 10}}>
          {data.payload.map((pkg, index) => (
            <View key={index} style={{marginBottom: 8}}>
              <View style={qtnStyles.card}>
                <View style={qtnStyles.topRow}>
                  <View style={{flex: 1}}>
                    <Text style={qtnStyles.heading}>Function Date</Text>
                    <Text style={qtnStyles.value}>{pkg.function_date || '—'}</Text>
                  </View>
                  <View style={{flex: 1, alignItems: 'flex-end'}}>
                    <Text style={qtnStyles.heading}>Program</Text>
                    <Text style={qtnStyles.value}>{pkg.program_name || '—'}</Text>
                  </View>
                </View>

                <View style={qtnStyles.divider} />

                <FlatList
                  data={getProducts(pkg)}
                  keyExtractor={(prod, i) => `prod-${index}-${i}`}
                  renderItem={({item: prod}) => (
                    <View style={qtnStyles.productBlock}>
                      <Text style={qtnStyles.productTitle}>
                        {prod.name || 'Unnamed Product'}
                      </Text>
                      <View style={qtnStyles.qtyRow}>
                        <Text style={qtnStyles.productDetails}>Qty: {prod.qty}</Text>
                        <Text style={qtnStyles.productDetails}>Rate: {prod.rate}</Text>
                        <Text style={qtnStyles.productDetails}>Total: {prod.total}</Text>
                      </View>
                    </View>
                  )}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <Text style={{fontSize: 12, color: '#888', textAlign: 'center', padding: 12}}>
                      No products
                    </Text>
                  }
                />
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* ── Delete Modal — unchanged ── */}
      <Modal transparent visible={deleteVisible} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setDeleteVisible(false)}>
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Package?</Text>
            <Text style={styles.modalText}>This action cannot be undone. Are you sure?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteConfirm(item?.package_master_code)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
};

export default PackageDetails;

/* ── Original header styles — untouched ── */
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F5'},
  scrollContent: {paddingBottom: 40, paddingTop: 12},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F05A28',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {fontSize: 18, fontFamily: fonts.semiBold, color: '#fff', marginLeft: 22},
  headerActions: {flexDirection: 'row'},

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '82%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
  },
  modalTitle: {fontSize: 18, fontFamily: fonts.bold, marginBottom: 12, color: '#000'},
  modalText: {fontSize: 14, color: '#555', marginBottom: 24},
  modalButtons: {flexDirection: 'row', justifyContent: 'flex-end', gap: 12},
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  deleteBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#ef4444',
  },
  cancelText: {color: '#374151', fontFamily: fonts.semiBold,},
  deleteText: {color: '#fff', fontFamily: fonts.semiBold,},
});

/* ── Same mid card styles as QuotationProfile ── */
const mid = StyleSheet.create({
  twoCol: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 13,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  fullCard: {
    marginHorizontal: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: '#111',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
    marginBottom: 10,
    marginTop: 2,
  },
});

/* ── Original qtnStyles — untouched ── */
const qtnStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: "98%",
    maxWidth:400,
    marginLeft: 0,
    marginTop: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: '#444',
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
   fontFamily: fonts.semiBold,
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 10,
  },
  productBlock: {
    margin: 4,
    borderBottomColor: '#dadada',
    borderBottomWidth: 0.4,
  },
  productTitle: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: '#222',
    marginBottom: 10,
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productDetails: {
    fontSize: 12,
    color: '#333',
  },
});