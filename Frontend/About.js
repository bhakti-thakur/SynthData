import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Sidebar from './Sidebar';

const { width } = Dimensions.get('window');

export default function About({ onBack, goToLogin, goToGenerate, goToEvaluate, goToHome, goToAbout }) {
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

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Developed as a B.E. Computer Engineering Final Year Project</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Published as a Conference Paper</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Guided by Dr. S. R. Khonde</Text>
          </View>
        </View>

        {/* Motivation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Motivation</Text>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Real-world data is restricted due to privacy & ethics</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Synthetic data enables safe AI development</Text>
          </View>
        </View>

        {/* Objective Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objective</Text>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Hybrid synthetic data generation</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Data quality & privacy validation</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>REST API + dashboard</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Multi-domain scalability</Text>
          </View>
        </View>

        {/* Footer Section - Team & Guide and Publications & Resources */}
        <View style={styles.footer}>
          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Team & Guide</Text>
            <Text style={styles.footerSubtitle}>Team Members</Text>
            <View style={styles.footerBulletItem}>
              <Text style={styles.footerBullet}>•</Text>
              <Text style={styles.footerText}>Bhakti Thakur</Text>
            </View>
            <View style={styles.footerBulletItem}>
              <Text style={styles.footerBullet}>•</Text>
              <Text style={styles.footerText}>Aabha Wadwalkar</Text>
            </View>
            <View style={styles.footerBulletItem}>
              <Text style={styles.footerBullet}>•</Text>
              <Text style={styles.footerText}>Kapil Sarda</Text>
            </View>
            <Text style={styles.footerSubtitle}>Project Guide</Text>
            <View style={styles.footerBulletItem}>
              <Text style={styles.footerBullet}>•</Text>
              <Text style={styles.footerText}>Dr. S. R. Khonde</Text>
            </View>
          </View>

          <View style={styles.footerSection}>
            <Text style={styles.footerTitle}>Publications & Resources</Text>
            <View style={styles.footerBulletItem}>
              <Text style={styles.footerBullet}>•</Text>
              <Text style={styles.footerText}>Conference Paper</Text>
            </View>
            <View style={styles.footerBulletItem}>
              <Text style={styles.footerBullet}>•</Text>
              <Text style={styles.footerText}>Project Presentation</Text>
            </View>
            <View style={styles.footerBulletItem}>
              <Text style={styles.footerBullet}>•</Text>
              <Text style={styles.footerText}>Project Report</Text>
            </View>
            <View style={styles.footerBulletItem}>
              <Text style={styles.footerBullet}>•</Text>
              <Text style={styles.footerText}>GitHub Repository</Text>
            </View>
          </View>
        </View>
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
    paddingBottom: 10,
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
    height: 2,
    backgroundColor: '#000',
    borderRadius: 1,
    marginBottom: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 24,
    textAlign: 'left',
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 18,
    color: '#000',
    marginRight: 12,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#000',
  },
  footerSection: {
    marginBottom: 32,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  footerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  footerBulletItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  footerBullet: {
    fontSize: 14,
    color: '#fff',
    marginRight: 8,
    marginTop: 2,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#fff',
    lineHeight: 20,
    flex: 1,
  },
});
