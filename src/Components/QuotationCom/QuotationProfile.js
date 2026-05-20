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
import Invoicehtml from './ShowPDF';
import FileViewer from 'react-native-file-viewer';

const QuotationProfile = ({route}) => {
  const {item} = route.params || {};
  const navigation = useNavigation();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [quotationDetail, setQuotationDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [Pdfdata, setPdfData] = useState(null);

  const quotationId = item?.quotation_id;

  const fetchQuotationDetails = async () => {
    if (!quotationId) {
      setError('No quotation ID found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(APIS.DETAILS_QUOTATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({quotation_id: quotationId}),
      });

      const json = await res.json();

      if (json?.status && json?.payload?.length > 0) {
        setData(json);
        console.log(data);
        setQuotationDetail(json.payload[0]);
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
    if (!quotationDetail) return [];

    const ids = (quotationDetail.product_id || '')
      .split(',')
      .map(s => s.trim());
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

  const handleDeleteConfirm = async quotationId => {
    try {
      const res = await fetch(APIS.DELETE_QUOTATION, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quotation_id: quotationId,
        }),
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
    navigation.navigate('QuotationForm', {item: item});
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
              <td>Rs.${Number(prod.rate).toFixed()}</td>
              <td>Rs.${total.toFixed()}</td>
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
              * { box-sizing: border-box; margin: 0; padding: 0; }

              body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                background: #f5f5f5;
                color: #1a1a1a;
                padding: 30px 20px;
              }

              .page {
                max-width: 820px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 24px rgba(0,0,0,0.07);
              }

              /* HEADER */
              .header {
                padding: 36px 44px 32px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 2px solid #F05A28;
              }

              .logo-wrap img {
                width: 150px;
                height: auto;
                display: block;
              }

              .header-right {
                text-align: right;
              }

              .doc-label {
                font-size: 11px;
                font-weight: 600;
                letter-spacing: 3px;
                text-transform: uppercase;
                color: #9ca3af;
                margin-bottom: 4px;
              }

              .doc-title {
                font-size: 36px;
                font-weight: 700;
                color: #1a1a1a;
                letter-spacing: -1px;
                line-height: 1;
              }

              .doc-title span { color: #F05A28; }

              /* INFO ROW */
              .info-row {
                display: flex;
                background: #fafafa;
                border-bottom: 1px solid #efefef;
              }

              .info-cell {
                flex: 1;
                padding: 18px 44px;
                border-right: 1px solid #efefef;
              }

              .info-cell:last-child { border-right: none; }

              .info-label {
                font-size: 10px;
                font-weight: 600;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: #9ca3af;
                margin-bottom: 4px;
              }

              .info-value {
                font-size: 14px;
                font-weight: 600;
                color: #1a1a1a;
              }

              /* BODY */
              .body { padding: 36px 44px 44px; }

              /* TABLE */
              .table-wrap {
                border: 1px solid #efefef;
                border-radius: 10px;
                overflow: hidden;
              }

              table { width: 100%; border-collapse: collapse; }

              thead tr { background: #1a1a1a; }

              th {
                padding: 13px 16px;
                font-size: 10px;
                font-weight: 600;
                color: #9ca3af;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                text-align: left;
              }

              th:last-child { text-align: right; }

              tbody tr { border-bottom: 1px solid #f5f5f5; }
              tbody tr:last-child { border-bottom: none; }
              tbody tr:nth-child(even) { background: #fafafa; }

              td {
                padding: 14px 16px;
                font-size: 13.5px;
                color: #374151;
              }

              td:first-child { font-weight: 600; color: #1a1a1a; }
              td:last-child { text-align: right; font-weight: 600; color: #1a1a1a; }

              .empty-row td {
                text-align: center;
                color: #9ca3af;
                font-style: italic;
                padding: 28px;
              }

              /* TOTALS */
              .bottom-section {
                margin-top: 28px;
                display: flex;
                justify-content: flex-end;
              }

              .totals-box {
                width: 280px;
                border: 1px solid #efefef;
                border-radius: 10px;
                overflow: hidden;
              }

              .totals-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 18px;
                border-bottom: 1px solid #f5f5f5;
                font-size: 13.5px;
              }

              .totals-row:last-child {
                border-bottom: none;
                background: #F05A28;
                padding: 15px 18px;
              }

              .totals-key { color: #6b7280; font-weight: 400; }
              .totals-val { color: #1a1a1a; font-weight: 600; }

              .totals-row:last-child .totals-key {
                color: rgba(255,255,255,0.8);
                font-weight: 600;
                font-size: 12px;
                letter-spacing: 1px;
                text-transform: uppercase;
              }

              .totals-row:last-child .totals-val {
                color: #ffffff;
                font-size: 18px;
                font-weight: 700;
              }

              /* FOOTER */
              .footer {
                margin-top: 36px;
                padding-top: 20px;
                border-top: 1px solid #efefef;
                display: flex;
                align-items: center;
                justify-content: space-between;
              }

              .footer-note { font-size: 11.5px; color: #9ca3af; }

              .footer-stamp {
                display: flex;
                align-items: center;
                gap: 7px;
                border: 1.5px solid #F05A28;
                border-radius: 6px;
                padding: 6px 12px;
              }

              .stamp-dot {
                width: 6px; height: 6px;
                background: #F05A28;
                border-radius: 50%;
              }

              .stamp-text {
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                color: #F05A28;
              }
            </style>
          </head>
          <body>
            <div class="page">

              <!-- HEADER -->
              <div class="header">
                <div class="logo-wrap">
                  <a href="https://ibb.co/KpbS07VD">
                    <img src="https://i.ibb.co/Q3ptbnYk/logo.png" alt="logo">
                  </a>
                </div>
                <div class="header-right">
                  <div class="doc-label">Official Document</div>
                  <div class="doc-title">QUOTATION<span>.</span></div>
                </div>
              </div>

              <!-- INFO ROW -->
              <div class="info-row">
                <div class="info-cell">
                  <div class="info-label">Party Name</div>
                  <div class="info-value">${item.party_name || '—'}</div>
                </div>
                <div class="info-cell">
                  <div class="info-label">Quotation Date</div>
                  <div class="info-value">${item.quotation_date || '—'}</div>
                </div>
                <div class="info-cell">
                  <div class="info-label">Status</div>
                  <div class="info-value">Pending Review</div>
                </div>
              </div>

              <!-- BODY -->
              <div class="body">

                <div class="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Description (Product)</th>
                        <th>Function Date</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${
                        rows ||
                        '<tr class="empty-row"><td colspan="5">No products found</td></tr>'
                      }
                    </tbody>
                  </table>
                </div>

                <div class="bottom-section">
                  <div class="totals-box">
                    <div class="totals-row">
                      <span class="totals-key">Sub Total</span>
                      <span class="totals-val">Rs. ${
                        data?.quotation_detail?.sub_total || '—'
                      }</span>
                    </div>
                    <div class="totals-row">
                      <span class="totals-key">Discount</span>
                      <span class="totals-val">${
                        data?.quotation_detail?.discount || '0'
                      }%</span>
                    </div>
                    <div class="totals-row">
                      <span class="totals-key">Grand Total</span>
                      <span class="totals-val">Rs. ${
                        data?.quotation_detail?.quotation_total || '—'
                      }</span>
                    </div>
                  </div>
                </div>

                <div class="footer">
                  <span class="footer-note">This quotation is valid for 30 days from the date of issue.</span>
                  <div class="footer-stamp">
                    <div class="stamp-dot"></div>
                    <span class="stamp-text">Official Quotation</span>
                  </div>
                </div>

              </div>
            </div>
          </body>
        </html>
      `;

      const options = {
        html,
        fileName: `Quotation_${item.party_name}`,
      };

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

  if (error || !quotationDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {paddingLeft: -20}]}>
            Quotation
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
        <Text style={[styles.headerTitle, {paddingLeft: 45}]}>Quotation</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={{paddingRight: 18}}>
            <FIcon name="file-pdf" size={20} color="#fff" />
          </TouchableOpacity>
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
        {/* ── Quotation No + Date ── */}
        <View style={mid.twoCol}>
          <View style={mid.card}>
            <Text style={mid.label}>Quotation No</Text>
            <Text style={mid.value}>{item.quot_no || '—'}</Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Quotation Date</Text>
            <Text style={mid.value}>{item.quotation_date || '—'}</Text>
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
              {data?.quotation_detail?.sub_total || '—'}
            </Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Discount</Text>
            <Text style={mid.value}>
              {data?.quotation_detail?.discount || '0'}%
            </Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Total</Text>
            <Text style={[mid.value, {fontFamily: fonts.semiBold}]}>
              {data?.quotation_detail?.quotation_total || '—'}
            </Text>
          </View>
        </View>

        {/* ── Section divider ── */}
        <View style={mid.sectionDivider} />

        {/* ── Function / Product Cards — original style ── */}
        <View style={{marginLeft: 10, marginTop: 10}}>
          {data?.payload?.length > 0 ? (
            data.payload.map((qutn, qtnIndex) => (
              <View key={qtnIndex}>
                <View style={qtnStyles.card}>
                  <View style={qtnStyles.topRow}>
                    <View style={{flex: 1}}>
                      <Text style={qtnStyles.heading}>Function Date:</Text>
                      <Text style={qtnStyles.value}>
                        {qutn.function_date || 'N/A'}
                      </Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'flex-end'}}>
                      <Text style={qtnStyles.heading}>Program:</Text>
                      <Text style={qtnStyles.value}>
                        {qutn.program_name || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={qtnStyles.divider} />

                  <FlatList
                    data={getProductsForQuotation(qutn)}
                    keyExtractor={(item, index) =>
                      `${qutn.quotation_id || qtnIndex}-${index}`
                    }
                    renderItem={({item: prod}) => (
                      <View style={qtnStyles.productBlock}>
                        <Text style={qtnStyles.productTitle}>
                          Product: {prod.name || 'Unknown Product'}
                        </Text>
                        <View style={qtnStyles.qtyRow}>
                          <Text style={qtnStyles.productDetails}>
                            Qty: {prod.qty || 1}
                          </Text>
                          <Text style={qtnStyles.productDetails}>
                            Rate: {prod.rate || 0}
                          </Text>
                          <Text style={qtnStyles.productDetails}>
                            Total: {prod.total || '0.00'}
                          </Text>
                        </View>
                      </View>
                    )}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#888',
                          textAlign: 'center',
                          padding: 8,
                        }}>
                        No products added
                      </Text>
                    }
                  />
                </View>
                {qtnIndex < data.payload.length - 1 && (
                  <View style={{height: 16}} />
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
              <Text style={styles.modalTitle}>Delete Quotation?</Text>
              <Text style={styles.modalText}>
                The Quotation will be deleted permanently. Are you sure you want
                to delete
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

      {/* ── PDF Loading Modal — unchanged ── */}
      <Modal visible={loadingPdf} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.85)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View>
            <Image
              style={{width: 80, height: 80, marginLeft: 12}}
              source={require('/KoratFlims/assets/Images/Loading.gif')}
            />
            <Text
              style={{
                marginTop: 18,
                color: 'white',
                fontSize: 17,
                fontFamily: fonts.semiBold,
              }}>
              Creating PDF...
            </Text>
          </View>
        </View>
      </Modal>

      {/* ── BOTTOM BUTTON — unchanged ── */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={handleShare}
        disabled={loadingPdf}>
        <PIcon name="file-pdf" size={20} color="#fff" />
        <Text style={styles.addBtnText}>Get PDF</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default QuotationProfile;

/* ─────────────────────────────────────────────
   ORIGINAL styles — header + bottom btn untouched
───────────────────────────────────────────── */
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
    width: '95%',
    maxWidth: 400,
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
    fontFamily: fonts.bold,
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

/* ─────────────────────────────────────────────
   NEW mid styles — clean black & white only
───────────────────────────────────────────── */
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

  functionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  functionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  functionValue: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: '#111',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEFEF',
  },

  productRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  productName: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: '#111',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaSep: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
  },
  metaLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: fonts.semiBold,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: '#333',
  },
});

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
    marginLeft: 0,
    marginTop: -12,
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
