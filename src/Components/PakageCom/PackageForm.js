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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EIcon from 'react-native-vector-icons/Entypo';
import {useNavigation} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import {APIS} from '../../../utils/Apis';
import {fonts} from '../../../utils/fonts';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useKeyboardVisible} from '../QuotationCom/isKeyboardVisible';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Divider, Menu} from 'react-native-paper';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const PackageForm = ({route}) => {
  const {sendData} = route.params || {};
  console.log('ITEM', sendData);
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

const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [finalModal, setFinalModal] = useState(false);
  const [search, setSearch] = useState('');
  const [FuntDate, setFuntDate] = useState(new Date());
  const [FuntDateString, setFuntDateString] = useState('');
  const [showFuntDate, setShowFuntDate] = useState(false);
  const [qty, setQty] = useState('1');
  const [rate, setRate] = useState('0');
  const [grandTotal, setGrandTotal] = useState(0);
  const [discount, setDiscount] = useState('');
  const [Finaltotal, setFinalTotal] = useState(0);

  // ─── FIXED: store the real server ID being edited, not index ───
  const [editingServerId, setEditingServerId] = useState(null); // package_master_id from server

  const [dropDownProduct, setDropdownProduct] = useState([]);
  const [readyData, setReadyData] = useState();
  const [packageEntries, setPackageEntries] = useState([]);
  const [showAddBtn, setShowAddBtn] = useState(false);
  const [deleteId, setDeleteId] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [alertBox, setAlertBox] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);
  const [packageName, setPackageName] = useState('');
  const packageNameErr = 'Please enter package name';
  const [showcoupleErr, setshowcoupleErr] = useState(false);
  const [notes, setNotes] = useState('');
  const [showFinalBtn, setshowFinalBtn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteAllModalVisible, setDeleteAllModalVisible] = useState(false);

  const finalTotal = (grandTotal - parseFloat(discount || 0))?.toFixed(2);

  const getProg = async () => {
    try {
      const res = await fetch(APIS.GET_PROGRAM);
      const data = await res.json();
      setDropdownData(data?.payload);
    } catch (err) {
      console.error('Failed to load programs:', err);
    }
  };

  const getProd = async () => {
    try {
      const res = await fetch(APIS.PRODUCT_LIST);
      const data = await res.json();
      setDropdownProduct(data?.payload);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const finalDropdownProd = dropDownProduct.map(i => ({
    product_id: i.product_id,
    label: i.product_name,
    value: i.product_id,
    rate: i.amount,
  }));

  const getPackDetails = async () => {
    if (!sendData?.package_master_code) {
      console.log('No package_master_code → skipping fetch');
      return;
    }

    try {
      const res = await fetch(APIS.DETAILS_PACKAGE, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          package_master_code: sendData?.package_master_code,
        }),
      });

      const text = await res.text();
      if (!res.ok || !text.trim()) {
        console.error('Server returned error or empty body');
        return;
      }

      const data = JSON.parse(text);
      console.log('Parsed data:', data);
      setFetchedData(data?.payload || []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    if (sendData) {
      getPackDetails();
      setIsEdit(true);
    }
  }, []);

  useEffect(() => {
    if (selectedProgram && selectProduct.length > 0) {
      setShowAddBtn(true);
    } else if (packageEntries.length > 0) {
      setshowFinalBtn(true);
      setShowAddBtn(false);
    } else {
      setShowAddBtn(false);
      setshowFinalBtn(false);
    }
  }, [selectedProgram, selectProduct, packageEntries]);

  useEffect(() => {
    getProg();
    getProd();
    const today = new Date();
    const formattedDate =
      String(today.getDate()).padStart(2, '0') +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      today.getFullYear();
    setFuntDateString(formattedDate);
  }, []);

  useEffect(() => {
    let total = 0;
    packageEntries.forEach(entry => {
      entry.products?.forEach(p => {
        total += Number(p.qty || 0) * Number(p.rate || 0);
      });
    });
    setGrandTotal(total);
  }, [packageEntries]);

  useEffect(() => {
    setFinalTotal((grandTotal * (1 - Number(discount || 0) / 100)).toFixed(2));
  }, [grandTotal, discount]);

  useEffect(() => {
    const backAction = () => {
      if (
        (selectProduct && selectProduct.length > 0) ||
        (packageEntries && packageEntries.length > 0) ||
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
  }, []);

  useEffect(() => {
    if (
      !fetchedData ||
      !Array.isArray(fetchedData) ||
      fetchedData.length === 0
    ) {
      setPackageEntries([]);
      return;
    }

    console.log('Processing fetchedData:', fetchedData);

    const loadedEntries = fetchedData.map((item, idx) => {
      const ids = (item.product_id || '').split(',').map(s => s.trim());
      const names = (item.product_name || '').split(',').map(s => s.trim());
      const qtys = (item.total_qty || '').split(',').map(s => s.trim());
      const rates = (item.total_price || '').split(',').map(s => s.trim());

      const products = ids
        .map((id, i) => {
          if (!id) return null;
          return {
            product_id: id,
            label: names[i] || `Product ${id}`,
            qty: qtys[i] || '1',
            rate: rates[i] || '0',
          };
        })
        .filter(Boolean);

      return {
        // ─── FIXED: store both IDs so edit/delete always has real server ID ───
        id: item.package_master_id || `temp-${idx}-${Date.now()}`,
        package_master_id: item.package_master_id || null,
        package_master_code:
          item.package_master_code || sendData?.package_master_code || null,
        function_date: item.function_date || '',
        program_id: item.program_id || '',
        program_name: item.program_name || 'Unknown',
        products: products,
      };
    });

    console.log('Loaded entries:', loadedEntries);
    setPackageEntries(loadedEntries);

    if (loadedEntries.length > 0) {
      setPackageName(sendData?.package_master_name || '');
    }
  }, [fetchedData, sendData]);

  // ─── FIXED: handleEdit now stores the real server package_master_id ───────
  const handleEdit = entry => {
    setMenuVisible(null);
    console.log('Editing entry:', entry);

    // Store real server ID — used in handleSubmit for UPDATE_SINGLE_PACKAGE
    setEditingServerId(entry.package_master_id || entry.id);

    setSelectedProgram(entry.program_id || '');

    if (Array.isArray(entry.products) && entry.products.length > 0) {
      setSelectProduct(entry.products);
    } else {
      const rebuilt = rebuildProductsFromRaw(entry);
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

  const handleDelete = async id => {
    try {
      const res = await fetch(APIS.DELETE_SINGLE_PACKAGE, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          package_master_id: id,
        }),
      });

      const result = await res.json();
      console.log('DELETE:', result);

      if (result.status) {
        // Remove from local state using package_master_id
        setPackageEntries(prev =>
          prev.filter(e => e.package_master_id !== id && e.id !== id),
        );
      } else {
        alert('Delete failed');
      }
    } catch (err) {
      console.log(err);
    } finally {
      setdeleteModalVisible(false);
    }
  };

  const finalData = dropdownData.map(i => ({
    label: i.event_name,
    value: i.event_id,
  }));

  const handleChange = (id, field, value) => {
    setSelectProduct(prev =>
      prev.map(item => {
        if (item.product_id === id) {
          return {...item, [field]: value};
        }
        return item;
      }),
    );
  };

  // ─── FIXED: handleSubmit uses editingServerId (real server ID) ───────────
  const handleSubmit = async () => {
    if (!selectedProgram || selectProduct.length === 0) {
      alert('Select program & product');
      return;
    }

    try {
      setLoading(true);

      if (editingServerId) {
        // ── EDIT existing entry ──────────────────────────────────────────
        const payload = {
          package_master_id: editingServerId, // real server ID, never temp
          program_id: selectedProgram,
          product_id: selectProduct.map(p => String(p.product_id)),
          total_qty: selectProduct.map(p => String(p.qty)),
          total_price: selectProduct.map(p => String(p.rate)),
          total_amount: selectProduct.map(p =>
            String(Number(p.qty) * Number(p.rate)),
          ),
        };

        console.log('UPDATE SINGLE PAYLOAD:', payload);

        const res = await fetch(APIS.UPDATE_SINGLE_PACKAGE, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        console.log('UPDATE SINGLE RESULT:', result);

        if (result.status) {
          // Update local state — match by real server ID
          setPackageEntries(prev =>
            prev.map(entry => {
              if (
                entry.package_master_id === editingServerId ||
                entry.id === editingServerId
              ) {
                return {
                  ...entry,
                  program_id: selectedProgram,
                  program_name:
                    finalData.find(p => p.value === selectedProgram)?.label ||
                    entry.program_name,
                  products: selectProduct.map(p => ({...p})),
                };
              }
              return entry;
            }),
          );
        } else {
          alert(result.message || 'Update failed');
        }
      } else {
        // ── ADD new entry via API ────────────────────────────────────────
        const payload = {
          package_master_code: sendData?.package_master_code || null,
          program_id: selectedProgram,
          product_id: selectProduct.map(p => String(p.product_id)),
          total_qty: selectProduct.map(p => String(p.qty)),
          total_price: selectProduct.map(p => String(p.rate)),
          total_amount: selectProduct.map(p =>
            String(Number(p.qty) * Number(p.rate)),
          ),
        };

        console.log('ADD SINGLE PAYLOAD:', payload);

        const res = await fetch(APIS.ADD_SINGLE_PACKAGE, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        console.log('ADD SINGLE RESULT:', result);

        if (result.status) {
          // Use server-returned ID if available, else refresh from server
          const newServerId = result?.payload?.package_master_id || null;

          setPackageEntries(prev => [
            ...prev,
            {
              id: newServerId || `temp-${Date.now()}`,
              package_master_id: newServerId,
              package_master_code: sendData?.package_master_code || null,
              function_date: FuntDateString,
              program_id: selectedProgram,
              program_name:
                finalData.find(p => p.value === selectedProgram)?.label ||
                'Unknown',
              products: selectProduct.map(p => ({...p})),
            },
          ]);
        } else {
          alert(result.message || 'Add failed');
        }
      }

      // Reset form fields
      setEditingServerId(null);
      setSelectedProgram(null);
      setSelectProduct([]);
    } catch (err) {
      console.log('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      // Only delete entries that have a real server ID
      const serverEntries = packageEntries.filter(e => e.package_master_id);
      for (const item of serverEntries) {
        await fetch(APIS.DELETE_SINGLE_PACKAGE, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            package_master_id: item.package_master_id,
          }),
        });
      }
      setPackageEntries([]);
      setDeleteAllModalVisible(false);
    } catch (err) {
      console.log('Delete All Error:', err);
    }
  };

  const handleFinalSubmit = async () => {
    if (!packageName.trim()) {
      setshowcoupleErr(true);
      return;
    }

    const payload = {
      package_master_name: packageName,
      subFunctions: packageEntries.map(entry => ({
        program_id: entry.program_id,
        products: [
          {
            product_id: entry.products.map(p => String(p.product_id)),
            total_qty: entry.products.map(p => String(p.qty)),
            total_price: entry.products.map(p => String(p.rate)),
            total_amount: entry.products.map(p =>
              String(Number(p.qty) * Number(p.rate)),
            ),
          },
        ],
      })),
    };

    // Include package_master_code for update
    if (sendData?.package_master_code) {
      payload.package_master_code = sendData.package_master_code;
    }

    try {
      setLoading(true);
      const URL = sendData ? APIS.UPDATE_PACKAGE : APIS.ADD_PACKAGE;

      const res = await fetch(URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log('FINAL SUBMIT RESULT:', result);

      if (result.status) {
        navigation.navigate('Package');
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = finalDropdownProd.filter(item =>
    item.label?.toLowerCase().includes(searchText.toLowerCase()),
  );
   const removeProductFromPackage = async (entryId, productIndex) => {
  const currentEntry = packageEntries.find(
    e => e.id === entryId || e.package_master_id === entryId
  );

  if (!currentEntry) return;

  const serverId = currentEntry.package_master_id || currentEntry.id;

  // ✅ CASE 1: Only 1 product → DELETE whole entry
  if (currentEntry.products.length === 1) {
    try {
      await fetch(APIS.DELETE_SINGLE_PACKAGE, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_master_id: serverId,
        }),
      });

      // ✅ Update UI
      setPackageEntries(prev =>
        prev.filter(
          e =>
            e.package_master_id !== serverId &&
            e.id !== serverId
        )
      );
    } catch (err) {
      console.log('Delete error:', err);
    }

    return;
  }

  // ✅ CASE 2: Remove single product → UPDATE API
  const updatedProducts = currentEntry.products.filter(
    (_, index) => index !== productIndex
  );

  const productIds = updatedProducts.map(p => String(p.product_id));
  const qtys = updatedProducts.map(p => String(p.qty || '1'));
  const rates = updatedProducts.map(p => String(p.rate || '0'));
  const totals = updatedProducts.map(p =>
    String((Number(p.qty) || 0) * (Number(p.rate) || 0))
  );

  try {
    await fetch(APIS.UPDATE_SINGLE_PACKAGE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        package_master_id: serverId, // 🔥 IMPORTANT
        program_id: currentEntry.program_id,
        product_id: productIds,
        total_qty: qtys,
        total_price: rates,
        total_amount: totals,
      }),
    });

    // ✅ Update UI
    setPackageEntries(prev =>
      prev.map(e =>
        e.id === entryId || e.package_master_id === entryId
          ? { ...e, products: updatedProducts }
          : e
      )
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
                  (packageEntries && packageEntries.length > 0)
                ) {
                  setAlertBox(true);
                } else {
                  navigation.goBack();
                }
              }}>
              <Icon name="arrow-left" size={25} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.title}>
              {sendData ? 'Update Package' : 'Add Package'}
            </Text>
          </View>

          {/* Main Content */}
          <View style={styles.form}>
            <View style={styles.row}>
              <View style={[styles.inputGroup, {flex: 1}]}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  style={styles.dateWrapper}
                  activeOpacity={0.7}>
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
            <View
              style={[
                styles.inputGroup,
                {flex: 1, marginLeft: 22, marginTop: -4},
              ]}>
              <View
                style={[
                  styles.inputGroup,
                  {flex: 1, width: '100%', marginTop: 2},
                ]}>
                <Text style={[styles.label, {marginLeft: -12}]}>Product</Text>

                <TouchableOpacity
                  style={styles.orangeDropdown}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={{color: '#000', paddingTop: 12}}>
                    {selectProduct.length > 0 ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          marginTop: 8,
                          width: 320,
                        }}>
                        {selectProduct.map(item => (
                          <View
                            key={item.product_id}
                            style={{
                              flexDirection: 'row',
                              alignContent: 'center',
                              backgroundColor: '#eaeaea',
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              borderRadius: 20,
                              marginRight: 6,
                              marginBottom: 6,
                              marginTop: 4,
                            }}>
                            <TouchableOpacity
                              onPress={() => {
                                setSelectProduct(
                                  selectProduct.filter(
                                    p => p.product_id !== item.product_id,
                                  ),
                                );
                              }}>
                              <View style={{flexDirection: 'row'}}>
                                <Text style={{marginRight: 5, color: '#000'}}>
                                  {item.label}
                                </Text>
                                <Text style={{paddingTop: 2}}>
                                  <EIcon
                                    name="cross"
                                    size={15}
                                    color="#747474"
                                  />
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={{}}>Select Products</Text>
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inv_container}>
              <View
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                {/* Product Edit Cards */}
                {selectProduct.map((item, index) => (
                  <View id={item.value} style={styles.inv_card} key={index}>
                    <Text style={styles.inv_productName}>{item?.label}</Text>

                    <View style={styles.inv_row}>
                      <View style={styles.inv_inputBox}>
                        <Text style={styles.inv_label}>Qty</Text>
                        <TextInput
                          value={item.qty.toString()}
                          onChangeText={text => {
                            // remove non-numeric characters
                            let cleaned = text.replace(/[^0-9]/g, '');

                            // remove leading zeros
                            cleaned = cleaned.replace(/^0+/, '');

                            handleChange(item.product_id, 'qty', cleaned);
                          }}
                          keyboardType="numeric"
                          style={styles.inv_input}
                          placeholder="1"
                          maxLength={5}
                        />
                      </View>

                      <View style={styles.inv_inputBox}>
                        <Text style={styles.inv_label}>Rate</Text>
                        <TextInput
                          value={item.rate.toString()}
                          onChangeText={text => {
                            let cleaned = text.replace(/[^0-9]/g, '');

                            // remove leading zeros
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
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={[
                    styles.inv_addBtn,
                    {backgroundColor: showAddBtn ? '#F05A28' : '#dadada'},
                  ]}
                  onPress={handleSubmit}
                  disabled={!showAddBtn}>
                  <Text style={[styles.inv_addText]}>
                    {loading
                      ? '...'
                      : editingServerId
                      ? 'Update Item'
                      : '+ Add Item'}
                  </Text>
                </TouchableOpacity>

                {packageEntries.map((entry, index) => (
                  <View key={entry.package_master_id || entry.id || index}>
                    <View style={qtnStyles.card}>
                      <View style={qtnStyles.topRow}>
                        <View style={{flex: 1}}>
                          <Text style={qtnStyles.heading}>Function Date:</Text>
                          <Text style={qtnStyles.value}>
                            {entry.function_date || '—'}
                          </Text>
                        </View>
                        <View style={{flex: 1, alignItems: 'flex-end'}}>
                          <Text style={qtnStyles.heading}>Program:</Text>
                          <Text style={qtnStyles.value}>
                            {entry.program_name || '—'}
                          </Text>
                        </View>
                        <View style={qtnStyles.actions}>
                          <Menu
                            visible={
                              menuVisible ===
                              (entry.package_master_id || entry.id)
                            }
                            onDismiss={() => setMenuVisible(null)}
                            anchor={
                              <TouchableOpacity
                                onPress={() =>
                                  setMenuVisible(
                                    entry.package_master_id || entry.id,
                                  )
                                }>
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
                              onPress={() => handleEdit(entry)}
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
                            <Divider />
                            <Menu.Item
                              onPress={() => {
                                // Use real server ID for delete
                                setDeleteId(
                                  entry.package_master_id || entry.id,
                                );
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
                      <FlatList
                        data={entry.products || []}
                        keyExtractor={(item, i) => `${item.product_id}-${i}`}
                        renderItem={({item: prod}) => (
                          <View style={qtnStyles.productBlock}>
                            <Text style={qtnStyles.productTitle}>
                              {prod.label || `Product ${prod.product_id}`}
                            </Text>
                            <View style={qtnStyles.qtyRow}>
                              <Text style={qtnStyles.productDetails}>
                                Qty: {prod.qty}
                              </Text>
                              <Text style={qtnStyles.productDetails}>
                                Rate: {prod.rate}
                              </Text>
                              <Text style={qtnStyles.productDetails}>
                                Total:{' '}
                                {(Number(prod.qty) * Number(prod.rate)).toFixed(
                                  2,
                                )}
                              </Text>
                              <View />
                              <TouchableOpacity
                                style={{
                                  position: 'absolute',
                                  right: 4,
                                  bottom: 4,
                                }}
                                onPress={() =>
                                  removeProductFromPackage(entry.id, index)
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
                      />
                    </View>
                  </View>
                ))}
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
              {/* <View style={styles.inv_inputBox}>
                <Text
                  style={[
                    styles.inv_label,
                    {fontSize: 13, color: '#000', fontFamily: fonts.semiBold},
                  ]}>
                  Grand Total:
                </Text>
                <TextInput
                  value={grandTotal.toFixed()}
                  editable={false}
                  keyboardType="numeric"
                  style={[
                    styles.inv_input,
                    {backgroundColor: '#f0f0f0', color: '#000'},
                  ]}
                  placeholder="0"
                />
              </View> */}

              {/* <View style={styles.inv_inputBox}>
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
                  Discount (%):<Text style={{fontSize: 18}}>⇋</Text>
                </Text>
                <TextInput
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="numeric"
                  style={styles.inv_input}
                  placeholder="0"
                  onFocus={() => setIsDiscountFocused(true)}
                  onBlur={() => setIsDiscountFocused(false)}
                />
              </View> */}
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
                onPress={() => setFinalModal(true)}>
                <Text style={styles.inv_saveText}>Save</Text>
              </TouchableOpacity>
            </View>

            {/* Modal for Final */}
            <Modal
              visible={finalModal}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setFinalModal(false)}>
              <Pressable
                style={modalStyles.overlay}
                onPress={() => setFinalModal(false)}>
                <Pressable
                  style={modalStyles.modalContainer}
                  onPress={() => {}}>
                  <View style={modalStyles.modalHeader}>
                    <TouchableOpacity onPress={() => setFinalModal(false)}>
                      <Icon name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    <View style={modalStyles.field}>
                      <Text style={modalStyles.label}>
                        Package Name <Text style={{color: 'red'}}>*</Text>
                      </Text>
                      <TextInput
                        style={[
                          modalStyles.input,
                          {borderColor: showcoupleErr ? 'red' : '#ddd'},
                        ]}
                        value={packageName}
                        onFocus={() => setIsDiscountFocused(true)}
                        onChangeText={text => {
                          setshowcoupleErr(false);
                          setPackageName(text);
                        }}
                        placeholder="Enter package name"
                        placeholderTextColor="#aaa"
                        autoFocus={true}
                      />
                      {showcoupleErr && (
                        <Text
                          style={{color: 'red', fontSize: 12, marginTop: 4}}>
                          {packageNameErr}
                        </Text>
                      )}
                    </View>
                  </ScrollView>

                  <View style={modalStyles.buttonRow}>
                    <TouchableOpacity
                      style={modalStyles.cancelBtn}
                      onPress={() => setFinalModal(false)}>
                      <Text style={modalStyles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={modalStyles.saveBtn}
                      onPress={() => {
                        if (!packageName.trim()) {
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

            {/* Modal for Delete */}
            <Modal
              transparent
              visible={deleteModalVisible}
              animationType="fade"
              onRequestClose={() => setdeleteModalVisible(false)}>
              <Pressable
                style={styles.modalBackdrop}
                onPress={() => setdeleteModalVisible(false)}>
                <Pressable style={styles.modalContent} onPress={() => {}}>
                  <Text style={styles.modalTitle}>Delete Package?</Text>
                  <Text style={styles.modalText}>
                    Are you sure you want to delete this Package?
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

            {/* Modal for Delete All */}
            <Modal
              transparent
              visible={deleteAllModalVisible}
              animationType="fade"
              onRequestClose={() => setDeleteAllModalVisible(false)}>
              <Pressable
                style={styles.modalBackdrop}
                onPress={() => setDeleteAllModalVisible(false)}>
                <Pressable style={styles.modalContent} onPress={() => {}}>
                  <Text style={styles.modalTitle}>Delete All Packages?</Text>
                  <Text style={styles.modalText}>
                    Are you sure you want to delete all packages?
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

            {/* Modal for back */}
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

      {/* Modal for Product Dropdown */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        statusBarTranslucent>
        {/* Dim Background */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-start',
            paddingTop: 190, // same as your old top
          }}>
          {/* Main Container */}
          <View
            style={{
              marginHorizontal: 12,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}>
            {/* Scrollable List */}
            <ScrollView
              style={{maxHeight: 300}}
              keyboardShouldPersistTaps="handled">
              {/* Search */}
              <View
                style={{
                  padding: 10,
                  borderBottomWidth: 1,
                  borderColor: '#eee',
                }}>
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
                    paddingHorizontal: 10,
                    color: '#000',
                    backgroundColor: '#fff',
                  }}
                />
              </View>

              {/* List */}
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
                      paddingVertical: 12,
                      paddingHorizontal: 15,
                      borderBottomWidth: 0.5,
                      borderColor: '#eee',
                      backgroundColor: isSelected ? '#fff7f0' : '#FFF',
                    }}
                    onPress={() => {
                      setSearchText('');
                      setSelectProduct(prev => {
                        const exists = prev.some(
                          p => p.product_id === item.product_id,
                        );

                        if (exists) {
                          return prev.filter(
                            p => p.product_id !== item.product_id,
                          );
                        } else {
                          return [...prev, {...item, qty: 1, rate: item.rate}];
                        }
                      });
                    }}>
                    <Text style={{color: '#000'}}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Bottom Buttons */}
            <View
              style={{
                flexDirection: 'row',
                borderTopWidth: 1,
                borderColor: '#eee',
                backgroundColor: '#fff',
              }}>
              {/* Clear */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setSelectProduct([]);
                  setModalVisible(false);
                }}>
                <Text style={{color: '#444'}}>Clear All</Text>
              </TouchableOpacity>

              <View style={{width: 1, backgroundColor: '#E5E7EB'}} />

              {/* Save */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
                onPress={() => setModalVisible(false)}>
                <Text
                  style={{
                    color: '#FF7A00',
                    fontFamily: fonts.medium,
                  }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

       <Modal
        visible={showDeleteWarning}
        transparent
        animationType="fade"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: '80%',
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 20,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10, color:"#000",alignSelf:'center' }}>
              Cannot Delete
            </Text>
      
            <Text style={{ color: '#555', marginBottom: 20,alignSelf:'center' }}>
              At least one product is required. (Click on Edit)
            </Text>
      
            <TouchableOpacity
              style={{
                backgroundColor: '#F05A28',
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={() => setShowDeleteWarning(false)}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PackageForm;

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
  row: {flexDirection: 'row', alignItems: 'flex-end', gap: 12},
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
  orangeDropdown: {
    minHeight: 45,
    borderWidth: 1,
    marginLeft: -21,
    borderColor: '#d4d4d4',
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  orangePlaceholder: {fontSize: 14, color: '#000000'},
  orangeSelectedText: {
    fontSize: 12,
    color: '#000000',
    fontFamily: fonts.medium,
  },
  orangeInputSearch: {height: 40, fontSize: 14, color: '#000000'},
  orangeSelectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaeaea',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    marginVertical: 4,
    fontSize: 12,
  },
  orangeSelectedTextChip: {marginRight: 5, fontSize: 12, color: '#000'},
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
  cancelText: {color: '#374151', fontSize: 14, fontFamily: fonts.medium},
  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 6,
    backgroundColor: '#FF7A00',
  },
  saveText: {color: '#fff', fontSize: 14, fontFamily: fonts.semiBold},
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
    marginTop: -1,
    marginBottom: 10,
  },
  inv_addText: {color: '#FFF', fontFamily: fonts.semiBold, fontSize: 14},
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
  inv_summaryLabel: {fontSize: 13, color: '#4B5563'},
  inv_summaryValue: {fontSize: 13, fontFamily: fonts.semiBold},
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
  inv_finalLabel: {fontSize: 15, fontFamily: fonts.bold, color: '#111827'},
  inv_finalValue: {fontSize: 16, fontFamily: fonts.bold, color: '#FF7A00'},
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
  fnBlock_container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 15,
  },
  fnBlock_topRow: {flexDirection: 'row', justifyContent: 'space-between'},
  fnBlock_heading: {
    fontSize: 13,
    color: '#777',
    fontFamily: fonts.bold,
    marginBottom: 4,
  },
  fnBlock_value: {fontSize: 15, color: '#000', fontFamily: fonts.bold},
  fnBlock_divider: {height: 1, backgroundColor: '#e5e5e5', marginVertical: 12},
  fnBlock_productBlock: {marginBottom: 4},
  fnBlock_productName: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: '#000',
    marginBottom: 6,
  },
  fnBlock_qtyRow: {flexDirection: 'row', justifyContent: 'space-between'},
  fnBlock_productDetail: {fontSize: 13, color: '#444'},
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
  actionIcon: {padding: 8, marginLeft: 4},
  card: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: "100%",
    marginLeft: 0,
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
  qtyRow: {flexDirection: 'row', justifyContent: 'space-between'},
  productDetails: {fontSize: 12, color: '#333'},
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
  modalTitle: {fontSize: 18, fontFamily: fonts.semiBold, color: '#111'},
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
  phoneRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
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
  plus: {fontSize: 16, color: '#555', marginRight: 4},
  countryCodeInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
    textAlign: 'center',
    color: '#000',
  },
  phoneInput: {flex: 1, color: '#000'},
  textArea: {minHeight: 90, textAlignVertical: 'top', color: '#000'},
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
