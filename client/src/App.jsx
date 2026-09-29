import React, { useState, useEffect, useMemo } from 'react';
import * as api from './api';
import { calculatePace } from './utils/paceCalc';
import CountdownHeader from './components/CountdownHeader';
import TaskRow from './components/TaskRow';
import TaskForm from './components/TaskForm';
import DailyLogForm from './components/DailyLogForm';
import NewGoalForm from './components/NewGoalForm';

function MobileNav({ currentView, setCurrentView }) {
  const [expanded, setExpanded] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    if (expanded) {
      const timer = setTimeout(() => {
        setExpanded(false);
      }, 60000); // 1 minute timeout
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  return (
    <aside className={`side-rail glass-card ${expanded ? 'expanded' : ''}`} onClick={() => !expanded && setExpanded(true)}>
      <div className="logo" onClick={(e) => { if (expanded) { e.stopPropagation(); setExpanded(false); } }}>A<span /></div>
      <nav>
        <button className={currentView === 'today' ? 'rail-active' : ''} onClick={(e) => { e.stopPropagation(); setCurrentView('today'); setExpanded(false); }} aria-label="Overview">
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
        </button>
        <button className={currentView === 'new_goal' ? 'rail-active' : ''} onClick={(e) => { e.stopPropagation(); setCurrentView('new_goal'); setExpanded(false); }} aria-label="New Goal">
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button className={currentView === 'history' ? 'rail-active' : ''} onClick={(e) => { e.stopPropagation(); setCurrentView('history'); setExpanded(false); }} aria-label="History">
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </button>
      </nav>
      <button className="rail-bottom" aria-label="Toggle Theme" onClick={(e) => { e.stopPropagation(); setIsDark(!isDark); }}>
        {isDark ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
      </button>
    </aside>
  );
}

function calculateStreak(logs, todayStr) {
  if (!logs || logs.length === 0) return 0;
  const uniqueDates = [...new Set(logs.map(l => l.date))].sort((a,b) => b.localeCompare(a));
  let streak = 0;
  let current = new Date(todayStr);
  
  if (uniqueDates[0] === todayStr || uniqueDates[0] === new Date(current.getTime() - 86400000).toISOString().split('T')[0]) {
      for (let i = 0; i < uniqueDates.length; i++) {
          const expected = new Date(current.getTime() - (i * 86400000)).toISOString().split('T')[0];
          if (uniqueDates.includes(expected)) {
             streak++;
          } else if (i === 0 && uniqueDates.includes(new Date(current.getTime() - 86400000).toISOString().split('T')[0])) {
             continue;
          } else {
             break;
          }
      }
  }
  return streak;
}

function getLast7DaysLogs(logs, todayStr) {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(new Date(todayStr).getTime() - (i * 86400000)).toISOString().split('T')[0];
    const sum = logs.filter(l => l.date === d).reduce((acc, l) => acc + (Number(l.minutesLogged) || 0), 0);
    result.push(sum);
  }
  return result;
}

export default function App() {
  const [goals, setGoals] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentView, setCurrentView] = useState('today'); // 'today' | 'goal_detail' | 'new_goal' | 'history'
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [isLoggingPace, setIsLoggingPace] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        const [g, l, t] = await Promise.all([
          api.fetchGoals(),
          api.fetchLogs(),
          api.fetchTasks()
        ]);
        setGoals(g);
        setLogs(l);
        setTasks(t);
      } catch (err) {
        console.error('Error loading data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const paceStats = useMemo(() => {
    const stats = {};
    goals.forEach(g => {
      stats[g.id] = calculatePace(g, logs, tasks, todayStr);
    });
    return stats;
  }, [goals, logs, tasks, todayStr]);

  // Handlers
  const handleCreateGoal = async (data) => {
    const newGoal = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      startDate: todayStr,
      ...data
    };
    setGoals(prev => [...prev, newGoal]);
    setCurrentView('today');
    try {
      const created = await api.createGoal(newGoal);
      setGoals(prev => prev.map(g => g.id === newGoal.id ? created : g));
    } catch (e) {
      console.error(e);
      setGoals(prev => prev.filter(g => g.id !== newGoal.id));
    }
  };

  const handleDeleteGoal = async (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    setGoals(prev => prev.filter(g => g.id !== goalId));
    if (selectedGoalId === goalId) setCurrentView('today');
    try {
      await api.deleteGoal(goalId);
    } catch (e) {
      console.error(e);
      setGoals(prev => [...prev, goal]);
    }
  };

  const handleCreateTask = async (data) => {
    const newTask = {
      id: Date.now().toString(),
      spentMinutes: 0,
      status: 'todo',
      ...data
    };
    setTasks(prev => [...prev, newTask]);
    try {
      const created = await api.createTask(newTask);
      setTasks(prev => prev.map(t => t.id === newTask.id ? created : t));
    } catch (e) {
      console.error(e);
      setTasks(prev => prev.filter(t => t.id !== newTask.id));
    }
  };

  const handleToggleTaskStatus = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      const updated = await api.updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (e) {
      console.error(e);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: task.status } : t));
    }
  };

  const handleUpdateTaskSpent = async (taskId, spentMinutes) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, spentMinutes } : t));
    try {
      const updated = await api.updateTask(taskId, { spentMinutes });
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (e) {
      console.error(e);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, spentMinutes: task.spentMinutes } : t));
    }
  };

  const handlePullToToday = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, targetDay: 'today' } : t));
    try {
      const updated = await api.updateTask(taskId, { targetDay: 'today' });
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
    } catch (e) {
      console.error(e);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, targetDay: task.targetDay } : t));
    }
  };

  const handleDeleteTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await api.deleteTask(taskId);
    } catch (e) {
      console.error(e);
      setTasks(prev => [...prev, task]);
    }
  };

  const handleCompleteGoal = async (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const completedAt = new Date().toISOString();
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, status: 'completed', completedAt } : g));
    if (selectedGoalId === goalId) setCurrentView('today');
    try {
      const updated = await api.updateGoal(goalId, { status: 'completed', completedAt });
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, status: 'completed', completedAt: updated.completedAt } : g));
    } catch (e) {
      console.error(e);
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, status: goal.status, completedAt: goal.completedAt } : g));
    }
  };

  const handleSubmitLog = async ({ entries, note, date }) => {
    const entriesWithIds = entries.map(e => ({
      ...e,
      id: Date.now().toString() + '-' + e.goalId,
      date,
      note
    }));
    setLogs(prev => [...prev, ...entriesWithIds]);
    setIsLoggingPace(false);
    try {
      const createdLogs = await api.createLogs(entriesWithIds, note, date);
      setLogs(prev => prev.map(l => {
        const created = createdLogs.find(cl => cl.id === l.id);
        return created ? created : l;
      }));
    } catch (e) {
      console.error(e);
      setLogs(prev => prev.filter(l => !entriesWithIds.find(e => e.id === l.id)));
    }
  };

  useEffect(() => {
    if (loading) return;
    
    // Auto-pull tasks
    tasks.forEach(t => {
      if (t.targetDay !== 'today' && t.status !== 'done') {
        if (t.targetDay.match(/^\d{4}-\d{2}-\d{2}$/) && t.targetDay <= todayStr) {
          handlePullToToday(t.id);
        }
      }
    });

    const todayDate = new Date(todayStr);
    goals.forEach(g => {
      if (g.status === 'completed' && g.completedAt) {
        const diffDays = (todayDate - new Date(g.completedAt)) / (1000 * 60 * 60 * 24);
        if (diffDays > 25) {
          api.deleteGoal(g.id).catch(console.error);
          setGoals(prev => prev.filter(pg => pg.id !== g.id));
        }
      }
    });
  }, [goals, tasks, todayStr, loading]);

  const selectedGoal = goals.find(g => g.id === selectedGoalId);
  const selectedStats = selectedGoal ? paceStats[selectedGoal.id] : null;

  const todayDate = new Date(todayStr);
  const activeGoals = goals.filter(g => g.status !== 'completed');
  const completedGoals = goals.filter(g => {
    if (g.status !== 'completed') return false;
    if (!g.completedAt) return true;
    const diffDays = (todayDate - new Date(g.completedAt)) / (1000 * 60 * 60 * 24);
    return diffDays <= 25;
  });

  const totalTodayLogged = useMemo(() => {
    return logs.filter(l => l.date === todayStr).reduce((acc, l) => acc + (Number(l.minutesLogged) || 0), 0);
  }, [logs, todayStr]);
  
  const totalTodayPlanned = useMemo(() => {
    return activeGoals.reduce((acc, g) => {
      const stats = paceStats[g.id];
      return acc + (stats?.requiredDailyPace || 0);
    }, 0);
  }, [activeGoals, paceStats]);

  const streakCount = useMemo(() => calculateStreak(logs, todayStr), [logs, todayStr]);
  const last7DaysLogs = useMemo(() => getLast7DaysLogs(logs, todayStr), [logs, todayStr]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><span className="text-[#7166dc] font-bold animate-pulse">LOADING DASHBOARD...</span></div>;
  }

  return (
    <main className="liquid-app">
      <div className="orb orb-pink" /><div className="orb orb-blue" /><div className="orb orb-yellow" />
      
      <MobileNav 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />

      <div className="dashboard-wrapper">
        <section className="dashboard">
          <header className="topbar">
            <div>
              <span className="eyebrow">Apexx Tracker</span>
              <h1>Your space to <em>make progress.</em></h1>
            </div>
            <div className="top-actions">
              <span className="sim-badge">SIM: {todayStr}</span>
              <button className="history-btn" onClick={() => setIsLoggingPace(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Commit Log
              </button>
            </div>
          </header>

          {currentView === 'new_goal' && (
            <div className="mb-8">
              <NewGoalForm 
                onSubmit={handleCreateGoal} 
                onCancel={() => setCurrentView('today')} 
              />
            </div>
          )}

          {isLoggingPace && (
            <div className="mb-8 relative z-[90]">
              <DailyLogForm 
                goals={currentView === 'goal_detail' ? [selectedGoal] : goals} 
                onSubmit={handleSubmitLog}
                onCancel={() => setIsLoggingPace(false)}
              />
            </div>
          )}

          {currentView === 'today' && !isLoggingPace && (
            <div className="bento-grid">
              
              <section className="hero glass-card">
                <div className="hero-copy">
                  <span className="eyebrow">Daily rhythm</span>
                  <h2>Pace Engine<br /><em>Active</em></h2>
                  <p>A calm plan for a meaningful day.</p>
                  
                  <div className="mt-8">
                     <span className="text-xs text-[#969caf] uppercase tracking-widest block mb-2">Global Stats</span>
                     <div className="flex gap-4">
                       <div>
                         <div className="text-2xl font-bold text-[#7166dc]">{activeGoals.length}</div>
                         <div className="text-[10px] text-[#969caf] uppercase">Active Goals</div>
                       </div>
                       <div>
                         <div className="text-2xl font-bold text-[#7166dc]">{tasks.filter(t => t.targetDay === 'today' && t.status !== 'done').length}</div>
                         <div className="text-[10px] text-[#969caf] uppercase">Inbox</div>
                       </div>
                     </div>
                  </div>
                </div>
                <div className="hero-orbit">
                  <div className="orbit-ring" style={{ background: `conic-gradient(#e99e83 0 ${Math.min(100, Math.max(5, (streakCount/30)*100))}%, #ffffff55 ${Math.min(100, Math.max(5, (streakCount/30)*100))}%)` }}>
                    <span className="text-[#25283b]">{streakCount}</span>
                    <small>day streak</small>
                  </div>
                  <svg className="hero-flame" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                </div>
              </section>
              
              <section className="metric glass-card">
                <div className="metric-top">
                  <span className="eyebrow">Today's Focus</span>
                  <div className="icon-bubble purple">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  </div>
                </div>
                <strong>{totalTodayLogged}<span> min</span></strong>
                <div className="meter"><i style={{ width: `${Math.min(100, (totalTodayLogged / (totalTodayPlanned || 1)) * 100)}%` }} /></div>
                <div className="metric-foot">
                  <span>{Math.round((totalTodayLogged / (totalTodayPlanned || 1)) * 100)}% of planned pace</span>
                  <span>{Math.max(0, totalTodayPlanned - totalTodayLogged)} min left</span>
                </div>
              </section>

              <section className="metric glass-card peach-card">
                <div className="metric-top">
                  <span className="eyebrow">Tasks Done</span>
                  <div className="icon-bubble peach">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                </div>
                <strong>{tasks.filter(t => t.targetDay === 'today' && t.status === 'done').length}<span> tasks</span></strong>
                <div className="mini-bars">
                  {last7DaysLogs.map((amt, i) => (
                    <i key={i} style={{ height: `${Math.max(10, Math.min(100, (amt / 120) * 100))}%` }} />
                  ))}
                </div>
                <div className="metric-foot">
                  <span>Last 7 days logged activity</span>
                </div>
              </section>

              <section className="goals-panel glass-card">
                <div className="panel-head">
                  <div>
                    <span className="eyebrow">Your intentions</span>
                    <h2>Active goals</h2>
                  </div>
                </div>
                <div className="goal-list">
                  {activeGoals.length === 0 ? (
                    <div className="text-sm text-[#969caf] p-4 text-center border border-dashed border-[#969caf]/30 rounded-xl">No active goals initialized.</div>
                  ) : activeGoals.map((g, index) => {
                    const stats = paceStats[g.id];
                    return (
                      <div className="goal-line group" key={g.id} onClick={() => { setSelectedGoalId(g.id); setCurrentView('goal_detail'); }}>
                        <div className={`goal-symbol ${index % 2 === 0 ? 'violet' : 'coral'}`}>
                           <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                        </div>
                        <div className="goal-info">
                          <strong className="group-hover:text-[#7166dc] transition-colors">{g.name || g.title}</strong>
                          <div className="meta">
                            <span className={`badge ${stats.paceStatus}`}>{stats.paceLabel}</span>
                            <span>{stats.daysRemaining} days left</span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[9px] text-[#969caf]">
                            <span>Req: {stats.requiredDailyPace} m/d</span>
                            <span>•</span>
                            <span>Avg: {stats.averageDailyPace} m/d</span>
                          </div>
                          <div className="goal-track"><i style={{ width: `${Math.min(100, (stats.totalMinutesLogged / (g.totalPlannedMinutes || 1)) * 100)}%` }} /></div>
                        </div>
                        <b>{Math.round((stats.totalMinutesLogged / (g.totalPlannedMinutes || 1)) * 100)}%</b>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="tasks-panel glass-card">
                <div className="panel-head">
                  <div>
                    <span className="eyebrow">Small steps, big picture</span>
                    <h2>Today's cadence</h2>
                  </div>
                </div>
                
                <div className="mt-4 mb-2 relative z-50">
                  <TaskForm onSubmit={handleCreateTask} />
                </div>
                
                <div className="task-list">
                  {tasks.filter(t => t.targetDay === 'today' && t.status !== 'done').length === 0 ? (
                    <div className="p-8 text-center text-[#969caf] text-sm border border-dashed border-[#969caf]/30 rounded-xl">
                      Zero inbox. Add tasks or pull from backlog.
                    </div>
                  ) : (
                    tasks.filter(t => t.targetDay === 'today' && t.status !== 'done')
                         .sort((a,b) => {
                            const p = {high:3, medium:2, low:1};
                            return p[b.priority] - p[a.priority];
                         })
                         .map(t => (
                           <TaskRow 
                             key={t.id} 
                             task={t} 
                             onToggle={handleToggleTaskStatus}
                             onUpdateSpent={handleUpdateTaskSpent}
                             onDelete={handleDeleteTask}
                           />
                         ))
                  )}

                  {tasks.filter(t => t.targetDay !== 'today' && t.status !== 'done').length > 0 && (
                    <div className="pt-6">
                      <div className="pb-2 mb-2">
                        <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#969caf]">Upcoming / Backlog</h3>
                      </div>
                      <div className="space-y-2 opacity-75 hover:opacity-100 transition-opacity">
                        {tasks.filter(t => t.targetDay !== 'today' && t.status !== 'done')
                             .sort((a,b) => {
                                const p = {high:3, medium:2, low:1};
                                return p[b.priority] - p[a.priority];
                             })
                             .map(t => (
                               <TaskRow 
                                 key={t.id} 
                                 task={t} 
                                 onToggle={handleToggleTaskStatus}
                                 onUpdateSpent={handleUpdateTaskSpent}
                                 onPullToToday={handlePullToToday}
                                 onDelete={handleDeleteTask}
                               />
                             ))}
                      </div>
                    </div>
                  )}

                  {tasks.filter(t => t.targetDay === 'today' && t.status === 'done').length > 0 && (
                    <div className="pt-6">
                      <h3 className="text-[10px] font-bold uppercase text-[#969caf] mb-3 tracking-widest">Completed Today</h3>
                      <div className="space-y-2">
                        {tasks.filter(t => t.targetDay === 'today' && t.status === 'done').map(t => (
                          <TaskRow 
                            key={t.id} 
                            task={t} 
                            onToggle={handleToggleTaskStatus}
                            onUpdateSpent={handleUpdateTaskSpent}
                            onDelete={handleDeleteTask}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {currentView === 'goal_detail' && selectedGoal && !isLoggingPace && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button 
                onClick={() => setCurrentView('today')}
                className="text-xs font-bold text-[#7166dc] hover:text-[#5d51ce] flex items-center gap-2 mb-2 bg-[#7166dc]/10 px-3 py-1.5 rounded-lg w-max"
              >
                &larr; BACK TO TODAY
              </button>

              <CountdownHeader goal={selectedGoal} stats={selectedStats} onDelete={handleDeleteGoal} />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-4">
                  <div className="text-[10px] text-[#969caf] uppercase font-bold tracking-wider">Logged Total</div>
                  <div className="text-3xl font-black text-[#25283b] mt-1">{selectedStats.totalMinutesLogged} <span className="text-sm font-normal text-[#969caf]">min</span></div>
                  <div className="text-xs text-[#7166dc] mt-1 font-medium">{selectedStats.remainingMinutes} min remaining</div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-[10px] text-[#969caf] uppercase font-bold tracking-wider">Current Avg Pace</div>
                  <div className="text-3xl font-black text-[#25283b] mt-1">{selectedStats.averageDailyPace} <span className="text-sm font-normal text-[#969caf]">m/d</span></div>
                </div>
                <div className="glass-card p-4" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
                  <div className="text-[10px] text-[#f59e0b] uppercase font-bold tracking-wider">Required Pace</div>
                  <div className="text-3xl font-black text-[#f59e0b] mt-1">{selectedStats.requiredDailyPace} <span className="text-sm font-normal opacity-70">m/d</span></div>
                </div>
                <div className="glass-card p-4">
                  <div className="text-[10px] text-[#969caf] uppercase font-bold tracking-wider">Projected Finish</div>
                  <div className="text-xl font-bold text-[#25283b] mt-1">
                    {selectedStats.projectedFinishDate}
                  </div>
                  <div className="text-[10px] text-[#7166dc] mt-1 font-medium">
                    {selectedStats.projectedDaysNeeded > 0 ? `${selectedStats.projectedDaysNeeded} days needed at current pace` : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 mt-4">
                <div>
                  <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#969caf] border-b border-[#969caf]/20 pb-2 mb-4">Recent Logs</h3>
                  <div className="space-y-2">
                    {logs.filter(l => l.goalId === selectedGoal.id).length === 0 ? (
                      <div className="text-xs text-[#969caf] italic">No logs yet.</div>
                    ) : (
                      logs.filter(l => l.goalId === selectedGoal.id).slice(-10).reverse().map((l, i) => (
                        <div key={i} className="glass-card p-3 flex justify-between items-center text-sm">
                          <span className="text-[#969caf] font-mono">{l.date}</span>
                          <div className="text-right">
                            <span className="text-amber-500 font-bold">+{l.minutesLogged}</span> <span className="text-[#969caf] text-xs">min</span>
                            {l.note && <div className="text-[10px] text-[#969caf] mt-1 max-w-[200px] truncate">{l.note}</div>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'history' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
               <button 
                 onClick={() => setCurrentView('today')}
                 className="text-xs font-bold text-[#7166dc] hover:text-[#5d51ce] flex items-center gap-2 mb-2 bg-[#7166dc]/10 px-3 py-1.5 rounded-lg w-max"
               >
                 &larr; BACK TO TODAY
               </button>
               <h2 className="text-2xl font-bold text-[#25283b] pb-4 border-b border-[#969caf]/20">
                 Completed History (Last 25 Days)
               </h2>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                 {completedGoals.map(g => (
                   <CountdownHeader 
                     key={g.id} 
                     goal={g} 
                     stats={paceStats[g.id]} 
                     onClickGoal={() => { setSelectedGoalId(g.id); setCurrentView('goal_detail'); }}
                     onDelete={handleDeleteGoal}
                   />
                 ))}
                 {completedGoals.length === 0 && (
                   <div className="text-sm text-[#969caf] p-8 glass-card text-center col-span-full">
                     No completed goals recently.
                   </div>
                 )}
               </div>
             </div>
          )}

        </section>
      </div>
    </main>
  );
}
