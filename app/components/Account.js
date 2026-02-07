import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Account() {
    const handleLogout = () => {
        // Logout logic will go here
        console.log('Logging out...');
    };

    const handleDeleteAccount = () => {
        // Delete account logic will go here
        console.log('Deleting account...');
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header Section */}
            <View style={styles.headerSection}>
                <Text style={styles.greeting}>Hey User</Text>
                <Ionicons name="person-circle" size={55} color="black" />
            </View>

            {/* User Info Card */}
            <View style={styles.infoCard}>
                <Text style={styles.infoText}>johndoe@samplemail.com</Text>
                <Text style={styles.infoText}>Profile: Student</Text>
                <Text style={styles.infoText}>+91 12345678890</Text>
            </View>

            {/* History Section */}
            <Text style={styles.sectionTitle}>History</Text>
            <View style={styles.historyCard}>
                <Text style={styles.historyItem}>Previous Task</Text>
                <Text style={styles.historyItem}>Previous Task</Text>
                <Text style={styles.historyItem}>Previous Task</Text>
                <Text style={styles.historyItem}>Previous Task</Text>
                <Text style={styles.historyItem}>Previous Task</Text>
            </View>

            {/* Account Settings Section */}
            <Text style={styles.sectionTitle}>Account Settings</Text>
            <View style={styles.settingsCard}>
                <TouchableOpacity onPress={handleLogout}>
                    <Text style={styles.settingsText}>Logout</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeleteAccount}>
                    <Text style={styles.deleteText}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            {/* Footer Text */}
            {/* <Text style={styles.footerText}>Scroll down to know more about us.</Text> */}

            {/* Bottom spacing for Navigator */}
            <View style={{ height: 80 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#d8e4f7',
        paddingHorizontal: 20,
        paddingTop: 80,
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    greeting: {
        fontSize: 35,
        fontWeight: 'bold',
        color: '#000',
        marginLeft: 8,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
    },
    infoText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 27,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
        marginLeft: 8,
    },
    historyCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
    },
    historyItem: {
        fontSize: 14,
        color: '#333',
        marginBottom: 12,
        fontWeight: '500',
    },
    settingsCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
    },
    settingsText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 15,
        fontWeight: '500',
    },
    deleteText: {
        fontSize: 16,
        color: '#FF0000',
        fontWeight: '600',
    },
    footerText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        marginBottom: 30,
        fontWeight: '500',
    },
});
