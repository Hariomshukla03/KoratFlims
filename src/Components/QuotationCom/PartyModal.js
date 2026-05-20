import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import {fonts} from '../../../utils/fonts';

const {width} = Dimensions.get('window');

const PartyModal = ({
  visible,
  onClose,
  onSave,
  initialData = null,
  onDelete = null, // optional delete callback
}) => {
  const [form, setForm] = useState({
    partyName: '',
    countryCode: '91',
    phoneNumber: '',
    email: '',
    city: '',
    address: '',
  });

  useEffect(() => {
    if (initialData) {
      let countryCode = '91';
      let phoneNumber = '';

      if (initialData.phone) {
        const phone = initialData.phone.replace(/[^0-9+]/g, '');
        if (phone.startsWith('+')) {
          const num = phone.slice(1);
          countryCode = num.slice(0, 2) || '91';
          phoneNumber = num.slice(2);
        } else if (phone.startsWith('91') && phone.length > 10) {
          countryCode = '91';
          phoneNumber = phone.slice(2);
        } else {
          phoneNumber = phone;
        }
      }

      setForm({
        partyName: initialData.partyName || '',
        countryCode,
        phoneNumber,
        email: initialData.email || '',
        city: initialData.city || '',
        address: initialData.address || '',
      });
    } else {
      setForm({
        partyName: '',
        countryCode: '91',
        phoneNumber: '',
        email: '',
        city: '',
        address: '',
      });
    }
  }, [initialData, visible]);

  const handleSave = () => {
    if (!form.partyName.trim() || !form.phoneNumber.trim()) {
      alert('Party Name and Phone Number are required');
      return;
    }

    const cleanedPhone = form.phoneNumber.replace(/\D/g, '');
    const fullPhone = `+${form.countryCode}${cleanedPhone}`;

    const data = {
      partyName: form.partyName.trim(),
      phone: fullPhone,
      email: form.email.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
    };

    onSave(data, !!initialData); // second arg = is update
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      avoidKeyboard={true}
      backdropOpacity={0.5}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {initialData ? 'Edit Party' : 'Add Party'}
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            {/* Party Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Party Name *</Text>
              <TextInput
                style={styles.input}
                value={form.partyName}
                onChangeText={text => setForm({...form, partyName: text})}
                placeholder="Enter party name"
                placeholderTextColor="#aaa"
              />
            </View>

            {/* Phone */}
            <View style={styles.field}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.plus}>+</Text>
                  <TextInput
                    style={styles.countryCodeInput}
                    value={form.countryCode}
                    onChangeText={text => setForm({...form, countryCode: text})}
                    keyboardType="phone-pad"
                    maxLength={4}
                    placeholder="91"
                  />
                </View>

                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  value={form.phoneNumber}
                  onChangeText={text => setForm({...form, phoneNumber: text})}
                  keyboardType="phone-pad"
                  placeholder="98765 43210"
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={text => setForm({...form, email: text})}
                placeholder="example@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#aaa"
              />
            </View>

            {/* City */}
            <View style={styles.field}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={form.city}
                onChangeText={text => setForm({...form, city: text})}
                placeholder="Surat / Ahmedabad / etc."
                placeholderTextColor="#aaa"
              />
            </View>

            {/* Address */}
            <View style={styles.field}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.address}
                onChangeText={text => setForm({...form, address: text})}
                placeholder="Street, area, landmark..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#aaa"
              />
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.btnTextCancel}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.btnTextSave}>
                {initialData ? 'Update' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Optional Delete button - only show when editing */}
          {initialData && onDelete && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => {
                if (window.confirm('Delete this party?')) {
                  onDelete(initialData);
                  onClose();
                }
              }}>
              <Text style={styles.deleteText}>Delete Party</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
  },
  header: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    color: '#111',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  field: {
    marginTop: 16,
  },
  label: {
    fontSize: 15,
    color: '#444',
    marginBottom: 6,
    fontFamily: fonts.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    width: 90,
  },
  plus: {
    fontSize: 16,
    marginLeft: 10,
    color: '#555',
  },
  countryCodeInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    textAlign: 'center',
  },
  phoneInput: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnTextCancel: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#333',
  },
  btnTextSave: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: 'white',
  },
  deleteBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 20,
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 15,
    fontFamily: fonts.medium,
  },
});

export default PartyModal;
