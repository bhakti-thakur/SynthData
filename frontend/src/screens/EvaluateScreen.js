import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import Sidebar from '../../components/Sidebar';
import SchemaEvaluateScreen from './SchemaEvaluateScreen';

export default function EvaluateScreen({ onBack, goToLogin, goToGenerate, goToEvaluate, goToHome, goToAbout }) {
  const [selectedMethod, setSelectedMethod] = React.useState('Statistical');
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [datasetId, setDatasetId] = React.useState('');
  const [realFile, setRealFile] = React.useState(null);
  const [isEvaluating, setIsEvaluating] = React.useState(false);

  /* 🔁 SWITCH TO SCHEMA SCREEN */
  if (selectedMethod === 'Schema Check') {
    return (
      <SchemaEvaluateScreen
        onBack={onBack}
        onSwitchToStatistical={() => setSelectedMethod('Statistical')}
        goToLogin={goToLogin}
        goToGenerate={goToGenerate}
        goToEvaluate={goToEvaluate}
        goToHome={goToHome}
        goToAbout={goToAbout}
      />
    );
  }

  const evaluatedata = async () => {
    if (isEvaluating) return;

    if (!realFile) {
      Alert.alert('Error', 'Please upload a real dataset file');
      return;
    }

    if (!datasetId) {
      Alert.alert('Error', 'Please provide a dataset ID for synthetic data');
      return;
    }

    setIsEvaluating(true);

    try {
      const formData = new FormData();
      
      formData.append('real_file', {
        uri: realFile.uri,
        type: 'text/csv',
        name: realFile.name || 'real_data.csv',
      });

      formData.append('dataset_id', datasetId);

      const response = await fetch("http://localhost:8000/evaluate", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        let message = 'Evaluation completed successfully!\n\n';
        if (data.interpretation) {
          Object.entries(data.interpretation).forEach(([key, value]) => {
            message += `${key}: ${value}\n`;
          });
        }
        Alert.alert('Success', message, [{ text: 'OK' }]);
      } else {
        Alert.alert('Error', data.detail || 'Failed to evaluate data');
      }
    } catch (error) {
      console.error("Failed to evaluate data:", error);
      Alert.alert('Error', 'Failed to evaluate data. Please check your connection.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const pickRealFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/csv', 'text/comma-separated-values'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setRealFile({
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType || 'text/csv',
        });
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

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

        {/* Title */}
        <Text style={styles.title}>
          Validating the magic,{'\n'}one metric at a time.
        </Text>

        {/* Method Switch */}
        <View style={styles.methodContainer}>
          <View style={[styles.methodOption, styles.methodSelected]}>
            <Text style={[styles.methodText, styles.methodSelectedText]}>
              Statistical
            </Text>
          </View>

          <TouchableOpacity
            style={styles.methodOption}
            onPress={() => setSelectedMethod('Schema Check')}
          >
            <Text style={styles.methodText}>Schema Check</Text>
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Real Data */}
          <Text style={styles.label}>Real Data</Text>
          <TouchableOpacity style={styles.inputBox} onPress={pickRealFile}>
            <Text style={styles.plus}>＋</Text>
            <Text style={styles.placeholder}>
              {realFile ? realFile.name || 'File selected' : 'Upload your real dataset'}
            </Text>
          </TouchableOpacity>

          {/* Synthetic Dataset */}
          <Text style={[styles.label, { marginTop: 24 }]}>
            Synthetic Dataset/ID
          </Text>
          <View style={styles.inputBox}>
            <Text style={styles.search}>🔍</Text>
            <TextInput
              style={styles.input}
              value={datasetId}
              onChangeText={setDatasetId}
            />
          </View>
        </View>

        {/* Check Button */}
        <TouchableOpacity 
          style={styles.buttonContainer}
          onPress={evaluatedata}
          disabled={isEvaluating}
        >
          <LinearGradient
            colors={['#8A2BE2', '#FF1493', '#FFC107']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <View style={styles.buttonInner}>
              <Text style={styles.buttonText}>
                {isEvaluating ? 'Evaluating...' : 'Check'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
  
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      alignItems: 'flex-end',
    },
  
    menuButton: {
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuIcon: {
      width: 24,
      height: 18,
      justifyContent: 'space-between',
    },
    menuLine: {
      width: 24,
      height: 3,
      backgroundColor: '#000',
      borderRadius: 2,
    },
  
    title: {
      fontSize: 22,
      fontWeight: '600',
      color: '#000',
      textAlign: 'center',
      marginVertical: 40,
      lineHeight: 30,
    },
  
    methodContainer: {
      flexDirection: 'row',
      backgroundColor: '#EDEDED',
      borderRadius: 14,
      padding: 6,
      marginHorizontal: 20,
      marginBottom: 30,
    },
    methodOption: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: '#fff',
      alignItems: 'center',
    },
    methodSelected: {
      backgroundColor: '#5A5A5A',
    },
    methodText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#000',
    },
    methodSelectedText: {
      color: '#fff',
    },
  
    card: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 20,
      marginHorizontal: 20,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 6,
    },
  
    label: {
      fontSize: 18,
      fontWeight: '700',
      color: '#000',
      marginBottom: 12,
    },
  
    inputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: '#000',
      borderRadius: 14,
      padding: 14,
    },
  
    plus: { fontSize: 18, marginRight: 10 },
    search: { fontSize: 16, marginRight: 10 },
  
    placeholder: {
      fontSize: 15,
      color: '#888',
    },
  
    input: {
      flex: 1,
      fontSize: 15,
      color: '#000',
    },
  
    buttonContainer: {
      marginTop: 40,
      alignItems: 'center',
    },
    buttonGradient: {
      borderRadius: 16,
      padding: 3,
    },
    buttonInner: {
      backgroundColor: '#fff',
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 50,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#000',
    },
  });
  