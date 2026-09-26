import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../components/GlassCard';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useFitness, Workout } from '../context/FitnessContext';

const ACTIVITY_COLORS: Record<string, string> = {
  Running: Colors.violet, Gym: Colors.pink, Yoga: Colors.cyan,
  Cycling: Colors.warning, Swimming: Colors.success, Boxing: '#F97316', Custom: Colors.violetLight,
};
const ACTIVITY_ICONS: Record<string, string> = {
  Running: 'walk-outline', Gym: 'barbell-outline', Yoga: 'body-outline',
  Cycling: 'bicycle-outline', Swimming: 'water-outline', Boxing: 'hand-left-outline', Custom: 'fitness-outline',
};

function groupByDate(workouts: Workout[]) {
  const groups: Record<string, Workout[]> = {};
  for (const w of workouts) {
    if (!groups[w.date]) groups[w.date] = [];
    groups[w.date].push(w);
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function FeedScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { workouts, deleteWorkout } = useFitness();

  const grouped = groupByDate(workouts);
  const bg = isDark
    ? [Colors.bgDark, Colors.bgDarkEnd] as [string, string]
    : [Colors.bgLight, Colors.bgLightEnd] as [string, string];

  return (
    <LinearGradient colors={bg} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.title, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
          Activity Feed
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: `${Colors.violet}25`, borderColor: Colors.violet }]}
          onPress={() => navigation.navigate('Workout')}
        >
          <Ionicons name="add" size={20} color={Colors.violetLight} />
          <Text style={[styles.addBtnText, { color: Colors.violetLight }]}>Log</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {grouped.length === 0 && (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="barbell-outline" size={40} color={Colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
              No activities yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
              Start logging your workouts to see them here!
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Workout')}>
              <LinearGradient
                colors={Colors.auroraVioletPink as [string, string]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnText}>Log First Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        )}

        {grouped.map(([date, dayWorkouts]) => {
          const dayCalories = dayWorkouts.reduce((s, w) => s + w.calories, 0);
          const dayDuration = dayWorkouts.reduce((s, w) => s + w.duration, 0);
          return (
            <View key={date} style={styles.dateGroup}>
              {/* Date header */}
              <View style={styles.dateHeader}>
                <Text style={[styles.dateLabel, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
                  {formatDate(date)}
                </Text>
                <Text style={[styles.dateSummary, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
                  {dayWorkouts.length} workout{dayWorkouts.length > 1 ? 's' : ''} · {dayCalories} kcal · {dayDuration} min
                </Text>
              </View>

              {/* Workout cards */}
              {dayWorkouts.map((workout) => {
                const color = ACTIVITY_COLORS[workout.type] || Colors.violet;
                const icon = ACTIVITY_ICONS[workout.type] || 'fitness-outline';
                return (
                  <GlassCard key={workout.id} style={styles.workoutCard} glowColor={color}>
                    {/* Top row */}
                    <View style={styles.cardTop}>
                      <View style={[styles.iconBox, { backgroundColor: `${color}22` }]}>
                        <Ionicons name={icon as any} size={24} color={color} />
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={[styles.workoutType, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
                          {workout.type}
                        </Text>
                        <View style={styles.metaRow}>
                          <View style={[styles.metaBadge, { backgroundColor: `${color}18` }]}>
                            <Text style={[styles.metaValue, { color }]}>⏱ {workout.duration} min</Text>
                          </View>
                          <View style={[styles.metaBadge, { backgroundColor: `${Colors.pink}18` }]}>
                            <Text style={[styles.metaValue, { color: Colors.pinkLight }]}>🔥 {workout.calories} kcal</Text>
                          </View>
                          {workout.distance && (
                            <View style={[styles.metaBadge, { backgroundColor: `${Colors.cyan}18` }]}>
                              <Text style={[styles.metaValue, { color: Colors.cyanLight }]}>📍 {workout.distance} km</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => deleteWorkout(workout.id)}>
                        <Ionicons name="trash-outline" size={18} color={Colors.error} />
                      </TouchableOpacity>
                    </View>

                    {/* Exercises */}
                    {workout.exercises.length > 0 && (
                      <View style={[styles.exerciseList, { borderTopColor: isDark ? Colors.glassBorderDark : Colors.glassBorderLight }]}>
                        {workout.exercises.slice(0, 3).map((ex) => (
                          <View key={ex.id} style={styles.exRow}>
                            <Text style={[styles.exName, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
                              • {ex.name}
                            </Text>
                            <Text style={[styles.exSets, { color: isDark ? Colors.textMuted : 'rgba(0,0,0,0.35)' }]}>
                              {ex.sets.length} sets
                            </Text>
                          </View>
                        ))}
                        {workout.exercises.length > 3 && (
                          <Text style={[styles.moreEx, { color: color }]}>
                            +{workout.exercises.length - 3} more
                          </Text>
                        )}
                      </View>
                    )}

                    {workout.notes ? (
                      <Text style={[styles.notes, { color: isDark ? Colors.textMuted : 'rgba(0,0,0,0.4)' }]}>
                        💬 {workout.notes}
                      </Text>
                    ) : null}
                  </GlassCard>
                );
              })}
            </View>
          );
        })}

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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  addBtnText: { fontSize: 14, fontWeight: '600' },
  scroll: { paddingHorizontal: 20 },
  emptyCard: { alignItems: 'center', gap: 10, paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 13, textAlign: 'center' },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, marginTop: 8 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  dateGroup: { marginBottom: 20 },
  dateHeader: { marginBottom: 10 },
  dateLabel: { fontSize: 17, fontWeight: '700' },
  dateSummary: { fontSize: 12, marginTop: 2 },
  workoutCard: { marginBottom: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, gap: 6 },
  workoutType: { fontSize: 16, fontWeight: '700' },
  metaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  metaBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  metaValue: { fontSize: 11, fontWeight: '600' },
  exerciseList: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, gap: 4 },
  exRow: { flexDirection: 'row', justifyContent: 'space-between' },
  exName: { fontSize: 12 },
  exSets: { fontSize: 12 },
  moreEx: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  notes: { fontSize: 12, marginTop: 8, fontStyle: 'italic' },
});
