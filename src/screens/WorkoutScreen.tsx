import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../components/GlassCard';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useFitness, Workout, Exercise } from '../context/FitnessContext';

const ACTIVITY_TYPES = ['Running', 'Gym', 'Cycling', 'Yoga', 'Swimming', 'Boxing', 'Custom'];
const ACTIVITY_COLORS: Record<string, string> = {
  Running: Colors.violet, Gym: Colors.pink, Cycling: Colors.warning,
  Yoga: Colors.cyan, Swimming: Colors.success, Boxing: '#F97316', Custom: Colors.violetLight,
};

export default function WorkoutScreen({ navigation }: any) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { addWorkout } = useFitness();

  const [selectedType, setSelectedType] = useState('Gym');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [notes, setNotes] = useState('');
  const [distance, setDistance] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<any>(null);

  const bg = isDark
    ? [Colors.bgDark, Colors.bgDarkEnd] as [string, string]
    : [Colors.bgLight, Colors.bgLightEnd] as [string, string];

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const toggleTimer = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
    } else {
      setIsRunning(true);
      intervalRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    }
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const addExercise = () => {
    const newEx: Exercise = {
      id: Date.now().toString(),
      name: 'New Exercise',
      sets: [{ weight: 0, reps: 10, done: false }],
    };
    setExercises(prev => [...prev, newEx]);
  };

  const updateExerciseName = (id: string, name: string) => {
    setExercises(prev => prev.map(e => e.id === id ? { ...e, name } : e));
  };

  const addSet = (exerciseId: string) => {
    setExercises(prev => prev.map(e =>
      e.id === exerciseId
        ? { ...e, sets: [...e.sets, { weight: 0, reps: 10, done: false }] }
        : e
    ));
  };

  const updateSet = (exerciseId: string, setIdx: number, field: 'weight' | 'reps', value: string) => {
    setExercises(prev => prev.map(e =>
      e.id === exerciseId
        ? { ...e, sets: e.sets.map((s, i) => i === setIdx ? { ...s, [field]: parseFloat(value) || 0 } : s) }
        : e
    ));
  };

  const toggleSetDone = (exerciseId: string, setIdx: number) => {
    setExercises(prev => prev.map(e =>
      e.id === exerciseId
        ? { ...e, sets: e.sets.map((s, i) => i === setIdx ? { ...s, done: !s.done } : s) }
        : e
    ));
  };

  const removeExercise = (id: string) => {
    setExercises(prev => prev.filter(e => e.id !== id));
  };

  const finishWorkout = async () => {
    if (elapsed < 30 && exercises.length === 0) {
      Alert.alert('Almost empty!', 'Add at least one exercise or log some time before finishing.');
      return;
    }
    const cal = Math.round((elapsed / 60) * 7);
    const workout: Workout = {
      id: Date.now().toString(),
      type: selectedType,
      date: new Date().toISOString().split('T')[0],
      duration: Math.max(1, Math.round(elapsed / 60)),
      calories: cal,
      exercises,
      notes,
      distance: distance ? parseFloat(distance) : undefined,
    };
    await addWorkout(workout);
    clearInterval(intervalRef.current);
    Alert.alert('🎉 Workout Saved!', `Great job! You trained for ${formatTime(elapsed)}.`, [
      { text: 'Done', onPress: () => navigation.navigate('Home') }
    ]);
  };

  const color = ACTIVITY_COLORS[selectedType] || Colors.violet;

  return (
    <LinearGradient colors={bg} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? Colors.textPrimary : Colors.textDark} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
          Log Workout
        </Text>
        <TouchableOpacity onPress={toggleTimer}>
          <Text style={[styles.timer, { color: isRunning ? Colors.cyan : Colors.textSecondary }]}>
            {formatTime(elapsed)}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Type selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          {ACTIVITY_TYPES.map(type => {
            const c = ACTIVITY_COLORS[type] || Colors.violet;
            const active = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, {
                  backgroundColor: active ? `${c}30` : 'transparent',
                  borderColor: active ? c : (isDark ? Colors.glassBorderDark : Colors.glassBorderLight),
                }]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[styles.typeLabel, { color: active ? c : (isDark ? Colors.textSecondary : Colors.textDarkSecondary) }]}>
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Distance (for cardio) */}
        {['Running', 'Cycling', 'Swimming'].includes(selectedType) && (
          <GlassCard style={styles.distanceCard}>
            <Text style={[styles.cardLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
              Distance (km)
            </Text>
            <TextInput
              style={[styles.distanceInput, { color: isDark ? Colors.textPrimary : Colors.textDark }]}
              placeholder="0.0"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
              value={distance}
              onChangeText={setDistance}
            />
          </GlassCard>
        )}

        {/* Exercises */}
        {exercises.map((ex, exIdx) => (
          <GlassCard key={ex.id} style={styles.exerciseCard} glowColor={color}>
            <View style={styles.exHeader}>
              <View style={[styles.exNum, { backgroundColor: `${color}25` }]}>
                <Text style={[styles.exNumText, { color }]}>{exIdx + 1}</Text>
              </View>
              <TextInput
                style={[styles.exName, { color: isDark ? Colors.textPrimary : Colors.textDark }]}
                value={ex.name}
                onChangeText={(t) => updateExerciseName(ex.id, t)}
                placeholder="Exercise name"
                placeholderTextColor={Colors.textMuted}
              />
              <TouchableOpacity onPress={() => removeExercise(ex.id)}>
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>

            {/* Set headers */}
            <View style={styles.setHeader}>
              <Text style={[styles.setHeaderText, { color: isDark ? Colors.textMuted : 'rgba(0,0,0,0.4)' }]}>SET</Text>
              <Text style={[styles.setHeaderText, { color: isDark ? Colors.textMuted : 'rgba(0,0,0,0.4)' }]}>KG</Text>
              <Text style={[styles.setHeaderText, { color: isDark ? Colors.textMuted : 'rgba(0,0,0,0.4)' }]}>REPS</Text>
              <Text style={[styles.setHeaderText, { color: isDark ? Colors.textMuted : 'rgba(0,0,0,0.4)' }]}>✓</Text>
            </View>

            {ex.sets.map((set, setIdx) => (
              <View key={setIdx} style={[
                styles.setRow,
                { backgroundColor: set.done ? `${Colors.success}12` : 'transparent' }
              ]}>
                <Text style={[styles.setNum, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
                  {setIdx + 1}
                </Text>
                <TextInput
                  style={[styles.setInput, { color: isDark ? Colors.textPrimary : Colors.textDark, borderColor: isDark ? Colors.glassBorderDark : Colors.glassBorderLight }]}
                  keyboardType="decimal-pad"
                  value={set.weight ? set.weight.toString() : ''}
                  onChangeText={(v) => updateSet(ex.id, setIdx, 'weight', v)}
                  placeholder="0"
                  placeholderTextColor={Colors.textMuted}
                />
                <TextInput
                  style={[styles.setInput, { color: isDark ? Colors.textPrimary : Colors.textDark, borderColor: isDark ? Colors.glassBorderDark : Colors.glassBorderLight }]}
                  keyboardType="number-pad"
                  value={set.reps ? set.reps.toString() : ''}
                  onChangeText={(v) => updateSet(ex.id, setIdx, 'reps', v)}
                  placeholder="10"
                  placeholderTextColor={Colors.textMuted}
                />
                <TouchableOpacity onPress={() => toggleSetDone(ex.id, setIdx)}>
                  <Ionicons
                    name={set.done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={set.done ? Colors.success : (isDark ? Colors.textMuted : 'rgba(0,0,0,0.3)')}
                  />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.addSetBtn, { borderColor: `${color}50` }]}
              onPress={() => addSet(ex.id)}
            >
              <Ionicons name="add" size={16} color={color} />
              <Text style={[styles.addSetText, { color }]}>Add Set</Text>
            </TouchableOpacity>
          </GlassCard>
        ))}

        {/* Add Exercise button */}
        <TouchableOpacity
          style={[styles.addExBtn, { borderColor: isDark ? Colors.glassBorderDark : Colors.glassBorderLight }]}
          onPress={addExercise}
        >
          <Ionicons name="add-circle-outline" size={20} color={isDark ? Colors.textSecondary : Colors.textDarkSecondary} />
          <Text style={[styles.addExText, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
            Add Exercise
          </Text>
        </TouchableOpacity>

        {/* Notes */}
        <GlassCard style={styles.notesCard}>
          <TextInput
            style={[styles.notesInput, { color: isDark ? Colors.textPrimary : Colors.textDark }]}
            placeholder="Notes (optional)..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </GlassCard>

        {/* Finish Button */}
        <TouchableOpacity onPress={finishWorkout} activeOpacity={0.85}>
          <LinearGradient
            colors={Colors.aurora as [string, string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.finishBtn}
          >
            <Ionicons name="checkmark-done" size={22} color="#fff" />
            <Text style={styles.finishText}>Finish Workout</Text>
          </LinearGradient>
        </TouchableOpacity>

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
  title: { fontSize: 20, fontWeight: '700' },
  timer: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  scroll: { paddingHorizontal: 20 },
  typeScroll: { marginBottom: 16 },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  typeLabel: { fontSize: 13, fontWeight: '600' },
  distanceCard: { marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLabel: { fontSize: 14, fontWeight: '600' },
  distanceInput: { fontSize: 24, fontWeight: '700', textAlign: 'right', flex: 1 },
  exerciseCard: { marginBottom: 12 },
  exHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  exNum: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  exNumText: { fontSize: 13, fontWeight: '700' },
  exName: { flex: 1, fontSize: 15, fontWeight: '700' },
  setHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 },
  setHeaderText: { fontSize: 10, fontWeight: '700', letterSpacing: 1, width: 50, textAlign: 'center' },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 4,
  },
  setNum: { width: 50, textAlign: 'center', fontSize: 13, fontWeight: '600' },
  setInput: {
    width: 50,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 4,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  addSetText: { fontSize: 13, fontWeight: '600' },
  addExBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addExText: { fontSize: 14, fontWeight: '600' },
  notesCard: { marginBottom: 20 },
  notesInput: { fontSize: 14, minHeight: 60 },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 18,
  },
  finishText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
