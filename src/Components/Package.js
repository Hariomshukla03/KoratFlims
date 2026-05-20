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
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import NothingFound from './NothingFound';
import {APIS} from '../../utils/Apis';
import QuotationShimmer from './Loaders/QuotationShimmer';
import PackageShimmer from './Loaders/PackageShimmer';
import {fonts} from '../../utils/fonts';

const Package = () => {
  const navigation = useNavigation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPackage, setselectedPackage] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (!data) {
        setLoading(true);
      }
      getQuotation();
    }, []),
  );
  useEffect(() => {
    const backAction = () => {
      if (selectedPackage) {
        setselectedPackage(null);
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
  }, [selectedPackage]);
  const getQuotation = async () => {
    const url = APIS.GET_PACKAGE;
    const res = await fetch(url);
    const data = await res.json();
    console.log(data.payload);
    setData(data.payload);
    setLoading(false);
  };
  const handleback = () => {
    if (!selectedPackage) {
      navigation.goBack();
    } else {
      setselectedPackage(null);
    }
  };

  const filteredQuotation = data?.filter(item =>
    item?.package_master_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = () => {
    if (selectedPackage) {
      navigation.navigate('PackageForm', {sendData: selectedPackage});
      setselectedPackage(null);
    }
  };

  const handleDeleteConfirm = async id => {
    console.log(id);
    const res = await fetch(APIS.DELETE_PACKAGE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        package_master_code: id,
      }),
    });
    const data = await res.json();
    console.log(data);
    if (data.code == 200) {
      setDeleteVisible(false);
      setselectedPackage(null);
      getQuotation();
      navigation.navigate('Package');
    }

    setDeleteVisible(false);
    console.log('Deleted product:', data);
    setselectedPackage(null);
    setDeleteVisible(false);
  };

  const renderProduct = ({item}) => {
    const isSelected =
      selectedPackage?.package_master_code === item.package_master_code;
    // helper function (put it outside render or in utils)

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.card, isSelected && styles.cardSelected]}
        onLongPress={() => setselectedPackage(item)}
        onPress={() => setselectedPackage(null)}
        // onPress={() => navigation.navigate('ProductDetailScreen', { item })} // ← you can keep this if needed
      >
        <View style={styles.infoContainer}>
          {/* <View style={styles.codeBadge}>
            <Text style={styles.codeText}>
              Quotation No: {item.quot_no}
            </Text>
          </View> */}

          <Text style={styles.name} numberOfLines={2}>
            Date:{' '}
            <Text style={{fontFamily: fonts.regular}}>
              {item.entry_date.split(' ')[0]}
            </Text>
          </Text>
          <Text style={styles.name} numberOfLines={2}>
            Package Master Name:{' '}
            <Text style={{fontFamily: fonts.regular}}>
              {item.package_master_name || '—'}
            </Text>
          </Text>
          <Text style={styles.name} numberOfLines={2}>
            Record:{' '}
            <Text style={{fontFamily: fonts.regular}}>
              {item.total_records}
            </Text>
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('PackageDetail', {item})}
            activeOpacity={0.8}>
            <View
              style={{
                height: 26,
                width: 26,
                borderRadius: 18,
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 4,
              }}>
              <Icon name="chevron-right" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header – changes when item is selected */}
      <View style={styles.header}>
        <>
          <TouchableOpacity onPress={handleback} style={styles.backBtn}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={[styles.headerTitleNormal]}>Package</Text>
          {selectedPackage && (
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
          placeholder="Search by package master name"
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
      {loading && <PackageShimmer />}
      <FlatList
        data={filteredQuotation}
        renderItem={renderProduct}
        keyExtractor={item => item.package_master_code}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<NothingFound />}
        refreshing={loading}
        onRefresh={getQuotation}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              setLoading(true);
              getQuotation();
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
          navigation.navigate('PackageForm');
        }}>
        <Icon name="plus" size={26} color="#fff" />
        <Text style={styles.addBtnText}>Add Package</Text>
      </TouchableOpacity>

      {/* Delete Confirmation Modal (unchanged logic) */}
      <Modal transparent visible={deleteVisible} animationType="fade">
        <Pressable
          onPress={() => setDeleteVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Pressable
            style={{
              width: '80%',
              backgroundColor: '#ffffff',
              borderRadius: 14,
              padding: 20,
            }}>
            <Text
              style={{
                fontSize: 20,
                fontFamily: fonts.bold,
                marginBottom: 18,
                color: '#000',
              }}>
              Delete Package?
            </Text>

            <Text style={{color: '#555', marginBottom: 20}}>
              Are you sure you want to delete this Package?
            </Text>

            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <TouchableOpacity
                onPress={() => setDeleteVisible(false)}
                style={{marginRight: 20}}>
                <Text style={{color: '#666'}}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  handleDeleteConfirm(selectedPackage.package_master_code);
                }}>
                <Text style={{color: '#FF4D4F', fontFamily: fonts.bold}}>
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

export default Package;

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
    paddingBottom: 100,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderLeftWidth: 5, // a bit thicker looks better
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 14,
    paddingLeft: 12, // ← slightly less left padding
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
    fontSize: 12.5,
    fontFamily: fonts.semiBold,
    color: '#111827',
    marginBottom: 0.5,
  },

  price: {
    fontSize: 12,
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
});
