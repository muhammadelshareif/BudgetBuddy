import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getTransactions } from "../../redux/transactions";
import { getCategories } from "../../redux/categories";
import { getBudgets } from "../../redux/budgets";
import { getSavingsGoals } from "../../redux/savings";
import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const dispatch = useDispatch();
  const location = useLocation();
  const sessionUser = useSelector((state) => state.session.user);

  // Track loading state
  const [isLoading, setIsLoading] = useState(true);

  // Get state with fallbacks for when it's not initialized yet
  const transactionsState = useSelector((state) => state.transactions) || {
    byId: {},
    allIds: [],
  };
  const categoriesState = useSelector((state) => state.categories) || {
    byId: {},
    allIds: [],
  };
  const budgetsState = useSelector((state) => state.budgets) || {
    byId: {},
    allIds: [],
  };
  const savingsState = useSelector((state) => state.savings) || {
    byId: {},
    allIds: [],
  };

  // Create a refresh function
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      dispatch(getTransactions()),
      dispatch(getCategories()),
      dispatch(getBudgets()),
      dispatch(getSavingsGoals()),
    ]);
    setIsLoading(false);
  }, [dispatch]);

  // Memoize transactions array to prevent recreation on each render
  const transactions = useMemo(() => {
    return (transactionsState.allIds || [])
      .map((id) => transactionsState.byId?.[id])
      .filter(Boolean);
  }, [transactionsState]);

  // Memoize categories object
  const categories = useMemo(() => {
    return categoriesState.byId || {};
  }, [categoriesState]);

  // Memoize budgets array
  const budgets = useMemo(() => {
    return (budgetsState.allIds || [])
      .map((id) => budgetsState.byId?.[id])
      .filter(Boolean);
  }, [budgetsState]);

  // Memoize savings goals array
  const savingsGoals = useMemo(() => {
    return (savingsState.allIds || [])
      .map((id) => savingsState.byId?.[id])
      .filter(Boolean);
  }, [savingsState]);

  const [monthlyData, setMonthlyData] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
  });

  // Refresh when the component mounts or when navigating to this page
  useEffect(() => {
    refreshData();
  }, [refreshData, location.pathname]);

  // Also refresh when the user changes
  useEffect(() => {
    if (sessionUser) {
      refreshData();
    }
  }, [sessionUser, refreshData]);

  useEffect(() => {
    if (transactions.length > 0) {
      // Calculate monthly totals
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const monthlyTransactions = transactions.filter((transaction) => {
        if (!transaction || !transaction.transaction_date) return false;
        const transactionDate = new Date(transaction.transaction_date);
        return (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      });

      const income = monthlyTransactions
        .filter((t) => t && t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      const expenses = monthlyTransactions
        .filter((t) => t && t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

      setMonthlyData({
        income,
        expenses,
        balance: income - expenses,
      });
    }
  }, [transactions]);

  // Memoize recent transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        if (!a?.transaction_date) return 1;
        if (!b?.transaction_date) return -1;
        return new Date(b.transaction_date) - new Date(a.transaction_date);
      })
      .slice(0, 5);
  }, [transactions]);

  // Memoize category totals and top categories
  const topCategories = useMemo(() => {
    // Calculate category totals for expenses
    const categoryTotals = transactions
      .filter((t) => t && t.type === "expense")
      .reduce((acc, transaction) => {
        if (!transaction) return acc;
        const categoryId = transaction.category_id;
        if (!acc[categoryId]) {
          acc[categoryId] = 0;
        }
        acc[categoryId] += parseFloat(transaction.amount || 0);
        return acc;
      }, {});

    // Sort categories by total
    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([categoryId, total]) => ({
        name: categories[categoryId]?.name || "Unknown",
        total,
      }));
  }, [transactions, categories]);

  // Budget Summary Component
  const BudgetSummary = () => {
    const currentBudgets = useMemo(() => {
      const now = new Date();
      return budgets.filter(
        (budget) =>
          budget.month === now.getMonth() + 1 &&
          budget.year === now.getFullYear()
      );
    }, []);

    // Calculate budget progress
    const budgetProgress = useMemo(() => {
      const progress = {};
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Get transactions for the current month/year
      const monthTransactions = transactions.filter((transaction) => {
        if (!transaction?.transaction_date) return false;
        const date = new Date(transaction.transaction_date);
        return (
          date.getMonth() + 1 === currentMonth &&
          date.getFullYear() === currentYear
        );
      });

      // Calculate totals by category
      currentBudgets.forEach((budget) => {
        const categoryTransactions = monthTransactions.filter(
          (t) => t.category_id === budget.category_id && t.type === "expense"
        );

        const spent = categoryTransactions.reduce(
          (sum, t) => sum + parseFloat(t.amount || 0),
          0
        );

        progress[budget.id] = {
          spent,
          remaining: parseFloat(budget.amount) - spent,
          percentage: Math.min(100, (spent / parseFloat(budget.amount)) * 100),
        };
      });

      return progress;
    }, [currentBudgets, transactions]);

    if (currentBudgets.length === 0) {
      return (
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Budget Goals</h3>
            <Link to="/budgets" className="view-all-link">
              Set Budgets
            </Link>
          </div>
          <p>No budget goals set for this month</p>
        </div>
      );
    }

    return (
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Budget Goals</h3>
          <Link to="/budgets" className="view-all-link">
            View All
          </Link>
        </div>

        <div className="budget-summary-list">
          {currentBudgets.slice(0, 3).map((budget) => {
            const category = categories[budget.category_id];
            const progress = budgetProgress[budget.id] || {
              spent: 0,
              remaining: parseFloat(budget.amount),
              percentage: 0,
            };

            return (
              <div key={budget.id} className="budget-summary-item">
                <div className="budget-summary-header">
                  <span className="category-name">
                    {category?.name || "Unknown"}
                  </span>
                  <span className="budget-amount">
                    ${parseFloat(budget.amount).toFixed(2)}
                  </span>
                </div>
                <div className="budget-spent">
                  <span>Spent: ${progress.spent.toFixed(2)}</span>
                  <span>Remaining: ${progress.remaining.toFixed(2)}</span>
                </div>
                <div className="budget-progress-container">
                  <div
                    className={`budget-progress-bar ${
                      progress.percentage >= 100 ? "exceeded" : ""
                    }`}
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
                <div className="budget-progress-label">
                  {progress.percentage.toFixed(0)}% used
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Savings Summary Component
  const SavingsSummary = () => {
    // Sort savings goals by progress percentage (highest first)
    const sortedGoals = useMemo(() => {
      return [...savingsGoals]
        .sort((a, b) => {
          const aProgress = a.current_amount / a.target_amount;
          const bProgress = b.current_amount / b.target_amount;
          return bProgress - aProgress;
        })
        .slice(0, 3);
    }, [savingsGoals]);

    if (sortedGoals.length === 0) {
      return (
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Savings Goals</h3>
            <Link to="/savings" className="view-all-link">
              Set Goals
            </Link>
          </div>
          <p>No savings goals set</p>
        </div>
      );
    }

    return (
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Savings Goals</h3>
          <Link to="/savings" className="view-all-link">
            View All
          </Link>
        </div>

        <div className="savings-summary-list">
          {sortedGoals.map((goal) => {
            const progressPercent =
              (goal.current_amount / goal.target_amount) * 100;

            return (
              <div key={goal.id} className="savings-summary-item">
                <div className="savings-summary-header">
                  <span className="savings-name">{goal.name}</span>
                  <span className="savings-amounts">
                    ${goal.current_amount.toFixed(2)} / $
                    {goal.target_amount.toFixed(2)}
                  </span>
                </div>
                <div className="savings-progress-container">
                  <div
                    className={`savings-progress-bar ${
                      progressPercent >= 100 ? "complete" : ""
                    }`}
                    style={{ width: `${Math.min(100, progressPercent)}%` }}
                  ></div>
                </div>
                <div className="savings-progress-label">
                  {progressPercent.toFixed(0)}% saved
                  {progressPercent >= 100 && " 🎉"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // You can add a loading indicator
  if (isLoading && transactions.length === 0) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      <div className="summary-cards">
        <div className="summary-card income">
          <h3>Monthly Income</h3>
          <p className="amount">${monthlyData.income.toFixed(2)}</p>
        </div>

        <div className="summary-card expenses">
          <h3>Monthly Expenses</h3>
          <p className="amount">${monthlyData.expenses.toFixed(2)}</p>
        </div>

        <div className="summary-card balance">
          <h3>Balance</h3>
          <p className="amount">${monthlyData.balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Recent Transactions</h3>
            <Link to="/transactions" className="view-all-link">
              View All
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <p>No recent transactions.</p>
          ) : (
            <table className="recent-transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className={transaction.type}>
                    <td>
                      {new Date(
                        transaction.transaction_date
                      ).toLocaleDateString()}
                    </td>
                    <td>{categories[transaction.category_id]?.name}</td>
                    <td>{transaction.description}</td>
                    <td className={transaction.type}>
                      {transaction.type === "income" ? "+" : "-"}$
                      {Math.abs(parseFloat(transaction.amount || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <BudgetSummary />

        <SavingsSummary />

        <div className="dashboard-section">
          <div className="section-header">
            <h3>Top Expense Categories</h3>
            <Link to="/categories" className="view-all-link">
              View All
            </Link>
          </div>

          {topCategories.length === 0 ? (
            <p>No expense data available.</p>
          ) : (
            <div className="category-expense-list">
              {topCategories.map((category, index) => (
                <div key={index} className="category-expense-item">
                  <span className="category-name">{category.name}</span>
                  <span className="category-amount">
                    ${category.total.toFixed(2)}
                  </span>
                  <div className="category-bar-container">
                    <div
                      className="category-bar"
                      style={{
                        width: `${
                          (category.total / (topCategories[0]?.total || 1)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
