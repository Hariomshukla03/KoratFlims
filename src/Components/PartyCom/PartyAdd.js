import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import ImagePicker from 'react-native-image-crop-picker';
import {APIS} from '../../../utils/Apis';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import {fonts} from '../../../utils/fonts';
import {ActivityIndicator} from 'react-native-paper';

const PartyAdd = ({route}) => {
  const {item} = route.params || {};
  console.log(item);
  const [errors, setErrors] = useState(null);

  const [form, setForm] = useState({
    name: '',
    countryCode: '91',
    mobile: '',
    email: '',
    city: '',
    address: '',
    birthDate: '',
    anniversary: '',
    refBy: '',
    instaId: '',
    partyPhoto: null,
    partyPhotoUri: null,
    couplePhoto: null,
    couplePhotoUri: null,
  });

  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [birthDate, setBirthDate] = useState(new Date());

  const [showAnniversaryPicker, setShowAnniversaryPicker] = useState(false);
  const [anniversaryDate, setAnniversaryDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      console.log(item)
      setForm({
        name: item.party_name || '',
        countryCode: item.country_code || '91',
        mobile: item.party_mobile || '',
        email: item.party_email || '',
        city: item.city || '',
        address: item.party_address || '',
        birthDate: item.birthday_date || '',
        anniversary: item.aniversary_date || '',
        refBy: item.party_reference_by || '',
        instaId: item.instagram_id || '',
        // partyPhoto: item?.party_photo || null,
        partyPhotoUri: item?.party_photo,
        couplePhotoUri: item?.couple_photo,
      });

      // Set birth date if exists
      if (item.birthday_date && typeof item.birthday_date === 'string') {
        const parts = item.birthday_date.split('/');
        if (parts.length === 3) {
          const [d, m, y] = parts;
          const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
          if (!isNaN(dateObj.getTime())) {
            setBirthDate(dateObj);
          }
        }
      }
      if (item.aniversary_date && typeof item.aniversary_date === 'string') {
        const parts = item.aniversary_date.split('/');
        if (parts.length === 3) {
          const [d, m, y] = parts;
          const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
          if (!isNaN(dateObj.getTime())) {
            setAnniversaryDate(dateObj);
          }
        }
      }
    }
  }, [item]);

  const navigation = useNavigation();

  const handleChange = (name, value) => {
    setForm(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = async () => {
    const err = {};
    if (!form.name.trim()) {
      err.name = 'Please enter party name';
    }
    if (!form.mobile.trim()) {
      err.mobile = 'Please enter phone number';
    }
    if (form.mobile.length<10) {
      err.mobile = 'Please enter 10 digit phone number';
    }
    setErrors(err);
    if (Object.keys(err).length > 0) {
      return;
    }
    setLoading(true);
    const payload = {
      ...(item?.party_id && {party_id: item.party_id}),
      party_name: form.name,
      country_code: form.countryCode,
      party_mobile: form.mobile,
      party_email: form.email || null,
      city: form.city || null,
      party_address: form.address || null,
      birthday_date: form.birthDate
        ? form.birthDate.split('/').reverse().join('-')
        : null,
      aniversary_date: form.anniversary
        ? form.anniversary.split('/').reverse().join('-')
        : null,
      party_reference_by: form.refBy || null,
      instagram_id: form.instaId || null,
      party_photo: form.partyPhoto || null,
      couple_photo: form.couplePhoto||null,
    };

    const API_URL = item ? APIS.PARTY_UPDATE : APIS.PARTY_ADD;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log(item ? 'update' : 'add', data);
      if (data.code === 200) {
        setLoading(false);
        navigation.navigate('PartyScreen');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: false,
        includeBase64: true,
        compressImageQuality: 0.8,
      });

      // Store complete base64 data URI
      console.log(image);
      const base64Image = `data:${image.mime};base64,${image.data}`;
      setForm(prev => ({
        ...prev,
        partyPhoto: base64Image,
        partyPhotoUri: image.path,
      }));
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Error picking image:', error);
      }
    }
  };
  const pickImageCouple = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: false,
        includeBase64: true,
        compressImageQuality: 0.8,
      });

      // Store complete base64 data URI
      console.log(image);
      const base64Image = `data:${image.mime};base64,${image.data}`;
      setForm(prev => ({
        ...prev,
        couplePhoto: base64Image,
        couplePhotoUri: image.path,
      }));
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Error picking image:', error);
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity onPress={navigation.goBack}>
              <Text>
                <Icon name="arrow-left" size={25} color="#FFF" />
              </Text>
            </TouchableOpacity>

            <Text style={styles.title}>
              {item ? 'Update Party' : 'Add New Party'}
            </Text>
          </View>

          <View style={styles.photoRow}>
            <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
              {form.partyPhotoUri ? (
                <Image
                  source={{uri: form.partyPhotoUri}}
                  style={styles.photo}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Icon name="camera-plus" size={36} color="#4B7BEC" />
                  <Text style={styles.photoText}>Party Photo</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoContainer} onPress={pickImageCouple}>
              {form.couplePhotoUri ? (
                <Image
                  source={{uri: form.couplePhotoUri}}
                  style={styles.photo}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Icon name="camera-plus" size={36} color="#4B7BEC" />
                  <Text style={styles.photoText}>Couple Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Party Name <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors?.name && {borderColor: 'red'},
                ]}>
                <Icon name="account" size={20} color="#64748b" />
                <TextInput
                  style={[styles.input]}
                  placeholder="Enter party name"
                  placeholderTextColor={'#b9b9b9'}
                  value={form.name}
                  onChangeText={v => {
                    if (errors?.name)
                      setErrors(prev => ({...prev, name: null}));
                    handleChange('name', v);
                  }}
                />
              </View>
              {errors?.name && <Text style={{color: '#f91515'}}>{errors?.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Mobile Number <Text style={styles.required}>*</Text>
              </Text>

              <View style={styles.rowContainer}>
                {/* Country Code Input */}
                <View
                  style={[
                    styles.codeWrapper,
                    errors?.countryCode && {
                      borderColor: '#ef4444',
                      borderWidth: 1.5,
                    },
                  ]}>
                  <TextInput
                    style={styles.codeInput}
                    placeholder="+91"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    maxLength={2}
                    value={form.countryCode || '+91'}
                    onChangeText={v => {
                      const cleaned = v.replace(/[^0-9+]/g, '');
                      handleChange('countryCode', cleaned);
                      if (errors?.countryCode) {
                        setErrors(prev => ({...prev, countryCode: null}));
                      }
                    }}
                  />
                </View>

                {/* Mobile Number Input */}
                <View
                  style={[
                    styles.mobileWrapper,
                    errors?.mobile && {
                      borderColor: '#ef4444',
                      borderWidth: 1.5,
                    },
                  ]}>
                  <Icon
                    name="phone"
                    size={20}
                    color="#64748b"
                    style={{marginLeft: 12}}
                  />

                  <TextInput
                    style={styles.mobileInput}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor="#b9b9b9"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={form.mobile}
                    onChangeText={v => {
                      const numeric = v.replace(/[^0-9]/g, '');
                      handleChange('mobile', numeric);
                      if (errors?.mobile) {
                        setErrors(prev => ({...prev, mobile: null}));
                      }
                    }}
                  />
                </View>
              </View>

              {/* Error messages */}
              {(errors?.countryCode || errors?.mobile) && (
                <Text style={{color:'red'}}>
                  {errors.countryCode || errors.mobile}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Icon name="email-outline" size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  placeholderTextColor={'#b9b9b9'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={v => handleChange('email', v)}
                />
              </View>
            </View>

            
              <View style={[styles.inputGroup, {flex: 1}]}>
                <Text style={styles.label}>City</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="city" size={20} color="#64748b" />
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    placeholderTextColor={'#b9b9b9'}
                    value={form.city}
                    onChangeText={v => handleChange('city', v)}
                  />
                </View>
              </View>


            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Address</Text>
              <View
                style={[
                  styles.inputWrapper,
                  {height: 65, alignItems: 'flex-start'},
                ]}>
                <Icon
                  name="map-marker-outline"
                  size={20}
                  color="#64748b"
                  style={{marginTop: 18}}
                />
                <TextInput
                  style={[styles.input, {height: 65}]}
                  placeholder="Shop no, Area, Landmark..."
                  placeholderTextColor={'#b9b9b9'}
                  multiline
                  value={form.address}
                  onChangeText={v => handleChange('address', v)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
                <Text style={styles.label}>Birth Date</Text>
                <TouchableOpacity
                  style={styles.inputWrapper}
                  activeOpacity={0.7}
                  onPress={() => setShowBirthDatePicker(true)}>
                  <Icon name="cake-variant" size={20} color="#64748b" />

                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={'#b9b9b9'}
                    value={form.birthDate}
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>

                {showBirthDatePicker && (
                  <DateTimePicker
                    value={birthDate}
                    mode="date"
                    // display={Platform.OS === 'ios' ? 'inline' : 'default'} // or 'spinner' / 'calendar'
                    onChange={(event, selectedDate) => {
                      // Close only on Android
                      // if (Platform.OS === 'android') {
                      setShowBirthDatePicker(false);
                      // }

                      // Process only if confirmed
                      if (event.type === 'set' && selectedDate) {
                        setBirthDate(selectedDate);

                        const day = selectedDate
                          .getDate()
                          .toString()
                          .padStart(2, '0');
                        const month = (selectedDate.getMonth() + 1)
                          .toString()
                          .padStart(2, '0');
                        const year = selectedDate.getFullYear();

                        handleChange('birthDate', `${day}/${month}/${year}`);
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}
              </View>

              <View style={[styles.inputGroup, {flex: 1}]}>
                <View style={[styles.inputGroup, {flex: 1}]}>
                  <Text style={styles.label}>Anniversary</Text>
                  <TouchableOpacity
                    style={styles.inputWrapper}
                    activeOpacity={0.7}
                    onPress={() => setShowAnniversaryPicker(true)}>
                    <Icon name="calendar" size={20} color="#64748b" />

                    <TextInput
                      style={styles.input}
                      placeholder="DD/MM/YYYY"
                      placeholderTextColor={'#b9b9b9'}
                      value={form.anniversary}
                      editable={false}
                      pointerEvents="none"
                    />
                  </TouchableOpacity>

                  {showAnniversaryPicker && (
                    <DateTimePicker
                      value={anniversaryDate}
                      mode="date"
                      // display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      onChange={(event, selectedDate) => {
                        // if (Platform.OS === 'android') {
                        setShowAnniversaryPicker(false);
                        // }

                        if (event.type === 'set' && selectedDate) {
                          setAnniversaryDate(selectedDate);

                          const day = selectedDate
                            .getDate()
                            .toString()
                            .padStart(2, '0');
                          const month = (selectedDate.getMonth() + 1)
                            .toString()
                            .padStart(2, '0');
                          const year = selectedDate.getFullYear();

                          handleChange(
                            'anniversary',
                            `${day}/${month}/${year}`,
                          );
                        }
                      }}
                    />
                  )}
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Referred By</Text>
              <View style={styles.inputWrapper}>
                <Icon name="account-arrow-right" size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="Referred by name / party"
                  value={form.refBy}
                  placeholderTextColor={'#b9b9b9'}
                  onChangeText={v => handleChange('refBy', v)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instagram ID</Text>
              <View style={styles.inputWrapper}>
                <Icon name="instagram" size={20} color="#64748b" />
                <TextInput
                  style={styles.input}
                  placeholder="@username"
                  placeholderTextColor={'#b9b9b9'}
                  value={form.instaId}
                  onChangeText={v => handleChange('instaId', v)}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}>
              <Text style={styles.submitText}>
                <Text style={styles.submitText}>
                  {loading
                    ? <ActivityIndicator size={'small'} color='#fff'/>
                    : item
                    ? 'Update Party'
                    : 'Save Party'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PartyAdd;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10, // space between code and mobile field
  },

  codeWrapper: {
    width: 70, // fixed small width
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },

  codeInput: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#111827',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  mobileWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },

  mobileInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 8,
    paddingHorizontal: 8,
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
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: '#FFF',
    paddingLeft: '25%',
  },
  photoRow: {
    flexDirection: 'row',
    gap: 25,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  photoContainer: {
    alignSelf: 'center',
  },
  photo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#4B7BEC',
  },
  photoPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#f0f4ff',
    borderWidth: 2,
    borderColor: '#4B7BEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    fontSize: 12,
    color: '#4B7BEC',
    marginTop: 4,
  },
  form: {
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitBtn: {
    backgroundColor: '#F05A28',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
});
