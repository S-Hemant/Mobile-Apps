import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Modal, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../components/GlassCard';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useFitness, Goal } from '../context/FitnessContext';

const GOAL_COLORS = [Colors.violet, Colors.pink, Colors.cyan, Colors.warning, Colors.success];
const GOAL_TYPES = ['distance', 'workouts', 'calories', 'steps', 'custom'] as const;

const ACHIEVEMENTS = [
  { id: 'a1', label: 'First Run', icon: '🏃', unlocked: true },
  { id: 'a2', label: '7-Day Streak', icon: '🔥', unlocked: true },
  { id: 'a3', label: '100 Workouts', icon: '💯', unlocked: true },
  { id: 'a4', label: 'Night Owl', icon: '🦉', unlocked: true },
  { id: 'a5', label: 'Iron Man', icon: '🦾', unlocked: false },
  { id: 'a6', label: 'Marathon', icon: '🏅', unlocked: false },
  { id: 'a7', label: '30-Day Streak', icon: '⚡', unlocked: false },
];

export default function GoalsScreen() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { goals, addGoal, deleteGoal } = useFitness();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'distance' as typeof GOAL_TYPES[number],
    target: '',
    unit: 'km',
    deadline: '',
    colorIdx: 0,
  });

  const bg = isDark
    ? [Colors.bgDark, Colors.bgDarkEnd] as [string, string]
    : [Colors.bgLight, Colors.bgLightEnd] as [string, string];

  const handleAdd = async () => {
    if (!form.title || !form.target) {
      Alert.alert('Missing info', 'Please fill in all required fields.');
      return;
    }
    const goal: Goal = {
      id: Date.now().toString(),
      title: form.title,
      type: form.type,
      target: parseFloat(form.target) || 0,
      current: 0,
      unit: form.unit,
      deadline: form.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      color: GOAL_COLORS[form.colorIdx],
    };
    await addGoal(goal);
    setForm({ title: '', type: 'distance', target: '', unit: 'km', deadline: '', colorIdx: 0 });
    setModalVisible(false);
  };

  const overallProgress = goals.length
    ? goals.reduce((s, g) => s + Math.min(g.current / g.target, 1), 0) / goals.length
    : 0;

  return (
    <LinearGradient colors={bg} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.title, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
          Goals & Milestones 🎯
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: `${Colors.violet}20`, borderColor: Colors.violet }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={20} color={Colors.violetLight} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Overall progress */}
        <GlassCard style={styles.overallCard} glowColor={Colors.violet}>
          <Text style={[styles.cardTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
            Overall Progress
          </Text>
          <View style={styles.overallRow}>
            <Text style={[styles.overallPct, { color: Colors.violetLight }]}>
              {Math.round(overallProgress * 100)}%
            </Text>
            <View style={[styles.overallBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
              <LinearGradient
                colors={Colors.aurora as [string, string, string]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.overallFill, { width: `${overallProgress * 100}%` as any }]}
              />
            </View>
          </View>
          <Text style={[styles.overallSub, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
            {goals.filter(g => g.current >= g.target).length} of {goals.length} goals completed
          </Text>
        </GlassCard>

        {/* Goals list */}
        <Text style={[styles.sectionTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
          Active Goals
        </Text>

        {goals.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
              No goals yet! Add your first fitness goal 🎯
            </Text>
          </GlassCard>
        ) : (
          goals.map(goal => {
            const pct = Math.min(goal.current / goal.target, 1);
            const completed = pct >= 1;
            return (
              <GlassCard key={goal.id} style={styles.goalCard} glowColor={goal.color}>
                <View style={styles.goalTop}>
                  <View style={[styles.goalDot, { backgroundColor: goal.color }]} />
                  <Text style={[styles.goalTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
                    {goal.title}
                  </Text>
                  <View style={styles.goalActions}>
                    {completed && <Ionicons name="checkmark-circle" size={18} color={Colors.success} />}
                    <TouchableOpacity onPress={() => deleteGoal(goal.id)}>
                      <Ionicons name="trash-outline" size={16} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.goalProgressRow}>
                  <View style={[styles.goalProgressBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                    <View style={[styles.goalProgressFill, { width: `${pct * 100}%` as any, backgroundColor: goal.color }]} />
                  </View>
                  <Text style={[styles.goalPct, { color: goal.color }]}>
                    {Math.round(pct * 100)}%
                  </Text>
                </View>

                <View style={styles.goalFooter}>
                  <Text style={[styles.goalValues, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
                    {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                  </Text>
                  {goal.deadline && (
                    <Text style={[styles.goalDeadline, { color: isDark ? Colors.textMuted : 'rgba(0,0,0,0.35)' }]}>
                      📅 {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  )}
                </View>
              </GlassCard>
            );
          })
        )}

        {/* Achievements */}
        <Text style={[styles.sectionTitle, { color: isDark ? Colors.textPrimary : Colors.textDark, marginTop: 8 }]}>
          Achievements 🏆
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achieveScroll}>
          {ACHIEVEMENTS.map(a => (
            <View
              key={a.id}
              style={[
                styles.achieveBadge,
                {
                  backgroundColor: a.unlocked ? `${Colors.violet}20` : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                  borderColor: a.unlocked ? Colors.violetLight : (isDark ? Colors.glassBorderDark : Colors.glassBorderLight),
                  opacity: a.unlocked ? 1 : 0.4,
                }
              ]}
            >
              <Text style={styles.achieveIcon}>{a.icon}</Text>
              <Text style={[styles.achieveLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
                {a.label}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <LinearGradient
            colors={isDark ? [Colors.bgDark, Colors.bgDarkEnd] as [string,string] : ['#fff','#f0f4ff'] as [string,string]}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>New Goal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDark ? Colors.textSecondary : Colors.textDarkSecondary} />
              </TouchableOpacity>
            </View>

            {[
              { key: 'title', label: 'Goal title', keyboard: 'default' as any },
              { key: 'target', label: 'Target value', keyboard: 'decimal-pad' as any },
              { key: 'unit', label: 'Unit (km, days, kcal…)', keyboard: 'default' as any },
              { key: 'deadline', label: 'Deadline (YYYY-MM-DD)', keyboard: 'default' as any },
            ].map(field => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>{field.label}</Text>
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

            {/* Color picker */}
            <Text style={[styles.inputLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary, marginBottom: 8 }]}>Color</Text>
            <View style={styles.colorRow}>
              {GOAL_COLORS.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setForm(f => ({ ...f, colorIdx: i }))}
                  style={[styles.colorDot, { backgroundColor: c, borderWidth: form.colorIdx === i ? 3 : 0, borderColor: '#fff' }]}
                />
              ))}
            </View>

            <TouchableOpacity onPress={handleAdd} activeOpacity={0.85}>
              <LinearGradient
                colors={Colors.auroraVioletPink as [string, string]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.saveBtn}
              >
                <Ionicons name="flag" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Set Goal</Text>
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
  title: { fontSize: 22, fontWeight: '700' },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  scroll: { paddingHorizontal: 20 },
  overallCard: { marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  overallRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  overallPct: { fontSize: 28, fontWeight: '800', minWidth: 64 },
  overallBg: { flex: 1, height: 10, borderRadius: 5, overflow: 'hidden' },
  overallFill: { height: '100%', borderRadius: 5 },
  overallSub: { fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  emptyCard: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { textAlign: 'center', fontSize: 14 },
  goalCard: { marginBottom: 12 },
  goalTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  goalDot: { width: 10, height: 10, borderRadius: 5 },
  goalTitle: { flex: 1, fontSize: 14, fontWeight: '700' },
  goalActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  goalProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalProgressBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  goalProgressFill: { height: '100%', borderRadius: 4 },
  goalPct: { fontSize: 13, fontWeight: '700', minWidth: 36, textAlign: 'right' },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  goalValues: { fontSize: 12 },
  goalDeadline: { fontSize: 12 },
  achieveScroll: { marginBottom: 16 },
  achieveBadge: { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, marginRight: 10, minWidth: 80 },
  achieveIcon: { fontSize: 28 },
  achieveLabel: { fontSize: 10, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  inputCard: { borderRadius: 12 },
  input: { padding: 12, fontSize: 15 },
  colorRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
