import {View, StyleSheet, Text, TouchableOpacity, Alert} from 'react-native';
import Pdf from 'react-native-pdf';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FIcon from 'react-native-vector-icons/MaterialIcons';
import {fonts} from '../../../utils/fonts';
import {useNavigation} from '@react-navigation/native';
import Share from 'react-native-share';

const ShowPDF = ({route}) => {
  const navigate = useNavigation();
  const {filePath} = route.params;
  const source = {
    uri: `file://${filePath}`, // important: add file:// prefix here
    cache: true,
  };
  const handleShare = async () => {
    if (!filePath) {
      Alert.alert('Error', 'PDF file not found');
      return;
    }

    const fileUrl = Platform.OS === 'android' ? `file://${filePath}` : filePath;

    const options = {
      title: 'Share Quotation',
      message: 'Here is your quotation PDF',
      url: fileUrl,
      type: 'application/pdf',
      filename: 'quotation.pdf',
    };

    try {
      await Share.open(options);
    } catch (error) {
      if (error.message?.includes('cancelled')) {
        // user cancelled → ignore
        return;
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigate.goBack()}>
          <Icon name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Quotation PDF</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare}>
            <FIcon name="share" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <Pdf
        source={source}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`PDF loaded – ${numberOfPages} pages`);
        }}
        onPageChanged={(page, numberOfPages) => {
          console.log(`Current page: ${page}`);
        }}
        onError={error => {
          console.log(error);
        }}
        onPressLink={uri => {
          console.log(`Link pressed: ${uri}`);
        }}
        style={styles.pdf}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  container: {flex: 1, backgroundColor: '#f9fafb'},

  title: {color: 'white', fontSize: 20, fontFamily: fonts.semiBold},
  pdf: {flex: 1, width: '100%', height: '100%'},
});
export default ShowPDF;
