import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';
import Evaluatorschemachck from './Evaluatorschemachck';

export default function Evaluatorstatistical() {
    const [activeTab, setActiveTab] = useState('Statistical');
    const [realDataset, setRealDataset] = useState('');
    const [syntheticDataset, setSyntheticDataset] = useState('');
    const [datasetId, setDatasetId] = useState('');

    const handleCheck = () => {
        // Check logic will go here
        console.log('Checking evaluation...');
    };

    return (
        <ScrollView style={styles.container}>
            {/* Title */}
            <Text style={styles.title}>Evaluator</Text>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'Statistical' && styles.activeTab]}
                    onPress={() => setActiveTab('Statistical')}
                >
                    <Text style={[styles.tabText, activeTab === 'Statistical' && styles.activeTabText]}>
                        Statistical
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'SchemaCheck' && styles.activeTab]}
                    onPress={() => setActiveTab('SchemaCheck')}
                >
                    <Text style={[styles.tabText, activeTab === 'SchemaCheck' && styles.activeTabText]}>
                        Schema Check
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'Statistical' ? (
                <>
                    {/* Content Section */}
                    <View style={styles.sectionContainer}>
                        {/* Schema Section */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Real Data</Text>
                            <View style={styles.uploadInput}>
                                <Text style={styles.uploadIcon}>+</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Upload your real dataset"
                                    placeholderTextColor="#999"
                                    value={realDataset}
                                    onChangeText={setRealDataset}
                                />
                            </View>
                        </View>

                        {/* Synthetic Dataset Section */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Synthetic Dataset</Text>
                            <View style={styles.uploadInput}>
                                <Text style={styles.uploadIcon}>+</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Upload your synthetic dataset"
                                    placeholderTextColor="#999"
                                    value={syntheticDataset}
                                    onChangeText={setSyntheticDataset}
                                />
                            </View>
                        </View>

                        {/* Synthetic Dataset ID Section */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Synthetic Dataset ID</Text>
                            <View style={styles.idInput}>
                                <Text style={styles.searchIcon}>🔍</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Type your synthetic dataset ID"
                                    placeholderTextColor="#999"
                                    value={datasetId}
                                    onChangeText={setDatasetId}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Check Button */}
                    <TouchableOpacity style={styles.checkButton} onPress={handleCheck}>
                        <Text style={styles.checkButtonText}>Check</Text>
                    </TouchableOpacity>

                    {/* Bottom spacing for Navigator */}
                    <View style={{ height: 80 }} />
                </>
            ) : (
                <Evaluatorschemachck />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d8e4f7',
        paddingTop: 80,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#000',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: 40,
        marginBottom: 30,
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 4,
        gap: 10,
    },
    tab: {
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#e8ecf7',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#000',
    },
    sectionContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#000',
    },
    uploadInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#999',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#f9f9f9',
    },
    idInput: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#999',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#f9f9f9',
    },
    uploadIcon: {
        fontSize: 18,
        color: '#999',
        marginRight: 10,
        fontWeight: 'bold',
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        padding: 0,
    },
    checkButton: {
        marginHorizontal: 90,
        marginBottom: 30,
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 16,
        alignItems: 'center',
    },
    checkButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
});
