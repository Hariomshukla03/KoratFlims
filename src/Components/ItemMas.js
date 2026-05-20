import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  BackHandler,
  RefreshControl,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import NothingFound from './NothingFound';
import {APIS} from '../../utils/Apis';
import {fonts} from '../../utils/fonts';
import ItemShimmer from './Loaders/ItemShimmer';

// Dummy festival items data
const dummyFestivalItems = [
  {
    id: '1',
    code: 'DIW-001',
    name: 'Premium Clay Diya Set (12 pcs)',
    price: 349.0,
  },
  {id: '2', code: 'RAK-015', name: 'Designer Rakhi with Lumba', price: 199.0},
  {id: '3', code: 'HOL-008', name: 'Organic Herbal Gulal (100g)', price: 149.0},
  {
    id: '4',
    code: 'XMS-022',
    name: 'LED Christmas Star Light (40 cm)',
    price: 799.0,
  },
  {
    id: '5',
    code: 'DIW-009',
    name: 'Marble Pooja Thali with Kumkum Box',
    price: 1299.0,
  },
  {id: '6', code: 'NEW-001', name: 'Festive LED Lantern (Red)', price: 499.0},
  {id: '7', code: 'NEW-002', name: 'Scented Candle Gift Set', price: 599.0},
];

const ItemMas = () => {
  const navigation = useNavigation();

  const [product, setProduct] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (!product) {
        setLoading(true);
      }
      getProduct();
    }, []),
  );
  const getProduct = async () => {
    const res = await fetch(APIS.PRODUCT_LIST);
    const data = await res.json();
    setProduct(data.payload);
    setLoading(false);
    // console.log(data)
  };

  const filteredItems = product?.filter(
    item =>
      item.product_name.toLowerCase().includes(search.toLowerCase()) ||
      item.amount.toLowerCase().includes(search.toLowerCase()),
  );
  const handleBack = () => {
    if (selectedItem == null) {
      navigation.goBack();
    } else {
      setSelectedItem(null);
    }
  };

  const handleDeletePress = () => {
    if (selectedItem) {
      setDeleteVisible(true);
    }
  };

  const confirmDelete = async id => {
    console.log(id);
    const response = await fetch(APIS.PRODUCT_DELETE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: id,
      }),
    });
    const data = await response.json();
    if (data.code == 200) {
      console.log('deleted sucessfully');
      getProduct();
    }
    setSelectedItem(null);
    setDeleteVisible(false);
  };

  const handleEdit = () => {
    if (selectedItem) {
      navigation.navigate('ItemFormScreen', {item: selectedItem});
      setSelectedItem(null); // optional: clear selection after navigation
    }
  };
  useEffect(() => {
    const backAction = () => {
      if (selectedItem) {
        setSelectedItem(null);
        return true;
      } else {
        navigation.goBack(); // manually go back
        return true;
      }
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => subscription.remove();
  }, [selectedItem]);
  const renderItem = ({item}) => {
    const isSelected = selectedItem?.product_id === item.product_id;

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => setSelectedItem(null)}
        onLongPress={() => setSelectedItem(item)}>
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={2}>
            Item Name:{' '}
            <Text style={{fontFamily: fonts.regular}}>{item.product_name}</Text>
          </Text>

          <Text style={styles.price}>₹ {item.amount}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={{
              height: 26,
              width: 26,
              borderRadius: 18,
              backgroundColor: '#fff',
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 4,
            }}
            onPress={() => navigation.navigate('ItemDetailsScreen', {item})}>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Item</Text>

        <View style={styles.rightHeader}>
          {selectedItem ? (
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionIcon} onPress={handleEdit}>
                <Icon name="pencil-outline" size={22} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionIcon}
                onPress={handleDeletePress}>
                <Icon name="delete-outline" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{width: 40}} />
          )}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Icon name="magnify" size={20} color="#9CA3AF" />

        <TextInput
          placeholder="Search by item name"
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, {flex: 1}]}
          placeholderTextColor="#9CA3AF"
        />

        {search?.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      {loading && <ItemShimmer />}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.product_id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<NothingFound />}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              setLoading(true);
              getProduct();
            }}
            colors={['#F05A28', '#FF8A65', '#F05A28']}
            progressBackgroundColor="#ffffff"
          />
        }
      />

      {/* FAB - Add new */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.addBtn}
        onPress={() => {
          setSelectedItem(null);
          navigation.navigate('ItemFormScreen');
        }}>
        <Icon name="plus" size={26} color="#fff" />
        <Text style={styles.addBtnText}>Add Item</Text>
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
      <Modal transparent visible={deleteVisible} animationType="fade">
        <Pressable
          onPress={() => {
            setDeleteVisible(false);
            setSelectedItem(null);
          }}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Pressable
            onPress={() => {}} // ✅ prevent closing when clicking inside
            style={{
              width: '80%',
              backgroundColor: '#ffffff',
              borderRadius: 14,
              padding: 20,

              // 🔥 optional shadow
              elevation: 5,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 10,
            }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: fonts.bold,
                marginBottom: 18,
                color: '#000',
              }}>
              Delete Item?
            </Text>

            <Text style={{color: '#555', marginBottom: 20}}>
              Are you sure you want to delete this item?
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setDeleteVisible(false);
                  setSelectedItem(null);
                }}
                style={{marginRight: 20}}>
                <Text style={{color: '#666'}}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  confirmDelete(selectedItem?.product_id);
                  setDeleteVisible(false); // ✅ close modal
                }}>
                <Text
                  style={{
                    color: '#FF4D4F',
                    fontFamily: fonts.bold,
                  }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default ItemMas;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f9fa'},

  listContent: {
    paddingVertical: 8,
    paddingBottom: 90,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 56,
    backgroundColor: '#F05A28',
    elevation: 2,
  },

  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#fff',
    paddingLeft: 30,
  },

  rightHeader: {
    width: 80,
    alignItems: 'flex-end',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIcon: {
    padding: 8,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },

  cardSelected: {
    backgroundColor: '#fff4ec',
    borderColor: '#fed7aa',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 12,
    marginBottom: 2,
    paddingHorizontal: 12,
    borderRadius: 14,
    height: 48,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#111827',
  },

  infoContainer: {flex: 1, justifyContent: 'center'},

  codeBadge: {
    backgroundColor: '#fff4ef',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },

  codeText: {
    fontSize: 11,
    fontFamily: fonts.semiBold,
    color: '#0c0a0a',
  },

  name: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#111827',
    marginBottom: 4,
  },

  price: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: '#111827',
  },
  addBtn: {
    position: 'absolute', // ← Yeh important hai
    bottom: 30, // bottom se distance
    right: 16, // right side se distance
    backgroundColor: '#F05A28', // Tumhara original color (blue)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 50, // Fully rounded (pill shape)
    elevation: 8, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 100, // Sabke upar dikhe
  },

  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F05A28',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '82%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 24,
  },

  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.semiBold,
    marginBottom: 12,
    color: '#000',
  },

  modalText: {
    color: '#555',
    marginBottom: 24,
    fontSize: 15,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  modalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  cancelText: {
    color: '#666',
    fontSize: 16,
  },

  deleteText: {
    color: '#FF4D4F',
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },
});
