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
import React, {useEffect, useRef, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, validatePathConfig} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import {APIS} from '../../../utils/Apis';
import {fonts} from '../../../utils/fonts';
import DateTimePicker from '@react-native-community/datetimepicker';
import {ProgressBar} from 'react-native-paper';
import PartySelector from './PartySelector';
import StepIndicator from '../Loaders/StepIndicator';

const QuotationForm = ({route}) => {
  const dropdownRef = useRef(null);
  const {item} = route.params || {};
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

  const [dropdownData, setDropdownData] = useState([]);
  const [data, setData] = useState([]);
  const [entryDate, setEntryDate] = useState();
  const [entryDateString, setEntryDateString] = useState('');

  const [selectedMobile, setSelectedMobile] = useState(null);
  const [search, setSearch] = useState('');
  const [showPartyForm, setShowPartyForm] = useState(false);
  const [showEntryDate, setShowEntryDate] = useState(false);
  const [quotation_id, setquotation_id] = useState();
  const [sendpartyName, setSendPartyName] = useState();
  const [sendCoupleName, setSendCoupleName] = useState();
  const [sendNote, setSendNote] = useState();
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [searchMobile, setSearchMobile] = useState('');
  // Fetch party list
  useEffect(() => {
    if (item) {
      console.log('Item is this', item);
      setEntryDate(
        item.quotation_date ? new Date(item.quotation_date) : new Date(),
      );
      setEntryDateString(item.quotation_date);
      setSelectedMobile(item.party_id);
      setquotation_id(item.quotation_id);
      setSendCoupleName(item.couple_name);
      setSendNote(item.notes);
    }
  }, []);
  const getParty = async () => {
    try {
      const res = await fetch(APIS.PARTY_LIST);
      const json = await res.json();
      setDropdownData(json?.payload || []);
    } catch (err) {
      console.error('Failed to load parties:', err);
    }
  };

  useEffect(() => {
    getParty();
    if (!item) {
      const today = new Date();

      const day = today.getDate().toString().padStart(2, '0');
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const year = today.getFullYear();

      const formatted = `${day}-${month}-${year}`;

      setEntryDate(today);
      setEntryDateString(formatted);
    }
  }, []);

  useEffect(() => {
    if (dropdownData.length > 0) {
      const newData = dropdownData.map(i => ({
        label: `${i.party_mobile} (${i.party_name})`,
        value: i.party_id,
      }));
      setData(newData);
    }
  }, [dropdownData]);

  const handleChange = (name, value) => {
    setForm(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = async () => {
    const err = {};
    console.log('step1');
    if (!form.partyName) {
      err.name = 'Please enter party name';
    }
    if (!form.phoneNumber) {
      err.mobile = 'Please enter phone number';
    }
    if (form.phoneNumber.length < 10) {
      err.mobile = 'Please enter 10 Digit phone number';
    }
    console.log('step2');
    setErrors(err);
    console.log(errors);
    if (Object.keys(err).length > 0) return;
    console.log('step3');

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
      console.log('step4', data);
      if (data.code === 200) {
        // console.log(data.payload.party_id)
        const newParty = data.payload;
        getParty();
        setDropdownData(prev => [...prev, newParty]);
        setSelectedMobile(newParty.party_id);
        setShowPartyForm(false);
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };
  const handleNextPage = async () => {
    err = {};
    if (!selectedMobile) {
      err.selectedMobile = 'Please fill the required details';
    }
    if (selectedMobile === 'addnew') {
      err.selectedMobile = 'Please fill the required details';
    }

    setErrors(err);
    if (Object.keys(err).length > 0) return;
    try {
      const partyName = await getPartyName();

      if (partyName) {
        navigation.navigate('QuotationDetailForm', {
          quotation_id,
          selectedMobile,
          entryDateString,
          sendpartyName: partyName,
          sendCoupleName,
          sendNote,
        });
      }
    } catch (error) {
      console.log('Navigation error:', error);
    }
  };
  const getPartyName = async () => {
    try {
      const res = await fetch(APIS.PARTY_DETAIL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          party_id: selectedMobile,
        }),
      });

      const data = await res.json();

      if (data?.payload) {
        const name = data.payload.party_name || '';
        setSendPartyName(name);
        return name;
      }

      return null;
    } catch (error) {
      console.log('Error fetching party name:', error);
      return null;
    }
  };

  const filterData = data.filter(item =>
    item.label.toLowerCase().includes(search.toLowerCase()),
  );

  // const finalData = [
  //   {label: `+ Add ${search}`, value: 'addnew'},
  //   ...filterData,
  // ];

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
              {item ? 'Update Quotation' : `Add New Quotation`}
            </Text>
          </View>
          <StepIndicator step={1} />

          <View style={styles.form}>
            <PartySelector
              data={data} // ← your existing data array (not finalData)
              value={selectedMobile}
              onChange={item => {
                if (item.value === 'addnew') {
                  setShowPartyForm(true);
                } else {
                  if (errors.selectedMobile) {
                    setErrors(prev => ({...prev, selectedMobile: null}));
                  }
                  setSelectedMobile(item.value);
                }
              }}
              error={errors.selectedMobile}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Entry Date <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputGroup, {flex: 1, marginRight: 1}]}>
                <TouchableOpacity
                  style={styles.inputWrapper}
                  activeOpacity={0.7}
                  onPress={() => setShowEntryDate(true)}>
                  <Icon name="calendar" size={20} color="#64748b" />
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={'#b9b9b9'}
                    value={entryDateString}
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>

                {showEntryDate && (
                  <DateTimePicker
                    value={entryDate}
                    mode="date"
                    onChange={(event, selectedDate) => {
                      setShowEntryDate(false);
                      if (event.type === 'set' && selectedDate) {
                        setEntryDate(selectedDate);

                        const day = selectedDate
                          .getDate()
                          .toString()
                          .padStart(2, '0');
                        const month = (selectedDate.getMonth() + 1)
                          .toString()
                          .padStart(2, '0');
                        const year = selectedDate.getFullYear();
                        const formatDate = `${day}/${month}/${year}`;

                        setEntryDateString(formatDate);
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}
              </View>
              {errors.selectedMobile && (
                <Text style={{color: '#f91515'}}>{errors.selectedMobile}</Text>
              )}
            </View>

            {/* Submit */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleNextPage}>
              <Text style={styles.submitText}>Next</Text>
            </TouchableOpacity>
          </View>

          <Modal
            visible={showPartyForm}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowPartyForm(false)}>
            <TouchableWithoutFeedback onPress={() => setShowPartyForm(false)}>
              <View style={modalStyles.overlay}>
                <TouchableWithoutFeedback>
                  <View style={modalStyles.modalContainer}>
                    {/* Header */}
                    <View style={modalStyles.modalHeader}>
                      <Text style={modalStyles.modalTitle}>Add Party</Text>
                      <TouchableOpacity onPress={() => setShowPartyForm(false)}>
                        <Icon name="close" size={24} color="#333" />
                      </TouchableOpacity>
                    </View>

                    <ScrollView
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}>
                      {/* Party Name */}
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
                          <Text style={{color: '#f91515'}}>{errors.name}</Text>
                        )}
                      </View>

                      {/* Phone */}
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
                              onChangeText={text => {
                                handleChange('countryCode', text);
                              }}
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
                          <Text style={{color: '#f91515'}}>
                            {errors.mobile}
                          </Text>
                        )}
                      </View>

                      {/* Email */}
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

                      {/* City */}
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

                      {/* Address */}
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

                    {/* Buttons */}
                    <View style={modalStyles.buttonRow}>
                      <TouchableOpacity
                        style={modalStyles.cancelBtn}
                        onPress={() => setShowPartyForm(false)}>
                        <Text style={modalStyles.cancelText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={modalStyles.saveBtn}
                        onPress={() => {
                          handleSubmit();

                          // setForm(prev => ({
                          //   ...prev,
                          //   partyName: '',
                          //   phoneNumber: '',
                          //   partyEmail: '',
                          //   partyCity: '',
                          //   partyAddress: '',
                          // }));
                        }}>
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

export default QuotationForm;

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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    marginBottom: 6,
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
    paddingVertical: 8,
    fontSize: 15,
    color: '#333',
  },
  submitBtn: {
    backgroundColor: '#F05A28',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 40,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  dropdown: {
    height: 45,
    width: '100%',
    marginLeft: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 1,
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
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#111',
  },
  field: {
    marginTop: 4,
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
    marginTop: 20,
    gap: 10,
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
