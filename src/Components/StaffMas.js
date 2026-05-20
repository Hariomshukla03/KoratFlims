import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
  Pressable,
  Linking,
  BackHandler,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {APIS} from '../../utils/Apis';
import NothingFound from './NothingFound';
import {fonts} from '../../utils/fonts';
import UserShimmer from './Loaders/UserShimmer';
import StaffShimmer from './Loaders/StaffShimmer';

const StaffMas = () => {
  const [staff, setStaff] = useState();
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      if (!staff) {
        setLoading(true);
      }
      getStaff();
    }, []),
  );
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

  const getStaff = async () => {
    const res = await fetch(APIS.STAFF_LIST);
    const data = await res.json();
    setStaff(data.payload);
    setLoading(false);
    // console.log(data);
  };
  const filteredStaff = staff?.filter(
    item =>
      item.staff_master_name.toLowerCase().includes(search.toLowerCase()) ||
      item.staff_master_mobile.includes(search),
  );
  const handleDeletePress = () => {
    if (selectedItem) {
      setDeleteVisible(true);
    }
  };

  const confirmDelete = async id => {
    console.log(id);
    const res = await fetch(APIS.STAFF_DELETE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        staff_master_id: id,
      }),
    });
    const data = await res.json();
    if (data.code == 200) {
      getStaff();
    }
    console.log(data);
    setSelectedItem(null);
    setDeleteVisible(false);
  };

  const handleEdit = () => {
    if (selectedItem) {
      navigation.navigate('StaffFormScreen', {item: selectedItem});
      setSelectedItem(null); // optional: clear selection after navigation
    }
  };
  const handleBack = () => {
    if (selectedItem == null) {
      navigation.goBack();
    } else {
      setSelectedItem(null);
    }
  };

  const renderPartyItem = ({item}) => {
    const isSelected = selectedItem?.staff_master_id === item.staff_master_id;

    return (
      <TouchableOpacity
        style={[styles.partyCard, isSelected && styles.cardSelected]}
        activeOpacity={0.9}
        onLongPress={() => setSelectedItem(item)}
        onPress={() => setSelectedItem(null)}>
        <View style={[styles.infoContainer]}>
          <Text style={[styles.name, {marginLeft: 4}]}>
            {item.staff_master_name}
          </Text>
          <View style={styles.row}>
            <Text style={styles.detail}>{item.staff_master_mobile}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.detail} numberOfLines={2}>
              {item.staff_master_address}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, {paddingRight: 15}]}
            onPress={() => Linking.openURL(`tel:${item.staff_master_mobile}`)}>
            <Icon name="phone" size={20} color="#484848" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('StaffProfileScreen', {item})}>
            <Icon
              name="chevron-right"
              size={26}
              color="#999"
              style={{borderWidth: 0.2, borderRadius: 25}}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, {paddingLeft: 30}]}>Staff</Text>

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or mobile"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#aaa"
        />
      </View>
      {loading && <StaffShimmer />}
      {/* Party List */}
      <FlatList
        data={filteredStaff}
        renderItem={renderPartyItem}
        keyExtractor={item => item.staff_master_id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<NothingFound />}
      />
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => {
          setSelectedItem(null);
          navigation.navigate('StaffFormScreen');
        }}>
        <Icon name="plus" size={24} color="#fff" />
        <Text style={styles.addBtnText}>Add Staff</Text>
      </TouchableOpacity>
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
              Delete Staff?
            </Text>

            <Text
              style={{
                color: '#555',
                marginBottom: 20,
              }}>
              Are you sure you want to delete this Staff?
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
              <TouchableOpacity
                onPress={() => setDeleteVisible(false)}
                style={{marginRight: 20}}>
                <Text style={{color: '#666'}}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  confirmDelete(selectedItem.staff_master_id);
                  setDeleteVisible(false); // ✅ close after delete
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
    </SafeAreaView>
  );
};

export default StaffMas;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  header: {
    flexDirection: 'row',

    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: '#111',
    paddingLeft: '28%',
  },

  cardSelected: {
    backgroundColor: '#fff4ec',
    borderColor: '#fed7aa',
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
  },

  rightHeader: {
    width: 80,
    alignItems: 'flex-end',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 4,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 14,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
  },

  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 90,
  },

  partyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    marginTop: 4,
  },

  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  name: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#111',
    marginBottom: 0,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },

  detail: {
    fontSize: 12,
    color: '#555',
    marginLeft: 4,
    flex: 1,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionBtn: {
    padding: 4,
    marginLeft: 4,
  },

  actionIcon: {
    padding: 8,
  },
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
