import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import {
  AuthStackParamList,
  MainTabParamList,
} from "../types/navigation";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { SignUpScreen } from "../screens/auth/SignUpScreen";
import { GeneratorScreen } from "../screens/generator/GeneratorScreen";
import { EvaluatorScreen } from "../screens/evaluator/EvaluatorScreen";
import { AccountScreen } from "../screens/account/AccountScreen";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ size, color }) => {
          const iconName =
            route.name === "Generator"
              ? "flash"
              : route.name === "Evaluator"
                ? "stats-chart"
                : "person";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Generator" component={GeneratorScreen} />
      <Tabs.Screen name="Evaluator" component={EvaluatorScreen} />
      <Tabs.Screen name="Account" component={AccountScreen} />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return isAuthenticated ? <TabNavigator /> : <AuthNavigator />;
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#f8fbff",
    borderTopColor: colors.border,
  },
});
