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
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FIcon from 'react-native-vector-icons/FontAwesome6';
import PIcon from 'react-native-vector-icons/FontAwesome5';
import {useNavigation} from '@react-navigation/native';
import {fonts} from '../../../utils/fonts';
import {APIS} from '../../../utils/Apis';
import {generatePDF} from 'react-native-html-to-pdf';

const SaleProfile = ({route}) => {
  const {item} = route.params || {};
  const navigation = useNavigation();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [saleDetail, setSaleDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [Pdfdata, setPdfData] = useState(null);
  const [staffName, setStaffName] = useState(null);

  const sale_id = item?.sale_id;

  const fetchQuotationDetails = async () => {
    if (!sale_id) {
      setError('No Sale ID found');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(APIS.DETAILS_SALE, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({sale_id: sale_id}),
      });
      const json = await res.json();
      if (json?.status && json?.payload?.length > 0) {
        setData(json);
        console.log(data);
        setSaleDetail(json.payload[0]);
      } else {
        setError('Oops! No data found. Try looking for a different party.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load quotation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotationDetails();
  }, []);

  const getProducts = () => {
    if (!saleDetail) return [];
    const ids = (saleDetail.product_id || '').split(',').map(s => s.trim());
    const qtys = (saleDetail.qty || '').split(',').map(s => s.trim());
    const rates = (saleDetail.rate || '').split(',').map(s => s.trim());
    const totals = (saleDetail.total || '').split(',').map(s => s.trim());
    return ids
      .map((id, index) => ({
        product_id: id,
        name: saleDetail.product_names?.[index] || `Product ${id}`,
        qty: qtys[index] || '1',
        rate: rates[index] || '0',
        total: totals[index] || '0',
      }))
      .filter(p => p.product_id);
  };

  const products = getProducts();

  const handleDeleteConfirm = async sale_id => {
    try {
      const res = await fetch(APIS.DELETE_QUOTATION, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({quotation_id: sale_id}),
      });
      const data = await res.json();
      console.log('Delete Response:', data);
      if (data.code === 200 || data.status === true) {
        setDeleteVisible(false);
        navigation.goBack();
      } else {
        alert(data.message || 'Failed to delete quotation');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Something went wrong while deleting');
    }
  };

  const handleEdit = data => {
    navigation.navigate('SaleForm', {item: item});
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{textAlign: 'center', marginTop: 100}}>
          <ActivityIndicator size={'small'} color="#F05A28" />
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !saleDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {paddingLeft: -20}]}>
            Sale Detail
          </Text>
          <View style={styles.headerActions} />
        </View>
        <Image
          style={{
            position: 'absolute',
            top: 230,
            right: 110,
            width: 150,
            height: 150,
          }}
          source={require('/KoratFlims/assets/Images/Notfound.png')}
        />
        <Text
          style={{
            textAlign: 'center',
            marginTop: '68%',
            color: 'red',
            padding: 85,
            fontSize: 16,
          }}>
          {error || 'No quotation details found'}
        </Text>
      </SafeAreaView>
    );
  }

  const getProductsForSale = sale => {
    if (!sale) return [];
    const ids = (sale.product_id || '').split(',').map(s => s.trim());
    const qtys = (sale.qty || '').split(',').map(s => s.trim());
    const rates = (sale.rate || '').split(',').map(s => s.trim());
    const totals = (sale.total || '').split(',').map(s => s.trim());
    return ids
      .map((id, index) => ({
        product_id: id,
        name: sale.product_names?.[index] || `Product ${id || 'Unknown'}`,
        qty: qtys[index] || '1',
        rate: rates[index] || '0',
        total: totals[index] || '0.00',
      }))
      .filter(p => p.product_id && p.product_id !== '');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── HEADER — unchanged ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {paddingLeft: 45}]}>Sale Detail</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => handleEdit(data)}>
            <Icon name="pencil-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDeleteVisible(true)}
            style={{marginLeft: 16}}>
            <Icon name="delete-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Sale No + Sale Date ── */}
        <View style={mid.twoCol}>
          <View style={mid.card}>
            <Text style={mid.label}>Sale No</Text>
            <Text style={mid.value}>{item.sale_no || '—'}</Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Sale Date</Text>
            <Text style={mid.value}>{item.sale_date || '—'}</Text>
          </View>
        </View>

        {/* ── Party Name ── */}
        <View style={[mid.card, mid.fullCard]}>
          <Text style={mid.label}>Party Name</Text>
          <Text style={mid.value}>{item.party_name || '—'}</Text>
        </View>

        {/* ── Couple Name + City ── */}
        <View style={mid.twoCol}>
          <View style={mid.card}>
            <Text style={mid.label}>Couple Name</Text>
            <Text style={mid.value}>{item.couple_name || '—'}</Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>City</Text>
            <Text style={mid.value}>{item.city_name || '—'}</Text>
          </View>
        </View>

        {/* ── Delivery Date ── */}
        <View style={[mid.card, mid.fullCard]}>
          <Text style={mid.label}>Delivery Date</Text>
          <Text style={mid.value}>{item.delivery_date || '—'}</Text>
        </View>

        {/* ── Staff Name + Staff Amount ── */}
        <View style={mid.twoCol}>
          <View style={mid.card}>
            <Text style={mid.label}>Staff Name</Text>
            <Text style={mid.value}>{item.staff_master_name || '—'}</Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Staff Amount</Text>
            <Text style={mid.value}>{item.staff_amount || '—'}</Text>
          </View>
        </View>

        {/* ── Notes ── */}
        <View style={[mid.card, mid.fullCard]}>
          <Text style={mid.label}>Notes</Text>
          <Text
            style={[mid.value, !item.notes && {color: '#bbb'}]}
            numberOfLines={3}>
            {item.notes || '—'}
          </Text>
        </View>

        {/* ── Totals ── */}
        <View style={mid.twoCol}>
          <View style={mid.card}>
            <Text style={mid.label}>Grand Total</Text>
            <Text style={mid.value}>
              {data?.salebill_detail?.sub_total || '—'}
            </Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Discount</Text>
            <Text style={mid.value}>
              {data?.salebill_detail?.discount || '0'}%
            </Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Total</Text>
            <Text style={[mid.value, {fontFamily: fonts.bold}]}>
              {data?.salebill_detail?.sale_total || '—'}
            </Text>
          </View>
        </View>

        {/* ── Section divider ── */}
        <View style={mid.sectionDivider} />

        {/* ── Sale Entries — original qtnStyles ── */}
        <View style={{marginLeft: 10}}>
          {data?.payload?.length > 0 ? (
            data.payload.map((sale, qtnIndex) => (
              <View key={qtnIndex}>
                <View style={qtnStyles.card}>
                  <View style={qtnStyles.topRow}>
                    <View style={{flex: 1}}>
                      <Text style={qtnStyles.heading}>Function Date:</Text>
                      <Text style={qtnStyles.value}>
                        {sale.function_date || 'N/A'}
                      </Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                      <Text style={qtnStyles.heading}>Program:</Text>
                      <Text style={qtnStyles.value}>
                        {sale.program_name || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={qtnStyles.divider} />

                  <View style={qtnStyles.productBlock}>
                    <View style={qtnStyles.qtyRow}>
                      <Text style={qtnStyles.productDetails}>
                        Qty: {sale.qty || 1}
                      </Text>
                      <Text style={qtnStyles.productDetails}>
                        Rate: {sale.rate || 0}
                      </Text>
                      <Text style={qtnStyles.productDetails}>
                        Total: {sale.total || '0.00'}
                      </Text>
                    </View>
                  </View>
                </View>
                {qtnIndex < data.payload.length - 1 && (
                  <View style={{height: 10}} />
                )}
              </View>
            ))
          ) : (
            <Text
              style={{
                textAlign: 'center',
                color: '#888',
                fontSize: 14,
                marginVertical: 20,
              }}>
              No quotations found
            </Text>
          )}
        </View>

        {/* ── Delete Modal ── */}
        <Modal transparent visible={deleteVisible} animationType="fade">
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setDeleteVisible(false)}>
            <Pressable style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Sale Bill?</Text>
              <Text style={styles.modalText}>
                The Bill will be deleted permanently. Are you sure you want to
                delete
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setDeleteVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteConfirm(item?.quotation_id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SaleProfile;

/* ── Original header styles — untouched ── */
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F5'},
  scrollContent: {paddingBottom: 80, paddingTop: 12},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F05A28',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  addBtnText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  addBtn: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F05A28',
    paddingVertical: 12,
    paddingHorizontal: '35%',
    borderRadius: 12,
    marginBottom: 8,
    bottom: 5,
    margin: 20,
    height: 50,
    width: 335,
    marginLeft: 12,
  },
  headerTitle: {fontSize: 18, fontFamily: fonts.semiBold, color: '#fff'},
  headerActions: {flexDirection: 'row'},

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 19,
    fontFamily: fonts.semiBold,
    marginBottom: 12,
    color: '#000',
  },
  modalText: {fontSize: 14.5, color: '#555', marginBottom: 24},
  modalButtons: {flexDirection: 'row', justifyContent: 'flex-end', gap: 12},
  cancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  deleteBtn: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#ef4444',
  },
  cancelText: {color: '#374151', fontFamily: fonts.semiBold, fontSize: 14.5},
  deleteText: {color: '#fff', fontFamily: fonts.semiBold, fontSize: 14.5},
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
    width: '98%',
    maxWidth: 400,
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
