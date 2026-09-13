const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB, pool } = require('./database');
const { v4: uuidv4 } = require('uuid'); // Will need to install uuid if not done, but we can generate simply, wait uuid isn't installed. Let's use simple crypto or Math.random if not using uuid, actually I can just use a simple string generation or add uuid later. We'll use simple IDs for now.

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/dist')));

// --- MAP DB ROWS ---
const mapGoal = row => ({
  id: row.id,
  name: row.name,
  startDate: row.startdate || row.startDate,
  deadline: row.deadline,
  totalPlannedMinutes: row.totalplannedminutes || row.totalPlannedMinutes,
  currentDailyCapacityMin: row.currentdailycapacitymin || row.currentDailyCapacityMin,
  createdAt: row.createdat || row.createdAt,
  status: row.status || 'active',
  completedAt: row.completedat || row.completedAt || null
});

const mapTask = row => ({
  id: row.id,
  goalId: row.goalid || row.goalId,
  title: row.title,
  priority: row.priority,
  targetDay: row.targetday || row.targetDay,
  estimatedMinutes: row.estimatedminutes || row.estimatedMinutes,
  spentMinutes: row.spentminutes || row.spentMinutes,
  status: row.status
});

const mapLog = row => ({
  id: row.id,
  goalId: row.goalid || row.goalId,
  date: row.date,
  minutesLogged: row.minuteslogged || row.minutesLogged,
  note: row.note
});

// --- API ROUTES ---

// GET /api/goals
app.get('/api/goals', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM goals');
    res.json(result.rows.map(mapGoal));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/goals
app.post('/api/goals', async (req, res) => {
  const { id, name, startDate, deadline, totalPlannedMinutes, currentDailyCapacityMin, createdAt } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO goals (id, name, startdate, deadline, totalplannedminutes, currentdailycapacitymin, createdat) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, name, startDate, deadline, totalPlannedMinutes, currentDailyCapacityMin, createdAt]
    );
    res.json(mapGoal(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/goals/:id
app.put('/api/goals/:id', async (req, res) => {
  const { id } = req.params;
  const { status, completedAt } = req.body;
  try {
    let updates = [];
    let values = [];
    let count = 1;

    if (status !== undefined) { updates.push(`status = $${count++}`); values.push(status); }
    if (completedAt !== undefined) { updates.push(`completedat = $${count++}`); values.push(completedAt); }

    if (updates.length === 0) return res.json({});

    values.push(id);
    const result = await pool.query(
      `UPDATE goals SET ${updates.join(', ')} WHERE id = $${count} RETURNING *`,
      values
    );
    res.json(mapGoal(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/goals/:id
app.delete('/api/goals/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM goals WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows.map(mapTask));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks
app.post('/api/tasks', async (req, res) => {
  const { id, goalId, title, priority, targetDay, estimatedMinutes, spentMinutes, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (id, goalid, title, priority, targetday, estimatedminutes, spentminutes, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [id, goalId, title, priority, targetDay, estimatedMinutes, spentMinutes, status]
    );
    res.json(mapTask(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tasks/:id
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { targetDay, spentMinutes, status } = req.body;
  
  try {
    let updates = [];
    let values = [];
    let count = 1;

    if (targetDay !== undefined) { updates.push(`targetday = $${count++}`); values.push(targetDay); }
    if (spentMinutes !== undefined) { updates.push(`spentminutes = $${count++}`); values.push(spentMinutes); }
    if (status !== undefined) { updates.push(`status = $${count++}`); values.push(status); }

    values.push(id);

    const result = await pool.query(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${count} RETURNING *`,
      values
    );
    res.json(mapTask(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/logs
app.get('/api/logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM logs');
    res.json(result.rows.map(mapLog));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/logs
app.post('/api/logs', async (req, res) => {
  const { entries, note, date } = req.body; // entries is array of { id, goalId, minutes }
  try {
    const results = [];
    for (const entry of entries) {
      const result = await pool.query(
        'INSERT INTO logs (id, goalid, date, minuteslogged, note) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [entry.id, entry.goalId, date, entry.minutes, note]
      );
      results.push(mapLog(result.rows[0]));
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Anything that doesn't match the API routes, send back index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Initialize DB and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});
