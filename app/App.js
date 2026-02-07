import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import Navigator from './components/Navigator';
import Generator from './components/Generatormodel';
import Evaluatorstatistical from './components/Evaluatorstatistical';
import Account from './components/Account';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('Generator');

  return (
    <View style={styles.container}>
      {activeScreen === 'Generator' ? (
        <Generator />
      ) : activeScreen === 'Evaluator' ? (
        <Evaluatorstatistical />
      ) : activeScreen === 'Account' ? (
        <Account />
      ) : (
        <Generator />
      )}
      <Navigator onNavigate={setActiveScreen} activeScreen={activeScreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d8e4f7',
    justifyContent: 'space-between'
  }
});
