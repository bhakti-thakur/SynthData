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
import SchemaBasedScreen from './SchemaBasedScreen';
import Sidebar from './Sidebar';

const { width } = Dimensions.get('window');

export default function GenerateDataScreen({ onBack, goToLogin, goToGenerate, goToEvaluate, goToHome, goToAbout }) {
  const [selectedMethod, setSelectedMethod] = React.useState('Model Based');
  const [numberOfRows, setNumberOfRows] = React.useState('5000');
  const [batchSize, setBatchSize] = React.useState('64');
  const [epochs, setEpochs] = React.useState('25');
  const [showSidebar, setShowSidebar] = React.useState(false);

  if (selectedMethod === 'Schema Based') {
    return (
      <SchemaBasedScreen 
        onBack={onBack} 
        onSwitchToModel={() => setSelectedMethod('Model Based')}
        goToLogin={goToLogin}
        goToGenerate={goToGenerate}
        goToEvaluate={goToEvaluate}
        goToHome={goToHome}
        goToAbout={goToAbout}
      />
    );
  }

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
            style={[
              styles.methodOption,
              selectedMethod === 'Model Based' && styles.methodOptionSelected,
            ]}
            onPress={() => setSelectedMethod('Model Based')}
          >
            <Text
              style={[
                styles.methodOptionText,
                selectedMethod === 'Model Based' && styles.methodOptionTextSelected,
              ]}
            >
              Model Based
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.methodOption,
              selectedMethod === 'Schema Based' && styles.methodOptionSelected,
            ]}
            onPress={() => setSelectedMethod('Schema Based')}
          >
            <Text
              style={[
                styles.methodOptionText,
                selectedMethod === 'Schema Based' && styles.methodOptionTextSelected,
              ]}
            >
              Schema Based
            </Text>
          </TouchableOpacity>
        </View>

        {/* Data Configuration Card */}
        <View style={styles.configCard}>
          <Text style={styles.configCardTitle}>Data Configuration</Text>

          {/* Real Dataset Section */}
          <View style={styles.datasetSection}>
            <View style={styles.datasetHeader}>
              <Text style={styles.datasetIcon}>📄</Text>
              <Text style={styles.datasetText}>
                Real Dataset (CSV, JSON or Parquet upto 50MB)
              </Text>
            </View>
            <TouchableOpacity style={styles.browseButton}>
              <Text style={styles.browseButtonText}>Browse</Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Number of Rows</Text>
            <TextInput
              style={styles.inputField}
              value={numberOfRows}
              onChangeText={setNumberOfRows}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Batch Size</Text>
            <TextInput
              style={styles.inputField}
              value={batchSize}
              onChangeText={setBatchSize}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Epochs</Text>
            <TextInput
              style={styles.inputField}
              value={epochs}
              onChangeText={setEpochs}
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
    backgroundColor: '#4A4A4A',
    borderColor: '#4A4A4A',
  },
  methodOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  methodOptionTextSelected: {
    color: '#fff',
  },
  configCard: {
    backgroundColor: '#FFF8F0',
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
  datasetSection: {
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  datasetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  datasetIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  datasetText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    flex: 1,
  },
  browseButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    backgroundColor: '#fff',
  },
  browseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
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
