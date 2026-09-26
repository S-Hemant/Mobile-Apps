import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from '../components/Gradient';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';

// Screens
import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import StatsScreen from '../screens/StatsScreen';
import FeedScreen from '../screens/FeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NutritionScreen from '../screens/NutritionScreen';
import SleepScreen from '../screens/SleepScreen';
import GoalsScreen from '../screens/GoalsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_CONFIG = [
  { name: 'Home', label: 'Home', icon: 'home-outline', activeIcon: 'home', component: HomeScreen },
  { name: 'Workout', label: 'Workout', icon: 'barbell-outline', activeIcon: 'barbell', component: WorkoutScreen },
  { name: 'Stats', label: 'Stats', icon: 'bar-chart-outline', activeIcon: 'bar-chart', component: StatsScreen },
  { name: 'Feed', label: 'Feed', icon: 'list-outline', activeIcon: 'list', component: FeedScreen },
  { name: 'Profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person', component: ProfileScreen },
];

function TabBar({ state, descriptors, navigation }: any) {
  const { isDark } = useTheme();
  return (
    <View style={styles.tabBarWrapper}>
      <BlurView
        intensity={isDark ? 55 : 70}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.tabBar,
          {
            borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(180,160,255,0.3)',
            backgroundColor: isDark ? 'rgba(10,18,35,0.6)' : 'rgba(245,242,255,0.75)',
          }
        ]}
      >
        {state.routes.map((route: any, index: number) => {
          const tab = TAB_CONFIG[index];
          const focused = state.index === index;
          const color = focused ? '#fff' : (isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.3)');

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabItem}
              activeOpacity={0.75}
            >
              {focused && (
                <LinearGradient
                  colors={Colors.auroraVioletPink as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeBg}
                />
              )}
              <Ionicons
                name={(focused ? tab.activeIcon : tab.icon) as any}
                size={focused ? 23 : 21}
                color={color}
              />
              {focused && (
                <Text style={styles.tabLabelActive}>{tab.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {TAB_CONFIG.map(tab => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Nutrition" component={NutritionScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Sleep" component={SleepScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Goals" component={GoalsScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 32,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    overflow: 'hidden',
    // Top inner highlight
    borderTopColor: 'rgba(255,255,255,0.22)',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
    borderRadius: 24,
    overflow: 'hidden',
    minHeight: 48,
  },
  activeBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    opacity: 0.9,
  },
  tabLabelActive: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
