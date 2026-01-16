import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Sidebar from './Sidebar';

const { width } = Dimensions.get('window');

export default function SchemaBasedScreen({ onBack, onSwitchToModel, goToLogin, goToGenerate, goToEvaluate, goToHome, goToAbout }) {
  const [numberOfRows, setNumberOfRows] = React.useState('5000');
  const [schemaText, setSchemaText] = React.useState('');
  const [showSidebar, setShowSidebar] = React.useState(false);

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFE5F1', '#FFD6E8']}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => setShowSidebar(true)}
          >
            <View style={styles.menuIcon}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </View>
          </TouchableOpacity>
          <Text style={styles.mainTitle}>Fake data. Real intelligence.</Text>
        </View>
        
        <Sidebar
          visible={showSidebar}
          onClose={() => setShowSidebar(false)}
          onHomePress={() => {
            setShowSidebar(false);
            goToHome?.();
          }}
          onLoginPress={() => {
            setShowSidebar(false);
            goToLogin?.();
          }}
          onGeneratePress={()=>{
            setShowSidebar(false);
            goToGenerate?.();
          }}
          onEvaluatePress={()=>{
            setShowSidebar(false);
            goToEvaluate?.();
          }}
          onAboutPress={()=>{
            setShowSidebar(false);
            goToAbout?.();
          }}
        />

        {/* Method Selection */}
        <View style={styles.methodContainer}>
          <TouchableOpacity 
            style={styles.methodOption}
            onPress={onSwitchToModel}
          >
            <Text style={styles.methodOptionText}>Model Based</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.methodOptionSelected}>
            <Text style={styles.methodOptionTextSelected}>Schema Based</Text>
          </TouchableOpacity>
        </View>

        {/* Schema Configuration Card */}
        <View style={styles.configCard}>
          <Text style={styles.configCardTitle}>Enter your Schema</Text>

          {/* Schema Input Area */}
          <View style={styles.schemaInputContainer}>
            <TextInput
              style={styles.schemaInput}
              placeholder="+ Enter your Schema/Upload your Schema"
              placeholderTextColor="#999"
              multiline
              numberOfLines={8}
              value={schemaText}
              onChangeText={setSchemaText}
              textAlignVertical="top"
            />
          </View>

          {/* Number of Rows Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Number of Rows</Text>
            <TextInput
              style={styles.inputField}
              value={numberOfRows}
              onChangeText={setNumberOfRows}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity style={styles.generateButtonContainer}>
          <LinearGradient
            colors={['#8A2BE2', '#FF1493', '#FFC107']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.generateButtonGradient}
          >
            <View style={styles.generateButtonInner}>
              <Text style={styles.generateButtonText}>Generate Synthetic Data</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
  },
  menuButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  menuIcon: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  menuLine: {
    width: 24,
    height: 2,
    backgroundColor: '#000',
    borderRadius: 1,
    marginBottom: 4,
  },
  methodContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
  },
  methodOptionSelected: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#4A4A4A',
    borderColor: '#4A4A4A',
    alignItems: 'center',
  },
  methodOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  methodOptionTextSelected: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  configCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  configCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  schemaInputContainer: {
    marginBottom: 20,
  },
  schemaInput: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
  },
  generateButtonContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  generateButtonGradient: {
    borderRadius: 12,
    padding: 2,
  },
  generateButtonInner: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
