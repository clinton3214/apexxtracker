import { describe, it, expect } from 'vitest';
import { calculatePace } from './paceCalc';

describe('calculatePace', () => {
  const baseGoal = {
    id: 'g1',
    startDate: '2025-01-01',
    deadline: '2025-01-31',
    totalPlannedMinutes: 1000,
    currentDailyCapacityMin: 60
  };

  it('calculates properly with no logs (zero logged time)', () => {
    const stats = calculatePace(baseGoal, [], [], '2025-01-10');
    expect(stats.daysElapsed).toBe(9);
    expect(stats.daysRemaining).toBe(21);
    expect(stats.totalMinutesLogged).toBe(0);
    expect(stats.averageDailyPace).toBe(0);
    expect(stats.requiredDailyPace).toBe(Math.round(1000 / 21)); // ~48
    expect(stats.paceStatus).toBe('nodata');
    expect(stats.paceLabel).toBe('Not enough data yet');
  });

  it('calculates properly past deadline', () => {
    const stats = calculatePace(baseGoal, [{ goalId: 'g1', minutesLogged: 100, date: '2025-01-02' }, { goalId: 'g1', minutesLogged: 100, date: '2025-01-03' }], [], '2025-02-05');
    // Days elapsed from start to today
    expect(stats.daysElapsed).toBe(35);
    // Days remaining should be max(0, ...)
    expect(stats.daysRemaining).toBe(0);
    expect(stats.totalMinutesLogged).toBe(200);
    expect(stats.remainingMinutes).toBe(800);
    // Required pace per day when remaining days is 0 but minutes > 0 is just the remaining minutes
    expect(stats.requiredDailyPace).toBe(800); 
    // Status should be behind / past deadline
    expect(stats.paceStatus).toBe('behind');
    expect(stats.paceLabel).toBe('Past Deadline');
  });

  it('calculates properly with no tasks', () => {
    const stats = calculatePace(baseGoal, [{ goalId: 'g1', minutesLogged: 100, date: '2025-01-02' }, { goalId: 'g1', minutesLogged: 100, date: '2025-01-03' }], [], '2025-01-10');
    expect(stats.taskCount).toBe(0);
  });

  it('calculates average and required pace accurately', () => {
    const logs = [
      { goalId: 'g1', minutesLogged: 60, date: '2025-01-02' },
      { goalId: 'g1', minutesLogged: 120, date: '2025-01-03' }
    ];
    // On 2025-01-04, 3 days have elapsed (from 01-01 to 01-04)
    // 27 days remaining (from 01-04 to 01-31)
    const stats = calculatePace(baseGoal, logs, [], '2025-01-04');
    expect(stats.daysElapsed).toBe(3);
    expect(stats.daysRemaining).toBe(27);
    expect(stats.totalMinutesLogged).toBe(180);
    expect(stats.averageDailyPace).toBe(Math.round(180 / 3)); // 60
    expect(stats.remainingMinutes).toBe(820);
    expect(stats.requiredDailyPace).toBe(Math.round(820 / 27)); // 30
    
    // avg > required * 1.1 (60 > 33), so Ahead
    expect(stats.paceStatus).toBe('ahead');
  });

  it('labels as completed when remaining minutes is 0', () => {
    const logs = [
      { goalId: 'g1', minutesLogged: 500, date: '2025-01-02' },
      { goalId: 'g1', minutesLogged: 500, date: '2025-01-03' }
    ];
    const stats = calculatePace(baseGoal, logs, [], '2025-01-10');
    expect(stats.remainingMinutes).toBe(0);
    expect(stats.paceStatus).toBe('ahead');
    expect(stats.paceLabel).toBe('Completed');
  });
});
