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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import {APIS} from '../../../utils/Apis';
import {fonts} from '../../../utils/fonts';

const PaymentForm = ({route}) => {
  const {item} = route.params || {};
  console.log("Item",item)
  const navigation = useNavigation();
  

  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    partyName: '',
    countryCode: '91',
    phoneNumber: '',
    partyEmail: '',
    partyCity: '',
    partyAddress: '',
  });

  const [dropdownData, setDropdownData] = useState([]); // parties
  const [dropdownDataOutdoor, setDropdownDataOutdoor] = useState([]); // bookings
  const [data, setData] = useState([]); // formatted parties
  const [dataQuotn, setDataQuotn] = useState([]); // formatted bookings

  const [amount, setAmount] = useState('');
  const [selectedMobile, setSelectedMobile] = useState(null);
  const [selectedOutdoor, setSelectedOutdoor] = useState(null);
  const [paymentMode, setPaymentMode] = useState(null);

  const [search, setSearch] = useState('');
  const [searchQuotn, setSearchQuotn] = useState('');

  const [showPartyForm, setShowPartyForm] = useState(false);

  // Fetch data
  const getParty = async () => {
    try {
      const res = await fetch(APIS.PARTY_LIST);
      const json = await res.json();
      setDropdownData(json?.payload || []);
    } catch (err) {
      console.error('Failed to load parties:', err);
    }
  };

  const getOutdoor = async () => {
    try {
      const res = await fetch(APIS.GET_BOOKING);
      const json = await res.json();
      setDropdownDataOutdoor(json?.payload || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  useEffect(() => {
    getParty();
    getOutdoor();

    if (item) {
      setSelectedOutdoor(item.outdoor_id);
      setSelectedMobile(item.party_id);
      setAmount(item.received);
      setPaymentMode(item.payment_type);
    }
  }, [item]);

  useEffect(() => {
    if (dropdownData.length > 0) {
      const newData = dropdownData.map(i => ({
        label: `${i.party_mobile} (${i.party_name})`,
        value: i.party_id,
      }));
      setData(newData);
    }

    if (dropdownDataOutdoor.length > 0) {
      const newData = dropdownDataOutdoor.map(i => ({
        label: `${i.outdoor_id} (${i.couple_name})  ${i.party_mobile}`,
        value: i.outdoor_id,
        couple_name: i.couple_name,
        party_id: i.party_id,
      }));
      setDataQuotn(newData);
    }
  }, [dropdownData, dropdownDataOutdoor]);

  const handleChange = (name, value) => {
    setForm(prev => ({...prev, [name]: value}));
  };

  const paymentModes = [
    {label: 'Cash', value: 'Cash'},
    {label: 'Online', value: 'Online'},
  ];

  // Add new party
  const handleSubmit = async () => {
    const err = {};

    if (!form.partyName) err.name = 'Please enter party name';
    if (!form.phoneNumber) err.mobile = 'Please enter phone number';
    if(!amount<1) err.amount
    

    setErrors(err);
    if (Object.keys(err).length > 0) return;

    const payload = {
      party_name: form.partyName,
      country_code: form.countryCode,
      party_mobile: form.phoneNumber,
      party_email: form.partyEmail || null,
      city: form.partyCity || null,
      party_address: form.partyAddress || null,
    };

    try {
      const res = await fetch(APIS.PARTY_ADD, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.code === 200) {
        const newParty = data.payload;
        getParty(); // refresh list
        setDropdownData(prev => [...prev, newParty]);
        setSelectedMobile(newParty.party_id);
        setShowPartyForm(false);

        // Optional: clear form after save
        setForm({
          partyName: '',
          countryCode: '91',
          phoneNumber: '',
          partyEmail: '',
          partyCity: '',
          partyAddress: '',
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleNextPage = async () => {
    const err = {};

    if (!selectedMobile) err.selectedMobile = 'Please select party';
    if (!selectedOutdoor) err.selectedOutdoor = 'Please select booking';
    if (!amount) err.amount = 'Please enter amount';
    if (!paymentMode) err.paymentMode = 'Please select payment mode';
    if(amount==="0") err.amount="Amount cannot be 0"

    setErrors(err);
    if (Object.keys(err).length > 0) return;
    const isEdit = !!item;
    const APICALL = isEdit ? APIS.UPDATE_PAYMENT : APIS.ADD_PAYMENT;
    const payload = {
      outdoor_id: selectedOutdoor,
      party_id: selectedMobile,
      received_amt: amount,
      payment_type: paymentMode,
    };
    if (item) {
      payload.outdoor_payment_id  = item.outdoor_payment_id ;
    }
    try {
      const res = await fetch(APICALL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},

        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log(data);
      if (data.code === 200) {
        navigation.navigate('Payment', {refresh:true});
      } else {
        console.log('API Error:', data);
      }  
    } catch (error) {
      console.log('Payment save error:', error);
    }
  };

  const filterData = data.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()),
  );

  const filterDataQuotn = dataQuotn.filter(item =>
    item.label.toLowerCase().includes(searchQuotn.toLowerCase()),
  );

  const finalDataMobile = [
    {label: `+ Add ${search || 'new party'}`, value: 'addnew'},
    ...filterData,
  ];

  const finalDataQuotn = [...filterDataQuotn];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={navigation.goBack}>
              <Icon name="arrow-left" size={25} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.title}>
              {item ? 'Update Payment' : 'New Payment'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Booking <Text style={styles.required}>*</Text>
              </Text>
              <Dropdown
                style={styles.dropdown}
                autoScroll={false}
                searchPlaceholderTextColor="#000"
                itemTextStyle={{color: '#000', marginVertical: -8}}
                placeholderStyle={{color: '#000'}}
                selectedTextStyle={{color: '#000'}}
                inputSearchStyle={{color: '#000'}}
                activeColor="#fef1e6"
                data={finalDataQuotn}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="Select Booking"
                searchPlaceholder="Search..."
                onChangeText={setSearchQuotn}
                value={selectedOutdoor}
                onChange={item => {
                  setErrors(prev => ({...prev, selectedOutdoor: null}));
                  setSelectedOutdoor(item.value);
                  setSelectedMobile(item.party_id);
                }}
              />
              {errors.selectedOutdoor && (
                <Text style={errorText}>{errors.selectedOutdoor}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Mobile Number <Text style={styles.required}>*</Text>
              </Text>
              <Dropdown
                style={styles.dropdown}
                autoScroll={false}
                searchPlaceholderTextColor="#000"
                itemTextStyle={{color: '#000', marginVertical: -8}}
                placeholderStyle={{color: '#000'}}
                selectedTextStyle={{color: '#000'}}
                inputSearchStyle={{color: '#000'}}
                data={finalDataMobile}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                activeColor="#fef1e6"
                placeholder="Mobile Number"
                searchPlaceholder="Search..."
                onChangeText={setSearch}
                value={selectedMobile}
                onChange={item => {
                  if (item.value === 'addnew') {
                    setShowPartyForm(true);
                    return;
                  }
                  setErrors(prev => ({...prev, selectedMobile: null}));
                  setSelectedMobile(item.value);
                }}
              />
              {errors.selectedMobile && (
                <Text style={errorText}>{errors.selectedMobile}</Text>
              )}
            </View>

            <View style={{flexDirection: 'row', gap: 12}}>
              <View style={[styles.inputGroup, {flex: 1}]}>
                <Text style={styles.label}>
                  Amount <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Icon name="currency-inr" size={20} color="#64748b" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter amount"
                    placeholderTextColor="#b9b9b9"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    maxLength={8}
                  />
                </View>
                {errors.amount && (
                  <Text style={errorText}>{errors.amount}</Text>
                )}
              </View>

              <View style={[styles.inputGroup, {flex: 1}]}>
                <Text style={styles.label}>
                  Payment Mode <Text style={styles.required}>*</Text>
                </Text>
                <Dropdown
                  autoScroll={false}
                  style={[styles.dropdown, {width: '100%'}]}
                  searchPlaceholderTextColor="#000"
                  itemTextStyle={{color: '#000', marginVertical: -8}}
                  placeholderStyle={{color: '#000'}}
                  selectedTextStyle={{color: '#000'}}
                  inputSearchStyle={{color: '#000'}}
                  data={paymentModes}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  activeColor="#fef1e6"
                  placeholder="Select Mode"
                  value={paymentMode}
                  onChange={item => {
                    setErrors(prev => ({...prev, paymentMode: null}));
                    setPaymentMode(item.value);
                  }}
                />
                {errors.paymentMode && (
                  <Text style={errorText}>{errors.paymentMode}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleNextPage}>
              <Text style={styles.submitText}>Save Payment</Text>
            </TouchableOpacity>
          </View>

          {/* ── Add Party Modal ── */}
          <Modal
            visible={showPartyForm}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowPartyForm(false)}>
            <TouchableWithoutFeedback onPress={() => setShowPartyForm(false)}>
              <View style={modalStyles.overlay}>
                <TouchableWithoutFeedback>
                  <View style={modalStyles.modalContainer}>
                    <View style={modalStyles.modalHeader}>
                      <Text style={modalStyles.modalTitle}>Add Party</Text>
                      <TouchableOpacity onPress={() => setShowPartyForm(false)}>
                        <Icon name="close" size={24} color="#333" />
                      </TouchableOpacity>
                    </View>

                    <ScrollView
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}>
                      <View style={modalStyles.field}>
                        <Text style={modalStyles.label}>
                          Party Name <Text style={{color: 'red'}}>*</Text>
                        </Text>
                        <TextInput
                          style={modalStyles.input}
                          value={form.partyName}
                          onChangeText={text => {
                            setErrors(prev => ({...prev, name: null}));
                            handleChange('partyName', text);
                          }}
                          placeholder="Enter party name"
                          placeholderTextColor="#aaa"
                        />
                        {errors.name && (
                          <Text style={errorTextModal}>{errors.name}</Text>
                        )}
                      </View>

                      <View style={modalStyles.field}>
                        <Text style={modalStyles.label}>
                          Phone Number <Text style={{color: 'red'}}>*</Text>
                        </Text>
                        <View style={modalStyles.phoneRow}>
                          <View style={modalStyles.countryCodeBox}>
                            <Text style={modalStyles.plus}>+</Text>
                            <TextInput
                              style={modalStyles.countryCodeInput}
                              value={form.countryCode}
                              onChangeText={text =>
                                handleChange('countryCode', text)
                              }
                              keyboardType="phone-pad"
                              maxLength={4}
                            />
                          </View>

                          <TextInput
                            style={[modalStyles.input, modalStyles.phoneInput]}
                            value={form.phoneNumber}
                            onChangeText={text => {
                              handleChange('phoneNumber', text);
                              setErrors(prev => ({...prev, mobile: null}));
                            }}
                            keyboardType="phone-pad"
                            placeholder="Enter your number"
                            placeholderTextColor="#aaa"
                            maxLength={10}
                          />
                        </View>
                        {errors.mobile && (
                          <Text style={errorTextModal}>{errors.mobile}</Text>
                        )}
                      </View>

                      <View style={modalStyles.field}>
                        <Text style={modalStyles.label}>Email</Text>
                        <TextInput
                          style={modalStyles.input}
                          value={form.partyEmail}
                          onChangeText={text =>
                            handleChange('partyEmail', text)
                          }
                          placeholder="example@email.com"
                          placeholderTextColor="#aaa"
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>

                      <View style={modalStyles.field}>
                        <Text style={modalStyles.label}>City</Text>
                        <TextInput
                          style={modalStyles.input}
                          value={form.partyCity}
                          onChangeText={text => handleChange('partyCity', text)}
                          placeholder="Enter city"
                          placeholderTextColor="#aaa"
                        />
                      </View>

                      <View style={modalStyles.field}>
                        <Text style={modalStyles.label}>Address</Text>
                        <TextInput
                          style={[modalStyles.input, modalStyles.textArea]}
                          value={form.partyAddress}
                          onChangeText={text =>
                            handleChange('partyAddress', text)
                          }
                          placeholder="Street, Area, Landmark..."
                          placeholderTextColor="#aaa"
                          multiline
                          numberOfLines={4}
                          textAlignVertical="top"
                        />
                      </View>
                    </ScrollView>

                    <View style={modalStyles.buttonRow}>
                      <TouchableOpacity
                        style={modalStyles.cancelBtn}
                        onPress={() => setShowPartyForm(false)}>
                        <Text style={modalStyles.cancelText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={modalStyles.saveBtn}
                        onPress={handleSubmit}>
                        <Text style={modalStyles.saveText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const errorText = {
  color: '#f91515',
  fontSize: 12,
  marginTop: 4,
};

const errorTextModal = {
  color: '#f91515',
  fontSize: 13,
  marginTop: 4,
};

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
    paddingVertical: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: '#FFF',
    paddingLeft: '25%',
  },
  form: {
    paddingTop: 18,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 8,
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
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 15,
    color: '#333',
  },
  submitBtn: {
    backgroundColor: '#F05A28',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 40,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  dropdown: {
    height: 48,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#111',
  },
  field: {
    marginBottom: 2,
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
    marginTop: 24,
    gap: 12,
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

export default PaymentForm;
