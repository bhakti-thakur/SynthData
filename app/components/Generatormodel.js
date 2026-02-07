import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';
import Generatorschema from './Generatorschema';

export default function Generator() {
    const [activeTab, setActiveTab] = useState('Model');
    const [fileName, setFileName] = useState(null);
    const [rows, setRows] = useState('5000');
    const [batchSize, setBatchSize] = useState('64');
    const [epochs, setEpochs] = useState('25');

    const handleBrowse = () => {
        // File picker logic will go here
        setFileName('Real Dataset (CSV or JSON)');
    };

    return (
        <ScrollView style={styles.container}>
            {/* Title */}
            <Text style={styles.title}>Generator</Text>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'Model' && styles.activeTab]}
                    onPress={() => setActiveTab('Model')}
                >
                    <Text style={[styles.tabText, activeTab === 'Model' && styles.activeTabText]}>
                        Model
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'Schema' && styles.activeTab]}
                    onPress={() => setActiveTab('Schema')}
                >
                    <Text style={[styles.tabText, activeTab === 'Schema' && styles.activeTabText]}>
                        Schema
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'Model' ? (
                <>
                    {/* Data Configuration Section */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Data Configuration</Text>

                        {/* File Upload Box */}
                        <View style={styles.fileBox}>
                            <Text style={styles.fileIcon}>📄</Text>
                            <Text style={styles.fileText}>Real Dataset (CSV or JSON upto 50MB)</Text>
                            <TouchableOpacity style={styles.browseButton} onPress={handleBrowse}>
                                <Text style={styles.browseButtonText}>Browse</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Number of Rows */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Number of Rows</Text>
                            <TextInput
                                style={styles.input}
                                value={rows}
                                onChangeText={setRows}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Batch Size */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Batch Size</Text>
                            <TextInput
                                style={styles.input}
                                value={batchSize}
                                onChangeText={setBatchSize}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Epochs */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Epochs</Text>
                            <TextInput
                                style={styles.input}
                                value={epochs}
                                onChangeText={setEpochs}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Generate Button */}
                    <TouchableOpacity style={styles.generateButton}>
                        <Text style={styles.generateButtonText}>Generate Synthetic Data</Text>
                    </TouchableOpacity>

                    {/* Bottom spacing for Navigator */}
                    <View style={{ height: 80 }} />
                </>
            ) : (
                <Generatorschema />
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
        marginHorizontal: 70,
        marginBottom: 30,
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 4,
        gap: 10,
    },
    tab: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#f0f4f9',
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
        marginHorizontal: 19,
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        // padding: 25,
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 20,
        paddingRight: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
    },
    fileBox: {
        borderWidth: 2,
        borderColor: '#999',
        borderRadius: 15,
        padding: 10,
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
    },
    fileIcon: {
        fontSize: 28,
        marginBottom: 10,
    },
    fileText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        textAlign: 'center',
    },
    browseButton: {
        borderWidth: 2,
        borderColor: '#999',
        borderRadius: 8,
        paddingHorizontal: 25,
        paddingVertical: 8,
    },
    browseButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    inputGroup: {
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#000',
    },
    input: {
        borderWidth: 2,
        borderColor: '#999',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 14,
        color: '#333',
    },
    generateButton: {
        marginHorizontal: 20,
        marginBottom: 30,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    generateButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
});
