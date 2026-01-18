import React, { useState } from 'react';
import LandingScreen from './src/screens/LandingScreen';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import GenerateDataScreen from './src/screens/GenerateDataScreen';
import EvaluateScreen from './src/screens/EvaluateScreen';
import About from './src/screens/About';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');

  // Navigation functions
  const goToHome = () => setCurrentScreen('landing');
  const goToLogin = () => setCurrentScreen('login');
  const goToSignup = () => setCurrentScreen('signup');
  const goToGenerate = () => setCurrentScreen('generator');
  const goToEvaluate = () => setCurrentScreen('evaluator');
  const goToAbout = () => setCurrentScreen('about');

  if (currentScreen === 'login') {
    return <Login onClose={goToHome} goToSignUp={goToSignup} />;
  }

  if(currentScreen === 'signup'){
    return <Signup onClose={goToLogin}/>;
  }

  if(currentScreen === 'generator'){
    return <GenerateDataScreen 
      onBack={goToHome} 
      goToLogin={goToLogin}
      goToGenerate={goToGenerate}
      goToEvaluate={goToEvaluate}
      goToHome={goToHome}
      goToAbout={goToAbout}
    />;
  }

  if(currentScreen === 'evaluator'){
    return <EvaluateScreen 
      onBack={goToHome}
      goToLogin={goToLogin}
      goToGenerate={goToGenerate}
      goToEvaluate={goToEvaluate}
      goToHome={goToHome}
      goToAbout={goToAbout}
    />;
  }

  if(currentScreen === 'about'){
    return <About 
      onBack={goToHome}
      goToLogin={goToLogin}
      goToGenerate={goToGenerate}
      goToEvaluate={goToEvaluate}
      goToHome={goToHome}
      goToAbout={goToAbout}
    />;
  }

  return (
    <LandingScreen 
      goToLogin={goToLogin} 
      goToGenerate={goToGenerate} 
      goToEvaluate={goToEvaluate}
      goToHome={goToHome}
      goToAbout={goToAbout}
    />
  );
}
