import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../components/GlassCard';
import { Colors } from '../theme/colors';
import { useTheme } from '../theme/ThemeContext';
import { useFitness } from '../context/FitnessContext';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { workouts, streak, goals } = useFitness();

  const bg = isDark
    ? [Colors.bgDark, Colors.bgDarkEnd] as [string, string]
    : [Colors.bgLight, Colors.bgLightEnd] as [string, string];

  const totalDistance = workouts.reduce((s, w) => s + (w.distance || 0), 0).toFixed(0);
  const totalCalories = workouts.reduce((s, w) => s + w.calories, 0);

  const level = 18;
  const xp = 7450;
  const xpNext = 8800;
  const xpPct = xp / xpNext;

  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        {
          icon: isDark ? 'moon-outline' : 'sunny-outline',
          label: isDark ? 'Dark Mode' : 'Light Mode',
          color: Colors.violet,
          right: (
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.violet }}
              thumbColor="#fff"
            />
          ),
        },
        { icon: 'notifications-outline', label: 'Notifications', color: Colors.pink, chevron: true },
        { icon: 'flag-outline', label: 'Daily Goals Setup', color: Colors.cyan, chevron: true },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', color: Colors.violet, chevron: true },
        { icon: 'hardware-chip-outline', label: 'Connected Devices', color: Colors.success, chevron: true },
        { icon: 'lock-closed-outline', label: 'Privacy & Security', color: Colors.warning, chevron: true },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help & FAQ', color: Colors.cyan, chevron: true },
        { icon: 'star-outline', label: 'Rate PulseTrack', color: Colors.warning, chevron: true },
        { icon: 'log-out-outline', label: 'Log Out', color: Colors.error, chevron: false },
      ],
    },
  ];

  return (
    <LinearGradient colors={bg} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={Colors.aurora as [string, string, string]}
              style={styles.avatarRing}
            >
              <View style={[styles.avatarInner, { backgroundColor: isDark ? Colors.bgDark : '#fff' }]}>
                <Text style={styles.avatarEmoji}>🧑‍💪</Text>
              </View>
            </LinearGradient>
          </View>
          <Text style={[styles.name, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
            Hemant
          </Text>
          <Text style={[styles.tier, { color: Colors.violetLight }]}>
            ✦ Gold Member · Level {level}
          </Text>

          {/* XP Bar */}
          <View style={styles.xpRow}>
            <Text style={[styles.xpText, { color: isDark ? Colors.textMuted : 'rgba(0,0,0,0.4)' }]}>
              {xp.toLocaleString()} XP
            </Text>
            <View style={[styles.xpBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
              <LinearGradient
                colors={Colors.auroraVioletPink as [string, string]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.xpFill, { width: `${xpPct * 100}%` as any }]}
              />
            </View>
            <Text style={[styles.xpText, { color: isDark ? Colors.textMuted : 'rgba(0,0,0,0.4)' }]}>
              {xpNext.toLocaleString()} XP
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <GlassCard style={styles.statsCard}>
          {[
            { label: 'Workouts', value: workouts.length.toString(), color: Colors.violet },
            { label: 'Day Streak', value: `${streak} 🔥`, color: Colors.pink },
            { label: 'Distance', value: `${totalDistance}km`, color: Colors.cyan },
            { label: 'Kcal', value: totalCalories > 1000 ? `${(totalCalories/1000).toFixed(1)}k` : totalCalories.toString(), color: Colors.warning },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: isDark ? Colors.glassBorderDark : Colors.glassBorderLight }]} />}
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: isDark ? Colors.textSecondary : Colors.textDarkSecondary }]}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </GlassCard>

        {/* Goals quick view */}
        <Text style={[styles.sectionTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
          Active Goals
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.goalsScroll}>
          {goals.map(goal => {
            const pct = Math.min(goal.current / goal.target, 1);
            return (
              <GlassCard key={goal.id} style={styles.goalCard} glowColor={goal.color}>
                <Text style={[styles.goalTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
                  {goal.title}
                </Text>
                <View style={[styles.goalBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
                  <View style={[styles.goalBarFill, { width: `${pct * 100}%` as any, backgroundColor: goal.color }]} />
                </View>
                <Text style={[styles.goalPct, { color: goal.color }]}>{Math.round(pct * 100)}%</Text>
              </GlassCard>
            );
          })}
        </ScrollView>

        {/* Settings */}
        {settingsGroups.map(group => (
          <View key={group.title}>
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.textPrimary : Colors.textDark }]}>
              {group.title}
            </Text>
            <GlassCard style={styles.settingsCard} noPadding>
              {group.items.map((item, i) => (
                <React.Fragment key={item.label}>
                  {i > 0 && <View style={[styles.rowDivider, { backgroundColor: isDark ? Colors.glassBorderDark : Colors.glassBorderLight }]} />}
                  <TouchableOpacity style={styles.settingRow}>
                    <View style={[styles.settingIcon, { backgroundColor: `${item.color}20` }]}>
                      <Ionicons name={item.icon as any} size={18} color={item.color} />
                    </View>
                    <Text style={[styles.settingLabel, { color: item.label === 'Log Out' ? Colors.error : (isDark ? Colors.textPrimary : Colors.textDark) }]}>
                      {item.label}
                    </Text>
                    {item.right}
                    {item.chevron && (
                      <Ionicons name="chevron-forward" size={16} color={isDark ? Colors.textMuted : 'rgba(0,0,0,0.3)'} />
                    )}
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </GlassCard>
          </View>
        ))}

        <Text style={[styles.version, { color: isDark ? Colors.textMuted : 'rgba(0,0,0,0.3)' }]}>
          PulseTrack v1.0.0 · Made with 💜
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarWrapper: { marginBottom: 12 },
  avatarRing: { width: 96, height: 96, borderRadius: 48, padding: 3, alignItems: 'center', justifyContent: 'center' },
  avatarInner: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 44 },
  name: { fontSize: 26, fontWeight: '800', marginBottom: 4 },
  tier: { fontSize: 13, fontWeight: '600', marginBottom: 14 },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  xpText: { fontSize: 10, fontWeight: '600', minWidth: 48 },
  xpBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 4 },
  statsCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statVal: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10 },
  divider: { width: 1, height: 36 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  goalsScroll: { marginBottom: 20 },
  goalCard: { width: 160, marginRight: 10 },
  goalTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8, numberOfLines: 2 } as any,
  goalBarBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  goalBarFill: { height: '100%', borderRadius: 3 },
  goalPct: { fontSize: 13, fontWeight: '700' },
  settingsCard: { marginBottom: 20 },
  rowDivider: { height: 1, marginHorizontal: 16 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  version: { textAlign: 'center', fontSize: 12, marginBottom: 8 },
});
