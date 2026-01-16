import React, { useState } from 'react';
import LandingScreen from './LandingScreen';
import Login from './Login';
import Signup from './Signup';
import GenerateDataScreen from './GenerateDataScreen';
import EvaluateScreen from './EvaluateScreen';
import About from './About';

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
