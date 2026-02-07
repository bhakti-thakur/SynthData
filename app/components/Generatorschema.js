import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';

export default function Generatorschema() {
    const [schemaFile, setSchemaFile] = useState(null);
    const [rows, setRows] = useState('5000');

    const handleBrowse = () => {
        // File picker logic will go here
        setSchemaFile('Schema File');
    };

    return (
        <View style={styles.container}>
            {/* Enter Your Schema Section */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Enter Your Schema</Text>

                {/* Schema Upload Box */}
                <View style={styles.schemaBox}>
                    <Text style={styles.uploadIcon}>+</Text>
                    <Text style={styles.uploadText}>Upload your Schema</Text>
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
            </View>

            {/* Generate Button */}
            <TouchableOpacity style={styles.generateButton}>
                <Text style={styles.generateButtonText}>Generate Synthetic Data</Text>
            </TouchableOpacity>

            {/* Bottom spacing for Navigator */}
            <View style={{ height: 80 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d8e4f7',
        paddingTop: 10,
        paddingHorizontal: 20,
    },
    sectionContainer: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#000',
    },
    schemaBox: {
        borderWidth: 2,
        borderColor: '#999',
        borderRadius: 20,
        padding: 19,
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
        minHeight: 210,
        justifyContent: 'center',
    },
    uploadIcon: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#999',
        marginBottom: 10,
    },
    uploadText: {
        fontSize: 16,
        color: '#999',
        marginBottom: 20,
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
        marginTop: 3,
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
        paddingVertical: 12,
        fontSize: 14,
        color: '#333',
    },
    generateButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 20,
    },
    generateButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
});
