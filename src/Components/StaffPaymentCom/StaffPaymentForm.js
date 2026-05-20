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
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Dropdown} from 'react-native-element-dropdown';
import {fonts} from '../../../utils/fonts';
import {APIS} from '../../../utils/Apis';

const titleData = [
  {label: 'Photo Shoot', value: 'Photo Shoot'},
  {label: 'Studio Rent', value: 'Studio Rent'},
  {label: 'Travel Expense', value: 'Travel Expense'},
  {label: 'Food & Catering', value: 'Food & Catering'},
  {label: 'Decoration', value: 'Decoration'},
  {label: 'Transportation', value: 'Transportation'},
  {label: 'Salary Payment', value: 'Salary Payment'},
  {label: 'Marketing', value: 'Marketing'},
  {label: 'Office Supplies', value: 'Office Supplies'},
  {label: 'Miscellaneous', value: 'Miscellaneous'},
];
const paymentType = [
  {label: 'Cash', value: 'Cash'},
  {label: 'Online', value: 'Online'},
  {label: 'Bank Transfer', value: 'Bank Transfer'},
  {label: 'Cheque', value: 'Cheque'},
];
const StaffPaymentForm = ({route}) => {
  const {item} = route.params || {};
  const navigation = useNavigation();

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    amount: '',
    payment: '',
    in_ex_description: '',
  });

  const [entryDate, setEntryDate] = useState(new Date());
  const [entryDateString, setEntryDateString] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dropdownData, setDropdownData] = useState([]);

  const formatDate = date => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || '',
        amount: item.amount?.toString() || '',
        payment: item.payment || '',
        in_ex_description: item.in_ex_description || '',
      });
      const date = item.ex_in_date ? new Date(item.ex_in_date) : new Date();
      setEntryDate(date);
      setEntryDateString(formatDate(date));
    } else {
      const today = new Date();
      setEntryDate(today);
      setEntryDateString(formatDate(today));
    }
  }, [item]);
  const getTitle = async () => {
    try {
      const res = await fetch(APIS.STAFF_LIST);
      const data = await res.json();
    //   console.log(data.payload);
      const newData = data.payload;
      setDropdownData(data?.payload);
    } catch (err) {
      console.error('Failed to load parties:', err);
    }
  };
  useEffect(() => {
    getTitle();
  }, []);

  const handleChange = (name, value) => {
    setForm(prev => ({...prev, [name]: value}));
    if (errors[name]) setErrors(prev => ({...prev, [name]: null}));
  };

  const validateForm = () => {
    const err = {};

    if (!form.title.trim()) {
      err.title = 'Please fill the staff';
    }

    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      err.amount = 'Please enter a valid amount';
    }

   
    if (!form.payment) {
      err.payment = 'Please select payment';
    }

    if (!entryDateString) {
      err.date = 'Please select date';
    }

    

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    const payload = {
      title: form.title.trim(),
      amount: Number(form.amount),
      payment: form.payment.trim() || null,
      in_ex_description: form.in_ex_description.trim() || null,
      ex_in_date: entryDateString,
    };

    try {
      const url = item ? APIS.UPDATE_EXPENSE : APIS.ADD_EXPENSE;
      const method = item ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ...payload,
          income_expense_id: item?.income_expense_id,
        }),
      });

      const json = await res.json();
      if (json?.code === 200 || json?.success) {
        navigation.navigate('ManageExpense', {refresh: true});
      } else {
        alert(json?.message || 'Failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error');
    } finally {
      setLoading(false);
    }
  };

  const finalData = dropdownData.map(i => ({
    label: i.staff_master_name,
    value: i.staff_master_id,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Header - more compact */}
          <View style={styles.header}>
            <TouchableOpacity onPress={navigation.goBack}>
              <Icon name="arrow-left" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>{item ? 'Edit' : 'New'} Entry</Text>
          </View>

          <View style={styles.form}>
            
            
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Staff <Text style={styles.required}>*</Text></Text>
              <Dropdown
                style={[styles.dropdown, errors.title && {borderColor: 'red'}]} // we'll define this
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={{color: '#000', marginVertical: -12}}
                iconStyle={styles.iconStyle}
                autoScroll={false}
                data={finalData}
                search
                maxHeight={300}
                labelField="label"
                activeColor="#fef1e6"
                valueField="value"
                placeholder={!form.title ? 'Select or type title' : ''}
                searchPlaceholder="Search title..."
                value={form.title}
                onChange={item => {
                  handleChange('title', item.value);
                }}
              />
              {errors.title && <Text style={styles.error}>{errors.title}</Text>}
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Amount (₹) <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.amount && {borderColor: 'red'}]}
                value={form.amount}
                onChangeText={v => handleChange('amount', v)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#aaa"
                maxLength={8}
              />
              {errors.amount && (
                <Text style={styles.error}>{errors.amount}</Text>
              )}
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Payment Type <Text style={styles.required}>*</Text></Text>
              <Dropdown
                style={[
                  styles.dropdown,
                  errors.payment && {borderColor: 'red'},
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                itemTextStyle={{color: '#000', marginVertical: -12}}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={paymentType}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                activeColor="#fef1e6"
                placeholder={!form.category ? 'Select category' : ''}
                searchPlaceholder="Search category..."
                value={form.category}
                onChange={item => {
                  handleChange('payment', item.value);
                }}
              />
              {errors.payment && <Text style={styles.error}>{errors.payment}</Text>}
            
            </View>

            {/* Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={[styles.dateInput, errors.date && {borderColor: 'red'}]}
                onPress={() => setShowDatePicker(true)}>
                <Icon name="calendar" size={18} color="#666" />
                <Text style={styles.dateText}>
                  {entryDateString || 'Select'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={entryDate}
                  mode="date"
                  maximumDate={new Date()}
                  onChange={(e, date) => {
                    setShowDatePicker(false);
                    if (date) {
                      setEntryDate(date);
                      setEntryDateString(formatDate(date));
                    }
                  }}
                />
              )}
              {errors.date && <Text style={styles.error}>{errors.date}</Text>}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Remarks</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  errors.in_ex_description && {borderColor: 'red'},
                ]}
                value={form.in_ex_description}
                onChangeText={v => handleChange('in_ex_description', v)}
                placeholder="Details..."
                multiline
                numberOfLines={3}
                placeholderTextColor="#aaa"
              />
              {errors.in_ex_description && <Text style={styles.error}>{errors.in_ex_description}</Text>}
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && {opacity: 0.7}]}
              onPress={handleSubmit}
              disabled={loading}>
              <Text style={styles.submitText}>
                {loading ? (
                  <ActivityIndicator color="#FFFF" size="small" />
                ) : item ? (
                  'Update'
                ) : (
                  'Save'
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default StaffPaymentForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    paddingBottom: 24,
  },

  header: {
    flexDirection: 'row',
    backgroundColor: '#F05A28',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    height: 56,
  },
  title: {
    fontSize: 17,
    fontFamily: fonts.bold,
    color: '#fff',
    marginLeft: '32%',
  },

  form: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },

  inputGroup: {
    marginBottom: 12,
  },

  label: {
    fontSize: 13.5,
    color: '#555',
    marginBottom: 4,
    fontFamily: fonts.semiBold,
  },

  required: {
    color: '#e63946',
  },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14.5,
    color: '#222',
  },

  textArea: {
    minHeight: 60, // smaller textarea
    textAlignVertical: 'top',
  },

  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  dateText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14.5,
    color: '#222',
  },

  typeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#F05A28',
    borderColor: '#F05A28',
  },
  typeText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#555',
  },

  submitBtn: {
    backgroundColor: '#F05A28',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 16,
  },
  submitText: {
    color: '#fff',
    fontSize: 15.5,
    fontFamily: fonts.semiBold,
  },

  error: {
    color: '#e63946',
    fontSize: 12.5,
    marginTop: 3,
  },
  dropdown: {
    height: 44, // same as your other inputs
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  placeholderStyle: {
    fontSize: 14.5,
    color: '#aaa',
  },
  selectedTextStyle: {
    fontSize: 14.5,
    color: '#222',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14.5,
    borderRadius: 8,
    color: '#000',
  },
});
