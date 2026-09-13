export function calculatePace(goal, logs, tasks, todayStr) {
  if (!todayStr) {
    todayStr = new Date().toISOString().split('T')[0];
  }

  const start = new Date(goal.startDate);
  const deadline = new Date(goal.deadline);
  const today = new Date(todayStr);

  const totalDays = Math.max(1, Math.round((deadline - start) / (1000 * 60 * 60 * 24)));
  const daysElapsed = Math.max(0, Math.round((today - start) / (1000 * 60 * 60 * 24)));
  const daysRemaining = Math.max(0, Math.round((deadline - today) / (1000 * 60 * 60 * 24)));

  const goalLogs = logs.filter(l => l.goalId === goal.id);
  const totalMinutesLogged = goalLogs.reduce((acc, l) => acc + (Number(l.minutesLogged) || 0), 0);

  const averageDailyPace = daysElapsed > 0 ? Math.round(totalMinutesLogged / daysElapsed) : 0;

  // Minutes remaining to hit planned total:
  const remainingMinutes = Math.max(0, goal.totalPlannedMinutes - totalMinutesLogged);

  // Required pace per day from now to deadline:
  const requiredDailyPace = daysRemaining > 0 ? Math.round(remainingMinutes / daysRemaining) : remainingMinutes;

  // Projected finish date based on current averageDailyPace:
  let projectedFinishDate = 'Indeterminate';
  let projectedDaysNeeded = 0;
  if (averageDailyPace > 0) {
    projectedDaysNeeded = Math.ceil(remainingMinutes / averageDailyPace);
    const finishDate = new Date(today);
    finishDate.setDate(finishDate.getDate() + projectedDaysNeeded);
    projectedFinishDate = finishDate.toISOString().split('T')[0];
  }

  // Determine Pace Badge:
  // Ahead: avg >= required * 1.1
  // On track: avg >= required * 0.88
  // Behind: avg < required * 0.88
  // Not enough data: logs count < 2
  const isDueToday = goal.deadline === todayStr;
  const isPastDeadline = new Date(todayStr) > new Date(goal.deadline);

  let paceStatus = 'nodata';
  let paceLabel = 'Not enough data yet';

  if (remainingMinutes <= 0) {
    // Fully logged — done
    paceStatus = 'ahead';
    paceLabel = 'Completed';
  } else if (isPastDeadline) {
    // Deadline passed with work still remaining
    paceStatus = 'behind';
    paceLabel = 'Past Deadline';
  } else if (isDueToday) {
    // Same-day goal — no logs needed, just show active status
    paceStatus = 'onTrack';
    paceLabel = 'Due Today';
  } else if (goalLogs.length === 0) {
    // Multi-day goal with genuinely no data yet
    paceStatus = 'nodata';
    paceLabel = 'Not enough data yet';
  } else if (averageDailyPace >= requiredDailyPace * 1.1) {
    paceStatus = 'ahead';
    paceLabel = 'Ahead';
  } else if (averageDailyPace >= requiredDailyPace * 0.88) {
    paceStatus = 'onTrack';
    paceLabel = 'On Track';
  } else {
    paceStatus = 'behind';
    paceLabel = 'Behind';
  }

  // Today's actual logged for this goal
  const todayLogs = goalLogs.filter(l => l.date === todayStr);
  const todayLoggedMinutes = todayLogs.reduce((acc, l) => acc + Number(l.minutesLogged || 0), 0);

  // Tasks under this goal
  const goalTasks = tasks.filter(t => t.goalId === goal.id);

  return {
    totalDays,
    daysElapsed,
    daysRemaining,
    totalMinutesLogged,
    remainingMinutes,
    averageDailyPace,
    requiredDailyPace,
    projectedFinishDate,
    projectedDaysNeeded,
    paceStatus,
    paceLabel,
    todayLoggedMinutes,
    plannedTodayMinutes: goal.currentDailyCapacityMin || 60,
    taskCount: goalTasks.length
  };
}
