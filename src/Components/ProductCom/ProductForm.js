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
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {fonts} from '../../../utils/fonts';
import {APIS} from '../../../utils/Apis';

const ProductForm = ({route}) => {
  const navigation = useNavigation();

  const {item} = route.params || {};

  const isEditMode = !!item;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    // prodCode: '',
    // itemName: '',
    prodName: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (item) {
      setForm({
        // prodCode: item.productCode || '',
        // itemName: item.itemName || '',
        id: item.event_id,
        prodName: item.event_name,
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

    // if (!form.prodCode.trim()) newErrors.prodCode = 'Item Code is required';
    // if (!form.itemName.trim()) newErrors.itemName = 'Item Name is required';
    if (!form.prodName.trim()) {
      newErrors.prodName = 'Product Name is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }
    setLoading(true);
    if (item) {
      const res = await fetch(APIS.UPDATE_PROGRAM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({event_id: form.id, event_name: form.prodName}),
      });
      const data = await res.json();
      if (data.code === 200) {
        setLoading(false);
        navigation.navigate('ProdScreen');
      }
    } else {
      const res = await fetch(APIS.ADD_PROGRAM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({event_name: form.prodName}),
      });
      const data = await res.json();
      console.log(data);
      if (data.code === 200) {
        setLoading(false);
        navigation.navigate('ProdScreen');
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
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </Text>
            <View style={{}}></View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Item Code */}
            {/* <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Product Code <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.prodCode && styles.inputError,
                ]}
              >
                <Icon name="barcode" size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. ITM-001"
                  placeholderTextColor="#b9b9b9"
                  value={form.prodCode}
                  onChangeText={(v) =>{ if(errors.prodCode) setErrors(prev=>({...prev,"prodCode":null})); handleChange('prodCode', v)}}
                  autoCapitalize="characters"
                />
              </View>
              {errors.prodCode && (
                <Text style={styles.errorText}>{errors.prodCode}</Text>
              )}
            </View> */}

            {/* Item Name */}
            {/* <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Item Name <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.itemName && styles.inputError,
                ]}
              >
                <Icon name="cube-outline" size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter item name"
                  placeholderTextColor="#b9b9b9"
                  value={form.itemName}
                  onChangeText={(v) =>{ if(errors.itemName) setErrors(prev=>({...prev,"itemName":null})); handleChange('itemName', v)}}
                />
              </View>
              {errors.itemName && (
                <Text style={styles.errorText}>{errors.itemName}</Text>
              )}
            </View> */}

            {/* Item prodName */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Product Name <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.prodName && styles.inputError,
                ]}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter product name"
                  placeholderTextColor="#b9b9b9"
                  value={form.prodName}
                  onChangeText={v => handleChange('prodName', v)}
                />
              </View>
              {errors.prodName && (
                <Text style={styles.errorText}>{errors.prodName}</Text>
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveBtn} onPress={validateAndSave}>
              <Text style={styles.saveText}>
                {loading ? (
                  <ActivityIndicator size={'small'} color="#FFF" />
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

export default ProductForm;

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
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
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
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
});
