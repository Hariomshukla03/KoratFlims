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
import DateTimePicker from '@react-native-community/datetimepicker';
import PartySelector from '../QuotationCom/PartySelector';
import {Calendar} from 'react-native-calendars';
const AppointmentForm = ({route}) => {
  const {item} = route.params || {};
  console.log(item);

  const navigation = useNavigation();

  const [errors, setErrors] = useState({});
  const [amount, setAmount] = useState();
  const [appointmentId, setAppointmentId] = useState();
  const [Fnotes, setFNotes] = useState();
  const [mode, setMode] = useState('date');
  const [status, setStatus] = useState('Pending');
  const [form, setForm] = useState({
    partyName: '',
    countryCode: '91',
    phoneNumber: '',
    partyEmail: '',
    partyCity: '',
    partyAddress: '',
  });
  useEffect(() => {
    if (item) {
      setAppointmentId(item?.appointment_id);
      setSelectedMobile(item?.phone);
      setEntryDate(
        item.outdoor_date ? new Date(item.outdoor_date) : new Date(),
      );
      setEntryDateString(item.function_date);
      setStatus(item?.status);
      setSelectedMobile(item.party_id);
      setFNotes(item.notes);
    }
  }, []);

  const [dropdownData, setDropdownData] = useState([]);
  const [dropdownDataQuotn, setDropdownDataQuotn] = useState([]);
  const [dropdownDataStaff, setDropdownDataStaff] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [data, setData] = useState([]);
  const [dataQuotn, setDataQuotn] = useState([]);
  const [dataStaff, setDataStaff] = useState([]);
  const [entryDate, setEntryDate] = useState(new Date());
  const [entryDateString, setEntryDateString] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [deliveryDateString, setDeliveryDateString] = useState();
  const [selectedMobile, setSelectedMobile] = useState(null);
  const [selectedQuotn, setSelectedQuotn] = useState(null);
  const [selectedCouple, setSelectedCouple] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [search, setSearch] = useState('');
  const [searchQuotn, setSearchQuotn] = useState('');
  const [searchStaff, setSearchStaff] = useState('');
  const [showPartyForm, setShowPartyForm] = useState(false);
  const [showEntryDate, setShowEntryDate] = useState(false);
  const [showDeliveryDate, setShowDeliveryDate] = useState(false);
  const [sendpartyName, setSendPartyName] = useState();
  // Fetch party list
  const getParty = async () => {
    try {
      const res = await fetch(APIS.PARTY_LIST);
      const json = await res.json();
      setDropdownData(json?.payload || []);
    } catch (err) {
      console.error('Failed to load parties:', err);
    }
  };
  const getQuotn = async () => {
    try {
      const res = await fetch(APIS.GET_QUOTATION);
      const json = await res.json();
      setDropdownDataQuotn(json?.payload || []);
    } catch (err) {
      console.error('Failed to load parties:', err);
    }
  };
  const getStaff = async () => {
    try {
      const res = await fetch(APIS.STAFF_LIST);
      const json = await res.json();
      setDropdownDataStaff(json?.payload || []);
    } catch (err) {
      console.error('Failed to load parties:', err);
    }
  };
  const getBooking = async () => {
    if (item) {
      try {
        const res = await fetch(APIS.DETAILS_SALE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sale_id: item.sale_id,
          }),
        });
        const json = await res.json();

        setBookingData(json || []);

        if (json?.outdoor_detail?.staff_id) {
          setSelectedStaff(String(json.outdoor_detail.staff_id));
        }
      } catch (err) {
        console.error('Failed to load parties:', err);
      }
    }
  };

  useEffect(() => {
    getParty();
    getQuotn();
    getStaff();
    getBooking();
    if (!item) {
      const today = new Date();

      const day = today.getDate().toString().padStart(2, '0');
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const year = today.getFullYear();

      const formatted = `${day}-${month}-${year}`;

      setEntryDate(today);
      setEntryDateString(formatted);
      setDeliveryDateString(formatted);
    }
  }, [item]);
  useEffect(() => {
    if (item && dataQuotn.length > 0) {
      const found = dataQuotn.find(i => i.party_id == item.party_id);
      if (found) setSelectedQuotn(String(found.value));
    }
  }, [item, dataQuotn]);

  useEffect(() => {
    if (dropdownData.length > 0) {
      const newData = dropdownData.map(i => ({
        label: `${i.party_mobile} (${i.party_name})`,
        value: i.party_id,
      }));
      setData(newData);
    }
    if (dropdownDataQuotn.length > 0) {
      const newData = dropdownDataQuotn.map(i => ({
        label: `${i.quotation_id} (${i.couple_name})  ${i.party_mobile}`,
        value: i.quotation_id,
        couple_name: i.couple_name,
        party_id: i.party_id,
      }));
      setDataQuotn(newData);
    }
    if (dropdownDataStaff.length > 0) {
      const newData = dropdownDataStaff.map(i => ({
        label: `${i.staff_master_name}`,
        value: `${i.staff_master_id}`,
      }));
      setDataStaff(newData);
    }
  }, [dropdownData, dropdownDataQuotn, dropdownDataStaff]);

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
      err.mobile = 'Please enter 10 digit phone number';
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
  const handleSave = async () => {
    err = {};
    if (!selectedMobile || !entryDate || !status) {
      err.selectedMobile = 'Please fill the required details';
    }

    if (selectedMobile === 'addnew') {
      err.selectedMobile = 'Please fill the required details';
    }

    setErrors(err);
    if (Object.keys(err).length > 0) return;
    try {
      const partyName = await getPartyName();

      // ✅ Split date & time (from single variable)
      const dateOnly = entryDate.toLocaleDateString();
      const timeOnly = entryDate.toLocaleTimeString();

      // ✅ Prepare full debug object
      const allData = {
        // Party
        party_id: selectedMobile,
        party_name: partyName,
        // Date & Time
        full_entry_date: entryDate,
        entry_date_string: entryDateString,
        date_only: dateOnly,
        time_only: timeOnly,
        delivery_date_string: deliveryDateString,
        // Other
        status: status,
        notes: Fnotes,
      };

      console.log('===== FINAL FORM DATA =====');
      console.log(allData);

      // 🔥 Individual logs (optional but useful)
      console.log('Party:', selectedMobile, partyName);
      console.log('Date:', dateOnly);
      console.log('Time:', timeOnly);
      console.log('Notes:', Fnotes);
    } catch (error) {
      console.log('Error in handleSave:', error);
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
  const filterDataQuotn = dataQuotn.filter(item =>
    item.label.toLowerCase().includes(searchQuotn.toLowerCase()),
  );
  const filterDataStaff = dataStaff.filter(item =>
    item.label.toLowerCase().includes(searchStaff.toLowerCase()),
  );

  const finalDataMobile = [
    {label: `+ Add ${search}`, value: 'addnew'},
    ...filterData,
  ];
  const finalDataQuotn = [...filterDataQuotn];
  const finalDataStaff = [...filterDataStaff];

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
              {item ? `Update Appointment` : `Add Appointment `}
            </Text>
          </View>

          <View style={styles.form}>
           
            <PartySelector
              data={data}
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
            />
            <View
              style={{flexDirection: 'row', gap: 6, justifyContent: 'center'}}>
              <View style={[styles.inputGroup, {flex: 1}]}>
                <Text style={styles.label}>
                  Appointment Date<Text style={styles.required}>*</Text>
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
                      mode={mode}
                      is24Hour={false}
                      onChange={(event, selectedDate) => {
                        if (event.type !== 'set' || !selectedDate) {
                          setShowEntryDate(false);
                          return;
                        }

                        let updatedDate = new Date(entryDate); // keep old value

                        if (mode === 'date') {
                          // ✅ Set Date only
                          updatedDate.setFullYear(
                            selectedDate.getFullYear(),
                            selectedDate.getMonth(),
                            selectedDate.getDate(),
                          );

                          setEntryDate(updatedDate);

                          // switch to time picker
                          setMode('time');
                          setShowEntryDate(true);
                        } else {
                          // ✅ Set Time only
                          updatedDate.setHours(
                            selectedDate.getHours(),
                            selectedDate.getMinutes(),
                          );

                          setEntryDate(updatedDate);
                          setShowEntryDate(false);
                          setMode('date');

                          // ✅ Format final date-time
                          const day = updatedDate
                            .getDate()
                            .toString()
                            .padStart(2, '0');
                          const month = (updatedDate.getMonth() + 1)
                            .toString()
                            .padStart(2, '0');
                          const year = updatedDate.getFullYear();

                          const formatted = `${day}-${month}-${year} ${updatedDate.toLocaleTimeString()}`;

                          setEntryDateString(formatted);

                          console.log(updatedDate.toLocaleString());
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  )}
                </View>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Status <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    status === 'Pending' && styles.typeBtnActive,
                  ]}
                  onPress={() => setStatus('Pending')}>
                  <Text
                    style={[
                      styles.typeText,
                      status === 'Pending' && {color: '#fff'},
                    ]}>
                    Pending
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    status === 'Confirmed' && styles.typeBtnActive,
                  ]}
                  onPress={() => setStatus('Confirmed')}>
                  <Text
                    style={[
                      styles.typeText,
                      status === 'Confirmed' && {color: '#fff'},
                    ]}>
                    Confirmed
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    status === 'Cancelled' && styles.typeBtnActive,
                  ]}
                  onPress={() => setStatus('Cancelled')}>
                  <Text
                    style={[
                      styles.typeText,
                      status === 'Cancelled' && {color: '#fff'},
                    ]}>
                    Cancelled
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.type && <Text style={styles.error}>{errors.type}</Text>}
            </View>
            <View style={[styles.inputGroup]}>
              <Text style={styles.label}>Note</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,

                  {
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 9,
                    fontSize: 14.5,
                    color: '#222',
                  },
                ]}
                value={Fnotes}
                onChangeText={v => setFNotes(v)}
                placeholder="Note"
                multiline
                numberOfLines={3}
                placeholderTextColor="#aaa"
              />
            </View>
            {(errors.selectedMobile || errors.selectedQuotn) && (
              <View>
                <Text style={{color: '#f91515'}}>{errors.selectedMobile}</Text>
                <Text style={{color: '#f91515'}}>{errors.selectedQuotn}</Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
              <Text style={styles.submitText}>Save</Text>
            </TouchableOpacity>
          </View>
          

          <Modal
            visible={showPartyForm}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowPartyForm(false)}
            >
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

export default AppointmentForm;

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
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
    fontFamily: fonts.semiBold,
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
