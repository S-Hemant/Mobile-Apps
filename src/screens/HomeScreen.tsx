import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from '../components/Gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../components/GlassCard';
import RingProgress from '../components/RingProgress';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useFitness } from '../context/FitnessContext';

const { width } = Dimensions.get('window');

const ACTIVITY_COLORS: Record<string, string> = {
  Running: Colors.violet,
  Gym: Colors.pink,
  Yoga: Colors.cyan,
  Cycling: Colors.warning,
  Swimming: Colors.success,
};

const ACTIVITY_ICONS: Record<string, string> = {
  Running: 'walk-outline',
  Gym: 'barbell-outline',
  Yoga: 'body-outline',
  Cycling: 'bicycle-outline',
  Swimming: 'water-outline',
};

export default function HomeScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { todayStats, workouts, streak } = useFitness();
  const scrollY = useRef(new Animated.Value(0)).current;

  const todayWorkouts = workouts.filter(
    w => w.date === new Date().toISOString().split('T')[0]
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const bg = isDark
    ? [Colors.bgDark, '#120826', Colors.bgDarkEnd] as [string, string, string]
    : [Colors.bgLight, '#E8EEFF', Colors.bgLightEnd] as [string, string, string];

  return (
    <LinearGradient colors={bg} locations={[0, 0.5, 1]} style={styles.container}>
      {/* Decorative aurora blobs in background */}
      <View style={[styles.auroraBlob1, { opacity: isDark ? 0.18 : 0.12 }]} />
      <View style={[styles.auroraBlob2, { opacity: isDark ? 0.14 : 0.08 }]} />

      <Animated.ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.appLabel, { color: Colors.violetLight }]}>
              PULSETRACK
            </Text>
            <Text style={[styles.greeting, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
              {greeting()}, Hemant 👋
            </Text>
            <Text style={[styles.dateText, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <GlassCard style={styles.streakCard} noPadding>
              <LinearGradient
                colors={['rgba(236,72,153,0.25)', 'rgba(124,58,237,0.25)']}
                style={styles.streakGrad}
              >
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakCount}>{streak}</Text>
                <Text style={[styles.streakLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>streak</Text>
              </LinearGradient>
            </GlassCard>
            <TouchableOpacity
              style={[styles.bellBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.08)' }]}
            >
              <Ionicons name="notifications-outline" size={20} color={isDark ? Colors.textPrimary : Colors.violet} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Progress Rings ── */}
        <GlassCard style={styles.ringsCard} glowColor={Colors.violet} variant="elevated">
          <View style={styles.ringsTitleRow}>
            <Text style={[styles.sectionLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
              DAILY GOALS
            </Text>
            <View style={[styles.dateBadge, { backgroundColor: isDark ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.1)' }]}>
              <Text style={[styles.dateBadgeText, { color: Colors.violetLight }]}>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>
          <View style={styles.ringsRow}>
            <RingProgress value={todayStats.steps} max={10000} color={Colors.violet} label="Steps" size={96} />
            <RingProgress value={todayStats.calories} max={2200} color={Colors.pink} label="Calories" unit="kcal" size={96} />
            <RingProgress value={todayStats.activeMinutes} max={60} color={Colors.cyan} label="Active" unit="min" size={96} />
          </View>
        </GlassCard>

        {/* ── Today's Summary ── */}
        <GlassCard style={styles.summaryCard} variant="subtle">
          <Text style={[styles.cardTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
            Today's Summary
          </Text>
          <View style={styles.statsRow}>
            {[
              { value: todayStats.steps.toLocaleString(), label: 'Steps', color: Colors.violet },
              { value: todayStats.calories.toLocaleString(), label: 'Calories', color: Colors.pink },
              { value: `${todayStats.distance.toFixed(1)} km`, label: 'Distance', color: Colors.cyan },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && (
                  <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]} />
                )}
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
                    {stat.label}
                  </Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </GlassCard>

        {/* ── Activity Timeline ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeading, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
            Today's Activity
          </Text>
          <TouchableOpacity
            style={[styles.seeAllBtn, { backgroundColor: isDark ? 'rgba(167,139,250,0.15)' : 'rgba(124,58,237,0.08)' }]}
            onPress={() => navigation.navigate('Feed')}
          >
            <Text style={[styles.seeAll, { color: Colors.violetLight }]}>See All</Text>
            <Ionicons name="chevron-forward" size={13} color={Colors.violetLight} />
          </TouchableOpacity>
        </View>

        {todayWorkouts.length === 0 ? (
          <GlassCard style={styles.emptyCard} variant="subtle">
            <Ionicons name="barbell-outline" size={32} color={isDark ? Colors.textMuted : 'rgba(0,0,0,0.2)'} />
            <Text style={[styles.emptyText, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
              No activities yet today.{'\n'}Log your first workout! 💪
            </Text>
          </GlassCard>
        ) : (
          todayWorkouts.map((workout) => {
            const color = ACTIVITY_COLORS[workout.type] || Colors.violet;
            const icon = ACTIVITY_ICONS[workout.type] || 'fitness-outline';
            return (
              <GlassCard key={workout.id} style={styles.activityCard} glowColor={color}>
                <View style={styles.activityRow}>
                  <LinearGradient
                    colors={[`${color}40`, `${color}18`]}
                    style={styles.activityIcon}
                  >
                    <Ionicons name={icon as any} size={22} color={color} />
                  </LinearGradient>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityName, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
                      {workout.type}
                    </Text>
                    <View style={styles.activityMeta}>
                      {workout.distance && (
                        <Text style={[styles.metaText, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
                          📍 {workout.distance}km
                        </Text>
                      )}
                      <Text style={[styles.metaText, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
                        ⏱ {workout.duration}min
                      </Text>
                      <Text style={[styles.metaText, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
                        🔥 {workout.calories}kcal
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.donePill, { backgroundColor: `${Colors.success}20` }]}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                    <Text style={[styles.doneText, { color: Colors.success }]}>Done</Text>
                  </View>
                </View>
              </GlassCard>
            );
          })
        )}

        {/* ── Quick Log ── */}
        <Text style={[styles.sectionHeading, { color: isDark ? Colors.textPrimary : Colors.textDark, marginTop: 4 }]}>
          Quick Log
        </Text>
        <View style={styles.quickGrid}>
          {[
            { icon: 'walk-outline', label: 'Run', color: Colors.violet, screen: 'Workout' },
            { icon: 'barbell-outline', label: 'Gym', color: Colors.pink, screen: 'Workout' },
            { icon: 'restaurant-outline', label: 'Meal', color: Colors.success, screen: 'Nutrition' },
            { icon: 'moon-outline', label: 'Sleep', color: Colors.cyan, screen: 'Sleep' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.75}
            >
              <GlassCard style={styles.quickCard} glowColor={item.color} noPadding>
                <LinearGradient
                  colors={[`${item.color}22`, `${item.color}0A`]}
                  style={styles.quickInner}
                >
                  <View style={[styles.quickIconBox, { backgroundColor: `${item.color}30` }]}>
                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                  </View>
                  <Text style={[styles.quickLabel, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
                    {item.label}
                  </Text>
                </LinearGradient>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 110 }} />
      </Animated.ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Aurora decorative blobs
  auroraBlob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.violet,
    top: -80,
    right: -80,
  },
  auroraBlob2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.pink,
    top: 200,
    left: -100,
  },

  scroll: {
    paddingHorizontal: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  appLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 2,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },
  headerRight: {
    gap: 8,
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  streakCard: {
    borderRadius: 18,
  },
  streakGrad: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 18,
    gap: 1,
  },
  streakEmoji: { fontSize: 20 },
  streakCount: { fontSize: 20, fontWeight: '800', color: Colors.pinkLight },
  streakLabel: { fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Rings card
  ringsCard: { marginBottom: 14 },
  ringsTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  dateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dateBadgeText: { fontSize: 11, fontWeight: '700' },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },

  // Summary
  summaryCard: { marginBottom: 22 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16, letterSpacing: -0.3 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 12, fontWeight: '500' },
  divider: { width: 1, height: 44 },

  // Activity section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: { fontSize: 19, fontWeight: '800', letterSpacing: -0.3 },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  seeAll: { fontSize: 13, fontWeight: '600' },

  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
    marginBottom: 16,
  },
  emptyText: { textAlign: 'center', fontSize: 14, lineHeight: 22 },

  activityCard: { marginBottom: 10 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: { flex: 1, gap: 5 },
  activityName: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  activityMeta: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  metaText: { fontSize: 12, fontWeight: '500' },
  donePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  doneText: { fontSize: 11, fontWeight: '700' },

  // Quick log
  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  quickCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  quickInner: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    gap: 8,
    width: (width - 90) / 4,
  },
  quickIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontSize: 11, fontWeight: '700', letterSpacing: -0.2 },
});
