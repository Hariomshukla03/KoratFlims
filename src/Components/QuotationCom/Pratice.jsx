import {
  View,
  Text, 
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import React, {useEffect, useState} from 'react';

const Pratice = () => {
  const [data, setData] = useState([]);
  const [formatData, setFormatData] = useState([]);
  const [activeTab, setActiveTab] = useState('Grocery');

  useEffect(() => {
    const mockResponse = [
      {
        quotation_add_id: 1,
        function_date: '21 Mar 2025',
        program_name: 'Family Function - Wedding',
        product_names: 'Rice,Basmati Rice,Toor Dal,Ghee,Jeera,Sugar',
        qty: '50,20,15,8,5,40',
        rate: '48,85,120,620,280,42',
        total: '2400,1700,1800,4960,1400,1680',
      },
      {
        quotation_add_id: 2,
        function_date: '15 Apr 2025',
        program_name: 'Birthday Celebration',
        product_names: 'Oil,Atta,Milk Powder,Spices Mix,Cashew',
        qty: '30,60,10,4,12',
        rate: '180,45,320,450,1100',
        total: '5400,2700,3200,1800,13200',
      },
    ];

    setData(mockResponse);
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const formatted = data.map(item => ({
      ...item,
      product_id: item.product_id?.split(',') || [],
      qty: item.qty?.split(',') || [],
      rate: item.rate?.split(',') || [],
      total: item.total?.split(',') || [],
      product_names: item.product_names?.split(',') || [],
    }));

    setFormatData(formatted);
  }, [data]);

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <Text style={styles.date}>{item.function_date}</Text>
      <Text style={styles.text}>{item.program_name}</Text>

      <Text style={styles.label}>Products:</Text>
      {item.product_names.map((p, i) => (
        <Text key={i} style={styles.value}>
          • {p.trim()}
        </Text>
      ))}

      <Text style={styles.label}>Qty:</Text>
      <Text style={styles.value}>{item.qty.join(', ')}</Text>

      <Text style={styles.label}>Rate:</Text>
      <Text style={styles.value}>{item.rate.join(', ')}</Text>
    </View>
  );

  const renderContent = () => {
    if (activeTab === 'Grocery') {
      return (
        <FlatList
          data={formatData}
          keyExtractor={item => item.quotation_add_id?.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    if (activeTab === 'Party') {
      return <Text style={styles.screenText}>🎉 Party Items Coming Soon</Text>;
    }

    if (activeTab === 'Bottle') {
      return <Text style={styles.screenText}>🍾 Bottle Section Coming Soon</Text>;
    }
  };

  // Tab config with colors (Instamart-inspired vibe)
  const tabs = [
    { name: 'Grocery', color: '#4CAF50' },   // green
    { name: 'Party',   color: '#FF5252' },   // red-orange
    { name: 'Bottle',  color: '#448AFF' },   // blue
  ];

  return (
    <View style={styles.container}>
      {/* Fancy Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => setActiveTab(tab.name)}
              style={[
                styles.tab,
                isActive && {
                  ...styles.activeTab,
                  borderBottomColor: tab.color,
                  shadowColor: tab.color,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive && { ...styles.activeTabText, color: tab.color },
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
};

export default Pratice;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // ─── TABS ────────────────────────────────────────────────
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0d0d0d',
    paddingTop: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',

  },

  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#111',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginHorizontal: 4,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
   
  },

  activeTab: {
    backgroundColor: '#000',
    borderBottomWidth: 4,
    elevation: 6,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    zIndex: 10,
    
    
  },

  tabText: {
    color: '#aaa',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },

  activeTabText: {
    fontWeight: '800',
    fontSize: 15.5,
    borderBottomRightRadius:24,
    borderBottomLeftRadius:16
  },

  // ─── CONTENT ─────────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: '#000',
  },

  // ─── CARD ────────────────────────────────────────────────
  card: {
    backgroundColor: '#161616',
    padding: 16,
    borderRadius: 1,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#222',
  },

  date: {
    color: '#4CAF50',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
  },

  text: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },

  label: {
    color: '#888',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '500',
  },

  value: {
    color: '#f0f0f0',
    fontSize: 14,
    lineHeight: 20,
  },

  screenText: {
    color: '#bbb',
    textAlign: 'center',
    marginTop: 80,
    fontSize: 20,
    fontWeight: '500',
  },
});