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
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import {APIS} from '../../../utils/Apis';
import {fonts} from '../../../utils/fonts';

const BookingStaffForm = ({route}) => {
  const {outdoor_id, existingStaffItem} = route.params || {};
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [dropDownProgData, setdropDownProgData] = useState([]);
  const [dropDownStaffData, setdropDownStaffData] = useState([]);

  // Product Multi-Select States
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [productSearchText, setProductSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [form, setForm] = useState({
    outdoor_program_id: null,
    function_date: '',
    remainder_date: '',
    staff_id: null,
    staff_amount: '',
    staff_msg: '',
  });

  const [showFuncDate, setShowFuncDate] = useState(false);
  const [showRemDate, setShowRemDate] = useState(false);

  // Static data
  const programs = [
    {label: 'Engagement', value: 1},
    {label: 'Wedding', value: 2},
    {label: 'Reception', value: 3},
    {label: 'Haldi', value: 4},
    {label: 'Sangeet', value: 5},
  ];

  const staffList = [
    {label: 'Photographer - Raj', value: 1},
    {label: 'Videographer - Amit', value: 2},
    {label: 'Drone - Vikram', value: 3},
    {label: 'Makeup - Priya', value: 4},
    {label: 'Decorator', value: 5},
  ];

  const getProg = async () => {
    const res = await fetch(APIS.GET_PROGRAM);
    const data = await res.json();
    // console.log(data.payload)
    setdropDownProgData(data.payload);
  };
  const getStaff = async () => {
    const res = await fetch(APIS.STAFF_LIST);
    const data = await res.json();
    // console.log(data.payload);
    setdropDownStaffData(data.payload);
  };
  const finalProg = dropDownProgData.map(item => ({
    label: item.event_name,
    value: item.event_id,
  }));
  const finalStaff = dropDownStaffData.map(item => ({
    label: item.staff_master_name,
    value: item.staff_master_id,
  }));

  // Fetch products from your real API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(APIS.PRODUCT_LIST);
        const json = await res.json();
        const list =
          json?.payload?.map(item => ({
            product_id: item.product_id || item.id,
            label: item.product_name || item.name,
            rate: item.amount || item.price || '0',
          })) || [];
        setProducts(list);
      } catch (err) {
        console.log('Failed to load products:', err);
      }
    };
    fetchProducts();
  }, []);
  useEffect(() => {
    getProg();
    getStaff();
  }, []);

  // Filtered products for search
  const filteredProducts = products.filter(item =>
    item.label?.toLowerCase().includes(productSearchText.toLowerCase()),
  );

  useEffect(() => {
    if (existingStaffItem) {
      setForm({
        outdoor_program_id: existingStaffItem.outdoor_program_id || null,
        function_date: existingStaffItem.function_date || '',
        remainder_date: existingStaffItem.remainder_date || '',
        staff_id: existingStaffItem.staff_id || null,
        staff_amount: String(existingStaffItem.staff_amount || ''),
        staff_msg: existingStaffItem.staff_msg || '',
      });
      // If edit mode has pre-selected products, load them here
      // Example: setSelectedProducts(existingStaffItem.selectedProducts || []);
    }
  }, [existingStaffItem]);

  const handleChange = (key, value) => {
    setForm(prev => ({...prev, [key]: value}));
    if (errors[key]) setErrors(prev => ({...prev, [key]: null}));
  };

  const formatDate = date => {
    if (!date) return '';
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${d}-${m}-${date.getFullYear()}`;
  };

  const handleSubmit = async () => {
    const errs = {};
    if (!form.outdoor_program_id) errs.program = 'Required';
    if (!form.staff_id) errs.staff = 'Required';
    if (!form.function_date) errs.function_date = 'Required';
    if (!form.remainder_date) errs.remainder_date = 'Required';
    if (!form.staff_amount.trim()) errs.amount = 'Required';

    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);

    const payload = {
      outdoor_id,
      ...(existingStaffItem?.outdoor_add_id && {
        outdoor_add_id: existingStaffItem.outdoor_add_id,
      }),
      outdoor_program_id: form.outdoor_program_id,
      function_date: form.function_date,
      remainder_date: form.remainder_date,
      staff_id: form.staff_id,
      staff_amount: Number(form.staff_amount) || 0,
      staff_msg: form.staff_msg.trim(),
      // Optional: send selected products
      outdoor_product_id: selectedProducts.map(p => String(p.product_id)),
    };

    try {
      const res = await fetch(
        existingStaffItem ? APIS.UPDATE_BOOKING_STAFF : APIS.ADD_BOOKING_STAFF,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (data.code === 200) {
        navigation.goBack();
      } else {
        alert(data.message || 'Failed');
      }
    } catch {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1, paddingBottom: 40}}>
        <ScrollView>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={navigation.goBack}>
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {existingStaffItem ? 'Edit Staff' : 'Add Staff'}
            </Text>
          </View>

          <View style={{gap: 16, paddingHorizontal: 12}}>
            {/* Program + Staff */}
            <View style={styles.row}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>
                  Program <Text style={{color: 'red'}}>*</Text>
                </Text>
                <Dropdown
                  style={[styles.dropdown, errors.program && styles.errorInput]}
                  data={finalProg}
                  labelField="label"
                  valueField="value"
                  placeholder="Select"
                  maxHeight={250}
                  autoScroll={false}
                  activeColor="#fef1e6"
                  searchPlaceholderTextColor="#000"
                  selectedTextStyle={{
                    fontSize: 13.5,
                    color: '#111827',
                    fontFamily: fonts.medium,
                  }}
                  itemTextStyle={{
                    color: '#000',
                    fontSize: 14,
                    marginVertical: -8,
                  }}
                  placeholderStyle={{color: '#000'}}
                  inputSearchStyle={{color: '#000', height: 36, fontSize: 13.5}}
                  search
                  keyboardType="phone-pad"
                  searchPlaceholder="Search..."
                  value={form.outdoor_program_id}
                  onChange={item =>
                    handleChange('outdoor_program_id', item.value)
                  }
                />
                {errors.program && (
                  <Text style={styles.error}>{errors.program}</Text>
                )}
              </View>

              <View style={{flex: 1}}>
                <Text style={styles.label}>
                  Staff <Text style={{color: 'red'}}>*</Text>
                </Text>
                <Dropdown
                  style={[styles.dropdown, errors.staff && styles.errorInput]}
                  data={finalStaff}
                  labelField="label"
                  valueField="value"
                  placeholder="Select"
                  maxHeight={350}
                  activeColor="#fef1e6"
                  autoScroll={false}
                  searchPlaceholderTextColor="#000"
                  itemTextStyle={{
                    color: '#000',
                    fontSize: 14,
                    marginVertical: -8,
                  }}
                  placeholderStyle={{color: '#000'}}
                  selectedTextStyle={{
                    fontSize: 13.5,
                    color: '#111827',
                    fontFamily: fonts.medium,
                  }}
                  inputSearchStyle={{color: '#000', height: 36, fontSize: 13.5}}
                  search
                  keyboardType="phone-pad"
                  searchPlaceholder="Search..."
                  value={form.staff_id}
                  onChange={item => handleChange('staff_id', item.value)}
                />
                {errors.staff && (
                  <Text style={styles.error}>{errors.staff}</Text>
                )}
              </View>
            </View>

            {/* Function Date + Reminder Date */}
            <View style={styles.row}>
              <View style={{flex: 1, marginRight: 10}}>
                <Text style={styles.label}>
                  Function Date <Text style={{color: 'red'}}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dateBtn,
                    errors.function_date && styles.errorInput,
                  ]}
                  onPress={() => setShowFuncDate(true)}>
                  <Icon name="calendar" size={18} color="#666" />
                  <Text style={styles.dateText}>
                    {form.function_date || 'DD-MM-YYYY'}
                  </Text>
                </TouchableOpacity>
                {showFuncDate && (
                  <DateTimePicker
                    value={
                      form.function_date
                        ? new Date(
                            form.function_date.split('-').reverse().join('-'),
                          )
                        : new Date()
                    }
                    mode="date"
                    onChange={(_, date) => {
                      setShowFuncDate(false);
                      if (date) handleChange('function_date', formatDate(date));
                    }}
                  />
                )}
                {errors.function_date && (
                  <Text style={styles.error}>{errors.function_date}</Text>
                )}
              </View>

              <View style={{flex: 1}}>
                <Text style={styles.label}>
                  Reminder Date <Text style={{color: 'red'}}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dateBtn,
                    errors.remainder_date && styles.errorInput,
                  ]}
                  onPress={() => setShowRemDate(true)}>
                  <Icon name="bell-outline" size={18} color="#666" />
                  <Text style={styles.dateText}>
                    {form.remainder_date || 'DD-MM-YYYY'}
                  </Text>
                </TouchableOpacity>
                {showRemDate && (
                  <DateTimePicker
                    value={
                      form.remainder_date
                        ? new Date(
                            form.remainder_date.split('-').reverse().join('-'),
                          )
                        : new Date()
                    }
                    mode="date"
                    onChange={(_, date) => {
                      setShowRemDate(false);
                      if (date)
                        handleChange('remainder_date', formatDate(date));
                    }}
                  />
                )}
                {errors.remainder_date && (
                  <Text style={styles.error}>{errors.remainder_date}</Text>
                )}
              </View>
            </View>
            <View>
              <Text style={styles.label}>Products</Text>
              <TouchableOpacity
                style={[
                  styles.dropdown,
                  {
                    minHeight: 44, // allow growing
                    height: 'auto',
                    paddingVertical: 8, // more vertical space
                    paddingHorizontal: 10,
                    flexDirection: 'row',
                    alignItems:
                      selectedProducts.length === 0 ? 'center' : 'flex-start',
                    flexWrap: 'wrap',
                    gap: 8,
                  },
                ]}
                onPress={() => setProductModalVisible(true)}>
                {selectedProducts.length === 0 ? (
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#9ca3af',
                    }}>
                    Select products
                  </Text>
                ) : (
                  selectedProducts.map(item => (
                    <TouchableOpacity
                      key={item.product_id}
                      onPress={() =>
                        setSelectedProducts(prev =>
                          prev.filter(p => p.product_id !== item.product_id),
                        )
                      }
                      activeOpacity={0.7}>
                      <View style={styles.selectedChip}>
                        <Text style={styles.selectedChipText}>
                          {item.label}
                        </Text>
                        <Icon name="close" size={16} color="#666" />
                      </View>
                    </TouchableOpacity>
                  ))
                )}

                {/* Dropdown arrow always at the end */}
                <Icon
                  name="chevron-down"
                  size={20}
                  color="#666"
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 12, // center vertically better
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* Amount */}
            <View>
              <Text style={styles.label}>
                Amount <Text style={{color: 'red'}}>*</Text>
              </Text>
              <View
                style={[styles.inputRow, errors.amount && styles.errorInput]}>
                <Icon name="currency-inr" size={18} color="#666" />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Enter Amount"
                  placeholderTextColor="#7777"
                  value={form.staff_amount}
                  onChangeText={v =>
                    handleChange('staff_amount', v.replace(/\D/g, ''))
                  }
                />
              </View>
              {errors.amount && (
                <Text style={styles.error}>{errors.amount}</Text>
              )}
            </View>

            {/* Message */}
            <View>
              <Text style={styles.label}>Message / Note</Text>
              <View style={styles.inputRow}>
                <Icon name="message-text-outline" size={18} color="#666" />
                <TextInput
                  style={[styles.input, {textAlignVertical: 'top'}]}
                  multiline
                  placeholder="Message/Notes..."
                  value={form.staff_msg}
                  placeholderTextColor={"#7777"}
                  onChangeText={v => handleChange('staff_msg', v)}
                />
              </View>
            </View>

            {/* ── Product Selection Field (looks like Dropdown) ── */}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.btn, loading && {opacity: 0.7}]}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>
                  {existingStaffItem ? 'Update' : 'Save'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Product Selection Modal*/}
      <Modal
        visible={productModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setProductModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setProductModalVisible(false)}>
          <View style={modalStyles.overlay}>
            <TouchableWithoutFeedback>
              <View style={modalStyles.modalContainer}>
                {/* Search */}
                <TextInput
                  style={modalStyles.searchInput}
                  placeholder="Search products..."
                  placeholderTextColor="#999"
                  value={productSearchText}
                  onChangeText={setProductSearchText}
                />

                {/* Product List */}
                <ScrollView style={{maxHeight: 200}}>
                  {filteredProducts.length === 0 ? (
                    <Text style={modalStyles.emptyText}>No products found</Text>
                  ) : (
                    filteredProducts.map(item => {
                      const isSelected = selectedProducts.some(
                        p => p.product_id === item.product_id,
                      );
                      return (
                        <TouchableOpacity
                          key={item.product_id}
                          style={[
                            modalStyles.productItem,
                            isSelected && modalStyles.productItemSelected,
                          ]}
                          onPress={() => {
                            setSelectedProducts(prev => {
                              if (isSelected) {
                                return prev.filter(
                                  p => p.product_id !== item.product_id,
                                );
                              }
                              return [...prev, {...item}];
                            });
                          }}>
                          <Text style={modalStyles.productName}>
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>

                {/* Footer Buttons */}
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 10,
                    gap: 8,
                    borderTopWidth: 1,
                    borderTopColor: '#eee',
                  }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setSelectedProducts([]);
                      setProductSearchText('');
                    }}>
                    <Text
                      style={{color: '#555', fontSize: 13, fontFamily: fonts.medium,}}>
                      Clear
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      borderRadius: 6,
                      backgroundColor: '#F05A28',
                      alignItems: 'center',
                    }}
                    onPress={() => setProductModalVisible(false)}>
                    <Text
                      style={{color: '#fff', fontSize: 13,fontFamily: fonts.semiBold,}}>
                      Done 
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f9fafb'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F05A28',
    padding: 16,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontFamily: fonts.semiBold,
    textAlign: 'center',
    marginRight: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
    fontFamily: fonts.semiBold,
  },
  dropdown: {
    height: 42,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    gap: 8,
  },
  dateText: {color: '#333', fontSize: 14, flex: 1},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    gap: 8,
  },
  input: {flex: 1, fontSize: 15, paddingVertical: 10, color: '#111'},
  errorInput: {borderColor: '#ef4444', borderWidth: 1.5},
  error: {color: '#ef4444', fontSize: 12, marginTop: 3},
  btn: {
    backgroundColor: '#F05A28',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },

  // Chip style for selected products
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaeaea',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 4,
    gap: 4,
  },
  selectedChipText: {
    fontSize: 13,
    color: '#000',
  },
});

// Modal styles
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0,0)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '93%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 150,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#111',
  },
  searchInput: {
    margin: 6,
    height: 40,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: '#f9fafb',
    color: '#000',
  },
  productItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  productItemSelected: {
    backgroundColor: '#fef1e6',
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: '#111',
  },
  emptyText: {
    textAlign: 'center',
    padding: 40,
    color: '#888',
    fontSize: 15,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f9fafb',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  clearText: {
    color: '#374151',
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  doneButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F05A28',
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },
});

export default BookingStaffForm;
