

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static('public'));

const expensesFilePath = path.join(__dirname, 'data', 'expenses.json');

// Get all expenses
app.get('/api/expenses', (req, res) => {
  fs.readFile(expensesFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading expenses data.');
    }
    res.json(JSON.parse(data || '[]'));
  });
});

// Add a new expense
app.post('/api/expenses', (req, res) => {
  const newExpense = req.body;
  fs.readFile(expensesFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading expenses data.');
    }
    const expenses = JSON.parse(data || '[]');
    expenses.push(newExpense);
    fs.writeFile(expensesFilePath, JSON.stringify(expenses, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error saving expense.');
      }
      res.status(201).json(newExpense);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

