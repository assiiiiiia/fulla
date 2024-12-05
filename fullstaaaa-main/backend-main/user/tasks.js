// backend/tasks.js
import express from 'express';
import db from './db.js';

const router = express.Router();

// Get the number of tasks due today
router.get('/tasks/today', (req, res) => {
  const query = `
    SELECT COUNT(*) AS taskCount
    FROM tasks
    WHERE DATE(due_date) = CURDATE() 
      AND due_date > NOW()
      AND (status = 'pas commencé' OR status = 'en cours')
  `;
  
  db.query(query, (err, results) => { 
    if (err) {
      console.error('Error fetching tasks due today:', err);
      return res.status(500).send('Server Error');
    }
    res.json({ taskCount: results[0].taskCount });
  });
});



// Get all tasks due today and order by priority, filter by status
router.get('/tasks', (req, res) => {
  const query = `
    SELECT * 
    FROM tasks
    WHERE DATE(due_date) = CURDATE() 
      AND due_date > NOW()
      AND (status = 'pas commencé' OR status = 'en cours')
    ORDER BY FIELD(priority, 'urgent', 'important', 'moins important')
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).send('Server Error');
    }
    res.json(results); 
  });
});
//route to update status
router.put("/task/:id/status", (req, res) => {
  const { status } = req.body; // Le statut envoyé depuis le frontend
  const taskId = req.params.id;

  if (!taskId) {
    res.status(400).send('ID de la tâche requis.');
    return; // Fin de la fonction
  }

  if (!['en cours', 'pas commencé', 'termine'].includes(status)) {
    res.status(400).send('Statut invalide.');
    return; // Fin de la fonction
  }

  const sql = `UPDATE tasks SET status = ? WHERE id = ?`;

  db.query(sql, [status, taskId], (err) => {
    if (err) {
      res.status(500).send('Erreur lors de la mise à jour du statut de la tâche.');
      return;
    }
    res.send('Statut de la tâche mis à jour avec succès !');
  });
});
//route to update status
router.put("/task/:id/status", (req, res) => {
  const { status } = req.body;
  const taskId = req.params.id;

  if (!taskId) {
    return res.status(400).send("ID de la tâche requis.");
  }

  if (!['pas commencé', 'en cours', 'terminé', 'annulé'].includes(status)) {
    return res.status(400).send("Statut invalide.");
  }

  const sql = `UPDATE tasks SET status = ? WHERE id = ?`;

  db.query(sql, [status, taskId], (err) => {
    if (err) {
      return res.status(500).send("Erreur lors de la mise à jour du statut de la tâche.");
    }
    res.send("Statut de la tâche mis à jour avec succès !");
  });
});

//update a task
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { task_name, category, due_date, status, priority } = req.body;

  const query = `
    UPDATE tasks 
    SET 
      task_name = ?, 
      category = ?, 
      due_date = ?, 
      status = ?, 
      priority = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [task_name, category, due_date, status, priority, id],
    (err, result) => {
      if (err) {
        console.error("Error updating task:", err);
        return res.status(500).json({ message: "Erreur lors de la mise à jour de la tâche." });
      }
      res.status(200).json({ message: "Tâche mise à jour avec succès." });
    }
  );
});

// Route to update task status
router.put('/tasks/:id/status', (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body; // Get the new status from the request body

  // Ensure the status is valid
  const validStatuses = ['pas commence', 'en cours', 'termine', 'annule'];
  if (!validStatuses.includes(status)) {
    return res.status(400).send('Invalid status');
  }

  // Update the task status in the database
  const query = `UPDATE tasks SET status = ? WHERE id = ?`;
  const values = [status, taskId];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating task status:', err);
      return res.status(500).send('Error updating task status');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Task not found');
    }

    res.send('Task status updated successfully');
  });
});



export default router;
