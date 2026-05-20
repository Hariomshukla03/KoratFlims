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
import { fonts } from '../../../utils/fonts';   // ← apna path adjust kar lena

const QuotationSelector = ({
  data = [],           // finalDataQuotn wala array
  value,
  onChange,
  error,
  placeholder = "Select Quotation",
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const searchRef = useRef(null);

  const selectedItem = data.find(item => item.value === value);

  // Filter quotations
  const filteredData = data.filter(item =>
    item.label.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (item) => {
    setModalVisible(false);
    setSearchText('');
    onChange(item);        // pura item bhej rahe hain (value + couple_name + party_id)
  };

  // Auto open keyboard
  const openKeyboard = () => {
    setTimeout(() => {
      searchRef.current?.focus();
    }, 250);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>
        Quotation <Text style={styles.required}>*</Text>
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
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Icon name="chevron-down" size={20} color="#64748b" />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modal with Search */}
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
                
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Quotation</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Icon name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                {/* Search Input */}
                <View style={styles.searchContainer}>
                  <Icon name="magnify" size={20} color="#64748b" />
                  <TextInput
                    ref={searchRef}
                    style={styles.searchInput}
                    placeholder="Search Quotation..."
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                </View>

                {/* List */}
                <FlatList
                  data={filteredData}
                  keyExtractor={(item) => item.value}
                  keyboardShouldPersistTaps="handled"
                  style={styles.list}
                  renderItem={({ item }) =>{
                    const isSelected = item.value === value;
                    return (

                    <TouchableOpacity
                      style={[styles.listItem,isSelected && styles.selectedListItem,]}
                      onPress={() => handleSelect(item)}
                    >
                      <Text style={styles.listItemText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>No matching quotation found</Text>
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

export default QuotationSelector;

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
    fontFamily: fonts.semiBold,
  },
  required: { color: '#ff4d4f' },
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
    color: '#b9b9b9',
  },
  errorText: {
    color: '#f91515',
    fontSize: 13,
    marginTop: 4,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  selectedListItem: {
    backgroundColor: '#fef1e6',     // ← Aapka desired color
  },
  dropdownContainer: {
    position: 'absolute',
    top: 125,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#111',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
    marginLeft: 10,
    color: '#333',
  },
  list: {
    maxHeight: 320,
  },
  listItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  listItemText: {
    fontSize: 14,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    padding: 30,
    color: '#888',
    fontSize: 14,
  },
});