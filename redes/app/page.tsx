'use client'

import { useState } from 'react'
import { ArrowUpRight, Check, CircleDashed, Clock3, Flame, LayoutGrid, MoreHorizontal, Plus, Sparkles, Target, Timer, Zap } from 'lucide-react'

const initialTasks = [
  { title: 'Outline the next chapter', priority: 'High', estimate: '30m', target: 'Today' },
  { title: 'Review product references', priority: 'Medium', estimate: '20m', target: 'Today' },
  { title: 'Write a short project brief', priority: 'Medium', estimate: '45m', target: 'Tomorrow' },
]

function TaskRow({ task }: { task: typeof initialTasks[number] }) {
  const [done, setDone] = useState(false)
  return <div className={`task-row ${done ? 'is-done' : ''}`}>
    <button className="task-check" aria-label={`Mark ${task.title} complete`} onClick={() => setDone(!done)}>{done && <Check size={13} />}</button>
    <div className="task-copy"><strong>{task.title}</strong><span><Timer size={12} /> {task.estimate} <i /> {task.target}</span></div>
    <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
    <button className="dots" aria-label={`More options for ${task.title}`}><MoreHorizontal size={17} /></button>
  </div>
}

export default function Page() {
  const [tasks, setTasks] = useState(initialTasks)
  const [newTask, setNewTask] = useState('')
  const addTask = () => { if (!newTask.trim()) return; setTasks([{ title: newTask.trim(), priority: 'Medium', estimate: '30m', target: 'Today' }, ...tasks]); setNewTask('') }
  return <main className="liquid-app">
    <div className="orb orb-pink" /><div className="orb orb-blue" /><div className="orb orb-yellow" />
    <aside className="side-rail glass-card">
      <div className="logo">A<span /></div>
      <nav><button className="rail-active" aria-label="Overview"><LayoutGrid size={19} /></button><button aria-label="Goals"><Target size={19} /></button><button aria-label="Calendar"><Clock3 size={19} /></button></nav>
      <button className="rail-bottom" aria-label="Profile">JD</button>
    </aside>
    <section className="dashboard">
      <header className="topbar"><div><span className="eyebrow">Tuesday, September 29</span><h1>Your space to <em>make progress.</em></h1></div><div className="top-actions"><button className="history"><Clock3 size={16} /> History</button><button className="profile">Jordan Davis <span>JD</span></button></div></header>
      <div className="bento-grid">
        <section className="hero glass-card"><div className="hero-copy"><span className="eyebrow">Daily rhythm</span><h2>Good morning,<br /><em>Jordan.</em></h2><p>A calm plan for a meaningful day.</p><button className="primary-button">Begin a focus session <ArrowUpRight size={16} /></button></div><div className="hero-orbit"><div className="orbit-ring"><span>12</span><small>day streak</small></div><Flame className="hero-flame" size={18} /></div></section>
        <section className="metric glass-card"><div className="metric-top"><span className="eyebrow">Today&apos;s focus</span><div className="icon-bubble purple"><Zap size={16} /></div></div><strong>48<span> min</span></strong><div className="meter"><i /></div><div className="metric-foot"><span>80% complete</span><span>12 min left</span></div></section>
        <section className="metric glass-card peach-card"><div className="metric-top"><span className="eyebrow">Weekly momentum</span><div className="icon-bubble peach"><Sparkles size={16} /></div></div><strong>82<span>%</span></strong><div className="mini-bars"><i /><i /><i /><i /><i /><i /><i /></div><div className="metric-foot"><span>+14% from last week</span><span>On track</span></div></section>
        <section className="goals-panel glass-card"><div className="panel-head"><div><span className="eyebrow">Your intentions</span><h2>Active goals</h2></div><button className="add-goal"><Plus size={16} /> New goal</button></div><div className="goal-list"><div className="goal-line"><div className="goal-symbol violet"><Sparkles size={17} /></div><div className="goal-info"><strong>Read 12 books</strong><span>8 of 12 milestones</span><div className="goal-track"><i style={{ width: '68%' }} /></div></div><b>68%</b></div><div className="goal-line"><div className="goal-symbol coral"><Zap size={17} /></div><div className="goal-info"><strong>Launch side project</strong><span>3 of 7 milestones</span><div className="goal-track"><i style={{ width: '42%' }} /></div></div><b>42%</b></div></div></section>
        <section className="tasks-panel glass-card"><div className="panel-head"><div><span className="eyebrow">Small steps, big picture</span><h2>Today&apos;s cadence</h2></div><button className="view-all">View all <ArrowUpRight size={14} /></button></div><div className="quick-add"><CircleDashed size={18} /><input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addTask() }} placeholder="What would move you forward?" aria-label="New task" /><button onClick={addTask} aria-label="Add task"><Plus size={18} /></button></div><div className="task-list">{tasks.map((task, index) => <TaskRow key={`${task.title}-${index}`} task={task} />)}</div></section>
      </div>
    </section>
  </main>
}
