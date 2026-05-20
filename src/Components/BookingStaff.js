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
import NothingFound from './NothingFound';
import {APIS} from '../../utils/Apis';
import {fonts} from '../../utils/fonts';
import Shimmerui from './Loaders/UserShimmer';

const BookingStaff = () => {
  const [partyList, setPartyList] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const filteredParties = partyList?.filter(
    item =>
      item.party_name.toLowerCase().includes(search.toLowerCase()) ||
      item.party_mobile.includes(search),
  );
  useFocusEffect(
    useCallback(() => {
      setSelectedItem(null);
      if (!partyList) {
        setLoading(true);
      }
      getParty();
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

  const getParty = async () => {
    const res = await fetch(APIS.PARTY_LIST);
    const data = await res.json();
    // console.log(data)
    if (data.code == 200) {
      setPartyList(data.payload);
      setLoading(false);
    }
  };
  const handleDeletePress = () => {
    if (selectedItem) {
      setDeleteVisible(true);
    }
  };

  const confirmDelete = async id => {
    console.log(id);
    const res = await fetch(APIS.PARTY_DELETE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        party_id: id,
      }),
    });
    const data = await res.json();
    console.log(data);
    if (data.code == 200) {
      setDeleteVisible(false);
      setSelectedItem(null);
      getParty();
      navigation.navigate('PartyScreen');
    }

    setDeleteVisible(false);
  };
  const handleBack = () => {
    if (selectedItem == null) {
      navigation.goBack();
    } else {
      setSelectedItem(null);
    }
  };

  const handleEdit = () => {
    if (selectedItem) {
      navigation.navigate('PartyAddScreen', {item: selectedItem});
      setSelectedItem(null); // optional: clear selection after navigation
    }
  };

  const renderPartyItem = ({item}) => {
    const isSelected = selectedItem?.party_id === item.party_id;

    return (
      <TouchableOpacity
        style={[styles.partyCard, isSelected && styles.cardSelected]}
        activeOpacity={0.9}
        onLongPress={() => setSelectedItem(item)}
        onPress={() => setSelectedItem(null)}>
        <Image source={{uri: item.party_photo}} style={styles.avatar} />

        <View style={[styles.infoContainer]}>
          <Text style={styles.name}>{item.party_name}</Text>
          <View style={styles.row}>
            <Text style={styles.detail}>{item.party_mobile}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.detail} numberOfLines={2}>
              {item.party_address}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => Linking.openURL(`tel:${item.party_mobile}`)}>
            <Icon name="phone" size={20} color="#484848" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, {paddingRight: 15}]}
            onPress={() =>
              Linking.openURL(`https://wa.me/${item.party_mobile}`)
            }>
            <Icon name="whatsapp" size={25} color="#484848" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PartyProfileScreen', {item})}>
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

        <Text style={[styles.headerTitle]}>Booking Staff</Text>

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

      {/* Party List */}
      {loading && <Shimmerui />}
      <FlatList
        data={filteredParties}
        renderItem={renderPartyItem}
        keyExtractor={item => item.party_id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<NothingFound />}
      />
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => {
          setSelectedItem(null);
          navigation.navigate('BookingStaffForm');
        }}>
        <Icon name="plus" size={24} color="#fff" />
        <Text style={styles.addBtnText}>Add Booking Staff</Text>
      </TouchableOpacity>

      <Modal transparent visible={deleteVisible} animationType="fade">
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setDeleteVisible(false)}>
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Party?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this Party?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setDeleteVisible(false)}
                style={styles.modalBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => confirmDelete(selectedItem.party_id)}
                style={styles.modalBtn}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default BookingStaff;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    // backgroundColor: 'rgba(0,0,0,0.4)',
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
    fontFamily: fonts.bold,
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
    fontFamily: fonts.bold,
    color: '#fff',
    marginLeft: 28,
  },

  rightHeader: {
    width: 80,
    alignItems: 'flex-end',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
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
    paddingBottom: 12,
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
    padding: 4,
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
