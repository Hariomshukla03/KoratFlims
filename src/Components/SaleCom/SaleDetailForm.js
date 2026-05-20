import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal,
  Pressable,
  BackHandler,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EIcon from 'react-native-vector-icons/Entypo';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import {APIS} from '../../../utils/Apis';
import {fonts} from '../../../utils/fonts';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useKeyboardVisible} from '../QuotationCom/isKeyboardVisible';
import {Divider, Menu, ProgressBar} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import StepIndicator from '../Loaders/StepIndicator';

const SaleDetailForm = ({route}) => {
  const {
    sale_id,
    selectedMobile,
    entryDateString,
    deliveryDateString,
    sendpartyName,
    selectedStaff,
    amount,
    couple_name,
    Fnotes,
  } = route.params || {};

  const navigation = useNavigation();
  const isKeyboardVisible = useKeyboardVisible();

  const [isDiscountFocused, setIsDiscountFocused] = useState(false);
  const [deleteModalVisible, setdeleteModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(null);
  const [dropdownData, setDropdownData] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const [finalModal, setFinalModal] = useState(false);
  const [search, setSearch] = useState('');
  const [FuntDate, setFuntDate] = useState(new Date());
  const [FuntDateString, setFuntDateString] = useState('');
  const [showFuntDate, setShowFuntDate] = useState(false);
  const [step, setStep] = useState(2);

  // qty, rate for the currently selected program
  const [qty, setQty] = useState('1');
  const [rate, setRate] = useState('0');

  const [grandTotal, setGrandTotal] = useState(0);
  const [discount, setDiscount] = useState('');
  const [Finaltotal, setFinalTotal] = useState(0);
  const [editingId, setEditingId] = useState(null);

  const [sales, setSales] = useState([]);
  const [showAddBtn, setShowAddBtn] = useState(false);
  const [deleteId, setDeleteId] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [alertBox, setAlertBox] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  const [coupleName, setCoupleName] = useState('');
  const coupleErr = 'Please enter couple name';
  const [showcoupleErr, setshowcoupleErr] = useState(false);
  const [notes, setNotes] = useState('');
  const [showFinalBtn, setshowFinalBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteAllModalVisible, setDeleteAllModalVisible] = useState(false);
  const [error, setError] = useState();

  // computed total for current input row
  const currentTotal = (
    (parseFloat(qty) || 0) * (parseFloat(rate) || 0)
  ).toFixed(2);

  // ─── Fetch programs ───────────────────────────────────────────────
  const getProg = async () => {
    try {
      const res = await fetch(APIS.GET_PROGRAM);
      const data = await res.json();
      setDropdownData(data?.payload || []);
    } catch (err) {
      console.error('Failed to load programs:', err);
    }
  };

  const finalData = dropdownData.map(i => ({
    label: i.event_name,
    value: i.event_id,
    // if your API has a default rate per program, map it here:
    // rate: i.amount,
  }));

  // ─── Fetch existing sale details (edit mode) ─────────────────────
  const getSaleDetails = async () => {
    try {
      const res = await fetch(APIS.DETAILS_SALE, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({sale_id}),
      });
      const data = await res.json();
      if (data?.salebill_detail) {
        const detail = data.salebill_detail;
        setDiscount(String(detail.discount || 0));
        setGrandTotal(Number(detail.sub_total) || 0);
      }
      setFetchedData(data?.payload);
    } catch (err) {
      console.error('Failed to load sale details:', err);
    }
  };

  useEffect(() => {
    if (sale_id) {
      getSaleDetails();
      setIsEdit(true);
    }
    if (couple_name) {
      setCoupleName(couple_name);
      setNotes(Fnotes);
    }
  }, [sale_id]);

  // ─── Show Add button when program + date selected ────────────────
  useEffect(() => {
    if (selectedProgram && FuntDateString) {
      setShowAddBtn(true);
    } else {
      setShowAddBtn(false);
    }
  }, [selectedProgram, FuntDateString]);

  // ─── Show Final/Save button when at least one sale item exists ───
  useEffect(() => {
    if (sales.length > 0) {
      setshowFinalBtn(true);
    } else {
      setshowFinalBtn(false);
    }
  }, [sales]);

  useEffect(() => {
    getProg();
  }, []);

  // ─── Recalculate grand total from sales list ─────────────────────
  useEffect(() => {
    if (!sales || sales.length === 0) {
      setGrandTotal(0);
      return;
    }
    const total = sales.reduce((sum, item) => {
      return sum + (Number(item.qty) || 0) * (Number(item.rate) || 0);
    }, 0);
    setGrandTotal(total);
  }, [sales]);

  // ─── Recalculate final total after discount ───────────────────────
  useEffect(() => {
    if (!grandTotal) {
      setFinalTotal(0);
      return;
    }
    const discountAmount = (grandTotal * Number(discount || 0)) / 100;
    setFinalTotal(grandTotal - discountAmount);
  }, [grandTotal, discount]);

  // ─── Hardware back ────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        if (sales.length > 0 || selectedProgram) {
          setAlertBox(true);
          return true;
        }

        navigation.goBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => subscription.remove();
    }, [sales, selectedProgram]),
  );

  // ─── Load fetched data into sales list (edit mode) ────────────────
  useEffect(() => {
    if (
      !fetchedData ||
      !Array.isArray(fetchedData) ||
      fetchedData.length === 0
    ) {
      setSales([]);
      return;
    }

    const programMap = new Map(finalData.map(p => [p.value, p.label]));

    const loadedSales = fetchedData.map(item => {
      const qty = (item.qty ?? '1').split(',')[0].trim();
      const rate = (item.rate ?? '0').split(',')[0].trim();
      const subTotal = (Number(qty) || 0) * (Number(rate) || 0);

      return {
        id: item.sale_add_id,
        function_date: item.function_date,
        program_id: item.program_id,
        program_name:
          programMap.get(item.program_id) || item.program_name || 'Unknown',
        qty,
        rate,
        sub_total: subTotal,
      };
    });

    setSales(loadedSales);

    if (loadedSales.length > 0) {
      const total = loadedSales.reduce(
        (sum, i) => sum + (Number(i.qty) || 0) * (Number(i.rate) || 0),
        0,
      );
      setGrandTotal(total);
    }
  }, [fetchedData]);

  // ─── Edit a sale item ─────────────────────────────────────────────
  const handleEdit = item => {
    setshowFinalBtn(false);
    setEditingId(item.id || item.sale_add_id);
    setFuntDateString(item.function_date || '');
    setSelectedProgram(item.program_id || null);
    setQty(String(item.qty || '1'));
    setRate(String(item.rate || '0'));
    setCoupleName(item?.couple_name);
    setNotes(item?.notes);
  };

  // ─── Delete single ────────────────────────────────────────────────
  const handleDelete = async id => {
    try {
      await fetch(APIS.DELETE_SINGLE_SALE, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({sale_add_id: id}),
      });
      setSales(prev => prev.filter(q => q.id !== id));
      setMenuVisible(null);

      setdeleteModalVisible(false);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // ─── Delete all ───────────────────────────────────────────────────
  const handleDeleteAll = async () => {
    try {
      for (const item of sales) {
        await fetch(APIS.DELETE_SINGLE_SALE, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({sale_add_id: item.id}),
        });
      }
      setSales([]);

      setDeleteAllModalVisible(false);
    } catch (err) {
      console.error('Delete All Error:', err);
    }
  };

  // ─── Add / Update item ────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedProgram || !FuntDateString) {
      alert('Fill all required fields');
      return;
    }
    if (rate == 0) {
      setError("Rate can't be 0");
      return;
    }

    const itemTotal = String((Number(qty) || 0) * (Number(rate) || 0));

    const payload = {
      ...(editingId && {sale_add_id: editingId}),
      sale_id: sale_id || null,
      function_date: FuntDateString,
      program_id: String(selectedProgram),
      qty: String(qty),
      rate: String(rate),
      total: String(itemTotal),
    };

    try {
      const apiUrl = editingId ? APIS.UPDATE_SINGLE_SALE : APIS.ADD_SINGLE_SALE;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log('API Response:', result);

      setError();
      if (result?.code !== 200) return;

      const serverAddId = result?.payload?.sale_add_id;
      const thisSubTotal = (Number(qty) || 0) * (Number(rate) || 0);

      setSales(prev => {
        let newList = [...prev];

        if (editingId) {
          newList = newList.map(item => {
            if (item.id === editingId) {
              return {
                ...item,
                id: serverAddId || item.id,
                function_date: FuntDateString,
                program_id: selectedProgram,
                program_name:
                  finalData.find(p => p.value === selectedProgram)?.label ||
                  item.program_name ||
                  'Unknown',
                qty,
                rate,
                sub_total: thisSubTotal,
              };
            }
            return item;
          });
        } else {
          newList.push({
            id: serverAddId || `temp-${Date.now()}`,
            function_date: FuntDateString,
            program_id: selectedProgram,
            program_name:
              finalData.find(p => p.value === selectedProgram)?.label ||
              'Unknown Program',
            qty,
            rate,
            sub_total: thisSubTotal,
          });
        }

        return newList;
      });

      // Reset form
      setEditingId(null);
      setSelectedProgram(null);
      setFuntDateString('');
      setQty('1');
      setRate('0');
    } catch (err) {
      console.error('Submit error:', err);
      alert('Network or server error – please check connection');
    }
  };

  // ─── Next (before final modal) ────────────────────────────────────
  const handleNext = () => {
    if (Number(discount) > 100) {
      setError('Please enter a value under 100');
      return;
    }
    navigation.navigate('SaleFinalForm', {
      sale_id,
      selectedMobile,
      entryDateString,
      sendpartyName,
      selectedStaff,
      amount,
      sendCoupleName: coupleName,
      sendNote: notes,
      sales,
      grandTotal,
      discount,
      Finaltotal,
    });
  };

  // ─── Final submit ─────────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    if (!coupleName.trim()) {
      setshowcoupleErr(true);
      return;
    }
    setshowcoupleErr(false);

    const isUpdate = !!sale_id;

    const payload = {
      party_id: selectedMobile || '',
      sale_date: entryDateString,
      function_side: '',
      party_name: sendpartyName || '',
      city_name: '',
      staff_id: selectedStaff,
      couple_name: coupleName.trim(),
      notes: notes,
      sub_total: Number(grandTotal) || 0,
      discount: Number(discount) || 0,
      sale_total: Number(Finaltotal) || 0,
      discount_type: 'percentage',
      staff_amount: amount,
      subFunctions:
        sales.length > 0
          ? sales.map(item => ({
              function_date: item.function_date || '',
              program_id: item.program_id || '',
              qty: String(item.qty || '1'),
              rate: String(item.rate || '0'),
              total: String(Number(item.qty) || 0) * (Number(item.rate) || 0),
            }))
          : [],
    };

    if (isUpdate) {
      payload.sale_id = sale_id;
    }

    try {
      setLoading(true);
      const apiUrl = isUpdate ? APIS.UPDATE_SALE : APIS.ADD_SALE;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log('Backend Response:', result);

      if (result?.code === 200) {
        setLoading(false);
        setFinalModal(false);
        setCoupleName('');
        setNotes('');
        setSales([]);
        setSelectedProgram(null);
        setFuntDateString('');
        setDiscount('');
        setGrandTotal(0);
        setFinalTotal(0);
        setQty('1');
        setRate('0');
        navigation.navigate('Sale');
      } else {
        setLoading(false);
        alert(result?.message || 'Failed to save. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      console.error('Network error:', err);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                if (sales.length > 0 || selectedProgram) {
                  setAlertBox(true);
                } else {
                  navigation.goBack();
                }
              }}>
              <Icon name="arrow-left" size={25} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {sale_id
                ? `Update Sale Bill (${sendpartyName})`
                : `Add Sale Bill (${sendpartyName})`}
            </Text>
          </View>
          <StepIndicator step={step} />

          {/* Form */}
          <View style={styles.form}>
            {/* Row: Date + Program */}
            <View style={styles.row}>
              {/* Function Date */}
              <View style={[styles.inputGroup, {flex: 1}]}>
                <Text style={styles.label}>Function Date</Text>
                <TouchableOpacity
                  style={styles.dateWrapper}
                  activeOpacity={0.7}
                  onPress={() => setShowFuntDate(true)}>
                  <Text style={styles.dateText}>
                    {FuntDateString || 'DD-MM-YYYY'}
                  </Text>
                  <Icon name="calendar" size={20} color="#64748b" />
                </TouchableOpacity>
                {showFuntDate && (
                  <DateTimePicker
                    value={FuntDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowFuntDate(Platform.OS === 'ios');
                      if (selectedDate) {
                        setFuntDate(selectedDate);
                        const day = selectedDate
                          .getDate()
                          .toString()
                          .padStart(2, '0');
                        const month = (selectedDate.getMonth() + 1)
                          .toString()
                          .padStart(2, '0');
                        const year = selectedDate.getFullYear();
                        setFuntDateString(`${day}-${month}-${year}`);
                      }
                    }}
                    minimumDate={new Date()}
                  />
                )}
              </View>

              {/* Program */}
              <View style={[styles.inputGroup, {flex: 1.1}]}>
                <Text style={[styles.label, {marginLeft: -12}]}>Program</Text>
                <Dropdown
                  autoScroll={false}
                  style={styles.dropdown}
                  searchPlaceholderTextColor="#000"
                  activeColor="#fef1e6"
                  itemTextStyle={{
                    color: '#000',
                    fontSize: 14,
                    marginVertical: -8,
                  }}
                  placeholderStyle={{color: '#000', fontSize: 14}}
                  selectedTextStyle={{color: '#000', fontSize: 14}}
                  inputSearchStyle={{
                    color: '#000',
                    width: 170,
                    height: 35,
                    fontSize: 13,
                    padding: -10,
                  }}
                  data={finalData}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select program"
                  searchPlaceholder="Search or type..."
                  onChangeText={setSearch}
                  value={selectedProgram}
                  onChange={item => setSelectedProgram(item.value)}
                />
              </View>
            </View>

            {/* Qty / Rate / Total card — shown when program is selected */}
            {selectedProgram ? (
              <View style={styles.inv_card}>
                <Text style={styles.inv_productName}>
                  {finalData.find(p => p.value === selectedProgram)?.label ||
                    'Selected Program'}
                </Text>
                <View style={styles.inv_row}>
                  {/* Qty */}
                  <View style={styles.inv_inputBox}>
                    <Text style={styles.inv_label}>Qty</Text>
                    <TextInput
                      value={qty}
                      onChangeText={text => {
                        let cleaned = text.replace(/[^0-9]/g, '');

                        // remove leading zeros
                        cleaned = cleaned.replace(/^0+/, '');
                        setQty(cleaned);
                      }}
                      keyboardType="numeric"
                      style={styles.inv_input}
                      placeholder="1"
                      maxLength={5}
                    />
                  </View>
                  {/* Rate */}
                  <View style={styles.inv_inputBox}>
                    <Text style={styles.inv_label}>Rate</Text>
                    <TextInput
                      value={rate}
                      onChangeText={text => {
                        let cleaned = text.replace(/[^0-9]/g, '');

                        // remove leading zeros
                        cleaned = cleaned.replace(/^0+/, '');
                        setRate(cleaned);
                      }}
                      keyboardType="numeric"
                      style={[styles.inv_input, error && {borderColor: 'red'}]}
                      placeholder="0"
                      maxLength={8}
                    />
                  </View>
                  {/* Total (read-only) */}
                  <View style={styles.inv_inputBox}>
                    <Text style={styles.inv_label}>Total</Text>
                    <TextInput
                      value={`₹ ${currentTotal}`}
                      keyboardType="numeric"
                      style={[styles.inv_input, {backgroundColor: '#f0f0f0'}]}
                      editable={false}
                    />
                  </View>
                </View>
              </View>
            ) : null}

            {/* Add / Update Item button */}
            <View style={styles.inv_container}>
              <TouchableOpacity
                style={[
                  styles.inv_addBtn,
                  {backgroundColor: showAddBtn ? '#F05A28' : '#dadada'},
                ]}
                onPress={handleSubmit}
                disabled={!showAddBtn}>
                <Text style={styles.inv_addText}>
                  {editingId ? 'Update Item' : 'Add Item'}
                </Text>
              </TouchableOpacity>

              {/* Sales summary cards */}
              {sales.map((item, index) => (
                <View key={index}>
                  <View style={qtnStyles.card}>
                    {/* Top Row */}
                    <View style={qtnStyles.topRow}>
                      <View style={{flex: 1}}>
                        <Text style={qtnStyles.heading}>Function Date:</Text>
                        <Text style={qtnStyles.value}>
                          {item.function_date || 'N/A'}
                        </Text>
                      </View>
                      <View style={{flex: 1, alignItems: 'flex-end'}}>
                        <Text style={qtnStyles.heading}>Program:</Text>
                        <Text style={qtnStyles.value}>
                          {item.program_name || 'N/A'}
                        </Text>
                      </View>
                      <View style={qtnStyles.actions}>
                        <Menu
                          visible={menuVisible === item.id}
                          onDismiss={() => setMenuVisible(null)}
                          anchorPosition="bottom"
                          anchor={
                            <TouchableOpacity
                              style={{paddingLeft: 12}}
                              onPress={() => setMenuVisible(item.id)}>
                              <EIcon
                                name="dots-three-vertical"
                                size={16}
                                color="#9CA3AF"
                              />
                            </TouchableOpacity>
                          }
                          style={{width: 120, height: 42, paddingLeft: 8}}
                          contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: 8,
                            elevation: 4,
                            shadowColor: '#000',
                            shadowOffset: {width: 0, height: 2},
                            shadowOpacity: 0.15,
                            shadowRadius: 6,
                          }}>
                          <Menu.Item
                            onPress={() => {
                              handleEdit(item);
                              setMenuVisible(null);
                            }}
                            leadingIcon={({color}) => (
                              <MaterialCommunityIcons
                                name="pencil"
                                size={22}
                                color={color}
                              />
                            )}
                            title="Edit"
                            titleStyle={{
                              color: '#000',
                              fontSize: 14,
                              marginLeft: -8,
                            }}
                            style={{
                              backgroundColor: '#fff',
                              height: 30,
                              paddingVertical: 0,
                            }}
                          />
                          <Divider style={{backgroundColor: '#c2c2c2'}} />
                          <Menu.Item
                            onPress={() => {
                              setDeleteId(item.id);
                              setdeleteModalVisible(true);
                              setMenuVisible(null);
                            }}
                            leadingIcon={({color}) => (
                              <MaterialCommunityIcons
                                name="delete"
                                size={22}
                                color={color}
                              />
                            )}
                            title="Delete"
                            titleStyle={{
                              color: '#000',
                              fontSize: 14,
                              marginLeft: -8,
                            }}
                            style={{
                              backgroundColor: '#fff',
                              height: 30,
                              paddingVertical: 0,
                            }}
                          />
                        </Menu>
                      </View>
                    </View>

                    <View style={qtnStyles.divider} />

                    {/* Qty / Rate / Total row */}
                    <View style={qtnStyles.qtyRow}>
                      <Text style={qtnStyles.productDetails}>
                        Qty: {item.qty || 1}
                      </Text>
                      <Text style={qtnStyles.productDetails}>
                        Rate: {item.rate || 0}
                      </Text>
                      <Text style={qtnStyles.productDetails}>
                        Total:{' '}
                        {(
                          (Number(item.qty) || 0) * (Number(item.rate) || 0)
                        ).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Summary */}
        {(!isKeyboardVisible || isDiscountFocused) && (
          <View
            style={[
              styles.inv_card,
              {paddingTop: 12, marginBottom: isKeyboardVisible ? 30 : 0},
            ]}>
            <View style={[styles.inv_row, {borderWidth: 0}]}>
              {/* Grand Total */}
              <View style={styles.inv_inputBox}>
                <Text
                  style={[
                    styles.inv_label,
                    {fontSize: 13, color: '#000', fontFamily: fonts.semiBold},
                  ]}>
                  Grand Total:
                </Text>
                <TextInput
                  value={grandTotal.toFixed(2)}
                  editable={false}
                  keyboardType="numeric"
                  style={[
                    styles.inv_input,
                    {backgroundColor: '#f0f0f0', color: '#000'},
                  ]}
                  placeholder="0"
                />
              </View>
              {/* Discount */}
              <View style={styles.inv_inputBox}>
                <Text
                  style={[
                    styles.inv_label,
                    {
                      fontSize: 13,
                      color: '#000',
                      fontFamily: fonts.semiBold,
                      width: 450,
                    },
                  ]}>
                  Discount (%):
                </Text>
                <TextInput
                  value={discount}
                  onChangeText={text => {
                    setDiscount(text);
                    setError(null);
                  }}
                  keyboardType="numeric"
                  style={[
                    styles.inv_input,
                    error && {borderColor: 'red', borderWidth: 1},
                  ]}
                  placeholder="0"
                  onFocus={() => setIsDiscountFocused(true)}
                  onBlur={() => setIsDiscountFocused(false)}
                  maxLength={3}
                />
              </View>
              {/* Final Total */}
              <View style={styles.inv_inputBox}>
                <Text
                  style={[
                    styles.inv_label,
                    {
                      fontSize: 14,
                      color: '#000',
                      fontFamily: fonts.semiBold,
                      marginLeft: 14,
                    },
                  ]}>
                  Total:
                </Text>
                <TextInput
                  value={Number(Finaltotal || 0).toFixed(2)}
                  keyboardType="numeric"
                  style={[
                    styles.inv_input,
                    {backgroundColor: '#f0f0f0', color: '#000'},
                  ]}
                  editable={false}
                />
              </View>
            </View>

            <View
              style={[
                styles.inv_btnRow,
                {paddingTop: 12, paddingHorizontal: 8},
              ]}>
              <TouchableOpacity
                style={styles.inv_cancelBtn}
                onPress={() => setDeleteAllModalVisible(true)}>
                <Text style={styles.inv_cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.inv_saveBtn,
                  {backgroundColor: showFinalBtn ? '#F05A28' : '#dadada'},
                ]}
                disabled={!showFinalBtn}
                onPress={handleNext}>
                <Text style={styles.inv_saveText}>Next</Text>
              </TouchableOpacity>
            </View>

            {/* ── Final Modal ── */}
            <Modal
              visible={finalModal}
              animationType="slide"
              transparent={true}
              onRequestClose={() => {
                setStep(2);
                setFinalModal(false);
              }}>
              <Pressable
                style={modalStyles.overlay}
                onPress={() => {
                  setStep(2);
                  setFinalModal(false);
                }}>
                <Pressable
                  style={modalStyles.modalContainer}
                  onPress={() => {}}>
                  <View style={modalStyles.modalHeader}>
                    <TouchableOpacity
                      onPress={() => {
                        setStep(2);
                        setFinalModal(false);
                      }}>
                      <Icon name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    <View style={modalStyles.field}>
                      <Text style={modalStyles.label}>
                        Couple Name <Text style={{color: 'red'}}>*</Text>
                      </Text>
                      <TextInput
                        style={[
                          modalStyles.input,
                          {borderColor: showcoupleErr ? 'red' : '#ddd'},
                        ]}
                        value={coupleName}
                        onFocus={() => setIsDiscountFocused(true)}
                        onChangeText={text => {
                          setshowcoupleErr(false);
                          setCoupleName(text);
                        }} // ← fixed typo: onChange → onChangeText
                        placeholder="Enter couple name"
                        placeholderTextColor="#aaa"
                        autoFocus={true}
                      />
                      {showcoupleErr && (
                        <Text
                          style={{color: 'red', fontSize: 12, marginTop: 4}}>
                          {coupleErr}
                        </Text>
                      )}
                    </View>
                    <View style={modalStyles.field}>
                      <Text style={modalStyles.label}>Note</Text>
                      <TextInput
                        style={[
                          modalStyles.input,
                          {height: 50, textAlignVertical: 'top'},
                        ]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Enter notes here..."
                        placeholderTextColor="#aaa"
                        multiline
                      />
                    </View>
                  </ScrollView>
                  <View style={modalStyles.buttonRow}>
                    <TouchableOpacity
                      style={modalStyles.cancelBtn}
                      onPress={() => {
                        setStep(2);
                        setFinalModal(false);
                      }}>
                      <Text style={modalStyles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={modalStyles.saveBtn}
                      onPress={() => {
                        if (!coupleName) {
                          setshowcoupleErr(true);
                          return;
                        }
                        setshowcoupleErr(false);
                        handleFinalSubmit();
                      }}>
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.inv_saveText}>Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </Pressable>
            </Modal>

            {/* ── Delete Single Modal ── */}
            <Modal
              transparent
              visible={deleteModalVisible}
              animationType="fade"
              onRequestClose={() => setdeleteModalVisible(false)}>
              <Pressable
                style={styles.modalBackdrop}
                onPress={() => setdeleteModalVisible(false)}>
                <Pressable style={styles.modalContent} onPress={() => {}}>
                  <Text style={styles.modalTitle}>Delete Bill?</Text>
                  <Text style={styles.modalText}>
                    Are you sure you want to delete this Sale Bill?
                  </Text>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      onPress={() => setdeleteModalVisible(false)}
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
                      <Text
                        style={{
                          color: '#344054',
                          fontFamily: fonts.semiBold,
                          fontSize: 14,
                        }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(deleteId)}
                      style={{
                        backgroundColor: '#FF4D4F',
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        elevation: 3,
                      }}
                      activeOpacity={0.8}>
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontFamily: fonts.semiBold,
                          fontSize: 14,
                        }}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </Pressable>
            </Modal>

            {/* ── Delete All Modal ── */}
            <Modal
              transparent
              visible={deleteAllModalVisible}
              animationType="fade"
              onRequestClose={() => setDeleteAllModalVisible(false)}>
              <Pressable
                style={styles.modalBackdrop}
                onPress={() => setDeleteAllModalVisible(false)}>
                <Pressable style={styles.modalContent} onPress={() => {}}>
                  <Text style={styles.modalTitle}>Delete All Sales?</Text>
                  <Text style={styles.modalText}>
                    Are you sure you want to delete all sales?
                  </Text>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      onPress={() => setDeleteAllModalVisible(false)}
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
                      <Text
                        style={{
                          color: '#344054',
                          fontFamily: fonts.semiBold,
                          fontSize: 14,
                        }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleDeleteAll}
                      style={{
                        backgroundColor: '#FF4D4F',
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        elevation: 3,
                      }}
                      activeOpacity={0.8}>
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontFamily: fonts.semiBold,
                          fontSize: 14,
                        }}>
                        Delete All
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </Pressable>
            </Modal>

            {/* ── Unsaved Changes Modal ── */}
            <Modal
              transparent
              visible={alertBox}
              animationType="fade"
              onRequestClose={() => setAlertBox(false)}>
              <Pressable
                style={styles.modalBackdrop}
                onPress={() => setAlertBox(false)}>
                <Pressable style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Unsaved Changes?</Text>
                  <Text style={styles.modalText}>
                    Do you want to go back? Unsaved changes to this booking will
                    be lost.
                  </Text>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      onPress={() => setAlertBox(false)}
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
                      <Text
                        style={{
                          color: '#344054',
                          fontFamily: fonts.semiBold,
                          fontSize: 14,
                        }}>
                        Stay Here
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={navigation.goBack}
                      style={{
                        backgroundColor: '#FF4D4F',
                        paddingVertical: 8,
                        paddingHorizontal: 14,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        elevation: 3,
                      }}
                      activeOpacity={0.8}>
                      <Text
                        style={{
                          color: '#FFFFFF',
                          fontFamily: fonts.semiBold,
                          fontSize: 14,
                        }}>
                        Discard Changes
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SaleDetailForm;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f9fa'},
  scrollContent: {paddingBottom: 40},
  header: {
    flexDirection: 'row',
    backgroundColor: '#F05A28',
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: '#FFF',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  form: {padding: 9},
  row: {flexDirection: 'row', alignItems: 'flex-end', gap: 14},
  inputGroup: {marginBottom: 8},
  label: {
    fontSize: 13,
    marginLeft: 10,
    color: '#444',
    marginBottom: 2,
    fontFamily: fonts.semiBold,
  },
  required: {color: '#ff4d4f'},
  dropdown: {
    height: 40,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginLeft: -22,
  },
  dateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    width: '92%',
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  dateText: {fontSize: 14, color: '#333', flex: 1},
  inv_container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 1,
    marginTop: 4,
  },
  inv_card: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 4,
  },
  inv_productName: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    marginTop: -8,
    marginBottom: 6,
    color: '#111827',
  },
  inv_row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 2,
  },
  inv_inputBox: {flex: 1, marginRight: 8},
  inv_label: {fontSize: 12, marginBottom: 2, color: '#6a6a6a', marginTop: -2},
  inv_input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 12,
    color: '#000',
    backgroundColor: '#FFF',
  },
  inv_addBtn: {
    backgroundColor: '#FF7A00',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  inv_addText: {color: '#FFF', fontFamily: fonts.semiBold, fontSize: 14},
  inv_btnRow: {flexDirection: 'row', gap: 10},
  inv_cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  inv_cancelText: {color: '#4B5563', fontFamily: fonts.semiBold, fontSize: 14},
  inv_saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ff7606',
    alignItems: 'center',
  },
  inv_saveText: {color: '#FFF', fontFamily: fonts.bold, fontSize: 14},
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    marginBottom: 18,
    color: '#000',
  },
  modalText: {color: '#555', marginBottom: 20, fontSize: 15},
  modalButtons: {flexDirection: 'row', justifyContent: 'flex-end'},
});

const qtnStyles = StyleSheet.create({
  actions: {flexDirection: 'row', alignItems: 'center'},
  card: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
  },
  topRow: {flexDirection: 'row', justifyContent: 'space-between'},
  heading: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: '#444',
    marginBottom: 2,
  },
  value: {fontSize: 12, fontFamily: fonts.semiBold, color: '#000'},
  divider: {height: 1, backgroundColor: '#E5E5E5', marginVertical: 8},
  qtyRow: {flexDirection: 'row', justifyContent: 'space-between'},
  productDetails: {fontSize: 12, color: '#333'},
  productBlock: {marginBottom: 6},
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  field: {marginTop: 4},
  label: {fontSize: 14, marginBottom: 6, color: '#444'},
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#fafafa',
    color: '#000',
  },
  buttonRow: {flexDirection: 'row', marginTop: 20, gap: 10},
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#F05A28',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {fontFamily: fonts.semiBold, color: '#333'},
  saveText: {fontFamily: fonts.semiBold, color: '#fff'},
});
