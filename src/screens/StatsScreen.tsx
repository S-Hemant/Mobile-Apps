import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../components/GlassCard';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useFitness } from '../context/FitnessContext';

const { width } = Dimensions.get('window');
const PERIODS = ['Week', 'Month', 'Year'];

// Mini bar chart component
const BarChart: React.FC<{ data: number[]; labels: string[]; color: string; isDark: boolean }> = ({
  data, labels, color, isDark,
}) => {
  const max = Math.max(...data, 1);
  const chartH = 100;
  return (
    <View style={barStyles.container}>
      <View style={barStyles.barsRow}>
        {data.map((val, i) => {
          const h = (val / max) * chartH;
          return (
            <View key={i} style={barStyles.barCol}>
              <View style={[barStyles.barBg, { height: chartH }]}>
                <LinearGradient
                  colors={Colors.aurora as [string, string, string]}
                  style={[barStyles.bar, { height: h }]}
                />
              </View>
              <Text style={[barStyles.barLabel, { color: isDark ? Colors.textMuted : 'rgba(0,0,0,0.35)' }]}>
                {labels[i]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const barStyles = StyleSheet.create({
  container: { paddingTop: 8 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barBg: { width: '100%', justifyContent: 'flex-end', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)' },
  bar: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 10, fontWeight: '600' },
});

// Breakdown bar
const BreakdownBar: React.FC<{
  items: { label: string; pct: number; color: string }[];
  isDark: boolean;
}> = ({ items, isDark }) => (
  <View>
    <View style={bdStyles.track}>
      {items.map((item, i) => (
        <View
          key={i}
          style={[bdStyles.segment, { flex: item.pct / 100, backgroundColor: item.color }]}
        />
      ))}
    </View>
    <View style={bdStyles.legend}>
      {items.map((item, i) => (
        <View key={i} style={bdStyles.legendItem}>
          <View style={[bdStyles.dot, { backgroundColor: item.color }]} />
          <Text style={[bdStyles.legendLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
            {item.label} {item.pct}%
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const bdStyles = StyleSheet.create({
  track: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 10 },
  segment: {},
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, fontWeight: '500' },
});

export default function StatsScreen() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { workouts, streak } = useFitness();
  const [period, setPeriod] = useState('Week');

  const bg = isDark
    ? [Colors.bgDark, Colors.bgDarkEnd] as [string, string]
    : [Colors.bgLight, Colors.bgLightEnd] as [string, string];

  const weekData = [4, 6, 3, 7, 5, 8, 6];
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthData = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10) + 3);
  const monthLabels = ['W1', 'W2', 'W3', 'W4'];
  const yearData = [28, 32, 25, 40, 35, 42, 38, 44, 30, 36, 41, 38];
  const yearLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  const chartData =
    period === 'Week' ? { data: weekData, labels: weekLabels }
    : period === 'Month' ? { data: monthData, labels: monthLabels }
    : { data: yearData, labels: yearLabels };

  const totalWorkouts = workouts.length;
  const totalCalories = workouts.reduce((s, w) => s + w.calories, 0);
  const avgDuration = workouts.length
    ? Math.round(workouts.reduce((s, w) => s + w.duration, 0) / workouts.length)
    : 0;

  const breakdown = [
    { label: 'Running', pct: 40, color: Colors.violet },
    { label: 'Gym', pct: 35, color: Colors.pink },
    { label: 'Yoga', pct: 15, color: Colors.cyan },
    { label: 'Other', pct: 10, color: Colors.textSecondary },
  ];

  const prs = [
    { label: 'Longest Run', value: '12 km', color: Colors.violet },
    { label: 'Max Bench', value: '100 kg', color: Colors.pink },
    { label: 'Best Streak', value: '21 days', color: Colors.cyan },
  ];

  const statCards = [
    { label: 'Total Workouts', value: totalWorkouts.toString(), icon: 'barbell-outline', color: Colors.violet, trend: '+20%' },
    { label: 'Calories Burned', value: `${totalCalories.toLocaleString()} kcal`, icon: 'flame-outline', color: Colors.pink },
    { label: 'Avg Duration', value: `${avgDuration} min`, icon: 'time-outline', color: Colors.cyan },
    { label: 'Day Streak', value: `${streak} 🔥`, icon: 'flash-outline', color: Colors.warning },
  ];

  return (
    <LinearGradient colors={bg} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.title, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
          Analytics
        </Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={22} color={isDark ? Colors.textSecondary : Colors.textDarkSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Period tabs */}
        <GlassCard style={styles.tabCard} noPadding>
          <View style={styles.tabRow}>
            {PERIODS.map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.tab, period === p && styles.tabActive]}
                onPress={() => setPeriod(p)}
              >
                {period === p && (
                  <LinearGradient
                    colors={Colors.auroraVioletPink as [string, string]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  />
                )}
                <Text style={[styles.tabText, { color: period === p ? '#fff' : (isDark ? Colors.textSecondary : Colors.textDarkSecondary) }]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {/* Activity Chart */}
        <GlassCard style={styles.chartCard} glowColor={Colors.violet}>
          <Text style={[styles.cardTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
            Weekly Activity
          </Text>
          <BarChart
            data={chartData.data}
            labels={chartData.labels}
            color={Colors.violet}
            isDark={isDark}
          />
        </GlassCard>

        {/* Stat grid */}
        <View style={styles.statGrid}>
          {statCards.map((card) => (
            <GlassCard key={card.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${card.color}20` }]}>
                <Ionicons name={card.icon as any} size={18} color={card.color} />
              </View>
              <Text style={[styles.statLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
                {card.label}
              </Text>
              <View style={styles.statValueRow}>
                <Text style={[styles.statValue, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
                  {card.value}
                </Text>
                {card.trend && (
                  <Text style={[styles.trend, { color: Colors.success }]}>{card.trend} ↑</Text>
                )}
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Breakdown */}
        <GlassCard style={styles.breakdownCard}>
          <Text style={[styles.cardTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
            Activity Breakdown
          </Text>
          <BreakdownBar items={breakdown} isDark={isDark} />
        </GlassCard>

        {/* PRs */}
        <GlassCard style={styles.prCard}>
          <Text style={[styles.cardTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
            Personal Records 🏆
          </Text>
          <View style={styles.prRow}>
            {prs.map(pr => (
              <View key={pr.label} style={[styles.prItem, { borderColor: `${pr.color}40` }]}>
                <Text style={[styles.prValue, { color: pr.color }]}>{pr.value}</Text>
                <Text style={[styles.prLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
                  {pr.label}
                </Text>
              </View>
            ))}
          </View>
        </GlassCard>

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: { fontSize: 24, fontWeight: '700' },
  scroll: { paddingHorizontal: 20 },
  tabCard: { marginBottom: 16 },
  tabRow: { flexDirection: 'row', borderRadius: 16, overflow: 'hidden', padding: 4, gap: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, overflow: 'hidden' },
  tabActive: {},
  tabText: { fontSize: 14, fontWeight: '600' },
  chartCard: { marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: { width: (width - 50) / 2, gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '600' },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 18, fontWeight: '800' },
  trend: { fontSize: 11, fontWeight: '600' },
  breakdownCard: { marginBottom: 16 },
  prCard: { marginBottom: 16 },
  prRow: { flexDirection: 'row', gap: 10 },
  prItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 4,
  },
  prValue: { fontSize: 17, fontWeight: '800' },
  prLabel: { fontSize: 10, fontWeight: '500', textAlign: 'center' },
});
