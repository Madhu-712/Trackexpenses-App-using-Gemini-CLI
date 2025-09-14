# Expense Tracker

This is a simple expense tracker application that allows you to track your expenses.

## Features

- Add new expenses with category and amount.
- View a list of all your expenses.
- Set a monthly budget and see your progress.
- Filter expenses by month.
- Sort expenses by amount.
- Dark mode toggle.
- Export expenses to CSV.

## Tech Stack

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Chart.js
- **Backend:**
  - Node.js
  - Express.js
- **Data Storage:**
  - JSON

## Project Structure

- `index.js`: The main server file.
- `package.json`: Contains project dependencies and scripts.
- `package-lock.json`:  Records the exact version of each installed package.
- `data/`: Contains the data file.
  - `expenses.json`: A JSON file to store expense data.
- `public/`: Contains the frontend files.
  - `index.html`: The main HTML file.
  - `script.js`: The main JavaScript file for the frontend.
  - `style.css`: The CSS file for styling the application.

## Steps to run the project

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Madhu-712/trackexpenses.git
   ```
2. **Navigate to the project directory:**
   ```bash
   cd trackexpenses
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Start the server:**
   ```bash
   node index.js
   ```
5. **Open your browser and go to `http://localhost:8080`**

## `script.js` Execution

The `script.js` file is the main JavaScript file for the frontend. It handles the following:

- **DOM Content Loaded:** The script waits for the DOM to be fully loaded before executing.
- **Expense Form Submission:** It listens for the form submission and sends a POST request to the server to add a new expense.
- **Fetch Expenses:** It fetches all expenses from the server on page load.
- **Render Expenses:** It renders the expenses in the table and updates the dashboard.
- **Dashboard Update:** It updates the total spend, budget alert, chart, and spending tips.
- **Chart Update:** It updates the expense chart using Chart.js.
- **Spending Tips Update:** It provides spending tips based on high-spending categories.
- **Filters:** It handles filtering expenses by month and sorting by amount.
- **Dark Mode:** It toggles dark mode for the application.
- **Export to CSV:** It exports the expenses to a CSV file.
