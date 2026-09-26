import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Alert, Modal,
} from 'react-native';
import { LinearGradient } from '../components/Gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../components/GlassCard';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useFitness, NutritionEntry } from '../context/FitnessContext';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const MEAL_ICONS: Record<string, string> = {
  breakfast: 'sunny-outline',
  lunch: 'restaurant-outline',
  dinner: 'moon-outline',
  snack: 'cafe-outline',
};
const MEAL_COLORS: Record<string, string> = {
  breakfast: Colors.warning,
  lunch: Colors.violet,
  dinner: Colors.cyan,
  snack: Colors.pink,
};

export default function NutritionScreen() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { nutritionLog, addNutrition, deleteNutrition } = useFitness();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'breakfast' as typeof MEAL_TYPES[number] });

  const bg = isDark
    ? [Colors.bgDark, Colors.bgDarkEnd] as [string, string]
    : [Colors.bgLight, Colors.bgLightEnd] as [string, string];

  const today = new Date().toISOString().split('T')[0];
  const todayEntries = nutritionLog.filter(e => e.date === today);

  const totals = todayEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const handleAdd = async () => {
    if (!form.name || !form.calories) {
      Alert.alert('Missing info', 'Please enter at least food name and calories.');
      return;
    }
    const entry: NutritionEntry = {
      id: Date.now().toString(),
      date: today,
      name: form.name,
      calories: parseFloat(form.calories) || 0,
      protein: parseFloat(form.protein) || 0,
      carbs: parseFloat(form.carbs) || 0,
      fat: parseFloat(form.fat) || 0,
      mealType: form.mealType,
    };
    await addNutrition(entry);
    setForm({ name: '', calories: '', protein: '', carbs: '', fat: '', mealType: 'breakfast' });
    setModalVisible(false);
  };

  const CalGoal = 2200;
  const calPct = Math.min(totals.calories / CalGoal, 1);

  return (
    <LinearGradient colors={bg} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.title, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
          Nutrition
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: `${Colors.success}20`, borderColor: Colors.success }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={20} color={Colors.success} />
          <Text style={[styles.addBtnText, { color: Colors.success }]}>Add Meal</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Calorie summary */}
        <GlassCard style={styles.summaryCard} glowColor={Colors.success}>
          <Text style={[styles.cardTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
            Today's Calories
          </Text>
          <View style={styles.calRow}>
            <Text style={[styles.calValue, { color: Colors.success }]}>
              {totals.calories.toLocaleString()}
            </Text>
            <Text style={[styles.calGoal, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
              / {CalGoal.toLocaleString()} kcal
            </Text>
          </View>
          {/* Progress bar */}
          <View style={[styles.progressBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
            <LinearGradient
              colors={[Colors.success, Colors.cyan]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${calPct * 100}%` as any }]}
            />
          </View>
          {/* Macro row */}
          <View style={styles.macroRow}>
            {[
              { label: 'Protein', val: totals.protein, color: Colors.violet, unit: 'g' },
              { label: 'Carbs', val: totals.carbs, color: Colors.warning, unit: 'g' },
              { label: 'Fat', val: totals.fat, color: Colors.pink, unit: 'g' },
            ].map(m => (
              <View key={m.label} style={styles.macro}>
                <Text style={[styles.macroVal, { color: m.color }]}>{m.val.toFixed(0)}{m.unit}</Text>
                <Text style={[styles.macroLabel, { color: isDark ? Colors.textMuted : 'rgba(0,0,0,0.4)' }]}>{m.label}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Meals by type */}
        {MEAL_TYPES.map(mealType => {
          const entries = todayEntries.filter(e => e.mealType === mealType);
          const color = MEAL_COLORS[mealType];
          const icon = MEAL_ICONS[mealType];
          const totalCal = entries.reduce((s, e) => s + e.calories, 0);
          return (
            <View key={mealType}>
              <View style={styles.mealHeader}>
                <View style={[styles.mealIconBox, { backgroundColor: `${color}20` }]}>
                  <Ionicons name={icon as any} size={16} color={color} />
                </View>
                <Text style={[styles.mealType, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </Text>
                {totalCal > 0 && (
                  <Text style={[styles.mealCal, { color }]}>{totalCal} kcal</Text>
                )}
              </View>

              {entries.map(entry => (
                <GlassCard key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryRow}>
                    <View style={styles.entryInfo}>
                      <Text style={[styles.entryName, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
                        {entry.name}
                      </Text>
                      <Text style={[styles.entryMacros, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
                        P: {entry.protein}g · C: {entry.carbs}g · F: {entry.fat}g
                      </Text>
                    </View>
                    <View style={styles.entryRight}>
                      <Text style={[styles.entryCal, { color }]}>{entry.calories}</Text>
                      <Text style={[styles.entryCalUnit, { color: isDark ? Colors.textMuted : 'rgba(0,0,0,0.4)' }]}>kcal</Text>
                    </View>
                    <TouchableOpacity onPress={() => deleteNutrition(entry.id)}>
                      <Ionicons name="close-circle" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              ))}

              {entries.length === 0 && (
                <TouchableOpacity
                  style={[styles.addMealRow, { borderColor: isDark ? Colors.glassBorderDark : Colors.glassBorderLight }]}
                  onPress={() => { setForm(f => ({ ...f, mealType })); setModalVisible(true); }}
                >
                  <Ionicons name="add" size={16} color={isDark ? Colors.textMuted : 'rgba(0,0,0,0.3)'} />
                  <Text style={[styles.addMealText, { color: isDark ? Colors.textMuted : 'rgba(0,0,0,0.3)' }]}>
                    Add {mealType}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={isDark ? [Colors.bgDark, Colors.bgDarkEnd] as [string,string] : ['#fff','#f0f4ff'] as [string,string]} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>Add Food</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDark ? Colors.textSecondary : Colors.textDarkSecondary} />
              </TouchableOpacity>
            </View>

            {/* Meal type selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {MEAL_TYPES.map(mt => {
                const c = MEAL_COLORS[mt];
                const active = form.mealType === mt;
                return (
                  <TouchableOpacity
                    key={mt}
                    style={[styles.mealChip, { backgroundColor: active ? `${c}30` : 'transparent', borderColor: active ? c : (isDark ? Colors.glassBorderDark : Colors.glassBorderLight) }]}
                    onPress={() => setForm(f => ({ ...f, mealType: mt }))}
                  >
                    <Text style={{ color: active ? c : (isDark ? Colors.textSecondary : Colors.textDarkSecondary), fontWeight: '600', fontSize: 13 }}>
                      {mt.charAt(0).toUpperCase() + mt.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {[
              { key: 'name', label: 'Food name', keyboard: 'default' as any },
              { key: 'calories', label: 'Calories (kcal)', keyboard: 'decimal-pad' as any },
              { key: 'protein', label: 'Protein (g)', keyboard: 'decimal-pad' as any },
              { key: 'carbs', label: 'Carbs (g)', keyboard: 'decimal-pad' as any },
              { key: 'fat', label: 'Fat (g)', keyboard: 'decimal-pad' as any },
            ].map(field => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
                  {field.label}
                </Text>
                <GlassCard style={styles.inputCard} noPadding>
                  <TextInput
                    style={[styles.input, { color: isDark ? Colors.textPrimary : Colors.textDark }]}
                    placeholder={field.label}
                    placeholderTextColor={Colors.textMuted}
                    keyboardType={field.keyboard}
                    value={(form as any)[field.key]}
                    onChangeText={(v) => setForm(f => ({ ...f, [field.key]: v }))}
                  />
                </GlassCard>
              </View>
            ))}

            <TouchableOpacity onPress={handleAdd} activeOpacity={0.85}>
              <LinearGradient
                colors={[Colors.success, Colors.cyan]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.saveBtn}
              >
                <Text style={styles.saveBtnText}>Save Food</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  addBtnText: { fontSize: 14, fontWeight: '600' },
  scroll: { paddingHorizontal: 20 },
  summaryCard: { marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  calRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 10 },
  calValue: { fontSize: 32, fontWeight: '800' },
  calGoal: { fontSize: 15 },
  progressBg: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', borderRadius: 4 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-around' },
  macro: { alignItems: 'center', gap: 2 },
  macroVal: { fontSize: 18, fontWeight: '700' },
  macroLabel: { fontSize: 11 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 16 },
  mealIconBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  mealType: { flex: 1, fontSize: 15, fontWeight: '700' },
  mealCal: { fontSize: 13, fontWeight: '600' },
  entryCard: { marginBottom: 8 },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  entryInfo: { flex: 1 },
  entryName: { fontSize: 14, fontWeight: '600' },
  entryMacros: { fontSize: 11, marginTop: 2 },
  entryRight: { alignItems: 'flex-end' },
  entryCal: { fontSize: 18, fontWeight: '800' },
  entryCalUnit: { fontSize: 10 },
  addMealRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', marginBottom: 4 },
  addMealText: { fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  mealChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, marginRight: 8 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  inputCard: { borderRadius: 12 },
  input: { padding: 12, fontSize: 15 },
  saveBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
