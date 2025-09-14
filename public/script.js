
document.addEventListener('DOMContentLoaded', () => {
  const expenseForm = document.getElementById('expense-form');
  const expenseList = document.getElementById('expense-list');
  const totalSpend = document.getElementById('total-spend');
  const budgetAlert = document.getElementById('budget-alert');
  const predictiveAlert = document.getElementById('predictive-alert');
  const budgetInput = document.getElementById('budget-input');
  const budgetProgress = document.getElementById('budget-progress');
  const categoryBudgetList = document.getElementById('category-budget-list');
  const filterMonth = document.getElementById('filter-month');
  const sortAmount = document.getElementById('sort-amount');
  const spendingTipsList = document.getElementById('spending-tips-list');
  const expenseChartCanvas = document.getElementById('expense-chart').getContext('2d');
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const exportCsvButton = document.getElementById('export-csv');

  let expenses = [];
  let expenseChart;
  let budget = localStorage.getItem('budget') || 80000;
  budgetInput.value = budget;
  let categoryBudgets = JSON.parse(localStorage.getItem('categoryBudgets')) || {};

  const categories = [
    'Groceries',
    'Medicine',
    'Clothes',
    'Insurance',
    'Vehicle Expenses',
    'Housing Maintenance',
    'Others'
  ];

  // Render category budget inputs
  const renderCategoryBudgets = () => {
    categoryBudgetList.innerHTML = '';
    categories.forEach(category => {
      const budgetItem = document.createElement('div');
      budgetItem.classList.add('category-budget-item');
      budgetItem.innerHTML = `
        <label>${category}</label>
        <input type="number" data-category="${category}" value="${categoryBudgets[category] || ''}" placeholder="Budget">
      `;
      categoryBudgetList.appendChild(budgetItem);
    });
  };

  // Save category budgets to local storage
  const saveCategoryBudgets = () => {
    const inputs = categoryBudgetList.querySelectorAll('input');
    inputs.forEach(input => {
      categoryBudgets[input.dataset.category] = parseFloat(input.value) || 0;
    });
    localStorage.setItem('categoryBudgets', JSON.stringify(categoryBudgets));
    renderExpenses();
  };

  // Event listener for category budget changes
  categoryBudgetList.addEventListener('change', saveCategoryBudgets);

  // Fetch expenses from the server
  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      expenses = await response.json();
      renderExpenses();
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  // Render expenses in the table and update dashboard
  const renderExpenses = () => {
    const filteredExpenses = getFilteredExpenses();

    // Clear table
    expenseList.innerHTML = '';

    // Populate table
    filteredExpenses.forEach(expense => {
      const row = document.createElement('tr');
      const categorySpend = filteredExpenses
        .filter(e => e.category === expense.category)
        .reduce((total, e) => total + e.amount, 0);

      if (categoryBudgets[expense.category] && categorySpend > categoryBudgets[expense.category]) {
        row.style.backgroundColor = '#ffcccc';
      }

      row.innerHTML = `
        <td>${expense.category}</td>
        <td>₹${expense.amount}</td>
        <td>${new Date(expense.date).toLocaleDateString()}</td>
      `;
      expenseList.appendChild(row);
    });

    updateDashboard(filteredExpenses);
  };

  // Update dashboard with total spend, budget alert, chart, and tips
  const updateDashboard = (currentExpenses) => {
    const monthlySpend = currentExpenses.reduce((total, expense) => total + expense.amount, 0);
    totalSpend.textContent = `₹${monthlySpend.toFixed(2)}`;

    // Budget alert and progress bar
    const budgetValue = parseFloat(budgetInput.value);
    const percentageSpent = (monthlySpend / budgetValue) * 100;
    budgetProgress.style.width = `${percentageSpent}%`;
    budgetProgress.textContent = `${percentageSpent.toFixed(2)}%`;

    if (monthlySpend > budgetValue) {
      budgetAlert.textContent = 'Budget Exceeded!';
      budgetAlert.classList.add('exceeded');
      budgetProgress.style.backgroundColor = '#f44336';
    } else {
      budgetAlert.textContent = '';
      budgetAlert.classList.remove('exceeded');
      if (percentageSpent > 80) {
        budgetProgress.style.backgroundColor = '#ff9800';
      } else {
        budgetProgress.style.backgroundColor = '#4CAF50';
      }
    }

    // Predictive alert
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const currentDay = new Date().getDate();
    const averageDailySpend = monthlySpend / currentDay;
    const projectedSpend = averageDailySpend * daysInMonth;

    if (projectedSpend > budgetValue && monthlySpend < budgetValue) {
      predictiveAlert.textContent = `Warning: You are on track to exceed your budget by ₹${(projectedSpend - budgetValue).toFixed(2)}`;
      predictiveAlert.style.display = 'block';
    } else {
      predictiveAlert.style.display = 'none';
    }

    // Update chart
    updateChart(currentExpenses);

    // Update spending tips
    updateSpendingTips(currentExpenses);
  };

  // Update the expense chart
  const updateChart = (currentExpenses) => {
    const categories = [...new Set(currentExpenses.map(expense => expense.category))];
    const categorySpends = categories.map(category => {
      return currentExpenses
        .filter(expense => expense.category === category)
        .reduce((total, expense) => total + expense.amount, 0);
    });

    if (expenseChart) {
      expenseChart.destroy();
    }

    expenseChart = new Chart(expenseChartCanvas, {
      type: 'pie',
      data: {
        labels: categories,
        datasets: [{
          label: 'Expenses by Category',
          data: categorySpends,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)'
          ],
        }]
      }
    });
  };

  // Update spending tips based on high-spending categories
  const updateSpendingTips = (currentExpenses) => {
    spendingTipsList.innerHTML = '';
    const totalSpend = currentExpenses.reduce((total, expense) => total + expense.amount, 0);

    const categorySpends = {};
    currentExpenses.forEach(expense => {
      if (!categorySpends[expense.category]) {
        categorySpends[expense.category] = 0;
      }
      categorySpends[expense.category] += expense.amount;
    });

    for (const category in categorySpends) {
      const percentage = (categorySpends[category] / totalSpend) * 100;
      if (percentage > 25) {
        const tip = document.createElement('li');
        tip.textContent = `You are spending a lot on ${category}. Consider reducing these expenses.`;
        spendingTipsList.appendChild(tip);
      }
    }

    if (spendingTipsList.children.length === 0) {
      const tip = document.createElement('li');
      tip.textContent = 'No specific spending tips at the moment. Keep up the good work!';
      spendingTipsList.appendChild(tip);
    }
  };

  // Handle form submission
  expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newExpense = {
      month: document.getElementById('month').value,
      category: document.getElementById('category').value,
      amount: parseFloat(document.getElementById('amount').value),
      date: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newExpense)
      });

      if (response.ok) {
        expenses.push(await response.json());
        renderExpenses();
        expenseForm.reset();
      } else {
        console.error('Error adding expense:', await response.text());
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  });

  // Event listeners for filters
  filterMonth.addEventListener('change', renderExpenses);
  sortAmount.addEventListener('change', renderExpenses);

  budgetInput.addEventListener('change', () => {
    budget = budgetInput.value;
    localStorage.setItem('budget', budget);
    renderExpenses();
  });

  // Dark mode toggle
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  // Export to CSV
  exportCsvButton.addEventListener('click', () => {
    const filteredExpenses = getFilteredExpenses();
    const csv = convertToCSV(filteredExpenses);
    downloadCSV(csv);
  });

  const getFilteredExpenses = () => {
    let filteredExpenses = [...expenses];

    // Filter by month
    if (filterMonth.value) {
      filteredExpenses = filteredExpenses.filter(expense => expense.month === filterMonth.value);
    }

    // Sort by amount
    if (sortAmount.value === 'low-to-high') {
      filteredExpenses.sort((a, b) => a.amount - b.amount);
    } else if (sortAmount.value === 'high-to-low') {
      filteredExpenses.sort((a, b) => b.amount - a.amount);
    }

    return filteredExpenses;
  }

  const convertToCSV = (data) => {
    const headers = ['Category', 'Amount', 'Date'];
    const rows = data.map(expense => {
      return [expense.category, expense.amount, new Date(expense.date).toLocaleDateString()];
    });

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    return csvContent;
  }

  const downloadCSV = (csv) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'expenses.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Initial fetch
  fetchExpenses();
  renderCategoryBudgets();
});
