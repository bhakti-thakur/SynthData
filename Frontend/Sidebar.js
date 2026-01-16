import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Sidebar({ visible, onClose, onHomePress, onLoginPress, onGeneratePress, onEvaluatePress, onAboutPress }) {
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const menuItems = [
    'Home',
    'Generator',
    'Evaluator',
    'About',
    'Login',
    'User',
  ];

  const handleMenuItemPress = (item) => {
    onClose();
    
    if (item === 'Home') {
      onHomePress?.();
    } else if (item === 'Login') {
      onLoginPress?.();
    } else if (item === 'Generator') {
      onGeneratePress?.();
    } else if (item === 'Evaluator') {
      onEvaluatePress?.();
    } else if (item === 'About') {
      onAboutPress?.();
    }
    // 'User' item doesn't have a handler yet, just closes the sidebar
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      {/* Overlay */}
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebarContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#FFFFFF']}
          style={styles.sidebar}
        >
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <View style={styles.closeIcon}>
              <View style={[styles.closeLine, { transform: [{ rotate: '45deg' }] }]} />
              <View style={[styles.closeLine, { transform: [{ rotate: '-45deg' }] }]} />
            </View>
          </TouchableOpacity>

          {/* Menu */}
          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item)}
              >
                <Text style={styles.menuItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sidebarContainer: {
    position: 'absolute',
    right: 0,
    width: width * 0.7,
    height: '100%',
  },
  sidebar: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    elevation: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  closeLine: {
    position: 'absolute',
    width: 24,
    height: 2,
    backgroundColor: '#000', // ✅ visible
  },
  menuList: {
    marginTop: 40,
  },
  menuItem: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  menuItemText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
  },
});
