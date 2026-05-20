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
import {APIS} from '../../../utils/Apis';
import {fonts} from '../../../utils/fonts';
import {ActivityIndicator} from 'react-native-paper';

const ItemForm = ({route}) => {
  const navigation = useNavigation();

  const {item} = route.params || {};

  const isEditMode = !!item;

  const [form, setForm] = useState({
    code: '',
    name: '',
    price: '',
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        code: item.product_id || '',
        name: item.product_name || '',
        price: item.amount,
      });
    }
  }, [item]);

  const handleChange = (field, value) => {
    setForm(prev => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  const validateAndSave = async () => {
    const newErrors = {};

    // if (!form.code.trim()) newErrors.code = 'Item Code is required';
    if (!form.name.trim()) newErrors.name = 'Item Name is required';
    if (!form.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      newErrors.price = 'Enter a valid price';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }
    setLoading(true);
    const itemData = {
      ...(item?.product_id && {product_id: item?.product_id}),
      product_name: form.name.trim(),
      amount: String(form.price),
    };
    if (isEditMode) {
      const url = APIS.PRODUCT_UPDATE;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      const data = await res.json();
      console.log(data);
      if (data.code === 200) {
        setLoading(false);
        navigation.navigate('ItemScreen');
      }
    } else {
      try {
        const res = await fetch(APIS.PRODUCT_ADD, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemData),
        });

        const data = await res.json();
        console.log('ADD RESPONSE:', data);
        console.log(itemData);
        if (data.code === 200) {
          setLoading(false);
          navigation.navigate('ItemScreen');
        } else {
          console.log('API error:', data);
        }
      } catch (error) {
        console.error('Fetch error details:', error);
        console.log('Message:', error.message);
        console.log('Stack:', error.stack);
        Alert.alert(
          'Connection Failed',
          'Check internet, server URL, or try HTTP → HTTPS.\n\nError: ' +
            error.message,
        );
      }
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
              {isEditMode ? 'Edit Item' : 'Add New Item'}
            </Text>
            <View style={{}}></View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Item Code */}

            {/* Item Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Item Name <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[styles.inputWrapper, errors.name && styles.inputError]}>
                <Icon name="cube-outline" size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter item name"
                  placeholderTextColor="#b9b9b9"
                  value={form.name}
                  onChangeText={v => handleChange('name', v.trimStart())}
                  maxLength={35}
                />
              </View>
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Item Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Price (₹) <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.price && styles.inputError,
                ]}>
                <Icon name="currency-inr" size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#b9b9b9"
                  value={form.price}
                  onChangeText={v => {
                    const cleaned = v.replace(/[^0-9.]/g, ''); // only numbers + dot
                    handleChange('price', cleaned);
                  }}
                  keyboardType="numeric"
                  maxLength={8}
                />
              </View>
              {errors.price && (
                <Text style={styles.errorText}>{errors.price}</Text>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveBtn} onPress={validateAndSave}>
              <Text style={styles.saveText}>
                {loading ? (
                  <ActivityIndicator size={'small'} color="#fff" />
                ) : isEditMode ? (
                  'Update Item'
                ) : (
                  'Save Item'
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ItemForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    paddingBottom: 40,
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
    // marginLeft: 1,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
    fontFamily: fonts.semiBold,
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
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#ff4d4f',
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
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
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
});
