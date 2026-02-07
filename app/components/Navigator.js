import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Navigator({ onNavigate, activeScreen }){
    return(
        <View style={styles.container}>
            <TouchableOpacity 
                style={[styles.navItem, activeScreen === 'Generator' && styles.activeNavItem]}
                onPress={() => onNavigate('Generator')}
            >
                <Ionicons name="flash" size={28} color={activeScreen === 'Generator' ? '#d8e4f7' : 'black'} />
                <Text style={[styles.label, activeScreen === 'Generator' && styles.activeLabel]}>Generator</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.navItem, activeScreen === 'Evaluator' && styles.activeNavItem]}
                onPress={() => onNavigate('Evaluator')}
            >
                <Ionicons name="trending-up" size={28} color={activeScreen === 'Evaluator' ? '#d8e4f7' : 'black'} />
                <Text style={[styles.label, activeScreen === 'Evaluator' && styles.activeLabel]}>Evaluator</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.navItem, activeScreen === 'Account' && styles.activeNavItem]}
                onPress={() => onNavigate('Account')}
            >
                <Ionicons name="person" size={28} color={activeScreen === 'Account' ? '#d8e4f7' : 'black'} />
                <Text style={[styles.label, activeScreen === 'Account' && styles.activeLabel]}>Account</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 80,
        width: '100%',
        backgroundColor: '#fff',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#d0d8e8',
        position: 'relative',
        bottom: 5,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        borderRadius: 15,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    activeNavItem: {
        backgroundColor: '#d8e4f7',
    },
    icon: {
        fontSize: 32,
        marginBottom: 5
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginTop: 4
    },
    activeLabel: {
        color: '#000'
    }
})