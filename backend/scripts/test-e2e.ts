import app from '../src/app';
import { Server } from 'http';

interface TestResult {
  feature: string;
  test: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, feature: string, test: string, details?: string) {
  if (condition) {
    results.push({ feature, test, passed: true, details });
    console.log(`  ✅ [${feature}] ${test}`);
  } else {
    results.push({ feature, test, passed: false, details });
    console.error(`  ❌ [${feature}] ${test} - FAILED: ${details || ''}`);
  }
}

async function runE2E() {
  console.log('======================================================');
  console.log('🧪 Starting PulseTrack End-to-End Feature Verification');
  console.log('======================================================\n');

  const PORT = 5555;
  const server: Server = app.listen(PORT);
  const baseUrl = `http://localhost:${PORT}`;

  try {
    // ── 1. Health & Server Check ──
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'System', 'Health check endpoint returns 200 OK');

    // ── 2. Auth & User Profile Feature (Profile Screen) ──
    const demoRes = await fetch(`${baseUrl}/api/auth/demo`, { method: 'POST' });
    const demoData = await demoRes.json();
    assert(demoRes.status === 200 && Boolean(demoData.token), 'Auth/Profile', 'Demo login produces valid JWT token');

    const token = demoData.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const meRes = await fetch(`${baseUrl}/api/auth/me`, { headers: authHeaders });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user.name === 'Hemant', 'Auth/Profile', 'Fetch current user profile succeeds');

    const updateProfileRes = await fetch(`${baseUrl}/api/auth/profile`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ themePreference: 'dark', avatarEmoji: '⚡' }),
    });
    const updateProfileData = await updateProfileRes.json();
    assert(
      updateProfileRes.status === 200 && updateProfileData.user.avatarEmoji === '⚡',
      'Auth/Profile',
      'Update user preferences & avatar succeeds'
    );

    // ── 3. Workouts Feature (Workout Screen & Feed Screen) ──
    const initialWorkoutsRes = await fetch(`${baseUrl}/api/workouts`, { headers: authHeaders });
    const initialWorkoutsData = await initialWorkoutsRes.json();
    assert(initialWorkoutsRes.status === 200 && Array.isArray(initialWorkoutsData.data), 'Workouts', 'Fetch workout feed succeeds');

    const newWorkoutPayload = {
      type: 'Gym',
      date: new Date().toISOString().split('T')[0],
      duration: 55,
      calories: 380,
      exercises: [
        {
          id: 'ex_test_1',
          name: 'Incline Dumbbell Press',
          sets: [
            { weight: 28, reps: 12, done: true },
            { weight: 32, reps: 10, done: true },
          ],
        },
      ],
      notes: 'End-to-End verified workout session',
    };

    const createWorkoutRes = await fetch(`${baseUrl}/api/workouts`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newWorkoutPayload),
    });
    const createWorkoutData = await createWorkoutRes.json();
    assert(createWorkoutRes.status === 201 && createWorkoutData.success, 'Workouts', 'Log workout with exercise sets succeeds');
    const createdWorkoutId = createWorkoutData.data.id;

    const getWorkoutRes = await fetch(`${baseUrl}/api/workouts/${createdWorkoutId}`, { headers: authHeaders });
    const getWorkoutData = await getWorkoutRes.json();
    assert(
      getWorkoutRes.status === 200 && getWorkoutData.data.exercises[0].name === 'Incline Dumbbell Press',
      'Workouts',
      'Get workout by ID verifies exercise details'
    );

    const updateWorkoutRes = await fetch(`${baseUrl}/api/workouts/${createdWorkoutId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ notes: 'Updated notes from E2E test' }),
    });
    const updateWorkoutData = await updateWorkoutRes.json();
    assert(
      updateWorkoutRes.status === 200 && updateWorkoutData.data.notes === 'Updated notes from E2E test',
      'Workouts',
      'Update existing workout succeeds'
    );

    const deleteWorkoutRes = await fetch(`${baseUrl}/api/workouts/${createdWorkoutId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const deleteWorkoutData = await deleteWorkoutRes.json();
    assert(deleteWorkoutRes.status === 200 && deleteWorkoutData.success, 'Workouts', 'Delete workout succeeds');

    // ── 4. Daily Stats & Summary Feature (Home Screen & Stats Screen) ──
    const todayStatsRes = await fetch(`${baseUrl}/api/stats/today`, { headers: authHeaders });
    const todayStatsData = await todayStatsRes.json();
    assert(todayStatsRes.status === 200 && todayStatsData.data.date !== undefined, 'Daily Stats', 'Fetch today progress rings data succeeds');

    const updateStatsRes = await fetch(`${baseUrl}/api/stats/today`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ steps: 9500, calories: 1450, activeMinutes: 50, distance: 4.2 }),
    });
    const updateStatsData = await updateStatsRes.json();
    assert(
      updateStatsRes.status === 200 && updateStatsData.data.steps === 9500,
      'Daily Stats',
      'Update real-time steps/calories/active minutes succeeds'
    );

    const summaryStatsRes = await fetch(`${baseUrl}/api/stats/summary`, { headers: authHeaders });
    const summaryStatsData = await summaryStatsRes.json();
    assert(
      summaryStatsRes.status === 200 && summaryStatsData.data.totalWorkouts > 0,
      'Analytics',
      'Fetch summary analytics & activity distribution succeeds'
    );

    // ── 5. Nutrition & Macro Feature (Nutrition Screen) ──
    const nutritionRes = await fetch(`${baseUrl}/api/nutrition`, { headers: authHeaders });
    const nutritionData = await nutritionRes.json();
    assert(nutritionRes.status === 200 && nutritionData.totals !== undefined, 'Nutrition', 'Fetch meal logs & calculated daily macro totals succeeds');

    const newMealPayload = {
      date: new Date().toISOString().split('T')[0],
      name: 'Salmon bowl with avocado & brown rice',
      calories: 550,
      protein: 42,
      carbs: 48,
      fat: 20,
      mealType: 'dinner',
    };
    const addMealRes = await fetch(`${baseUrl}/api/nutrition`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newMealPayload),
    });
    const addMealData = await addMealRes.json();
    assert(addMealRes.status === 201 && addMealData.data.protein === 42, 'Nutrition', 'Log meal with macros succeeds');
    const createdMealId = addMealData.data.id;

    const deleteMealRes = await fetch(`${baseUrl}/api/nutrition/${createdMealId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(deleteMealRes.status === 200, 'Nutrition', 'Delete meal log entry succeeds');

    // ── 6. Sleep Tracking Feature (Sleep Screen) ──
    const sleepRes = await fetch(`${baseUrl}/api/sleep`, { headers: authHeaders });
    const sleepData = await sleepRes.json();
    assert(sleepRes.status === 200 && sleepData.averages !== undefined, 'Sleep', 'Fetch sleep history & average quality succeeds');

    const newSleepPayload = {
      date: new Date().toISOString().split('T')[0],
      bedtime: '23:15',
      wakeTime: '07:15',
      duration: 8.0,
      quality: 5,
    };
    const addSleepRes = await fetch(`${baseUrl}/api/sleep`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newSleepPayload),
    });
    const addSleepData = await addSleepRes.json();
    assert(addSleepRes.status === 201 && addSleepData.data.duration === 8.0, 'Sleep', 'Log sleep duration and 5-star rating succeeds');
    const createdSleepId = addSleepData.data.id;

    const deleteSleepRes = await fetch(`${baseUrl}/api/sleep/${createdSleepId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(deleteSleepRes.status === 200, 'Sleep', 'Delete sleep log entry succeeds');

    // ── 7. Goals & Milestones Feature (Goals Screen) ──
    const goalsRes = await fetch(`${baseUrl}/api/goals`, { headers: authHeaders });
    const goalsData = await goalsRes.json();
    assert(goalsRes.status === 200 && Array.isArray(goalsData.data), 'Goals', 'Fetch active goals succeeds');

    const newGoalPayload = {
      title: 'Cycle 100km this month',
      type: 'distance',
      target: 100,
      current: 25,
      unit: 'km',
      deadline: '2026-10-31',
      color: '#06B6D4',
    };
    const createGoalRes = await fetch(`${baseUrl}/api/goals`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newGoalPayload),
    });
    const createGoalData = await createGoalRes.json();
    assert(createGoalRes.status === 201 && createGoalData.data.target === 100, 'Goals', 'Create new fitness target goal succeeds');
    const createdGoalId = createGoalData.data.id;

    const updateGoalRes = await fetch(`${baseUrl}/api/goals/${createdGoalId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ current: 45 }),
    });
    const updateGoalData = await updateGoalRes.json();
    assert(updateGoalRes.status === 200 && updateGoalData.data.current === 45, 'Goals', 'Advance goal progress towards target succeeds');

    const deleteGoalRes = await fetch(`${baseUrl}/api/goals/${createdGoalId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    assert(deleteGoalRes.status === 200, 'Goals', 'Delete goal milestone succeeds');

    // ── 8. Batch Synchronization Feature (Offline-First Sync) ──
    const syncPayload = {
      workouts: [
        {
          id: 'w_sync_test',
          userId: 'user_default',
          type: 'Yoga',
          date: new Date().toISOString().split('T')[0],
          duration: 25,
          calories: 110,
          exercises: [],
          notes: 'Offline-synced yoga session',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      dailyStats: [
        {
          id: 'ds_sync_test',
          userId: 'user_default',
          date: new Date().toISOString().split('T')[0],
          steps: 8888,
          calories: 1300,
          activeMinutes: 40,
          distance: 3.5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };
    const syncRes = await fetch(`${baseUrl}/api/sync`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(syncPayload),
    });
    const syncData = await syncRes.json();
    assert(syncRes.status === 200 && syncData.success, 'Sync', 'Batch synchronization of offline data succeeds');

    console.log('\n======================================================');
    const totalPassed = results.filter(r => r.passed).length;
    console.log(`📊 Test Summary: ${totalPassed}/${results.length} tests PASSED`);
    console.log('======================================================');

    if (totalPassed === results.length) {
      console.log('🎉 ALL END-TO-END UI FEATURES VERIFIED SUCCESSFULLY!\n');
    } else {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Fatal E2E error:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runE2E();
