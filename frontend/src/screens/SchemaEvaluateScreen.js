import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Sidebar from '../../components/Sidebar';
const { width } = Dimensions.get('window');

export default function SchemaEvaluateScreen({
  onBack,
  onSwitchToStatistical,
  goToLogin, goToGenerate, goToEvaluate, goToHome, goToAbout
}) {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [schema, setSchema] = React.useState('');
  const [datasetId, setDatasetId] = React.useState('');
  const [isEvaluating, setIsEvaluating] = React.useState(false);
  const [result, setResult] = React.useState(null);

  const checkSchema = async () => {
    if (isEvaluating) return;

    if (!schema.trim()) {
      Alert.alert('Error', 'Please enter a schema');
      return;
    }

    if (!datasetId.trim()) {
      Alert.alert('Error', 'Please provide a dataset ID');
      return;
    }

    setIsEvaluating(true);

    try {
      let schemaObj;
      try {
        schemaObj = JSON.parse(schema);
      } catch (e) {
        Alert.alert('Error', 'Invalid JSON schema. Please check the format.');
        setIsEvaluating(false);
        return;
      }

      const formData = new FormData();
      formData.append('data_schema', JSON.stringify(schemaObj));
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
        setResult(data);
        let message = 'Schema check completed successfully!\n\n';
        if (data.interpretation) {
          Object.entries(data.interpretation).forEach(([key, value]) => {
            message += `${key}: ${value}\n`;
          });
        }
        Alert.alert('Success', message, [{ text: 'OK' }]);
      } else {
        Alert.alert('Error', data.detail || 'Failed to evaluate schema');
      }
    } catch (error) {
      console.error("Failed to evaluate schema:", error);
      Alert.alert('Error', 'Failed to evaluate schema. Please check your connection.');
    } finally {
      setIsEvaluating(false);
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
          <TouchableOpacity
            style={styles.methodOption}
            onPress={onSwitchToStatistical}
          >
            <Text style={styles.methodText}>Statistical</Text>
          </TouchableOpacity>

          <View style={[styles.methodOption, styles.methodSelected]}>
            <Text style={[styles.methodText, styles.methodSelectedText]}>
              Schema Check
            </Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Schema Upload */}
          <Text style={styles.label}>Schema</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={[styles.input, styles.schemaInput]}
              placeholder="Enter your schema JSON"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={schema}
              onChangeText={setSchema}
              textAlignVertical="top"
            />
          </View>

          {/* Dataset ID */}
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
          onPress={checkSchema}
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
                {isEvaluating ? 'Checking...' : 'Check'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Result Box */}
        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>✓ Evaluation Complete</Text>
            <Text style={styles.resultText}>
              Schema Validity: <Text style={styles.boldText}>{result.schema_validity}</Text>
            </Text>
            <Text style={styles.resultText}>
              Type Consistency: <Text style={styles.boldText}>{result.type_consistency}</Text>
            </Text>
            {result.range_violations !== undefined && (
              <Text style={styles.resultText}>
                Range Violations: <Text style={styles.boldText}>{result.range_violations}</Text>
              </Text>
            )}
            {result.category_violations !== undefined && (
              <Text style={styles.resultText}>
                Category Violations: <Text style={styles.boldText}>{result.category_violations}</Text>
              </Text>
            )}
            {result.identifier_issues && (
              <Text style={[styles.resultText, styles.warningText]}>
                Issues: <Text style={styles.boldText}>{result.identifier_issues}</Text>
              </Text>
            )}
            {result.message && (
              <Text style={styles.resultMessage}>{result.message}</Text>
            )}
          </View>
        )}
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
  
    plus: {
      fontSize: 18,
      marginRight: 10,
    },
    search: {
      fontSize: 16,
      marginRight: 10,
    },
  
    placeholder: {
      fontSize: 15,
      color: '#888',
    },
  
    input: {
      flex: 1,
      fontSize: 15,
      color: '#000',
    },

    schemaInput: {
      minHeight: 100,
      textAlignVertical: 'top',
      paddingVertical: 10,
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
    resultCard: {
      backgroundColor: '#E8F5E9',
      borderLeftWidth: 4,
      borderLeftColor: '#4CAF50',
      borderRadius: 12,
      padding: 20,
      marginHorizontal: 20,
      marginTop: 24,
      marginBottom: 40,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    resultTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#2E7D32',
      marginBottom: 12,
    },
    resultText: {
      fontSize: 14,
      color: '#1B5E20',
      marginBottom: 8,
    },
    warningText: {
      color: '#D32F2F',
    },
    boldText: {
      fontWeight: '700',
    },
    resultMessage: {
      fontSize: 13,
      color: '#558B2F',
      marginTop: 12,
      fontStyle: 'italic',
    },
  });
  
