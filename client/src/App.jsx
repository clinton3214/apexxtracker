import React, { useState, useEffect, useMemo } from 'react';
import * as api from './api';
import { calculatePace } from './utils/paceCalc';
import CountdownHeader from './components/CountdownHeader';
import GoalCard from './components/GoalCard';
import TaskRow from './components/TaskRow';
import TaskForm from './components/TaskForm';
import DailyLogForm from './components/DailyLogForm';
import NewGoalForm from './components/NewGoalForm';

export default function App() {
  const [goals, setGoals] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentView, setCurrentView] = useState('today'); // 'today' | 'goal_detail' | 'new_goal'
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
      startDate: new Date().toISOString().split('T')[0],
      ...data
    };
    setGoals(prev => [...prev, newGoal]); // Optimistic
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
    setGoals(prev => prev.filter(g => g.id !== goalId)); // Optimistic
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
    setTasks(prev => [...prev, newTask]); // Optimistic
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
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)); // Optimistic
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
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, spentMinutes } : t)); // Optimistic
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
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, targetDay: 'today' } : t)); // Optimistic
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
    setTasks(prev => prev.filter(t => t.id !== taskId)); // Optimistic
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
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, status: 'completed', completedAt } : g)); // Optimistic
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
    setLogs(prev => [...prev, ...entriesWithIds]); // Optimistic
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

  React.useEffect(() => {
    if (loading) return;
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
  }, [goals, todayStr, loading]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><span className="text-amber-500 font-mono animate-pulse">BOOTING CADENCE ENGINE...</span></div>;
  }

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

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-xl border-b border-surface-borderStrong shadow-lg shadow-black/20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 
              onClick={() => setCurrentView('today')}
              className="text-lg font-black tracking-tighter text-zinc-100 cursor-pointer flex items-center gap-2"
            >
              <div className="w-4 h-4 bg-amber-500 rounded-sm"></div>
              Apexx tracker <span className="text-zinc-500 font-normal text-sm hidden sm:inline">/ PACE ENGINE</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* History — clock icon on mobile, text on desktop */}
            <button 
              onClick={() => setCurrentView('history')}
              className="text-zinc-500 hover:text-amber-400 transition-colors flex items-center gap-1"
              title="History"
            >
              {/* Clock icon — always visible */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-mono hidden sm:inline">HISTORY</span>
            </button>
            <span className="text-xs font-mono text-zinc-500 hidden sm:inline bg-surface py-1 px-2 rounded-lg border border-surface-border">SIM: {todayStr}</span>
            {currentView === 'today' && !isLoggingPace && (
              <button 
                onClick={() => setCurrentView('new_goal')}
                className="text-xs font-mono bg-surface hover:bg-surface-subtle text-zinc-300 border border-surface-borderStrong px-3 py-1.5 rounded-lg transition-colors"
              >
                + NEW GOAL
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {currentView === 'new_goal' && (
          <NewGoalForm 
            onSubmit={handleCreateGoal} 
            onCancel={() => setCurrentView('today')} 
          />
        )}

        {isLoggingPace && (
          <DailyLogForm 
            goals={currentView === 'goal_detail' ? [selectedGoal] : goals} 
            onSubmit={handleSubmitLog}
            onCancel={() => setIsLoggingPace(false)}
          />
        )}

        {currentView === 'today' && !isLoggingPace && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Stats Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeGoals.map(g => (
                <CountdownHeader 
                  key={g.id} 
                  goal={g} 
                  stats={paceStats[g.id]} 
                  onClickGoal={() => { setSelectedGoalId(g.id); setCurrentView('goal_detail'); }}
                  onDelete={handleDeleteGoal}
                  onComplete={handleCompleteGoal}
                />
              ))}
            </div>

            {/* Daily Execution Board */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between border-b border-surface-borderStrong pb-2">
                  <h2 className="text-sm font-bold font-mono tracking-widest uppercase text-zinc-300">Pace Drivers</h2>
                  <button 
                    onClick={() => setIsLoggingPace(true)}
                    className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 px-2 py-1 rounded font-mono uppercase tracking-wider transition-colors"
                  >
                    Commit Log
                  </button>
                </div>
                
                <div className="flex flex-col gap-4">
                  {activeGoals.map(g => (
                    <GoalCard 
                      key={g.id} 
                      goal={g} 
                      stats={paceStats[g.id]} 
                      onSelectGoal={() => { setSelectedGoalId(g.id); setCurrentView('goal_detail'); }}
                      onLogClick={(id) => { setSelectedGoalId(id); setIsLoggingPace(true); setCurrentView('goal_detail'); }}
                      onDelete={handleDeleteGoal}
                      onComplete={handleCompleteGoal}
                    />
                  ))}
                  {activeGoals.length === 0 && (
                    <div className="text-sm text-zinc-500 font-mono p-4 border border-dashed border-surface-border rounded-xl text-center">
                      No active goals initialized.
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="border-b border-surface-borderStrong pb-2 flex justify-between items-end">
                  <h2 className="text-sm font-bold font-mono tracking-widest uppercase text-zinc-300">Today's Operating Cadence</h2>
                  <span className="text-[10px] font-mono text-zinc-500">PRIORITY SORTED</span>
                </div>
                
                <div className="space-y-2">
                  <TaskForm onSubmit={handleCreateTask} />
                  
                  {tasks.filter(t => t.targetDay === 'today' && t.status !== 'done').length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-surface-border rounded-xl text-zinc-500 font-mono text-sm">
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

                  {/* Future / Backlog Tasks visible on Dashboard */}
                  {tasks.filter(t => t.targetDay !== 'today' && t.status !== 'done').length > 0 && (
                    <div className="pt-6">
                      <div className="border-b border-surface-borderStrong pb-2 mb-2 flex justify-between items-end">
                        <h3 className="text-xs font-bold font-mono tracking-widest uppercase text-zinc-500">Upcoming / Backlog</h3>
                      </div>
                      <div className="space-y-2 opacity-70 hover:opacity-100 transition-opacity">
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
                </div>

                {tasks.filter(t => t.targetDay === 'today' && t.status === 'done').length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xs font-mono uppercase text-zinc-600 mb-3 tracking-widest">Completed Today</h3>
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
            </div>
          </div>
        )}

        {currentView === 'goal_detail' && selectedGoal && !isLoggingPace && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setCurrentView('today')}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-2 mb-2"
            >
              &larr; BACK TO TODAY
            </button>

            <CountdownHeader goal={selectedGoal} stats={selectedStats} onDelete={handleDeleteGoal} />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-4">
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Logged Total</div>
                <div className="text-2xl font-black font-num text-zinc-100">{selectedStats.totalMinutesLogged} <span className="text-sm font-normal text-zinc-500">min</span></div>
                <div className="text-xs text-zinc-400 mt-1">{selectedStats.remainingMinutes} min remaining</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Current Avg Pace</div>
                <div className="text-2xl font-black font-num text-zinc-100">{selectedStats.averageDailyPace} <span className="text-sm font-normal text-zinc-500">m/d</span></div>
              </div>
              <div className="glass-card p-4 border-amber-500/20">
                <div className="text-[10px] text-amber-500/80 font-mono uppercase">Required Pace</div>
                <div className="text-2xl font-black font-num text-amber-400">{selectedStats.requiredDailyPace} <span className="text-sm font-normal text-amber-500/50">m/d</span></div>
              </div>
              <div className="glass-card p-4">
                <div className="text-[10px] text-zinc-500 font-mono uppercase">Projected Finish</div>
                <div className="text-lg font-bold font-mono text-zinc-100 mt-1">
                  {selectedStats.projectedFinishDate}
                </div>
                <div className="text-[10px] text-zinc-400 mt-1">
                  {selectedStats.projectedDaysNeeded > 0 ? `${selectedStats.projectedDaysNeeded} days needed at current pace` : 'N/A'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div>
                <h3 className="text-sm font-bold font-mono tracking-widest uppercase text-zinc-300 border-b border-surface-borderStrong pb-2 mb-4">Recent Logs</h3>
                <div className="space-y-2">
                  {logs.filter(l => l.goalId === selectedGoal.id).length === 0 ? (
                    <div className="text-xs text-zinc-500 font-mono italic">No logs yet.</div>
                  ) : (
                    logs.filter(l => l.goalId === selectedGoal.id).slice(-10).reverse().map((l, i) => (
                      <div key={i} className="glass-panel p-3 flex justify-between items-center text-sm font-mono">
                        <span className="text-zinc-400">{l.date}</span>
                        <div className="text-right">
                          <span className="text-amber-400 font-bold">+{l.minutesLogged}</span> <span className="text-zinc-500 text-xs">min</span>
                          {l.note && <div className="text-[10px] text-zinc-500 mt-1 max-w-[200px] truncate">{l.note}</div>}
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
            <h2 className="text-xl font-bold font-mono tracking-tight text-zinc-100 border-b border-surface-borderStrong pb-4">
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
                <div className="text-sm text-zinc-500 font-mono p-4 border border-dashed border-surface-border rounded-xl text-center col-span-full">
                  No completed goals recently.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
