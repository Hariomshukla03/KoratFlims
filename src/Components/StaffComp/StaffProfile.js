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

const StaffProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {item} = route.params || {};

  const [deleteVisible, setDeleteVisible] = useState(false);

  const data = item;

  const handleCall = () => console.log('Call:', data.mobile);
  const handleEdit = () => navigation.navigate('StaffFormScreen', {item: data});
  const handleConfDelete = async id => {
    console.log(id);
    const res = await fetch(APIS.STAFF_DELETE, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({staff_master_id: id}),
    });
    const data = await res.json();
    if (data.code == 200) {
      navigation.navigate('StaffScreen');
    }
    console.log(item, 'deleted');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── HEADER — unchanged ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={25} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Staff Profile</Text>
          <TouchableOpacity />
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit}>
              <Icon name="pencil-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDeleteVisible(true)}
              style={{marginLeft: 20}}>
              <Icon name="delete-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Staff Name ── */}
        <View style={[mid.twoCol, {marginTop: 12}]}>
          <View style={mid.card}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(`tel:${data.staff_master_mobile}`)
              }>
              <Text style={mid.label}>Staff Name</Text>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <Icon name="phone" size={13} color="#9CA3AF" />
                <Text style={mid.value}>{data.staff_master_name || '—'}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Staff Code</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Icon name="badge-account" size={13} color="#9CA3AF" />
              <Text style={mid.value}>{data.staff_master_code || '—'}</Text>
            </View>
          </View>
        </View>

        {/* ── Staff Code + Mobile ── */}
        <View style={mid.twoCol}>
          <View style={mid.card}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(`tel:${data.staff_master_mobile}`)
              }>
              <Text style={mid.label}>Mobile</Text>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <Icon name="phone" size={13} color="#9CA3AF" />
                <Text style={mid.value}>{data.staff_master_mobile || '—'}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={mid.card}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(`tel:${data.staff_another_mobile}`)
              }>
              <Text style={mid.label}>Mobile</Text>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <Icon name="phone" size={13} color="#9CA3AF" />
                <Text style={mid.value}>
                  {data.staff_another_mobile || '—'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Another Mobile (conditional) ── */}
        {data.anotherMobile ? (
          <View style={[mid.card, mid.fullCard]}>
            <Text style={mid.label}>Another Mobile</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Icon name="phone-outline" size={13} color="#9CA3AF" />
              <Text style={mid.value}>{data.staff_another_mobile || '—'}</Text>
            </View>
          </View>
        ) : null}

        {/* ── Category + Type ── */}
        <View style={mid.twoCol}>
          <View style={mid.card}>
            <Text style={mid.label}>Category</Text>
            <Text style={mid.value}>{data.staff_master_category || '—'}</Text>
          </View>
          <View style={mid.card}>
            <Text style={mid.label}>Type</Text>
            <Text style={mid.value}>{data.staff_master_type || '—'}</Text>
          </View>
        </View>

        {/* ── Address ── */}
        <View style={[mid.card, mid.fullCard]}>
          <Text style={mid.label}>Address</Text>
          <Text style={mid.value}>{data.staff_master_address || '—'}</Text>
        </View>

        {/* ── Hobby ── */}
        <View style={[mid.card, mid.fullCard]}>
          <Text style={mid.label}>Hobby</Text>
          <Text style={mid.value}>{data.staff_master_hobby || '—'}</Text>
        </View>

        {/* ── Delete Modal — unchanged logic ── */}
        <Modal transparent visible={deleteVisible} animationType="fade">
          <Pressable
            onPress={() => setDeleteVisible(false)}
            style={styles.modalBackdrop}>
            <Pressable style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Staff?</Text>
              <Text style={styles.modalText}>
                Are you sure you want to delete this staff member?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setDeleteVisible(false)}
                  style={styles.cancelBtn}
                  activeOpacity={0.8}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setDeleteVisible(false);
                    handleConfDelete(data.staff_master_id);
                  }}
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

export default StaffProfile;

/* ── Original header styles — untouched ── */
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F5F5'},
  scrollContent: {paddingBottom: 40},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F05A28',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 19,
    fontFamily: fonts.bold,
    color: '#fff',
    marginLeft: '18%',
  },
  headerActions: {flexDirection: 'row', alignItems: 'center'},

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
    fontFamily: fonts.semiBold,
    marginBottom: 18,
    color: '#000',
  },
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
    fontFamily: fonts.bold,
    color: '#111',
  },
});
