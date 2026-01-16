import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import GenerateDataScreen from './GenerateDataScreen';
import Sidebar from './Sidebar';
// import Login from './Login';

const { width } = Dimensions.get('window');

export default function LandingScreen({ goToLogin, goToGenerate, goToEvaluate, goToHome, goToAbout }) {
    const [showGenerateScreen, setShowGenerateScreen] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    // const [loginVisible, setLoginVisible] = useState(false);


    if (showGenerateScreen) {
        return (
            <View style={styles.fullContainer}>
                <ScrollView
                    style={styles.generateScreenScrollView}
                    contentContainerStyle={styles.generateScreenScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <GenerateDataScreen onBack={() => setShowGenerateScreen(false)} />
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
            </View>
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
                {/* Header with Hamburger Menu */}
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

                {/* <Sidebar visible={showSidebar} onClose={() => 
          setShowSidebar(false)} onLoginPress={() => {
          setShowSidebar(false);
          setLoginVisible(true);}} /> */}

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



                {/* Top Section: Introduction */}
                <View style={styles.topSection}>
                    <Text style={styles.mainTitle}>
                        Privacy-Preserving Synthetic Data Generation using Generative AI
                    </Text>
                    <Text style={styles.subtitle}>
                        A hybrid Generative AI framework leveraging GANs, VAEs, and {"\n"} CTOANS to generate high- {"\n"}fidelity synthetic datasets for {"\n"} sensitive domains.
                    </Text>

                    <View style={styles.bulletPoints}>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>GDPR, HIPAA compliant and secure</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>Maintains statistical fidelity</Text>
                        </View>
                        <View style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>Designed for advanced analytics</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.generateButton}
                        onPress={() => setShowGenerateScreen(true)}
                    >
                        <LinearGradient
                            colors={['#8A2BE2', '#FF1493', '#FFC107']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.border}
                        >
                            <Text style={styles.generateButtonText}>Generate Synthetic Data</Text>
                        </LinearGradient>
                    </TouchableOpacity>


                    {/* Flowchart 1: Data Generation Process for AI */}
                    <View style={styles.diagramContainer}>
                        <Image
                            source={require('./assets/data-generation-process-diagram.png')}
                            style={styles.diagramImage}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Problem Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>The Problem with {"\n"} Real-World Data</Text>
                    {/* <View style={styles.problemCards}>
              <View style={styles.problemCard}>
                <Text style={styles.problemCardTitle}>Sensitive & Regulated Data</Text>
                <Text style={styles.problemCardText}>Strict privacy and ethical considerations</Text>
                <Text style={styles.problemCardText}>Legal compliance (GDPR, HIPAA, CCPA)</Text>
              </View>
              <View style={styles.problemCard}>
                <Text style={styles.problemCardTitle}>Data Scarcity & Imbalance</Text>
                <Text style={styles.problemCardText}>Lack of data for rare events or minorities</Text>
                <Text style={styles.problemCardText}>Difficulty in sharing and collaboration</Text>
              </View>
              <View style={styles.problemCard}>
                <Text style={styles.problemCardTitle}>Ineffective Anonymization</Text>
                <Text style={styles.problemCardText}>Easy to de-anonymize with modern techniques</Text>
                <Text style={styles.problemCardText}>Loss of data utility and accuracy</Text>
              </View>
            </View> */}
                    <View style={styles.applicationCards}>
                        <View style={styles.applicationCard}>
                            <View style={styles.cardDecorTopRight} />
                            <View style={styles.cardDecorBottomLeft} />
                            <Text style={styles.applicationCardTitle}>Sensitive & Regulated Data</Text>
                            <View style={styles.applicationBulletItem}>
                                <Text style={styles.applicationBullet}>•</Text>
                                <Text style={styles.applicationCardText}>Medical,Financial, and personal datasets are restricted</Text>
                            </View>
                            <View style={styles.applicationBulletItem}>
                                <Text style={styles.applicationBullet}>•</Text>
                                <Text style={styles.applicationCardText}>Laws like GDPR,HIPAA,DPDP Act limit data access</Text>
                            </View>

                        </View>
                        <View style={styles.applicationCard}>
                            <View style={styles.cardDecorTopRight} />
                            <View style={styles.cardDecorBottomLeft} />
                            <Text style={styles.applicationCardTitle}>Data Scarcity & Imbalance</Text>
                            <View style={styles.applicationBulletItem}>
                                <Text style={styles.applicationBullet}>•</Text>
                                <Text style={styles.applicationCardText}>Insufficient samples for training robust ML models</Text>
                            </View>
                            <View style={styles.applicationBulletItem}>
                                <Text style={styles.applicationBullet}>•</Text>
                                <Text style={styles.applicationCardText}>Minority classes often underrepresented</Text>
                            </View>
                        </View>
                        <View style={styles.applicationCard}>
                            <View style={styles.cardDecorTopRight} />
                            <View style={styles.cardDecorBottomLeft} />
                            <Text style={styles.applicationCardTitle}>Ineffective Anonymization</Text>
                            <View style={styles.applicationBulletItem}>
                                <Text style={styles.applicationBullet}>•</Text>
                                <Text style={styles.applicationCardText}>Masking and noise degrade data quality</Text>
                            </View>
                            <View style={styles.applicationBulletItem}>
                                <Text style={styles.applicationBullet}>•</Text>
                                <Text style={styles.applicationCardText}>Still vulnerable to privacy leakage</Text>
                            </View>

                        </View>
                    </View>
                </View>

                {/* Solution Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Our Solution: SynthData</Text>
                    <Text style={styles.solutionDescription}>
                        SynthData is a Generative AI-based synthetic data pipeline that learns real data distributions and generates privacy-safe, statistically consistent synthetic datasets without exposing original data.
                    </Text>

                    {/* Flowchart 2: SynthData Process */}
                    <View style={styles.processFlowchart}>
                        <View style={styles.processItem}>
                            <Image
                                source={require('./assets/dataset-icon.png')}
                                style={styles.processIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.processLabel}>Real Data</Text>
                        </View>
                        <View style={styles.processArrow}>
                            <Text style={styles.processArrowText}>→</Text>
                        </View>
                        <View style={styles.processItem}>
                            <Image
                                source={require('./assets/gear-funnel-icon.png')}
                                style={styles.processIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.processLabel}>Preprocessing</Text>
                        </View>
                        <View style={styles.processArrow}>
                            <Text style={styles.processArrowText}>→</Text>
                        </View>
                        <View style={styles.processItem}>
                            <Image
                                source={require('./assets/brain-gear-icon.png')}
                                style={styles.processIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.processLabel}>Generative Models</Text>
                        </View>
                        <View style={styles.processArrow}>
                            <Text style={styles.processArrowText}>→</Text>
                        </View>
                        <View style={styles.processItem}>
                            <Image
                                source={require('./assets/chip-icon.png')}
                                style={styles.processIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.processLabel}>Synthetic Data</Text>
                        </View>
                        <View style={styles.processArrow}>
                            <Text style={styles.processArrowText}>→</Text>
                        </View>
                        <View style={styles.processItem}>
                            <Image
                                source={require('./assets/analyst-icon.png')}
                                style={styles.processIcon}
                                resizeMode="contain"
                            />
                            <Text style={styles.processLabel}>AI Analyst</Text>
                        </View>
                    </View>
                </View>

                {/* Key Features Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Key Features Section</Text>
                    <View style={styles.featuresContainer}>
                        <View style={styles.featureItem}>
                            {/* <Image
                                source={require('./assets/brain-gear-icon.png')}
                                style={styles.featureIcon}
                                resizeMode="contain"
                            /> */}
                          
                          <FontAwesome5
                            name="exclamation-triangle"
                            size={30}
                            color="#000"
                            style={styles.privacyicon}
                          />
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>Privacy Preservation</Text>
                                <View style={styles.featureBulletItem}>
                                    <Text style={styles.featureBullet}>•</Text>
                                    <Text style={styles.featureText}>No record replication</Text>
                                </View>
                                <View style={styles.featureBulletItem}>
                                    <Text style={styles.featureBullet}>•</Text>
                                    <Text style={styles.featureText}>Safe for compliance-sensitive domains</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.featureItem}>
                        <FontAwesome5
                            name="chart-line"
                            size={30}
                            color="#000"
                            style={styles.privacyicon}
                          />
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>Statistical Fidelity</Text>
                                <View style={styles.featureBulletItem}>
                                    <Text style={styles.featureBullet}>•</Text>
                                    <Text style={styles.featureText}>Distribution & correlation matching</Text>
                                </View>
                                <View style={styles.featureBulletItem}>
                                    <Text style={styles.featureBullet}>•</Text>
                                    <Text style={styles.featureText}>Quantitative similarity metrics</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.featureItem}>
                        <FontAwesome5
                            name="robot"
                            size={30}
                            color="#000"
                            style={styles.privacyicon}
                          />
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>ML Utility</Text>
                                <View style={styles.featureBulletItem}>
                                    <Text style={styles.featureBullet}>•</Text>
                                    <Text style={styles.featureText}>Comparable model accuracy</Text>
                                </View>
                                <View style={styles.featureBulletItem}>
                                    <Text style={styles.featureBullet}>•</Text>
                                    <Text style={styles.featureText}>Useful for training & testing</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.featureItem}>
                        <FontAwesome5
                            name="cubes"
                            size={30}
                            color="#000"
                            style={styles.privacyicon}
                          />
                            <View style={styles.featureContent}>
                                <Text style={styles.featureTitle}>Modular Architecture</Text>
                                <View style={styles.featureBulletItem}>
                                    <Text style={styles.featureBullet}>•</Text>
                                    <Text style={styles.featureText}>Easily extensible to new domains</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Applications Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Real-World Applications of Synthetic Data</Text>
                    <Text style={styles.applicationsSubtitle}>
                        Secure, scalable, and compliant data {"\n"} generation across sensitive domains.
                    </Text>

                    <View style={styles.applicationCards}>
                        <View style={styles.applicationCard}>
                            <View style={styles.cardDecorTopRight} />
                            <View style={styles.cardDecorBottomLeft} />
                            <Text style={styles.applicationCardTitle}>Healthcare & Medical Research</Text>
                            <Text style={styles.applicationCardSubtitle}>Problem</Text>
                            <View style={styles.applicationBulletItem}>
                                <Text style={styles.applicationBullet}>•</Text>
                                <Text style={styles.applicationCardText}>Patient data is highly sensitive</Text>
                            </View>
                            <View style={styles.applicationBulletItem}>
                                <Text style={styles.applicationBullet}>•</Text>
                                <Text style={styles.applicationCardText}>Sharing EHRs violates privacy laws</Text>
                            </View>
                            <Text style={styles.applicationCardSubtitle}>How SynthData Helps</Text>
                            <View style={styles.applicationBulletItem}>
                                <Text style={styles.applicationBullet}>•</Text>
                                <Text style={styles.applicationCardText}>Generates synthetic patient records</Text>
                            </View>
                            <View style={styles.applicationBulletItem}>
                                <Text style={styles.applicationBullet}>•</Text>
                                <Text style={styles.applicationCardText}>Preserves statistical trends without revealing identities</Text>
                            </View>
                        </View>
                        <View style={styles.applicationCard}>
                            <View style={styles.cardDecorTopRight} />
                            <View style={styles.cardDecorBottomLeft} />
                            <Text style={styles.applicationCardTitle}>Finance & Banking</Text>
                            <Text style={styles.applicationCardSubtitle}>Problem</Text>
                            <View style={styles.applicationBulletItem}>
                                <Text style={styles.applicationBullet}>•</Text>
                                <Text style={styles.applicationCardText}>Fraud datasets are rare and confidential</Text>
                            </View>
                            <View style={styles.applicationBulletItem}>
                                <Text style={styles.applicationBullet}>•</Text>
                                <Text style={styles.applicationCardText}>Real fraud patterns are underrepresented</Text>
                            </View>
                            <Text style={styles.applicationCardSubtitle}>How SynthData Helps</Text>
                            <View style={styles.applicationBulletItem}>
                                <Text style={styles.applicationBullet}>•</Text>
                                <Text style={styles.applicationCardText}>Generates realistic transaction datasets</Text>
                            </View>
                            <View style={styles.applicationBulletItem}>
                                <Text style={styles.applicationBullet}>•</Text>
                                <Text style={styles.applicationCardText}>Handles class imbalance effectively</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.learnMoreButton}>
                        <Text style={styles.learnMoreButtonText}>Read more</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer Section */}
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
    fullContainer: {
        flex: 1,
    },
    generateScreenScrollView: {
        flex: 1,
    },
    generateScreenScrollContent: {
        flexGrow: 1,
    },
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
        paddingRight: 20,
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
    },
    topSection: {
        paddingHorizontal: 20,
        paddingTop: 80,
        paddingBottom: 40,
        alignItems: 'center',
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 32,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#000',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    bulletPoints: {
        width: '100%',
        marginBottom: 32,
        paddingHorizontal: 20,
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
    border: {
        padding: 3,
        borderRadius: 18,
    },
    // generateButton: {
    //   backgroundColor: '#fff',
    //   borderWidth: 2,
    //   borderColor: '#8B5CF6',
    //   borderRadius: 8,
    //   paddingVertical: 14,
    //   paddingHorizontal: 32,
    //   marginBottom: 40,
    //   minWidth: 200,
    //   alignItems: 'center',
    // },
    generateButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 30,
        borderRadius: 15,
    },
    diagramContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    diagramImage: {
        width: '100%',
        maxWidth: width - 40,
        aspectRatio: 0.8,
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
        textAlign: 'center',
    },
    problemCards: {
        width: '100%',
    },
    problemCard: {
        backgroundColor: '#000',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
    },
    problemCardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
    },
    problemCardText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#fff',
        marginBottom: 8,
        lineHeight: 20,
    },
    solutionDescription: {
        fontSize: 16,
        fontWeight: '400',
        color: '#000',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    processFlowchart: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    processItem: {
        alignItems: 'center',
        marginHorizontal: 8,
        marginVertical: 8,
        minWidth: 80,
    },
    processIcon: {
        width: 60,
        height: 60,
        marginBottom: 8,
    },
    processLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: '#000',
        textAlign: 'center',
    },
    processArrow: {
        marginHorizontal: 4,
    },
    processArrowText: {
        fontSize: 20,
        color: '#000',
    },
    featuresContainer: {
        width: '100%',
        marginTop: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    featureIcon: {
        width: 50,
        height: 50,
        marginRight: 16,
        marginTop: 4,
    },
    privacyicon:{
        marginLeft: 20,
        marginRight: 10,
        paddingTop: 7,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
        textAlign: 'left',
    },
    featureBulletItem: {
        flexDirection: 'row',
        marginBottom: 6,
        alignItems: 'flex-start',
    },
    featureBullet: {
        fontSize: 14,
        color: '#000',
        marginRight: 8,
        marginTop: 2,
    },
    featureText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000',
        textAlign: 'left',
        lineHeight: 20,
        flex: 1,
    },
    applicationsSubtitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    applicationCards: {
        width: '100%',
        marginBottom: 24,
    },
    applicationCard: {
        backgroundColor: '#000',
        borderRadius: 22,
        padding: 35,
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    cardDecorTopRight: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 80,
        height: 80,
        // borderTopRightRadius: 60,
        borderRadius: 60,
        backgroundColor: '#ffffff',
        opacity: 0.4,
    },
    cardDecorBottomLeft: {
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 80,
        height: 80,
        // borderBottomLeftRadius: 60,
        borderRadius: 60,
        backgroundColor: '#ffffff',
        opacity: 0.4,
    },
    applicationCardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
    },
    applicationCardSubtitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginTop: 12,
        marginBottom: 8,
    },
    applicationBulletItem: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    applicationBullet: {
        fontSize: 14,
        color: '#fff',
        marginRight: 8,
        marginTop: 2,
        fontWeight: '400',
    },
    applicationCardText: {
        fontSize: 14,
        fontWeight: '400',
        color: '#fff',
        lineHeight: 20,
        flex: 1,
    },
    learnMoreButton: {
        backgroundColor: '#000',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 32,
        alignSelf: 'center',
        minWidth: 150,
        alignItems: 'center',
        marginTop: 8,
    },
    learnMoreButtonText: {
        fontSize: 16,
        fontWeight: '400',
        color: '#fff',
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

