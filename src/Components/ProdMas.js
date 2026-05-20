///Product ki jaghe pe program(halsi , Wedding ,etc,etc) and Product is in Item ////

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  Modal,
  SafeAreaView,
  BackHandler,
  RefreshControl,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import NothingFound from './NothingFound';
import {fonts} from '../../utils/fonts';
import ItemShimmer from './Loaders/ItemShimmer';
import ProductShimmer from './Loaders/ProductShimmer';
import {APIS} from '../../utils/Apis';
import {Divider, Menu} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Sample dummy products (unchanged)
const dummyProducts = [
  {
    id: '1',
    productCode: 'PROD-001',
    itemName: 'Wireless Earbuds Pro',
    prodName: 'Noise Cancelling True Wireless Earbuds',
  },
  {
    id: '2',
    productCode: 'PROD-002',
    itemName: 'Smart LED Bulb',
    prodName: 'WiFi Enabled 10W RGB Color Changing Bulb',
  },
  {
    id: '3',
    productCode: 'PROD-003',
    itemName: 'Portable Power Bank',
    prodName: '20000mAh Fast Charging Powerbank with Dual USB',
  },
  {
    id: '4',
    productCode: 'PROD-004',
    itemName: 'Bluetooth Speaker',
    prodName: '20W Portable Waterproof Wireless Speaker',
  },
  {
    id: '5',
    productCode: 'PROD-005',
    itemName: 'Action Camera',
    prodName: '4K 60fps Waterproof Sports & Adventure Camera',
  },
  {
    id: '6',
    productCode: 'PROD-006',
    itemName: 'Fast Charger',
    prodName: '65W GaN USB-C Fast Charger with PD & QC',
  },
  {
    id: '7',
    productCode: 'PROD-007',
    itemName: 'Fitness Smartwatch',
    prodName: '1.78" AMOLED Display Smartwatch with SpO2 & Heart Rate',
  },
  {
    id: '8',
    productCode: 'PROD-008',
    itemName: 'Gaming Mouse',
    prodName: 'RGB Wireless Gaming Mouse 16000 DPI',
  },
  {
    id: '9',
    productCode: 'PROD-009',
    itemName: 'Mechanical Keyboard',
    prodName: 'RGB Backlit Mechanical Gaming Keyboard',
  },
  {
    id: '10',
    productCode: 'PROD-010',
    itemName: 'SSD Drive',
    prodName: '1TB NVMe M.2 PCIe Gen4 SSD',
  },
];
/// Backend API For the PRODUCT is in the ITEM.MAS file ////
const ProdMas = () => {
  const navigation = useNavigation();

  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [menuVisible, setMenuVisible] = useState(null);

  const filteredProducts = product?.filter(item =>
    item.event_name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = () => {
    if (selectedProduct) {
      navigation.navigate('ProductFormScreen', {item: selectedProduct});
      setSelectedProduct(null);
    }
  };

  const handleDeleteConfirm = async id => {
    const res = await fetch(APIS.DELETE_PROGRAM, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({event_id: id}),
    });
    console.log('Deleted product:', selectedProduct?.prodName);
    setSelectedProduct(null);
    setDeleteVisible(false);
    getProduct();
  };
  const getProduct = async () => {
    const res = await fetch(APIS.GET_PROGRAM);
    const data = await res.json();
    setProduct(data.payload);
  };
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getProduct();
    }, []),
  );
  setTimeout(() => {
    setLoading(false);
  }, 1500);
  useEffect(() => {
    const backpress = () => {
      if (selectedProduct) {
        setSelectedProduct(null);
        return true;
      }

      return false;
    };
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      backpress,
    );
    return () => subscription.remove();
  }, [selectedProduct]);

  const renderProduct = ({item}) => {
    const isSelected = selectedProduct?.event_id === item.event_id;

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        style={[styles.card, isSelected && styles.cardSelected]}
        onLongPress={() => setSelectedProduct(item)}
        onPress={() => setSelectedProduct(null)}
        // onPress={() => navigation.navigate('ProductDetailScreen', { item })}
      >
        <View style={styles.infoContainer}>
          <Text style={styles.price}>
            <Text style={{fontFamily: fonts.semiBold, fontSize: 14}}>
              {item.event_name}
            </Text>
          </Text>
        </View>

        <View style={styles.actions}>
          <Menu
            visible={menuVisible == item.event_id}
            onDismiss={() => setMenuVisible(null)}
            anchorPosition="bottom"
            anchor={
              <TouchableOpacity
                style={{}}
                onPress={() => setMenuVisible(item.event_id)}>
                <EntypoIcon
                  name="dots-three-vertical"
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            }
            style={{width: 120, height: 42, paddingLeft: 8}}
            contentStyle={{
              backgroundColor: '#fff',
              borderRadius: 8,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.15,
              shadowRadius: 6,
            }}>
            <Menu.Item
              onPress={() => {
                navigation.navigate('ProductFormScreen', {item});
                setMenuVisible(null);
              }}
              leadingIcon={({color}) => (
                <View>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={22} // ← yaha chhota size daal do (18, 20, 16 etc.)
                    color={color}
                  />
                </View>
              )}
              title="Edit"
              titleStyle={{color: '#000', fontSize: 14, marginLeft: -8}}
              style={{backgroundColor: '#fff', height: 30, paddingVertical: 0}}
            />
            <Divider style={{backgroundColor: '#c2c2c2'}} />
            <Menu.Item
              onPress={() => {
                setDeleteVisible(true);
                setSelectedProduct(item);
                setMenuVisible(null);
              }}
              leadingIcon={({color}) => (
                <MaterialCommunityIcons
                  name="delete"
                  size={22} // ← yaha chhota size daal do (18, 20, 16 etc.)
                  color={color}
                />
              )}
              title="Delete"
              titleStyle={{color: '#000', fontSize: 14, marginLeft: -8}}
              style={{backgroundColor: '#fff', height: 30, paddingVertical: 0}}
            />
          </Menu>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header – changes when item is selected */}
      <View style={styles.header}>
        <>
          <TouchableOpacity
            onPress={() => {
              selectedProduct == null
                ? navigation.goBack()
                : setSelectedProduct(null);
            }}
            style={styles.backBtn}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitleNormal]}>Products</Text>
          {selectedProduct && (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerAction}
                onPress={handleEdit}>
                <Icon name="pencil-outline" size={22} color="#FFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerAction}
                onPress={() => setDeleteVisible(true)}>
                <Icon name="delete-outline" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        </>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Icon name="magnify" size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Search by product name"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor="#9CA3AF"
        />
        {search?.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
      {loading && <ProductShimmer />}

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.event_id}
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

      {/* Floating Add Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.addBtn}
        onPress={() => {
          setSelectedProduct(null), navigation.navigate('ProductFormScreen');
        }}>
        <Icon name="plus" size={26} color="#fff" />
        <Text style={styles.addBtnText}>Add Product</Text>
      </TouchableOpacity>

      {/* Delete Confirmation Modal (unchanged logic) */}
      <Modal transparent visible={deleteVisible} animationType="fade">
        <Pressable
          onPress={() => {
            setDeleteVisible(false);
            setSelectedProduct(null);
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

              // 🔥 optional premium shadow
              elevation: 5,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 10,
            }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: fonts.semiBold,
                marginBottom: 18,
                color: '#000',
              }}>
              Delete Product?
            </Text>

            <Text style={{color: '#555', marginBottom: 20}}>
              Are you sure you want to delete this product?
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setDeleteVisible(false);
                  setSelectedProduct(null);
                }}
                style={{marginRight: 20}}>
                <Text style={{color: '#666'}}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  handleDeleteConfirm(selectedProduct?.event_id);
                  setDeleteVisible(false); // ✅ important fix
                  setSelectedProduct(null);
                }}>
                <Text
                  style={{
                    color: '#FF4D4F',
                    fontFamily: fonts.semiBold,
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

export default ProdMas;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  header: {
    height: 56,
    backgroundColor: '#F05A28',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    elevation: 4,
  },

  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,

    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },

  headerTitleNormal: {
    flex: 1,
    color: '#fff',
    fontSize: 18,

    fontFamily: fonts.semiBold,
    // textAlign: '',
    paddingLeft: '25%',
  },

  backBtn: {
    padding: 8,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },

  // headerAction: {
  //   padding: 12,
  // },

  listContent: {
    paddingVertical: 8,
    paddingBottom: 90,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 14,
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
    marginBottom: -12,
    marginBottom: 1,
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

  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  codeBadge: {
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },

  codeText: {
    fontSize: 11,

    fontFamily: fonts.semiBold,
    color: '#000',
  },

  name: {
    fontSize: 14,

    fontFamily: fonts.semiBold,
    color: '#111827',
    marginBottom: 4,
  },

  price: {
    fontSize: 15,

    fontFamily: fonts.semiBold,
    color: '#111827',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIcon: {
    padding: 8,
    marginLeft: 4,
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
    paddingVertical: 14,
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
});
