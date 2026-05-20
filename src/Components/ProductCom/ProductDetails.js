import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {APIS} from '../../../utils/Apis';
import {fonts} from '../../../utils/fonts';

const ProductDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {item} = route.params || {};

  const [deleteVisible, setDeleteVisible] = useState(false);

  const data = item || {};

  const handleEdit = () => {
    navigation.navigate('ItemFormScreen', {item: data});
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(APIS.DELETE_PRODUCT, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({product_id: data.product_id}),
      });

      const result = await response.json();

      if (result.code === 200) {
        setDeleteVisible(false);
        navigation.goBack();
      } else {
        console.log('Delete failed:', result);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Product Details</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleEdit}>
            <Icon name="pencil-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDeleteVisible(true)}
            style={{marginLeft: 20}}>
            <Icon name="delete-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Info Card */}
        <View style={styles.infoCard}>
          <DetailRow
            icon="cube-outline"
            label="Item Name"
            value={data.itemName || '—'}
          />
          <DetailRow
            icon="package-variant"
            label="Product Name"
            value={data.prodName}
          />
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal – exactly same style as your PartyProfile */}
      <Modal transparent visible={deleteVisible} animationType="fade">
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setDeleteVisible(false)}>
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Product?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this product?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setDeleteVisible(false)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#D0D5DD',
                  marginRight: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FFFFFF',
                }}
                activeOpacity={0.8}>
                <Text
                  style={{
                    color: '#344054',
                    fontFamily: fonts.semiBold,
                    fontSize: 14,
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                style={{
                  backgroundColor: '#FF4D4F',
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                  elevation: 3,
                }}
                activeOpacity={0.8}>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontFamily: fonts.semiBold,
                    fontSize: 14,
                  }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const DetailRow = ({icon, label, value}) => (
  <View style={styles.detailRow}>
    <Icon name={icon} size={22} color="#64748b" style={styles.detailIcon} />
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F05A28',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailIcon: {
    marginRight: 16,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: fonts.medium,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
    fontFamily: fonts.semiBold,
  },

  // Modal styles – matched exactly to your PartyProfile version
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    marginBottom: 18,
    color: '#000',
  },
  modalText: {
    color: '#555',
    marginBottom: 20,
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default ProductDetails;
