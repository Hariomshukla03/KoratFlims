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

const QuotationFinalForm = ({route}) => {
  const navigation = useNavigation();

  // ── All data passed from QuotationDetailsForm ──────────────────────────────
  const {
    quotation_id,
    selectedMobile,
    entryDateString,
    sendpartyName,
    selectedStaff,
    sendCoupleName, // pre-filled if editing
    sendNote, // pre-filled if editing
    quotations,
    grandTotal,
    discount,
    Finaltotal,
  } = route.params || {};

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

  // ── Local state ────────────────────────────────────────────────────────────
  const [coupleName, setCoupleName] = useState(sendCoupleName || '');
  const [notes, setNotes] = useState(sendNote || '');
  const [loading, setLoading] = useState(false);
  const [coupleErr, setCoupleErr] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  // ── Final Submit ───────────────────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    if (!coupleName.trim()) {
      setCoupleErr(true);
      return;
    }
    setCoupleErr(false);

    const isUpdate = !!quotation_id;

    const payload = {
      party_id: selectedMobile || '',
      quotation_date: entryDateString,
      function_side: '',
      party_name: sendpartyName || '',
      city_name: '',
      staff_id: selectedStaff,
      couple_name: coupleName.trim(),
      notes: notes.trim() || '',
      sub_total: Number(grandTotal) || 0,
      discount: Number(discount) || 0,
      quotation_total: Number(Finaltotal) || 0,
      discount_type: 'percentage',
      subFunctions:
        quotations && quotations.length > 0
          ? quotations.map(qutn => {
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
                  : [];

              return {
                function_date: qutn.function_date || '',
                program_id: qutn.program_id || '',
                products: productsArray,
              };
            })
          : [],
    };

    if (isUpdate) {
      payload.quotation_id = quotation_id;
    }

    try {
      setLoading(true);
      const apiUrl = isUpdate ? APIS.UPDATE_QUOTATION : APIS.ADD_QUOTATION;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log('Final Submit Response:', result);

      if (result?.code === 200) {
        setLoading(false);
        navigation.navigate('QuotationScreen');
      } else {
        setLoading(false);
        alert(result?.message || 'Failed to save quotation. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Network error:', error);
      alert('Network error – please check your connection.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 30}
        style={{flex: 1}}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={25} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {quotation_id
              ? `Update Quotation (${sendpartyName})`
              : `Add Quotation (${sendpartyName})`}
          </Text>
        </View>

        {/* ── Step Indicator ── */}
        <StepIndicator step={3} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* ── Couple Name ── */}
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

            {/* ── Notes ── */}
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
              <Text style={styles.saveText}>
                {quotation_id ? 'Update' : 'Save'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default QuotationFinalForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 20,
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
    padding: 16,
  },

  // ── Summary Card ────────────────────────────────────────────────────────────
  summaryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: fonts.medium,
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
    fontFamily: fonts.semiBold,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
    marginTop: 2,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: '#F05A28',
  },

  // ── Fields ──────────────────────────────────────────────────────────────────
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

  // ── Bottom Bar ───────────────────────────────────────────────────────────────
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 4,
    position: 'absolute', // 👈 KEY FIX
    bottom: 0,
    left: 0,
    right: 0,
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
