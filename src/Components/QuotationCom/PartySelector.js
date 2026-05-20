import React, {useState, useRef, useEffect} from 'react';
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
import {fonts} from '../../../utils/fonts';

const PartySelector = ({
  data = [],
  value,
  onChange,
  error,
  placeholder = 'Mobile Number (Party Name)',
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const searchInputRef = useRef(null);

  const selectedItem = data.find(item => item.value === value);

  const filteredData = data.filter(item =>
    item.label.toLowerCase().includes(searchText.toLowerCase()),
  );

  const finalList = [
    {label: `+ Add ${searchText}`, value: 'addnew'},
    ...filteredData,
  ];

  const handleSelect = item => {
    setModalVisible(false);
    setSearchText('');
    onChange(item);
  };

  // This forces keyboard to open after modal is shown
  const openKeyboard = () => {
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 300); // 300ms delay usually works best
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>
        Mobile Number <Text style={styles.required}>*</Text>
      </Text>

      {/* Dropdown Trigger */}
      <TouchableOpacity
        style={styles.selector}
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}>
        <Text
          style={[styles.selectedText, !selectedItem && styles.placeholderText]}
          numberOfLines={1}>
          {selectedItem ? selectedItem.label : placeholder}
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
        onShow={openKeyboard}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownContainer}>
                {/* Search Input */}
                <View style={styles.searchContainer}>
                  <Icon name="magnify" size={20} color="#64748b" />
                  <TextInput
                    ref={searchInputRef}
                    style={styles.searchInput}
                    placeholder="Search mobile or party name..."
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText}
                    keyboardType="default"
                    returnKeyType="done"
                  />
                </View>

                {/* Scrollable List */}
                <FlatList
                  data={finalList}
                  keyExtractor={(item, index) => `${item.value}-${index}`}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                  style={styles.list}
                  renderItem={({item}) => {
                    const isSelected = item.value === value;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.listItem,
                          isSelected && styles.selectedListItem,
                        ]}
                        onPress={() => handleSelect(item)}>
                        <Text style={styles.listItemText}>{item.label}</Text>
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>
                      {searchText.trim()
                        ? 'No matching result'
                        : 'No parties found'}
                    </Text>
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

export default PartySelector;

const styles = StyleSheet.create({
  container: {marginBottom: 12},
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
    fontFamily: fonts.semiBold,
  },
  required: {color: '#ff4d4f'},
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
  placeholderText: {color: '#b9b9b9'},
  errorText: {
    color: '#f91515',
    fontSize: 13,
    marginTop: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 120, // Adjust if needed (distance below the field)
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 340,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedListItem: {
    backgroundColor: '#fef1e6', // ← Aapka desired color
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 4,
    marginLeft: 8,
    color: '#333',
  },
  list: {
    maxHeight: 280,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  listItemText: {
    fontSize: 13.5,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    padding: 25,
    color: '#888',
    fontSize: 14,
  },
});
