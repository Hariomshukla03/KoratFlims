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
  TouchableWithoutFeedback,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EIcon from 'react-native-vector-icons/Entypo';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import {APIS} from '../../../utils/Apis';
import {fonts} from '../../../utils/fonts';
import DateTimePicker from '@react-native-community/datetimepicker';
import {MultiSelect} from 'react-native-element-dropdown';
import {useKeyboardVisible} from './isKeyboardVisible';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Divider, Menu, ProgressBar} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import StepIndicator from '../Loaders/StepIndicator';
const QuotationDetailsForm = ({route}) => {
  const {width} = Dimensions.get('window');

  const {
    quotation_id,
    selectedMobile,
    entryDateString,
    sendpartyName,
    selectedStaff,
    sendCoupleName,
    sendNote,
  } = route.params || {};
  // console.log(quotation_id, selectedMobile, entryDateString, sendpartyName);
  const navigation = useNavigation();
  const isKeyboardVisible = useKeyboardVisible();

  const [isDiscountFocused, setIsDiscountFocused] = useState(false);
  const [deleteModalVisible, setdeleteModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(null);
  const [dropdownData, setDropdownData] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectProduct, setSelectProduct] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [step, setStep] = useState(2);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [finalModal, setFinalModal] = useState(false);
  const [search, setSearch] = useState('');
  const [FuntDate, setFuntDate] = useState(null);
  const [FuntDateString, setFuntDateString] = useState(null);
  const [showFuntDate, setShowFuntDate] = useState(false);
  const [qty, setQty] = useState('1');
  const [rate, setRate] = useState('0');
  const [grandTotal, setGrandTotal] = useState(0); // products total
  const [discount, setDiscount] = useState(''); // user input %
  const [Finaltotal, setFinalTotal] = useState(0); // after discount
  const [editingId, setEditingId] = useState(null);
  const [dropDownProduct, setDropdownProduct] = useState([]);
  const [readyData, setReadyData] = useState();
  const [quotations, setQuotations] = useState([]); // ← naya
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
  const [error, setError] = useState();
  const [deleteAllModalVisible, setDeleteAllModalVisible] = useState(false);
  const [reqError, setreqError] = useState(null);
  const total = (parseFloat(qty || 0) * parseFloat(rate || 0)).toFixed(2);

  const finalTotal = (grandTotal - parseFloat(discount || 0))?.toFixed(2);

  const getProg = async () => {
    try {
      const res = await fetch(APIS.GET_PROGRAM);
      const data = await res.json();
      // console.log(data);
      const newData = data.payload;
      setDropdownData(data?.payload);
    } catch (err) {
      console.error('Failed to load parties:', err);
    }
  };
  const getProd = async () => {
    try {
      const res = await fetch(APIS.PRODUCT_LIST);
      const data = await res.json();
      // console.log(data);
      const newData = data.payload;
      setDropdownProduct(data?.payload);
    } catch (err) {
      console.error('Failed to load parties:', err);
    }
  };
  const finalDropdownProd = dropDownProduct.map(i => ({
    product_id: i.product_id,
    label: i.product_name,
    value: i.product_id,
    rate: i.amount,
  }));

  const getQutnDetails = async () => {
    try {
      const res = await fetch(APIS.DETAILS_QUOTATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quotation_id: quotation_id,
        }),
      });
      const data = await res.json();
      // console.log("HIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII",data);
      if (data?.quotation_detail) {
        const detail = data.quotation_detail;

        setDiscount(String(detail.discount || 0));
        setGrandTotal(Number(detail.sub_total) || 0);
      }
      const newData = data.payload;
      setFetchedData(data?.payload);
    } catch (err) {
      console.error('Failed to load parties:', err);
    }
  };

  useEffect(() => {
    if (quotation_id) {
      getQutnDetails();
      setIsEdit(true);
    }
  }, [quotation_id]);

  useEffect(() => {
    if (selectedProgram && selectProduct.length > 0 && FuntDate) {
      setShowAddBtn(true);
    } else if (quotations.length > 0) {
      setshowFinalBtn(true);
      setShowAddBtn(false);
    } else {
      setShowAddBtn(false);
      setshowFinalBtn(false);
    }
  }, [selectedProgram, selectProduct, FuntDate, quotations]);

  useEffect(() => {
    getProg();
    getProd();
    if (sendCoupleName) {
      setCoupleName(sendCoupleName);
    }
    if (sendNote) {
      setNotes(sendNote);
    }
  }, []);
  useEffect(() => {
    if (!quotations || quotations.length === 0) {
      setGrandTotal(0);
      return;
    }

    const overallSubTotal = quotations.reduce((sum, qutn) => {
      const subTotal =
        qutn.products?.reduce((s, prod) => {
          const qty = Number(prod.qty) || 0;
          const rate = Number(prod.rate) || 0;
          return s + qty * rate;
        }, 0) || 0;

      return sum + subTotal;
    }, 0);

    setGrandTotal(overallSubTotal);
  }, [quotations]);
  useEffect(() => {
    if (!grandTotal) {
      setFinalTotal(0);
      return;
    }

    const discountAmount = (grandTotal * Number(discount || 0)) / 100;

    const finalAmount = grandTotal - discountAmount;

    setFinalTotal(finalAmount);
  }, [grandTotal, discount]);

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        if (
          (selectProduct && selectProduct.length > 0) ||
          (quotations && quotations.length > 0) ||
          selectedProgram
        ) {
          setAlertBox(true);
          return true;
        } else {
          navigation.goBack();
          return true;
        }
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => subscription.remove();
    }, [selectProduct, quotations, selectedProgram]),
  );
  useEffect(() => {
    if (
      !fetchedData ||
      !Array.isArray(fetchedData) ||
      fetchedData.length === 0
    ) {
      setQuotations([]);

      return;
    }

    console.log('fetchedData:', fetchedData);

    const programMap = new Map(finalData.map(p => [p.value, p.label]));

    const loadedQuotations = fetchedData.map(item => {
      // item = one row like { quotation_add_id: "45", product_id: "5,3", ... }

      const productIds = (item.product_id ?? '').split(',').map(s => s.trim());
      const qtys = (item.qty ?? '').split(',').map(s => s.trim());
      const rates = (item.rate ?? '').split(',').map(s => s.trim());
      const totals = (item.total ?? '').split(',').map(s => s.trim());

      const products = productIds
        .map((id, index) => {
          if (!id) return null;

          const prod = dropDownProduct.find(p => p.product_id === id);

          return {
            product_id: id,
            label:
              prod?.product_name ||
              item.product_names?.[index] ||
              'Unknown Product',
            qty: qtys[index] || '1',
            rate: rates[index] || '0',
            total: totals[index] || '0',
          };
        })
        .filter(Boolean);

      // 2. Calculate subtotal (better to recalculate than trust API total sometimes)
      const subTotal = products.reduce((sum, p) => {
        return sum + (Number(p.qty) || 0) * (Number(p.rate) || 0);
      }, 0);

      const discountPercent = Number(item.discount ?? 0);
      const discountAmount = subTotal * (discountPercent / 100);
      const finalTotal = subTotal - discountAmount;

      return {
        id: item.quotation_add_id,
        function_date: item.function_date,
        program_id: item.program_id,
        program_name:
          programMap.get(item.program_id) || item.program_name || 'Unknown',
        products,
        sub_total: subTotal,
        discount: discountPercent, // keeping as percent
        discount_amount: discountAmount, // optional: useful for display
        final_total: finalTotal,
      };
    });

    // console.log('Transformed quotations:', loadedQuotations);

    // Save to state
    setQuotations(loadedQuotations);

    // For editing/view mode — usually take the first one, or the selected one
    if (loadedQuotations.length > 0) {
      const first = loadedQuotations[0];
      console.log('first', first);
      setGrandTotal(first.final_total); // or .sub_total — depends on your UI
    } else {
      setDiscount('0');
      setGrandTotal(0);
    }
  }, [fetchedData, dropDownProduct, finalData]);

  const handleEdit = qutn => {
    setshowFinalBtn(false);
    console.log('qutn', qutn);
    setEditingId(qutn.id || qutn.quotation_add_id);

    // Form fields fill karo
    setFuntDateString(qutn.function_date || '');

    // Program dropdown ke liye – string ya number – jo expect karta hai us hisab se
    setSelectedProgram(qutn.program_id || '');

    if (Array.isArray(qutn.products) && qutn.products.length > 0) {
      setSelectProduct(qutn.products);
    } else {
      // Agar products nahi hai → backend se aaya raw format hai to rebuild karo
      console.warn('No products array found – rebuilding from raw fields');
      const rebuilt = rebuildProductsFromRaw(qutn);
      setSelectProduct(rebuilt);
    }
  };

  function rebuildProductsFromRaw(qutn) {
    const ids = (qutn.product_id || '').split(',').map(s => s.trim());
    const qtys = (qutn.qty || '').split(',').map(s => s.trim());
    const rates = (qutn.rate || '').split(',').map(s => s.trim());
    const totals = (qutn.total || '').split(',').map(s => s.trim());

    const maxLen = Math.max(
      ids.length,
      qtys.length,
      rates.length,
      totals.length,
    );
    const arr = [];

    for (let i = 0; i < maxLen; i++) {
      const pid = ids[i];
      if (!pid) continue;

      arr.push({
        product_id: pid,
        qty: qtys[i] || '1',
        rate: rates[i] || '0',
        total:
          totals[i] || String(Number(qtys[i] || 0) * Number(rates[i] || 0)),
      });
    }

    return arr;
  }

  const handleDelete = async deleteId => {
    const res = await fetch(APIS.DELETE_SINGLE_QUOTATION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quotation_add_id: deleteId,
      }),
    });
    const data = await res.json();
    console.log(data);
    if (quotations.length >= 1) {
    } else {
    }
    const updatedList = quotations.filter(q => q.id !== deleteId);
    setQuotations(updatedList);
    setMenuVisible(null);
    setdeleteModalVisible(false);
  };

  const finalData = dropdownData.map(i => ({
    label: i.event_name,
    value: i.event_id,
  }));
  const handleChange = (id, field, value) => {
    setSelectProduct(prev =>
      prev.map(item => {
        if (item.product_id === id) {
          return {
            ...item,
            [field]: value,
          };
        }
        return item;
      }),
    );
  };

  const handleSubmit = async () => {
    if (!selectedProgram || selectProduct.length === 0 || !FuntDateString) {
      setreqError('Fill all the Details');
      return;
    }

    const productIds = selectProduct.map(p => String(p.product_id));
    const qtys = selectProduct.map(p => String(p.qty || '1'));
    const rates = selectProduct.map(p => String(p.rate || '0'));
    const totals = selectProduct.map(p =>
      String((Number(p.qty) || 0) * (Number(p.rate) || 0)),
    );

    const payload = {
      ...(editingId && {quotation_add_id: editingId}),
      quotation_id: quotation_id || null,
      function_date: FuntDateString,
      program_id: String(selectedProgram),
      product_id: productIds,
      qty: qtys,
      rate: rates,
      total: totals,
    };

    try {
      const apiUrl = editingId
        ? APIS.UPDATE_SINGLE_QUOTATION
        : APIS.ADD_SINGLE_QUOTATION;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log('API Response:', result);

      if (result?.code !== 200) {
        // alert(result?.message || 'Save failed – check console');
        return;
      }

      // alert(editingId ? 'Updated Successfully' : 'Added Successfully');

      const serverAddId = result?.payload?.quotation_add_id;

      // ─── Update local state ───────────────────────────────────────
      setQuotations(prev => {
        let newList = [...prev];

        const thisSubTotal = selectProduct.reduce(
          (sum, p) => sum + Number(p.qty || 0) * Number(p.rate || 0),
          0,
        );

        if (editingId) {
          // EDIT: replace matching item (by old id or new server id if upgraded)
          newList = newList.map(item => {
            if (
              item.id === editingId ||
              (serverAddId && item.id.startsWith('temp'))
            ) {
              return {
                ...item,
                id: serverAddId || item.id, // upgrade temp → real id if received
                function_date: FuntDateString,
                program_id: selectedProgram,
                program_name:
                  finalData.find(p => p.value === selectedProgram)?.label ||
                  item.program_name ||
                  'Unknown',
                products: selectProduct.map(p => ({...p})),
                sub_total: thisSubTotal,
              };
            }
            return item;
          });
        } else {
          // ADD: append new item
          const newItem = {
            id: serverAddId || `temp-${Date.now()}`,
            function_date: FuntDateString,
            program_id: selectedProgram,
            program_name:
              finalData.find(p => p.value === selectedProgram)?.label ||
              'Unknown Program',
            products: selectProduct.map(p => ({...p})),
            sub_total: thisSubTotal,
            discount: 0,
            final_total: thisSubTotal,
          };
          newList.push(newItem);
        }

        console.log('Updated quotations count:', newList.length);
        return newList;
      });

      // Reset form
      setEditingId(null);
      setSelectedProgram(null);
      setSelectProduct([]);
      setFuntDateString(null);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Network or server error – please check connection');
    }
  };

  const handleDeleteAll = async () => {
    try {
      for (const item of quotations) {
        await fetch(APIS.DELETE_SINGLE_QUOTATION, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quotation_add_id: item.id,
          }),
        });
      }

      setQuotations([]);

      setDeleteAllModalVisible(false);
    } catch (err) {
      console.log('Delete All Error:', err);
    }
  };
  const handleNext = () => {
    if (discount > 100) {
      setError('Discount should less than 100');
      return;
    }
    navigation.navigate('QuotationFinalForm', {
      quotation_id,
      selectedMobile,
      entryDateString,
      sendpartyName,
      selectedStaff,
      sendCoupleName: coupleName,
      sendNote: notes,
      quotations,
      grandTotal,
      discount,
      Finaltotal,
    });
  };

  const handleFinalSubmit = async () => {
    if (!coupleName.trim()) {
      setshowcoupleErr(true);
      return;
    }

    setshowcoupleErr(false);

    const isUpdate = !!quotation_id;

    const payload = {
      party_id: selectedMobile || '',
      quotation_date: entryDateString,
      function_side: '', // ← add state if needed
      party_name: sendpartyName || '', // ← add state if needed
      city_name: '', // ← add state if needed
      staff_id: selectedStaff,
      couple_name: coupleName,
      notes: notes.trim() || '',
      sub_total: Number(grandTotal) || 0,
      discount: Number(discount) || 0,
      quotation_total: Number(Finaltotal) || 0,
      discount_type: 'percentage', // ← add state or default

      subFunctions:
        quotations.length > 0
          ? quotations.map(qutn => {
              // If no products → send empty products array
              const productsArray =
                qutn.products?.length > 0
                  ? [
                      {
                        product_id: qutn.products.map(p =>
                          String(p.product_id || ''),
                        ),
                        qty: qutn.products.map(p => String(p.qty || '1')),
                        rate: qutn.products.map(p => String(p.rate || '0')),
                        total: qutn.products.map(p =>
                          String((Number(p.qty) || 0) * (Number(p.rate) || 0)),
                        ),
                      },
                    ]
                  : []; // empty array if no products

              return {
                function_date: qutn.function_date || FuntDateString || '',
                program_id: qutn.program_id || selectedProgram || '',
                products: productsArray,
              };
            })
          : [], // empty array if no quotations
    };

    // Add quotation_id only for update
    if (isUpdate) {
      payload.quotation_id = quotation_id;
    }

    try {
      setLoading(true);
      const apiUrl = isUpdate ? APIS.UPDATE_QUOTATION : APIS.ADD_QUOTATION;
      const method = isUpdate ? 'POST' : 'POST'; // change to 'POST' if backend wants POST for update

      const res = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      console.log('Backend Response:', result);

      if (result?.code === 200) {
        setLoading(false);
        setFinalModal(false);
        setCoupleName('');
        setNotes('');
        setQuotations([]);
        setSelectProduct([]);
        setSelectedProgram(null);
        setFuntDateString(null);
        setDiscount('');
        setGrandTotal(0);
        setFinalTotal(0);

        navigation.navigate('QuotationScreen');
      } else {
        alert(result?.message || 'Failed to save quotation. Please try again.');
      }
    } catch (error) {
      console.error('Network error:', error);
      // alert('Internet check karo ya server down hai bhai.');
    }
  };
  const filteredProducts = finalDropdownProd.filter(item =>
    item.label?.toLowerCase().includes(searchText.toLowerCase()),
  );
  const removeProductFromQuotation = async (qutnId, productIndex) => {
    const currentQuotation = quotations.find(q => q.id === qutnId);

    if (!currentQuotation) return;

    // Case 1: Only 1 product → DELETE whole quotation
    if (currentQuotation.products.length === 1) {
      try {
        await fetch(APIS.DELETE_SINGLE_QUOTATION, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            quotation_add_id: qutnId,
          }),
        });

        // update UI
        setQuotations(prev => prev.filter(q => q.id !== qutnId));
      } catch (err) {
        console.log('Delete error:', err);
      }

      return;
    }

    // Case 2: Remove only 1 product → UPDATE API
    const updatedProducts = currentQuotation.products.filter(
      (_, index) => index !== productIndex,
    );

    const productIds = updatedProducts.map(p => String(p.product_id));
    const qtys = updatedProducts.map(p => String(p.qty || '1'));
    const rates = updatedProducts.map(p => String(p.rate || '0'));
    const totals = updatedProducts.map(p =>
      String((Number(p.qty) || 0) * (Number(p.rate) || 0)),
    );

    try {
      await fetch(APIS.UPDATE_SINGLE_QUOTATION, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          quotation_add_id: qutnId,
          function_date: currentQuotation.function_date,
          program_id: currentQuotation.program_id,
          product_id: productIds,
          qty: qtys,
          rate: rates,
          total: totals,
        }),
      });

      // update UI
      setQuotations(prev =>
        prev.map(q =>
          q.id === qutnId ? {...q, products: updatedProducts} : q,
        ),
      );
    } catch (err) {
      console.log('Update error:', err);
    }
  };

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
                if (
                  (selectedProgram && selectedProgram !== '') ||
                  (selectProduct && selectProduct.length > 0) ||
                  (quotations && quotations.length > 0)
                ) {
                  setAlertBox(true);
                } else {
                  navigation.goBack();
                }
              }}>
              <Icon name="arrow-left" size={25} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.title}>
              {quotation_id
                ? `Update Quotation (${sendpartyName})`
                : `Add Quotation (${sendpartyName})`}
            </Text>
          </View>
          <StepIndicator step={2} />

          {/* Main Content – Dropdown + Date on one row */}
          <View style={styles.form}>
            <View style={styles.row}>
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
                    value={FuntDate || new Date()}
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
                    width: 'auto',
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
            <View style={{width: '100%', marginBottom: 2}}>
              <Text
                style={{
                  fontSize: 14,
                  color: '#444',
                  marginBottom: 1,
                  fontWeight: '600',
                  paddingLeft: 4,
                }}>
                Product
              </Text>

              <TouchableOpacity
                style={{
                  width: '100%',
                  minHeight: 42,
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderColor: '#d1d5db',
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  justifyContent: 'center',
                }}
                onPress={() => setModalVisible(!modalVisible)}
                activeOpacity={0.8}>
                {selectProduct.length > 0 ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                      paddingVertical: 4,
                    }}>
                    {selectProduct.map(item => (
                      <View
                        key={item.product_id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: '#eaeaea',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 20,
                        }}>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectProduct(
                              selectProduct.filter(
                                p => p.product_id !== item.product_id,
                              ),
                            );
                          }}>
                          <Text
                            style={{
                              color: '#000',
                              fontSize: 13,
                              marginRight: 4,
                            }}>
                            {item.label}
                            <EIcon name="cross" size={16} color="#747474" />
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text
                    style={{
                      color: '#999',
                      fontSize: 15,
                    }}>
                    Select Products
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inv_container}>
              {/* Main content - scrollable part */}
              <View
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                {/* Product / Edit Card */}
                {selectProduct.map((item, index) => (
                  <View id={item.value} style={styles.inv_card} key={index}>
                    <Text style={styles.inv_productName}>{item?.label}</Text>

                    <View style={styles.inv_row}>
                      {/* Qty */}
                      <View style={styles.inv_inputBox}>
                        <Text style={styles.inv_label}>Qty</Text>
                        <TextInput
                          value={item.qty.toString()}
                          onChangeText={text => {
                            let cleaned = text.replace(/[^0-9]/g, '');

                            // remove leading zeros
                            cleaned = cleaned.replace(/^0+/, '');
                            handleChange(item.product_id, 'qty', cleaned);
                          }}
                          maxLength={5}
                          keyboardType="numeric"
                          style={styles.inv_input}
                          placeholder="1"
                        />
                      </View>

                      {/* Rate */}
                      <View style={styles.inv_inputBox}>
                        <Text style={styles.inv_label}>Rate</Text>
                        <TextInput
                          value={item.rate.toString()}
                          onChangeText={text => {
                            let cleaned = text.replace(/[^0-9]/g, '');

                            cleaned = cleaned.replace(/^0+/, '');
                            handleChange(item.product_id, 'rate', cleaned);
                          }}
                          keyboardType="numeric"
                          style={styles.inv_input}
                          placeholder="0"
                          maxLength={8}
                        />
                      </View>
                      <View style={styles.inv_inputBox}>
                        <Text style={styles.inv_label}>Total</Text>
                        <TextInput
                          value={`₹ ${(
                            (parseFloat(item.qty) || 0) *
                            (parseFloat(item.rate) || 0)
                          ).toFixed(2)}`}
                          onChangeText={setRate}
                          keyboardType="numeric"
                          style={[
                            styles.inv_input,
                            {backgroundColor: '#f0f0f0'},
                          ]}
                          placeholder="0"
                          editable={false}
                        />
                      </View>

                      {/* Total (display only) */}
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={[
                    styles.inv_addBtn,
                    {
                      backgroundColor: showAddBtn ? '#F05A28' : '#dadada',
                      marginTop: 2,
                    },
                  ]}
                  onPress={handleSubmit}
                  disabled={!showAddBtn}>
                  <Text style={[styles.inv_addText]}>
                    {editingId ? 'Update Item' : 'Add Item'}
                  </Text>
                </TouchableOpacity>
                {reqError && reqError}

                {quotations.map((qutn, index) => {
                  return (
                    <View style={{}} key={index}>
                      <View style={qtnStyles.card}>
                        {/* Top Row */}
                        <View style={qtnStyles.topRow}>
                          <View style={{flex: 1}}>
                            <Text style={qtnStyles.heading}>
                              Function Date:
                            </Text>
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
                          <View style={qtnStyles.actions}>
                            <Menu
                              visible={menuVisible === qutn.id}
                              onDismiss={() => setMenuVisible(null)}
                              anchorPosition="bottom"
                              anchor={
                                <TouchableOpacity
                                  style={{paddingLeft: 12}}
                                  onPress={() => setMenuVisible(qutn.id)}>
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
                                  handleEdit(qutn);

                                  setMenuVisible(null);
                                }}
                                leadingIcon={({color}) => (
                                  <View>
                                    <MaterialCommunityIcons
                                      name="pencil"
                                      size={22} // ← yaha chhota size daal do (18, 20, 16 etc.)
                                      color={color}
                                    />
                                  </View>
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
                                  setDeleteId(qutn.id);
                                  setdeleteModalVisible(true);

                                  setMenuVisible(null);
                                }}
                                leadingIcon={({color}) => (
                                  <MaterialCommunityIcons
                                    name="delete"
                                    size={22} // ← yaha chhota size daal do (18, 20, 16 etc.)
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

                        {/* Products */}
                        <FlatList
                          data={qutn.products || []}
                          keyExtractor={(item, index) =>
                            `${item.product_id || 'prod'}-${index}`
                          }
                          renderItem={({item: prod, index}) => (
                            <View style={qtnStyles.productBlock}>
                              <Text style={qtnStyles.productTitle}>
                                Product:{' '}
                                {prod.label ||
                                  prod.product_name ||
                                  'Unknown Product'}
                              </Text>

                              <View style={qtnStyles.qtyRow}>
                                <Text style={qtnStyles.productDetails}>
                                  Qty: {prod.qty || 1}
                                </Text>
                                <Text style={qtnStyles.productDetails}>
                                  Rate: {prod.rate || 0}
                                </Text>
                                <Text style={qtnStyles.productDetails}>
                                  Total:{' '}
                                  {(
                                    (Number(prod.qty) || 0) *
                                    (Number(prod.rate) || 0)
                                  ).toFixed(2)}
                                </Text>
                                <View />
                                <TouchableOpacity
                                  style={{
                                    position: 'absolute',
                                    right: 4,
                                    bottom: 4,
                                  }}
                                  onPress={() =>
                                    removeProductFromQuotation(qutn.id, index)
                                  }>
                                  <Icon
                                    name="close-circle"
                                    size={20}
                                    color="#9CA3AF"
                                  />
                                </TouchableOpacity>
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
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
        {(!isKeyboardVisible || isDiscountFocused) && (
          <View
            style={[
              styles.inv_card,
              {paddingTop: 12, marginBottom: isKeyboardVisible ? 30 : 0},
            ]}>
            <View style={[styles.inv_row, {borderWidth: 0}]}>
              <View style={styles.inv_inputBox}>
                <Text
                  style={[
                    styles.inv_label,
                    {fontSize: 13, color: '#000', fontFamily: fonts.semiBold},
                  ]}>
                  Grand Total:
                </Text>
                <TextInput
                  value={grandTotal.toFixed()}
                  // onChangeText={}
                  editable={false}
                  keyboardType="numeric"
                  style={[
                    styles.inv_input,
                    {backgroundColor: '#f0f0f0', color: '#000'},
                  ]}
                  placeholder="0"
                />
              </View>

              {/* Rate */}
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
                    setError(null);
                    setDiscount(text);
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
            {/* Modal for Final*/}
            <Modal
              visible={finalModal}
              animationType="slide"
              transparent={true}
              onRequestClose={() => {
                setStep(2), setFinalModal(false);
              }}>
              <Pressable
                style={modalStyles.overlay}
                onPress={() => {
                  setStep(2), setFinalModal(false);
                }} // close when tap outside content
              >
                <Pressable
                  style={modalStyles.modalContainer}
                  onPress={() => {}} // ← IMPORTANT: stop propagation here
                >
                  {/* Header */}
                  <View style={modalStyles.modalHeader}>
                    <TouchableOpacity
                      onPress={() => {
                        setStep(2), setFinalModal(false);
                      }}>
                      <Icon name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    keyboardShouldPersistTaps="handled" // ← allows taps inside without dismissing keyboard
                    showsVerticalScrollIndicator={false}>
                    {/* Couple Name */}
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
                        autoFocus={true} // optional: auto open keyboard
                      />
                      {showcoupleErr && (
                        <Text
                          style={{color: 'red', fontSize: 12, marginTop: 4}}>
                          {coupleErr}
                        </Text>
                      )}
                    </View>

                    {/* Notes */}
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

                  {/* Buttons */}
                  <View style={modalStyles.buttonRow}>
                    <TouchableOpacity
                      style={modalStyles.cancelBtn}
                      onPress={() => {
                        setStep(2), setFinalModal(false);
                      }}>
                      <Text style={modalStyles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={modalStyles.saveBtn}
                      onPress={() => {
                        if (!coupleName.trim()) {
                          setshowcoupleErr(true);
                          return;
                        }
                        setshowcoupleErr(false);
                        handleFinalSubmit();
                        // setFinalModal(false);  ← close after success
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

            {/* Modal for Delete*/}
            <Modal
              transparent
              visible={deleteModalVisible}
              animationType="fade"
              onRequestClose={() => setdeleteModalVisible(false)}>
              <Pressable
                style={styles.modalBackdrop}
                onPress={() => setdeleteModalVisible(false)}>
                <Pressable style={styles.modalContent} onPress={() => {}}>
                  <Text style={styles.modalTitle}>Delete Quotation?</Text>
                  <Text style={styles.modalText}>
                    Are you sure you want to delete this Quotation?
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
            <Modal
              transparent
              visible={deleteAllModalVisible}
              animationType="fade"
              onRequestClose={() => setDeleteAllModalVisible(false)}>
              <Pressable
                style={styles.modalBackdrop}
                onPress={() => setDeleteAllModalVisible(false)}>
                <Pressable style={styles.modalContent} onPress={() => {}}>
                  <Text style={styles.modalTitle}>Delete All Quotations?</Text>

                  <Text style={styles.modalText}>
                    Are you sure you want to delete all quotations?
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
            {/* Modal for back*/}
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
                    Do you want to go back? Unsaved changes to this Quotation
                    will be lost.
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
                      onPress={() => {
                        navigation.goBack();
                        setAlertBox(false);
                      }}
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
      {/* Modal for Dropdown*/}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true} // ← Yeh important hai
        statusBarTranslucent={true}>
        {/* Dim Background Overlay */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // ← Yeh line background ko dim karegi
            justifyContent: 'flex-start',
            paddingTop: 200, // Adjust according to your header
          }}>
          {/* Dropdown Container */}
          <ScrollView
            style={{
              marginHorizontal: 12,
              backgroundColor: '#fff',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              maxHeight: 300,
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.2,
              shadowRadius: 8,
            }}
            keyboardShouldPersistTaps="handled">
            {/* Search Input */}
            <View
              style={{padding: 8, borderBottomWidth: 1, borderColor: '#eee'}}>
              <TextInput
                placeholder="Search product..."
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={setSearchText}
                style={{
                  height: 40,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 8,
                  paddingHorizontal: 14,
                  fontSize: 13,
                  color: '#000',
                  backgroundColor: '#fff',
                }}
              />
            </View>

            {/* Product List */}
            {filteredProducts.map(item => {
              const isSelected = selectProduct.some(
                p => p.product_id === item.product_id,
              );

              return (
                <TouchableOpacity
                  key={item.product_id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 4,
                    paddingHorizontal: 16,
                    borderBottomWidth: 0.5,
                    borderColor: '#eee',
                    backgroundColor: isSelected ? '#fef1e6' : '#FFF',
                  }}
                  onPress={() => {
                    setSearchText('');
                    setSelectProduct(prev => {
                      const isAlreadySelected = prev.some(
                        p => p.product_id === item.product_id,
                      );

                      if (isAlreadySelected) {
                        return prev.filter(
                          p => p.product_id !== item.product_id,
                        );
                      } else {
                        return [...prev, {...item, qty: 1, rate: item.rate}];
                      }
                    });
                  }}>
                  <Text style={{color: '#000', fontSize: 15}}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bottom Buttons */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#fff',
              marginHorizontal: 12,
              marginTop: 0.1,
              borderRadius: 8,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}>
            {/* Clear All */}
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
              }}
              onPress={() => {
                setSelectProduct([]);
                setModalVisible(false);
              }}>
              <Text style={{color: '#444', fontSize: 13}}>Clear All</Text>
            </TouchableOpacity>

            <View style={{width: 1, backgroundColor: '#E5E7EB'}} />

            {/* Save Button */}
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
              }}
              onPress={() => setModalVisible(false)}>
              <Text
                style={{
                  color: '#FF7A00',
                  fontSize: 13,
                  fontFamily: fonts.semiBold,
                }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showDeleteWarning} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '80%',
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 20,
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 10,
                color: '#000',
                alignSelf: 'center',
              }}>
              Cannot Delete
            </Text>

            <Text
              style={{color: '#555', marginBottom: 20, alignSelf: 'center'}}>
              At least one product is required. (Click on Edit)
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: '#F05A28',
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={() => setShowDeleteWarning(false)}>
              <Text style={{color: '#fff', fontWeight: '600'}}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default QuotationDetailsForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 40,
  },
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
  form: {
    padding: 9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    marginLeft: 10,
    color: '#444',
    marginBottom: 2,
    fontFamily: fonts.semiBold,
  },
  required: {
    color: '#ff4d4f',
  },
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
    width: '90%',
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  orangeDropdown: {
    minHeight: 45,
    borderWidth: 1,
    marginLeft: -21,
    borderColor: '#d4d4d4',
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },

  orangePlaceholder: {
    fontSize: 14,
    color: '#000000', // dark orange text
  },

  orangeSelectedText: {
    fontSize: 12,
    color: '#000000',
    fontFamily: fonts.medium,
  },

  orangeInputSearch: {
    height: 40,
    fontSize: 14,
    color: '#000000',
  },

  orangeSelectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaeaea', // soft chip color
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginVertical: 4,
    fontSize: 12,
  },

  orangeSelectedTextChip: {
    marginRight: 5,
    fontSize: 12,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },

  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 10,
  },

  cancelText: {
    color: '#374151',
    fontSize: 14,
    fontFamily: fonts.medium,
  },

  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 6,
    backgroundColor: '#FF7A00', // orange
  },

  saveText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  inv_container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 1,
    marginTop: 4,
    width: '100%',
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
    color: '#111827',
  },

  inv_row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 2,
  },

  inv_inputBox: {
    flex: 1,
    marginRight: 8,
  },

  inv_label: {
    fontSize: 12,
    marginBottom: 2,
    color: '#6a6a6a',
    marginTop: -2,
  },

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

  inv_totalText: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#111827',
    marginTop: 8,
    marginBottom: 12,
    marginLeft: 12,
  },

  inv_addBtn: {
    backgroundColor: '#FF7A00',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 10,
  },

  inv_addText: {
    color: '#FFF',
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },

  // ─────────────────────────────────────────────
  // FIXED BOTTOM SUMMARY + BUTTONS
  // ─────────────────────────────────────────────
  inv_bottomFixed: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  inv_summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  inv_summaryLabel: {
    fontSize: 13,
    color: '#4B5563',
  },

  inv_summaryValue: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },

  inv_discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  inv_discountInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    width: 90,
    fontSize: 14,
    textAlign: 'right',
    backgroundColor: '#FFF',
  },

  inv_grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 12,
  },

  inv_finalLabel: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: '#111827',
  },

  inv_finalValue: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#FF7A00',
  },

  inv_btnRow: {
    flexDirection: 'row',
    gap: 10,
  },

  inv_cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },

  inv_cancelText: {
    color: '#4B5563',
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },

  inv_saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ff7606',
    alignItems: 'center',
  },

  inv_saveText: {
    color: '#FFF',
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  fnBlock_container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 15,
  },

  fnBlock_topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  fnBlock_heading: {
    fontSize: 13,
    color: '#777',
    fontFamily: fonts.semiBold,
    marginBottom: 4,
  },

  fnBlock_value: {
    fontSize: 15,
    color: '#000',
    fontFamily: fonts.bold,
  },

  fnBlock_divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 12,
  },

  fnBlock_productBlock: {
    marginBottom: 4,
  },

  fnBlock_productName: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#000',
    marginBottom: 6,
  },

  fnBlock_qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  fnBlock_productDetail: {
    fontSize: 13,
    color: '#444',
  },
  // Modal styles – matched exactly to your PartyProfile version
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
  modalText: {
    color: '#555',
    marginBottom: 20,
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
const qtnStyles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIcon: {
    padding: 8,
    marginLeft: 4,
  },

  card: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
    marginLeft: 0,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  heading: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: '#444',
    marginBottom: 2,
  },

  value: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: '#000',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
  },

  productBlock: {
    marginBottom: 6,
    borderBottomColor: '#dadada',

    borderBottomWidth: 0.4,
  },

  productTitle: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: '#222',
    marginBottom: 3,
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
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#111',
  },
  field: {
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    backgroundColor: '#fafafa',
    color: '#000',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    width: 90,
    paddingHorizontal: 8,
  },
  plus: {
    fontSize: 16,
    color: '#555',
    marginRight: 4,
  },
  countryCodeInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    textAlign: 'center',
    color: '#000',
  },
  phoneInput: {
    flex: 1,
    color: '#000',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
    color: '#000',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
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
  cancelText: {
    fontFamily: fonts.semiBold,
    color: '#333',
  },
  saveText: {
    fontFamily: fonts.semiBold,
    color: '#fff',
  },
});
