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

const BookingFinalForm = ({route}) => {
  const navigation = useNavigation();

  const {
    Booking_id,
    selectedMobile,
    entryDateString,
    sendpartyName,
    selectedStaff,
    // pre-filled if editing
    sendCoupleName,
    sendNote,
    sendMapLocation,
    sendOnPlace,
    // quotation data
    quotations,
    grandTotal,
    discount,
    Finaltotal,
  } = route.params || {};

  const [coupleName, setCoupleName] = useState(sendCoupleName || '');
  const [notes, setNotes] = useState(sendNote || '');
  const [mapLocation, setMapLocation] = useState(sendMapLocation || '');
  const [onPlace, setOnPlace] = useState(sendOnPlace || '');
  const [loading, setLoading] = useState(false);
  const [coupleErr, setCoupleErr] = useState(false);
  
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const handleFinalSubmit = async () => {
    if (!coupleName.trim()) {
      setCoupleErr(true);
      return;
    }
    setCoupleErr(false);

    const isUpdate = !!Booking_id;

    const payload = {
      party_id: selectedMobile || '',
      outdoor_date: entryDateString,
      function_side: '',
      party_name: sendpartyName || '',
      city_name: '',
      staff_id: selectedStaff,
      couple_name: coupleName.trim(),
      notes: notes.trim() || '',
      map_location: mapLocation.trim() || '',
      on_place: onPlace.trim() || '',
      sub_total: Number(grandTotal) || 0,
      discount: Number(discount) || 0,
      outdoor_total: Number(Finaltotal) || 0,
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
                          String(
                            (Number(p.qty) || 0) * (Number(p.rate) || 0),
                          ),
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
      payload.outdoor_id = Booking_id;
    }

    try {
      setLoading(true);
      const apiUrl = isUpdate ? APIS.UPDATE_BOOKING : APIS.ADD_BOOKING;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log('Final Submit Response:', result);

      if (result?.code === 200) {
        setLoading(false);
        navigation.navigate('FinalBooking');
      } else {
        setLoading(false);
        alert(result?.message || 'Failed to save booking. Please try again.');
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
          {Booking_id
            ? `Update Booking (${sendpartyName})`
            : `Add Booking (${sendpartyName})`}
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
                numberOfLines={3}
              />
            </View>

            {/* Map Location */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Map Location</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={mapLocation}
                onChangeText={setMapLocation}
                placeholder="Enter map location here..."
                placeholderTextColor="#aaa"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* On Place */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>On Place</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={onPlace}
                onChangeText={setOnPlace}
                placeholder="Enter on place here..."
                placeholderTextColor="#aaa"
                multiline
                numberOfLines={3}
              />
            </View>

          </View>
        </ScrollView>

        {/* Bottom buttons — OUTSIDE ScrollView, INSIDE KeyboardAvoidingView = rises above keyboard */}
        <View style={[styles.bottomBar, { marginBottom: keyboardVisible ? 30 : 0 },]}>
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
                {Booking_id ? 'Update' : 'Save'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BookingFinalForm;

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
    minHeight: 60,
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