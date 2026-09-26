import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from '../components/Gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../components/GlassCard';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useFitness, SleepEntry } from '../context/FitnessContext';

const QUALITY_LABELS = ['Terrible', 'Poor', 'OK', 'Good', 'Great'];
const QUALITY_COLORS = [Colors.error, Colors.warning, Colors.warning, Colors.success, Colors.cyan];

export default function SleepScreen() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { sleepLog, addSleep } = useFitness();
  const [modalVisible, setModalVisible] = useState(false);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState<1|2|3|4|5>(4);

  const bg = isDark
    ? [Colors.bgDark, Colors.bgDarkEnd] as [string, string]
    : [Colors.bgLight, Colors.bgLightEnd] as [string, string];

  const calcDuration = (bed: string, wake: string) => {
    const [bh, bm] = bed.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);
    let diff = (wh * 60 + wm) - (bh * 60 + bm);
    if (diff < 0) diff += 24 * 60;
    return parseFloat((diff / 60).toFixed(1));
  };

  const handleSave = async () => {
    const dur = calcDuration(bedtime, wakeTime);
    if (dur < 1) { Alert.alert('Invalid', 'Please check your times.'); return; }
    const entry: SleepEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      bedtime, wakeTime,
      duration: dur,
      quality,
    };
    await addSleep(entry);
    setModalVisible(false);
  };

  const avgSleep = sleepLog.length
    ? (sleepLog.reduce((s, e) => s + e.duration, 0) / sleepLog.length).toFixed(1)
    : '0';

  const avgQuality = sleepLog.length
    ? (sleepLog.reduce((s, e) => s + e.quality, 0) / sleepLog.length).toFixed(1)
    : '0';

  // Weekly bars (last 7 entries)
  const weekEntries = sleepLog.slice(0, 7).reverse();
  const maxSleep = 10;

  return (
    <LinearGradient colors={bg} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.title, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
          Sleep 😴
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: `${Colors.sleep}20`, borderColor: Colors.sleep }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={20} color={Colors.sleep} />
          <Text style={[styles.addBtnText, { color: Colors.sleep }]}>Log Sleep</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <GlassCard style={styles.summaryCard} glowColor={Colors.sleep}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: Colors.sleep }]}>{avgSleep}h</Text>
              <Text style={[styles.summaryLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>Avg Sleep</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: isDark ? Colors.glassBorderDark : Colors.glassBorderLight }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: Colors.cyan }]}>{avgQuality}/5 ⭐</Text>
              <Text style={[styles.summaryLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>Avg Quality</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: isDark ? Colors.glassBorderDark : Colors.glassBorderLight }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: Colors.violet }]}>{sleepLog.length}</Text>
              <Text style={[styles.summaryLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>Nights Logged</Text>
            </View>
          </View>
        </GlassCard>

        {/* Weekly chart */}
        {weekEntries.length > 0 && (
          <GlassCard style={styles.chartCard}>
            <Text style={[styles.cardTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
              Sleep History
            </Text>
            <View style={styles.barsRow}>
              {weekEntries.map((entry, i) => {
                const h = (entry.duration / maxSleep) * 100;
                const qColor = QUALITY_COLORS[entry.quality - 1];
                return (
                  <View key={i} style={styles.barCol}>
                    <Text style={[styles.barVal, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
                      {entry.duration}h
                    </Text>
                    <View style={[styles.barBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                      <View style={[styles.barFill, { height: h, backgroundColor: qColor }]} />
                    </View>
                    <Text style={[styles.barDay, { color: isDark ? Colors.textMuted : 'rgba(0,0,0,0.35)' }]}>
                      {new Date(entry.date).toLocaleDateString('en', { weekday: 'narrow' })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </GlassCard>
        )}

        {/* Log entries */}
        <Text style={[styles.sectionTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
          Recent Logs
        </Text>
        {sleepLog.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
              No sleep logs yet. Log your first sleep! 🌙
            </Text>
          </GlassCard>
        ) : (
          sleepLog.slice(0, 10).map(entry => {
            const qColor = QUALITY_COLORS[entry.quality - 1];
            const qLabel = QUALITY_LABELS[entry.quality - 1];
            return (
              <GlassCard key={entry.id} style={styles.entryCard}>
                <View style={styles.entryTop}>
                  <View style={[styles.moonIcon, { backgroundColor: `${Colors.sleep}20` }]}>
                    <Ionicons name="moon" size={20} color={Colors.sleep} />
                  </View>
                  <View style={styles.entryInfo}>
                    <Text style={[styles.entryDate, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
                      {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                    <Text style={[styles.entryTimes, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
                      🛌 {entry.bedtime}  →  ⏰ {entry.wakeTime}
                    </Text>
                  </View>
                  <View style={styles.entryRight}>
                    <Text style={[styles.entryDuration, { color: Colors.sleep }]}>{entry.duration}h</Text>
                    <View style={[styles.qualityBadge, { backgroundColor: `${qColor}20` }]}>
                      <Text style={[styles.qualityText, { color: qColor }]}>{qLabel}</Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Log Sleep Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <LinearGradient
            colors={isDark ? [Colors.bgDark, Colors.bgDarkEnd] as [string,string] : ['#fff', '#f0f4ff'] as [string,string]}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
                Log Sleep
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDark ? Colors.textSecondary : Colors.textDarkSecondary} />
              </TouchableOpacity>
            </View>

            {[
              { label: 'Bedtime (HH:MM)', val: bedtime, setter: setBedtime },
              { label: 'Wake Time (HH:MM)', val: wakeTime, setter: setWakeTime },
            ].map(({ label, val, setter }) => (
              <View key={label} style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>{label}</Text>
                <GlassCard style={styles.inputCard} noPadding>
                  <TextInput
                    style={[styles.input, { color: isDark ? Colors.textPrimary : Colors.textDark }]}
                    value={val}
                    onChangeText={setter}
                    placeholder="23:00"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numbers-and-punctuation"
                  />
                </GlassCard>
              </View>
            ))}

            <Text style={[styles.inputLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary, marginBottom: 10 }]}>
              Sleep Quality
            </Text>
            <View style={styles.qualityRow}>
              {([1, 2, 3, 4, 5] as const).map(q => {
                const c = QUALITY_COLORS[q - 1];
                return (
                  <TouchableOpacity
                    key={q}
                    style={[styles.qualityBtn, { backgroundColor: quality === q ? `${c}30` : 'transparent', borderColor: quality === q ? c : (isDark ? Colors.glassBorderDark : Colors.glassBorderLight) }]}
                    onPress={() => setQuality(q)}
                  >
                    <Text style={[styles.qualityBtnText, { color: quality === q ? c : (isDark ? Colors.textSecondary : Colors.textDarkSecondary) }]}>
                      {q}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.durationPreview, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>
              Duration: {calcDuration(bedtime, wakeTime)}h
            </Text>

            <TouchableOpacity onPress={handleSave} activeOpacity={0.85}>
              <LinearGradient
                colors={[Colors.sleep, Colors.cyan]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.saveBtn}
              >
                <Ionicons name="moon" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Save Sleep</Text>
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
  summaryCard: { marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryVal: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 11 },
  summaryDivider: { width: 1, height: 40 },
  chartCard: { marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barVal: { fontSize: 9, fontWeight: '600' },
  barBg: { width: '100%', height: 80, borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 6 },
  barDay: { fontSize: 10, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  emptyCard: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { textAlign: 'center', fontSize: 14 },
  entryCard: { marginBottom: 10 },
  entryTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  moonIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  entryInfo: { flex: 1 },
  entryDate: { fontSize: 15, fontWeight: '700' },
  entryTimes: { fontSize: 12, marginTop: 2 },
  entryRight: { alignItems: 'flex-end', gap: 4 },
  entryDuration: { fontSize: 20, fontWeight: '800' },
  qualityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  qualityText: { fontSize: 11, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  inputCard: { borderRadius: 12 },
  input: { padding: 12, fontSize: 15 },
  qualityRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  qualityBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
  qualityBtnText: { fontSize: 16, fontWeight: '700' },
  durationPreview: { textAlign: 'center', fontSize: 13, marginBottom: 16 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 16 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
