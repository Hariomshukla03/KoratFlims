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
  Keyboard,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {APIS} from '../../../utils/Apis';
import {fonts} from '../../../utils/fonts';
import StepIndicator from '../Loaders/StepIndicator';

const SaleFinalForm = ({route}) => {
  const navigation = useNavigation();

  const {
    sale_id,
    selectedMobile,
    entryDateString,
    sendpartyName,
    selectedStaff,
    amount,
    // pre-filled if editing
    sendCoupleName,
    sendNote,
    // sale data
    sales,
    grandTotal,
    discount,
    Finaltotal,
  } = route.params || {};

  const [coupleName, setCoupleName] = useState(sendCoupleName || '');
  const [notes, setNotes] = useState(sendNote || '');
  const [loading, setLoading] = useState(false);
  const [coupleErr, setCoupleErr] = useState(false);

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const handleFinalSubmit = async () => {
    if (!coupleName.trim()) {
      setCoupleErr(true);
      return;
    }
    setCoupleErr(false);

    const isUpdate = !!sale_id;

    const payload = {
      party_id: selectedMobile || '',
      sale_date: entryDateString,
      function_side: '',
      party_name: sendpartyName || '',
      city_name: '',
      staff_id: selectedStaff,
      couple_name: coupleName.trim(),
      notes: notes.trim() || '',
      sub_total: Number(grandTotal) || 0,
      discount: Number(discount) || 0,
      sale_total: Number(Finaltotal) || 0,
      discount_type: 'percentage',
      staff_amount: amount,
      subFunctions:
        sales && sales.length > 0
          ? sales.map(item => ({
              function_date: item.function_date || '',
              program_id: item.program_id || '',
              qty: String(item.qty || '1'),
              rate: String(item.rate || '0'),
              total: String((Number(item.qty) || 0) * (Number(item.rate) || 0)),
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
      console.log('Final Submit Response:', result);

      if (result?.code === 200) {
        setLoading(false);
        navigation.navigate('Sale');
      } else {
        setLoading(false);
        alert(result?.message || 'Failed to save. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Network error:', error);
      alert('Network error – please check your connection.');
    }
  };

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header — fixed, never moves */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={25} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {sale_id
            ? `Update Sale Bill (${sendpartyName})`
            : `Add Sale Bill (${sendpartyName})`}
        </Text>
      </View>

      {/* Step Indicator — fixed, never moves */}
      <StepIndicator step={3} />

      {/* KeyboardAvoidingView pushes bottomBar above keyboard */}
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Couple Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Couple Name <Text style={{color: 'red'}}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, coupleErr && {borderColor: 'red'}]}
                value={coupleName}
                onChangeText={text => {
                  setCoupleErr(false);
                  setCoupleName(text);
                }}
                placeholder="Enter couple name"
                placeholderTextColor="#aaa"
              />
              {coupleErr && (
                <Text style={styles.errText}>Please enter couple name</Text>
              )}
            </View>

            {/* Notes */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Note</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Enter notes here..."
                placeholderTextColor="#aaa"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom buttons — OUTSIDE ScrollView, INSIDE KeyboardAvoidingView = rises above keyboard */}
        <View
          style={[styles.bottomBar, {marginBottom: keyboardVisible ? 30 : 0}]}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleFinalSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.saveText}>{sale_id ? 'Update' : 'Save'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SaleFinalForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  scrollContent: {
    paddingBottom: 16,
  },
  form: {
    padding: 16,
  },
  fieldGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
    fontFamily: fonts.semiBold,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FFF',
    color: '#000',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  errText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelText: {
    color: '#4B5563',
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F05A28',
    alignItems: 'center',
  },
  saveText: {
    color: '#FFF',
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});
