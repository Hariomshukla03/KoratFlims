import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {APIS} from '../../../utils/Apis';
import {fonts} from '../../../utils/fonts';

const PartyProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {item} = route.params || {};
  const [deleteVisible, setDeleteVisible] = useState(false);

  const data = item;
  console.log(data);

  const handleCall = () => console.log('Call:', data.mobile);
  const handleEmail = () => console.log('Email:', data.email);
  const handleEdit = () => navigation.navigate('PartyAddScreen', {item: data});
  const handleDelete = async id => {
    console.log(id);
    const res = await fetch(APIS.PARTY_DELETE, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({party_id: id}),
    });
    const data = await res.json();
    console.log(data);
    if (data.code == 200) {
      setDeleteVisible(false);
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* ── HEADER — unchanged ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={25} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Party Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit}>
              <Icon name="pencil-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteVisible(true)} style={{marginLeft: 20}}>
              <Icon name="delete-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Photos Row — unchanged ── */}
        <View style={styles.photosCard}>
          <View style={{alignItems: 'center'}}>
            <Image
              source={{uri: data.party_photo}}
              style={{width: 120, height: 120, borderRadius: 60, resizeMode: 'cover'}}
            />
            <Text style={styles.photoLabel}>Profile Photo</Text>
          </View>
          <View style={{alignItems: 'center'}}>
            <Image
              source={{uri: data.couple_photo}}
              style={{width: 120, height: 120, borderRadius: 65, resizeMode: 'cover'}}
            />
            <Text style={styles.photoLabel}>Couple Photo</Text>
          </View>
        </View>

        {/* ── Party Name ── */}
        <View style={[mid.card, mid.fullCard]}>
          <Text style={mid.label}>Party Name</Text>
          <Text style={mid.value}>{data.party_name || '—'}</Text>
        </View>

        {/* ── Mobile + City ── */}
        <View style={mid.twoCol}>
          <TouchableOpacity
            style={mid.card}
            onPress={() => Linking.openURL(`tel:${data.party_mobile}`)}>
            <Text style={mid.label}>Mobile</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Icon name="phone" size={14} color="#555" />
              <Text style={mid.value}>{data.party_mobile || '—'}</Text>
            </View>
          </TouchableOpacity>
          <View style={mid.card}>
            <Text style={mid.label}>City</Text>
            <Text style={mid.value}>{data.city || '—'}</Text>
          </View>
        </View>

        {/* ── Email ── */}
        <TouchableOpacity
          style={[mid.card, mid.fullCard]}
          onPress={() => Linking.openURL(`mailto:${data.party_email}`)}>
          <Text style={mid.label}>Email</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
            <Icon name="email-outline" size={14} color="#555" />
            <Text style={mid.value} numberOfLines={1}>{data.party_email || '—'}</Text>
          </View>
        </TouchableOpacity>

        {/* ── Address ── */}
        <View style={[mid.card, mid.fullCard]}>
          <Text style={mid.label}>Address</Text>
          <Text style={mid.value}>{data.party_address || '—'}</Text>
        </View>

        {/* ── Birth Date + Anniversary ── */}
        <View style={mid.twoCol}>
          <View style={mid.card}>
            <Text style={mid.label}>Birth Date</Text>
            <Text style={mid.value}>{data.birthday_date || '—'}</Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Anniversary</Text>
            <Text style={mid.value}>{data.aniversary_date || '—'}</Text>
          </View>
        </View>

        {/* ── Referred By + Instagram ── */}
        <View style={mid.twoCol}>
          <View style={mid.card}>
            <Text style={mid.label}>Referred By</Text>
            <Text style={mid.value}>{data.party_reference_by || '—'}</Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Instagram ID</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Icon name="instagram" size={14} color="#64748b" />
              <Text style={mid.value}>{data.instagram_id || '—'}</Text>
            </View>
          </View>
        </View>

        {/* ── Delete Modal — unchanged logic ── */}
        <Modal transparent visible={deleteVisible} animationType="fade">
          <Pressable
            onPress={() => setDeleteVisible(false)}
            style={styles.modalBackdrop}>
            <Pressable onPress={() => {}} style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Party?</Text>
              <Text style={styles.modalText}>
                Are you sure you want to delete party?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setDeleteVisible(false)}
                  style={styles.cancelBtn}
                  activeOpacity={0.8}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item.party_id)}
                  style={styles.deleteBtn}
                  activeOpacity={0.8}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
};

export default PartyProfile;

/* ── Original header styles — untouched ── */
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F5'},
  scrollContent: {paddingBottom: 40},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F05A28',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerActions: {flexDirection: 'row', alignItems: 'center'},
  headerTitle: {fontSize: 19, fontFamily: fonts.semiBold, color: '#fff'},

  photosCard: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  photoLabel: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: '#444',
  },

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
  modalTitle: {fontSize: 20, fontFamily: fonts.bold, marginBottom: 18, color: '#000'},
  modalText: {color: '#555', marginBottom: 20, fontSize: 14},
  modalButtons: {flexDirection: 'row', justifyContent: 'flex-end', gap: 12},
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: '#FF4D4F',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  cancelText: {color: '#344054', fontFamily: fonts.semiBold, fontSize: 14},
  deleteText: {color: '#FFFFFF', fontFamily: fonts.semiBold, fontSize: 14},
});

/* ── Same mid card styles as QuotationProfile ── */
const mid = StyleSheet.create({
  twoCol: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 13,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  fullCard: {
    marginHorizontal: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: fonts.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: '#111',
  },
});