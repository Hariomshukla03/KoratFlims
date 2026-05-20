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
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import {APIS} from '../../../utils/Apis';
import {fonts} from '../../../utils/fonts';

const StaffForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {item} = route.params || {}; // coming from edit

  const isEditMode = !!item;

  const data = [
    {label: 'Drone Photo', value: 'Drone Photo'},
    {label: 'Pre Wedding', value: 'Pre Wedding'},
    {label: 'Traditional Video Editing', value: 'Traditional Video Editing'},
    {label: 'Coffee Table Book Album', value: 'Coffee Table Book Album'},
    {label: 'Album 4k 16X24', value: 'Album 4k 16X24'},
    {label: 'Same Day Video Editing', value: 'Same Day Video Editing'},
    {label: 'Same Day Photo Editing', value: 'Same Day Photo Editing'},
    {label: 'FPV Drone', value: 'FPV Drone'},
    {label: 'Drone', value: 'Drone'},
    {label: 'Cinematic Video', value: 'Cinematic Video'},
    {label: 'Cinematic Photo', value: 'Cinematic Photo'},
    {label: 'Traditional Video', value: 'Traditional Video'},
  ];
  const typeData = [
    {label: 'Internal Staff', value: 'Internal Staff'},
    {label: 'External Staff', value: 'External Staff'},
  ];

  const [form, setForm] = useState({
    staffCode: '',
    name: '',
    mobile: '',
    anotherMobile: '',
    staffAddress: '',
    hobby: '',
    category: '',
    staffType: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setForm({
        staffCode: item.staff_master_code || '',
        name: item.staff_master_name || '',
        mobile: item.staff_master_mobile || '',
        anotherMobile: item.staff_another_mobile || '',
        staffAddress: item.staff_master_address || '',
        hobby: item.staff_master_hobby || '',
        category: item.staff_master_category || '',
      });
    }
  }, [item]);
  const payload = {
    ...(item?.staff_master_id && {staff_master_id: item?.staff_master_id}),
    staff_master_code: form.staffCode,
    staff_master_name: form.name,
    staff_master_mobile: form.mobile,
    staff_another_mobile: form.anotherMobile || '',
    staff_master_address: form.staffAddress,
    staff_master_hobby: form.hobby || '',
    staff_master_category: form.category,
  };

  const handleChange = (field, value) => {
    setForm(prev => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const validateAndSave = async () => {
    const newErrors = {};

    if (!form.staffCode.trim()) newErrors.staffCode = 'Staff Code is required';
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    else if (!/^\+?\d{10,15}$/.test(form.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Enter a 10 digit mobile number';
    }
    if (
      form.anotherMobile &&
      !/^\+?\d{10,15}$/.test(form.anotherMobile.replace(/\s/g, ''))
    ) {
      newErrors.anotherMobile = 'Enter a 10 digit mobile number';
    }
    if (!form.staffAddress.trim())
      newErrors.staffAddress = 'Address is required';
    if (!form.category) newErrors.category = 'Category is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }
    if (item) {
      const res = await fetch(APIS.STAFF_UPDATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.code == 200) {
        navigation.navigate('StaffScreen');
      }
      console.log(data);
    } else {
      const res = await fetch(APIS.STAFF_ADD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.code == 200) {
        navigation.navigate('StaffScreen');
      }
      console.log(data);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {isEditMode ? 'Edit Staff' : 'Add New Staff'}
            </Text>
            <View style={{width: 40}} />
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Staff Code */}
            <InputField
              icon="badge-account-outline"
              label="Staff Code"
              placeholder="e.g. STF-001"
              value={form.staffCode}
              onChange={v => handleChange('staffCode', v.toUpperCase())}
              error={errors.staffCode}
              autoCapitalize="characters"
              mobile={true}
            />

            {/* Name */}
            <InputField
              icon="account-outline"
              label="Full Name"
              placeholder="Enter full name"
              value={form.name}
              onChange={v => handleChange('name', v)}
              error={errors.name}
            />

            {/* Mobile */}
            <InputField
              icon="phone-outline"
              label="Mobile Number"
              placeholder="Enter phone number"
              value={form.mobile}
              onChange={v => handleChange('mobile', v)}
              error={errors.mobile}
              keyboardType="phone-pad"
              mobile={true}
            />

            {/* Another Mobile */}
            <InputField
              icon="phone-outline"
              label="Another Mobile (optional)"
              placeholder="Enter phone number"
              value={form.anotherMobile}
              onChange={v => handleChange('anotherMobile', v)}
              error={errors.anotherMobile}
              keyboardType="phone-pad"
              mobile={true}
            />

            {/* Address */}
            <InputField
              icon="map-marker-outline"
              label="Staff Address"
              placeholder="Full address"
              value={form.staffAddress}
              onChange={v => handleChange('staffAddress', v)}
              error={errors.staffAddress}
              multiline
              numberOfLines={2}
            />

            {/* Hobby */}
            <InputField
              icon="book-open-outline"
              label="Hobby"
              placeholder="e.g. Cricket & Bike Riding"
              value={form.hobby}
              onChange={v => handleChange('hobby', v)}
              error={errors.hobby}
            />

            {/* Category */}
            <Text style={styles.label}>Category</Text>
            <Dropdown
              style={[styles.dropdown]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              itemTextStyle={{
                color: '#000',
                fontSize: 14,
                marginVertical: -8,
              }}
              autoScroll={false}
              iconStyle={styles.iconStyle}
              data={data}
              search
              maxHeight={230}
              activeColor="#fef1e6"
              labelField="label"
              valueField="value"
              placeholder={'Select Category...'}
              searchPlaceholder="Search..."
              value={form.category}
              onChange={v => handleChange('category', v.value)}
            />
            <Text style={styles.label}>Type</Text>
            <Dropdown
              style={[styles.dropdown]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              itemTextStyle={{
                color: '#000',
                fontSize: 14,
                marginVertical: -8,
              }}
              autoScroll={false}
              iconStyle={styles.iconStyle}
              data={typeData}
              search
              maxHeight={300}
              activeColor="#fef1e6"
              labelField="label"
              valueField="value"
              placeholder={'Select Category...'}
              searchPlaceholder="Search..."
              value={form.staffType}
              onChange={v => handleChange('staffType', v.value)}
            />

            {/* Save Button */}
            <TouchableOpacity style={styles.saveBtn} onPress={validateAndSave}>
              <Text style={styles.saveText}>
                {isEditMode ? 'Update Staff' : 'Save Staff'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Reusable Input Field Component
const InputField = ({
  icon,
  label,
  placeholder,
  value,
  onChange,
  error,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  mobile,
}) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>
      {label} <Text style={styles.required}>*</Text>
    </Text>
    <View style={[styles.inputWrapper, error && styles.inputError]}>
      <Icon name={icon} size={20} color="#64748b" style={{marginRight: 10}} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#b9b9b9"
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={mobile ? 10 : 100}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

export default StaffForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F05A28',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 19,
    fontFamily: fonts.bold,
    color: '#fff',
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 2,
  },
  inputGroup: {
    marginBottom: 6,
  },
  label: {
    fontSize: 13.5,
    color: '#444',
    marginBottom: 4,
    fontFamily: fonts.semiBold,
  },
  dropdown: {
    height: 45,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  icon: {
    marginRight: 5,
  },
  Droplabel: {
    position: 'absolute',
    backgroundColor: 'white',
    color: '#000',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#7777',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#000',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 35,
    fontSize: 12,
    color: '#000',
  },
  required: {
    color: '#ff4d4f',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: '#ff4d4f',
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  saveBtn: {
    backgroundColor: '#F05A28',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 1,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
});
