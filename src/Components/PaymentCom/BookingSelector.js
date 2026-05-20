import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fonts } from '../../utils/fonts';

const BookingSelector = ({
  data = [],           // bookings array jo aap formatted kar rahe ho
  value,
  onChange,
  placeholder = "Select Booking",
  error,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchRef = useRef(null);

  const selectedItem = data.find(item => item.value === value);

  // Filter bookings
  const filteredData = data.filter(item =>
    item.label.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (item) => {
    setModalVisible(false);
    setSearchText('');
    onChange(item.value, item);   // value + full raw item dono bhej rahe hain
  };

  // Force keyboard open after modal shows
  const openKeyboard = () => {
    setTimeout(() => {
      searchRef.current?.focus();
    }, 250);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>
        Select Booking <Text style={styles.required}>*</Text>
      </Text>

      {/* Clickable Field */}
      <TouchableOpacity
        style={styles.selector}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.selectedText,
            !selectedItem && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedItem 
            ? selectedItem.label 
            : placeholder}
        </Text>
        <Icon name="chevron-down" size={20} color="#64748b" />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Compact Dropdown Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        onShow={openKeyboard}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownContainer}>
                
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <Icon name="magnify" size={20} color="#64748b" />
                  <TextInput
                    ref={searchRef}
                    style={styles.searchInput}
                    placeholder="Search by Outdoor ID, Couple Name or Mobile..."
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText}
                    autoCapitalize="none"
                  />
                </View>

                {/* List */}
                <FlatList
                  data={filteredData}
                  keyExtractor={(item) => item.value}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                  style={styles.list}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.listItem}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={styles.listItemText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No matching booking found</Text>
                  }
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default BookingSelector;

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: {
    fontSize: 15.5,
    fontFamily: fonts.medium || '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  required: { color: '#dc2626' },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 48,
  },
  selectedText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  errorText: {
    color: '#f91515',
    fontSize: 13,
    marginTop: 4,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 125,           // Adjust if needed
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
    marginLeft: 10,
    color: '#333',
  },
  list: {
    maxHeight: 320,
  },
  listItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  listItemText: {
    fontSize: 15,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    padding: 30,
    color: '#888',
    fontSize: 14,
  },
});