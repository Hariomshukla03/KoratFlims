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

const BookingProfile = ({route}) => {
  const {item} = route.params || {};
  const navigation = useNavigation();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [quotationDetail, setQuotationDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [data, setData] = useState(null);
  const [Pdfdata, setPdfData] = useState(null);
  const [staffName, setStaffName] = useState('');

  const outdoor_id = item?.outdoor_id;

  useEffect(() => {
    if (error || !quotationDetail) {
      setTimeout(() => {
        setShowError(true);
      }, 2500);
    }
  }, [error]);

  const fetchBookingDetails = async () => {
    if (!outdoor_id) {
      setError('No Booking ID found');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(APIS.DETAILS_BOOKING, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({outdoor_id: outdoor_id}),
      });
      const json = await res.json();
      if (json?.status && json?.payload?.length > 0) {
        setData(json);
        setQuotationDetail(json.payload[0]);
      } else {
        setError('Oops! No data found. Try looking for a different party.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffDetails = async () => {
    try {
      setLoading(true);
      if (!data) return;
      const res = await fetch(APIS.STAFF_DETAIL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({staff_master_id: data?.outdoor_detail?.staff_id}),
      });
      const json = await res.json();
      if (json?.status && json?.payload?.length > 0) {
        console.log('STAFF', json.payload.map(i => i.staff_master_name));
        const staffN = String(json.payload.map(i => i.staff_master_name));
        setStaffName(staffN);
        setQuotationDetail(json.payload[0]);
      } else {
        setError('Oops! No data found. Try looking for a different party.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  useEffect(() => {
    if (data?.outdoor_detail?.staff_id) {
      fetchStaffDetails();
    }
  }, [data]);

  const getProducts = () => {
    if (!quotationDetail) return [];
    const ids = (quotationDetail.product_id || '').split(',').map(s => s.trim());
    const qtys = (quotationDetail.qty || '').split(',').map(s => s.trim());
    const rates = (quotationDetail.rate || '').split(',').map(s => s.trim());
    const totals = (quotationDetail.total || '').split(',').map(s => s.trim());
    return ids
      .map((id, index) => ({
        product_id: id,
        name: quotationDetail.product_names?.[index] || `Product ${id}`,
        qty: qtys[index] || '1',
        rate: rates[index] || '0',
        total: totals[index] || '0',
      }))
      .filter(p => p.product_id);
  };

  const products = getProducts();

  const handleDeleteConfirm = async outdoor_id => {
    try {
      const res = await fetch(APIS.DELETE_BOOKING, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({outdoor_id: outdoor_id}),
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
    navigation.navigate('BookingForm', {item: item});
  };

  const handleShare = async () => {
    setLoadingPdf(true);
    if (!data?.payload || data.payload.length === 0) {
      Alert.alert('Error', 'No quotation data available to generate PDF');
      return;
    }
    const quotations = data.payload;
    let grandTotal = 0;
    let discount = quotations?.discount || 0;
    let finalTotal = 0;
    console.log('final qutn', quotations);
    const rows = quotations
      .flatMap(qutn =>
        getProductsForQuotation(qutn).map(prod => {
          const total = Number(prod.qty) * Number(prod.rate);
          grandTotal += total;
          return `
            <tr>
              <td>${prod.name || 'Unknown'}</td>
              <td>${qutn.function_date || '-'}  (${qutn.program_name})</td>
              <td>${prod.qty}</td>
              <td>₹${Number(prod.rate).toFixed()}</td>
              <td>₹${total.toFixed()}</td>
            </tr>
          `;
        }),
      )
      .join('');
    finalTotal = grandTotal - grandTotal * (Number(discount) / 100);
    try {
      const html = `
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background: #ffffff; color: #1a1a1a; line-height: 1.6; }
              .container { max-width: 820px; margin: 30px auto; padding: 35px 40px; background: #ffffff; border: 1px solid #e8e8e8; border-radius: 10px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); outline: 1px solid rgba(240,90,40,0.18); outline-offset: -2px; }
              .logo { width: 160px; height: auto; margin-right: 28px; }
              h1 { margin: 0; font-size: 30px; font-weight: 700; color: #F05A28; letter-spacing: -0.5px; }
              p strong { color: #374151; font-weight: 600; }
              table { width: 100%; border-collapse: collapse; margin: 28px 0 20px; outline: 1px solid rgba(240,90,40,0.12); outline-offset: -1px; }
              th, td { padding: 12px 10px; text-align: left; border-bottom: 1px solid #f0f0f0; }
              th { font-size: 13px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.4px; }
              td { font-size: 14px; color: #1f2937; }
              td:first-child, th:first-child { border-left: 3px solid rgba(240,90,40,0.08); padding-left: 13px; }
              .totals { margin-top: 32px; text-align: right; font-size: 15px; outline: 1px solid rgba(240,90,40,0.10); outline-offset: -2px; padding: 12px 16px; border-radius: 8px; background: rgba(240,90,40,0.02); }
              .totals p { margin: 6px 0; }
              .totals strong { color: #F05A28; font-size: 17px; font-weight: 700; }
            </style>
          </head>
          <body>
            <div class="container">
              <a href="https://ibb.co/KpbS07VD"><img src="https://i.ibb.co/Q3ptbnYk/logo.png" class="logo" alt="logo" border="0"></a>
              <h1>QUOTATION</h1>
              <p><strong>Party Name:</strong> ${item.party_name || '—'}</p>
              <p><strong>Booking Date:</strong> ${item.outdoor_date || '—'}</p>
              <table>
                <tr>
                  <th>Description (Product)</th>
                  <th>Function Date</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Total</th>
                </tr>
                ${rows || '<tr><td colspan="5">No products found</td></tr>'}
              </table>
              <div class="totals">
                <p><strong>Grand Total:</strong> ₹${data?.outdoor_detail?.sub_total || '—'}</p>
                <p><strong>Discount:</strong> ${data?.outdoor_detail?.discount || '0'}%</p>
                <p><strong>Final Total:</strong> ₹${data?.outdoor_detail?.outdoor_total || '—'}</p>
              </div>
            </div>
          </body>
        </html>
      `;
      const options = {html, fileName: `Quotation_${item.party_name}`};
      const result = await generatePDF(options);
      setLoadingPdf(false);
      console.log('PDF created:', result.filePath);
      navigation.navigate('ShowPDF', {filePath: result.filePath});
    } catch (error) {
      console.error('PDF error:', error);
      Alert.alert('Error', error.message || 'Failed to generate PDF');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{textAlign: 'center', marginTop: 100}}>Loading...</Text>
      </SafeAreaView>
    );
  }

  {
    showError && (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {marginRight: 35}]}>Booking</Text>
          <View style={styles.headerActions} />
        </View>
        <Image
          style={{position: 'absolute', top: 230, right: 110, width: 150, height: 150}}
          source={require('/KoratFlims/assets/Images/Notfound.png')}
        />
        <Text style={{textAlign: 'center', marginTop: '68%', color: 'red', padding: 85, fontSize: 16}}>
          {error || 'No Booking details found'}
        </Text>
      </SafeAreaView>
    );
  }

  const getProductsForQuotation = qutn => {
    if (!qutn) return [];
    const ids = (qutn.product_id || '').split(',').map(s => s.trim());
    const qtys = (qutn.qty || '').split(',').map(s => s.trim());
    const rates = (qutn.rate || '').split(',').map(s => s.trim());
    const totals = (qutn.total || '').split(',').map(s => s.trim());
    return ids
      .map((id, index) => ({
        product_id: id,
        name: qutn.product_names?.[index] || `Product ${id || 'Unknown'}`,
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
        <Text style={[styles.headerTitle, {paddingLeft: 45}]}>Booking</Text>
        <View style={styles.headerActions}>
          {/* <TouchableOpacity onPress={handleShare} style={{paddingRight:18}}>
            <FIcon name="file-pdf" size={20} color="#fff" />
          </TouchableOpacity> */}
          <TouchableOpacity onPress={() => handleEdit(data)}>
            <Icon name="pencil-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDeleteVisible(true)} style={{marginLeft: 16}}>
            <Icon name="delete-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ── Booking No + Date ── */}
        <View style={mid.twoCol}>
          <View style={mid.card}>
            <Text style={mid.label}>Booking No</Text>
            <Text style={mid.value}>{item.outdoor_no || '—'}</Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Booking Date</Text>
            <Text style={mid.value}>{item.outdoor_date || '—'}</Text>
          </View>
        </View>

        {/* ── Party Name ── */}
        <View style={[mid.card, mid.fullCard]}>
          <Text style={mid.label}>Party Name</Text>
          <Text style={mid.value}>{item.party_name || '—'}</Text>
        </View>

        {/* ── Couple Name + Staff Name ── */}
        <View style={mid.twoCol}>
          <View style={mid.card}>
            <Text style={mid.label}>Couple Name</Text>
            <Text style={mid.value}>{item.couple_name || '—'}</Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Staff Name</Text>
            <Text style={mid.value}>{staffName || '—'}</Text>
          </View>
        </View>
        <View style={mid.twoCol}>
          <View style={mid.card}>
            <Text style={mid.label}>Map Location</Text>
            <Text style={mid.value}>{item.map_location || '—'}</Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>On Place</Text>
            <Text style={mid.value}>{item.on_place || '—'}</Text>
          </View>
        </View>

        {/* ── Map Location ── */}

        {/* ── Notes ── */}
        <View style={[mid.card, mid.fullCard]}>
          <Text style={mid.label}>Notes</Text>
          <Text style={[mid.value, !item.notes && {color: '#bbb'}]} numberOfLines={3}>
            {item.notes || '—'}
          </Text>
        </View>

        {/* ── Totals ── */}
        <View style={mid.twoCol}>
          <View style={mid.card}>
            <Text style={mid.label}>Grand Total</Text>
            <Text style={mid.value}>{data?.outdoor_detail?.sub_total || '0'}</Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Discount</Text>
            <Text style={mid.value}>{data?.outdoor_detail?.discount || '0'}%</Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Total</Text>
            <Text style={[mid.value, {fontFamily: fonts.bold,}]}>
              {data?.outdoor_detail?.outdoor_total || '0'}
            </Text>
          </View>
        </View>

        {/* ── Section divider ── */}
        <View style={mid.sectionDivider} />

        {/* ── Function / Product Cards — original qtnStyles ── */}
        <View style={{marginLeft: 10, marginTop: 1}}>
          {data?.payload?.length > 0 ? (
            data.payload.map((qutn, qtnIndex) => (
              <View key={qtnIndex}>
                <View style={qtnStyles.card}>
                  <View style={qtnStyles.topRow}>
                    <View style={{flex: 1}}>
                      <Text style={qtnStyles.heading}>Function Date:</Text>
                      <Text style={qtnStyles.value}>{qutn.function_date || 'N/A'}</Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                      <Text style={qtnStyles.heading}>Program:</Text>
                      <Text style={qtnStyles.value}>{qutn.program_name || 'N/A'}</Text>
                    </View>
                  </View>

                  <View style={qtnStyles.divider} />

                  <FlatList
                    data={getProductsForQuotation(qutn)}
                    keyExtractor={(item, index) => `${qutn.quotation_id || qtnIndex}-${index}`}
                    renderItem={({item: prod}) => (
                      <View style={qtnStyles.productBlock}>
                        <Text style={qtnStyles.productTitle}>
                          Product: {prod.name || 'Unknown Product'}
                        </Text>
                        <View style={qtnStyles.qtyRow}>
                          <Text style={qtnStyles.productDetails}>Qty: {prod.qty || 1}</Text>
                          <Text style={qtnStyles.productDetails}>Rate: {prod.rate || 0}</Text>
                          <Text style={qtnStyles.productDetails}>Total: {prod.total || '0.00'}</Text>
                        </View>
                      </View>
                    )}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                      <Text style={{fontSize: 12, color: '#888', textAlign: 'center', padding: 8}}>
                        No products added
                      </Text>
                    }
                  />
                </View>
                {qtnIndex < data.payload.length - 1 && <View style={{height: 16}} />}
              </View>
            ))
          ) : (
            <Text style={{textAlign: 'center', color: '#888', fontSize: 14, marginVertical: 20}}>
              No quotations found
            </Text>
          )}
        </View>

        {/* ── Delete Modal ── */}
        <Modal transparent visible={deleteVisible} animationType="fade">
          <Pressable style={styles.modalBackdrop} onPress={() => setDeleteVisible(false)}>
            <Pressable style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Booking?</Text>
              <Text style={styles.modalText}>
                The Booking will be deleted permanently. Are you sure you want to delete?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteConfirm(item?.outdoor_id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

      </ScrollView>

      {/* ── PDF Loading Modal — unchanged ── */}
      <Modal visible={loadingPdf} transparent animationType="fade">
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center'}}>
          <View>
            <Image style={{width: 80, height: 80, marginLeft: 12}} source={require('/KoratFlims/assets/Images/Loading.gif')} />
            <Text style={{marginTop: 18, color: 'white', fontSize: 17, fontFamily: fonts.semiBold,}}>
              Creating PDF...
            </Text>
          </View>
        </View>
      </Modal>

      {/* <TouchableOpacity style={styles.addBtn} onPress={handleShare} disabled={loadingPdf}>
        <PIcon name="file-pdf" size={20} color="#fff" />
        <Text style={styles.addBtnText}>Get PDF</Text>
      </TouchableOpacity> */}

    </SafeAreaView>
  );
};

export default BookingProfile;

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
    paddingVertical: 12,
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
  modalTitle: {fontSize: 19,fontFamily: fonts.bold, marginBottom: 12, color: '#000'},
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
    width: "98%",
    maxWidth:400,
    marginLeft: 0,
    marginTop: 0,
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