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

const mapReminder = row => ({
  id: row.id,
  text: row.text,
  time: row.time || '',
  completed: row.completed === true || row.completed === 'true',
  createdAt: row.createdat || row.createdAt
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

// GET /api/reminders
app.get('/api/reminders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reminders ORDER BY createdat DESC');
    res.json(result.rows.map(mapReminder));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reminders
app.post('/api/reminders', async (req, res) => {
  const { id, text, time, completed = false, createdAt } = req.body;
  try {
    const reminderId = id || uuidv4();
    const createdDate = createdAt || new Date().toISOString();
    const result = await pool.query(
      'INSERT INTO reminders (id, text, time, completed, createdat) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [reminderId, text, time || '', Boolean(completed), createdDate]
    );
    res.json(mapReminder(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/reminders/:id
app.put('/api/reminders/:id', async (req, res) => {
  const { id } = req.params;
  const { text, time, completed } = req.body;
  try {
    let updates = [];
    let values = [];
    let count = 1;

    if (text !== undefined) { updates.push(`text = $${count++}`); values.push(text); }
    if (time !== undefined) { updates.push(`time = $${count++}`); values.push(time); }
    if (completed !== undefined) { updates.push(`completed = $${count++}`); values.push(Boolean(completed)); }

    if (updates.length === 0) return res.json({});

    values.push(id);
    const result = await pool.query(
      `UPDATE reminders SET ${updates.join(', ')} WHERE id = $${count} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reminder not found' });
    res.json(mapReminder(result.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/reminders/:id
app.delete('/api/reminders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM reminders WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- REMINDER CHECK LOGIC (Scheduled & Manual) ---
async function runReminderCheck(triggerSource = 'timer') {
  const logPrefix = `[Reminder ${triggerSource === 'manual' ? 'Manual' : 'Timer'}]`;
  const lagosTimeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Lagos',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(new Date());

  console.log(`${logPrefix} [${lagosTimeStr} Africa/Lagos] Running reminder check...`);

  // 1. Check Quiet Hours (23:00 - 06:00 Africa/Lagos time)
  const lagosHour = parseInt(lagosTimeStr.split(':')[0], 10);
  if (lagosHour >= 23 || lagosHour < 6) {
    const msg = `Skipped: Quiet hours in Africa/Lagos (23:00 - 06:00). Current time: ${lagosTimeStr}`;
    console.log(`${logPrefix} ${msg}`);
    return { status: 'skipped', reason: msg };
  }

  // 2. Cooldown check: Don't send twice if called again within 25 minutes
  const metaResult = await pool.query("SELECT value FROM reminder_meta WHERE key = 'last_sent'");
  if (metaResult.rows.length > 0) {
    const lastSentTime = new Date(metaResult.rows[0].value).getTime();
    const diffMinutes = (Date.now() - lastSentTime) / (1000 * 60);
    if (diffMinutes < 25) {
      const msg = `Skipped: Already sent a reminder ${Math.round(diffMinutes)}m ago (must be at least 25m apart).`;
      console.log(`${logPrefix} ${msg}`);
      return { status: 'throttled', reason: msg, lastSent: metaResult.rows[0].value };
    }
  }

  // 3. Retrieve Today's Unfinished Tasks and Pending Reminders
  const lagosDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  const [tasksResult, remindersResult, goalsResult] = await Promise.all([
    pool.query(
      "SELECT * FROM tasks WHERE status != 'done' AND (targetday = 'today' OR targetday <= $1)",
      [lagosDateStr]
    ),
    pool.query(
      "SELECT * FROM reminders WHERE completed = false ORDER BY createdat ASC"
    ),
    pool.query(
      "SELECT * FROM goals WHERE status != 'completed'"
    )
  ]);

  const unfinishedTasks = tasksResult.rows.map(mapTask);
  const pendingReminders = remindersResult.rows.map(mapReminder);
  const activeGoals = goalsResult.rows.map(mapGoal);

  // 4. If nothing pending, send nothing
  if (unfinishedTasks.length === 0 && pendingReminders.length === 0) {
    const msg = 'Skipped: No pending tasks or reminders for today. Nothing sent.';
    console.log(`${logPrefix} ${msg}`);
    return { status: 'skipped', reason: msg };
  }

  // 5. Build Message with Tasks, Reminders, and Goal Deadlines
  const goalDeadlineLines = [];
  const todayLagosMidnight = new Date(`${lagosDateStr}T00:00:00`);

  for (const goal of activeGoals) {
    const goalName = goal.name || 'Untitled Goal';
    if (goal.deadline) {
      const deadlineMidnight = new Date(`${goal.deadline}T00:00:00`);
      const diffMs = deadlineMidnight.getTime() - todayLagosMidnight.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      let timeText = '';
      if (diffDays > 1) {
        timeText = `${diffDays} days left`;
      } else if (diffDays === 1) {
        timeText = '1 day left (Tomorrow!)';
      } else if (diffDays === 0) {
        timeText = 'Due TODAY!';
      } else {
        timeText = `${Math.abs(diffDays)} days overdue`;
      }
      goalDeadlineLines.push(`• *${goalName}*: ${timeText} (Deadline: ${goal.deadline})`);
    } else {
      goalDeadlineLines.push(`• *${goalName}*: No deadline set`);
    }
  }

  let messageParts = ['⚡ *Apex Tracker Daily Reminder* ⚡\n'];

  if (unfinishedTasks.length > 0) {
    messageParts.push(`📋 *Today's Pending Tasks (${unfinishedTasks.length}):*`);
    unfinishedTasks.forEach(task => {
      const priorityTag = task.priority ? `[${task.priority.toUpperCase()}] ` : '';
      const est = task.estimatedMinutes ? ` (~${task.estimatedMinutes}m)` : '';
      messageParts.push(`• ${priorityTag}${task.title}${est}`);
    });
    messageParts.push('');
  }

  if (pendingReminders.length > 0) {
    messageParts.push(`⏰ *Reminders (${pendingReminders.length}):*`);
    pendingReminders.forEach(rem => {
      const timeTag = rem.time ? ` [${rem.time}]` : '';
      messageParts.push(`• ${rem.text}${timeTag}`);
    });
    messageParts.push('');
  }

  if (goalDeadlineLines.length > 0) {
    messageParts.push('⏳ *Goal Deadlines:*');
    messageParts.push(...goalDeadlineLines);
    messageParts.push('');
  }

  messageParts.push(`_Sent at ${lagosTimeStr.slice(0, 5)} (Africa/Lagos)_`);
  const messageText = messageParts.join('\n');

  // 6. Verify Telegram Bot credentials from environment
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    const errorMsg = 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment variables.';
    console.error(`${logPrefix} Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // 7. Send Telegram message
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  let telegramResponse = await fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: messageText,
      parse_mode: 'Markdown'
    })
  });

  let telegramData = await telegramResponse.json();

  // If Telegram Markdown parsing throws an error, retry with unformatted plain text
  if (!telegramData.ok) {
    console.warn(`${logPrefix} Telegram Markdown failed, retrying plain text:`, telegramData.description);
    telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText.replace(/[*_`]/g, '')
      })
    });
    telegramData = await telegramResponse.json();
    if (!telegramData.ok) {
      console.error(`${logPrefix} Telegram send failed:`, telegramData);
      throw new Error(`Telegram API error: ${JSON.stringify(telegramData)}`);
    }
  }

  // 8. Save last_sent time in database (Supabase)
  const sentTimestamp = new Date().toISOString();
  await pool.query(
    `INSERT INTO reminder_meta (key, value)
     VALUES ('last_sent', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [sentTimestamp]
  );

  console.log(`${logPrefix} SUCCESS: Telegram reminder sent (${unfinishedTasks.length} tasks, ${pendingReminders.length} reminders).`);

  return {
    status: 'success',
    message: 'Telegram reminder sent successfully',
    tasksPending: unfinishedTasks.length,
    remindersPending: pendingReminders.length,
    sentAt: sentTimestamp
  };
}

// GET /api/cron/remind?key=REMINDER_SECRET (Manual backup trigger)
app.get('/api/cron/remind', async (req, res) => {
  const { key } = req.query;
  const reminderSecret = process.env.REMINDER_SECRET;

  if (!reminderSecret || key !== reminderSecret) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing secret key' });
  }

  try {
    const result = await runReminderCheck('manual');
    res.status(200).json(result);
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

    // Set up internal timer to run reminder check every 30 minutes
    const REMINDER_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
    console.log('[Reminder Timer] Scheduled internal reminder check every 30 minutes.');

    // Run first check 10 seconds after server startup
    setTimeout(() => {
      runReminderCheck('timer').catch(err => {
        console.error('[Reminder Timer] Error during startup check:', err.message);
      });
    }, 10000);

    // Run recurring check every 30 minutes
    setInterval(() => {
      runReminderCheck('timer').catch(err => {
        console.error('[Reminder Timer] Error during scheduled check:', err.message);
      });
    }, REMINDER_INTERVAL_MS);
  });
});
