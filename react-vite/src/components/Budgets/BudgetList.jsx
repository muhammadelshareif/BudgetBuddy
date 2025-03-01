import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBudgets, deleteBudget } from "../../redux/budgets";
import { getCategories } from "../../redux/categories";
import { getTransactions } from "../../redux/transactions";
import { Link, useNavigate } from "react-router-dom";
import "./Budgets.css";

function BudgetList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const budgetsState = useSelector((state) => state.budgets) || {
    byId: {},
    allIds: [],
  };
  const categoriesState = useSelector((state) => state.categories) || {
    byId: {},
    allIds: [],
  };
  const transactionsState = useSelector((state) => state.transactions) || {
    byId: {},
    allIds: [],
  };

  // Memoize data
  const budgets = useMemo(() => {
    return (budgetsState.allIds || [])
      .map((id) => budgetsState.byId?.[id])
      .filter(Boolean);
  }, [budgetsState]);

  const categories = useMemo(() => {
    return categoriesState.byId || {};
  }, [categoriesState]);

  const transactions = useMemo(() => {
    return (transactionsState.allIds || [])
      .map((id) => transactionsState.byId?.[id])
      .filter(Boolean);
  }, [transactionsState]);

  // Filter budgets by current month/year
  const currentBudgets = useMemo(() => {
    return budgets.filter(
      (budget) => budget.month === currentMonth && budget.year === currentYear
    );
  }, [budgets, currentMonth, currentYear]);

  // Calculate spending for each budget
  const budgetProgress = useMemo(() => {
    const progress = {};

    // Format month with leading zero if needed
    const monthStr = String(currentMonth).padStart(2, "0");
    const monthPrefix = `${currentYear}-${monthStr}`;

    // Filter transactions by selected month
    const monthTransactions = transactions.filter((transaction) => {
      if (!transaction?.transaction_date) return false;
      return transaction.transaction_date.startsWith(monthPrefix);
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
  }, [currentBudgets, transactions, currentMonth, currentYear]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        dispatch(getBudgets()),
        dispatch(getCategories()),
        dispatch(getTransactions()),
      ]);
      setIsLoading(false);
    };

    fetchData();
  }, [dispatch]);

  const handleDelete = async (budgetId) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      await dispatch(deleteBudget(budgetId));
    }
  };

  const handleMonthChange = (e) => {
    setCurrentMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setCurrentYear(parseInt(e.target.value));
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (isLoading) {
    return <div className="loading">Loading budgets...</div>;
  }

  return (
    <div className="budget-list-container">
      <div className="budget-list-header">
        <h2>Budget Goals</h2>
        <Link to="/budgets/new" className="btn btn-primary">
          Add Budget Goal
        </Link>
      </div>

      <div className="budget-filters">
        <div className="filter-group">
          <label htmlFor="month">Month:</label>
          <select id="month" value={currentMonth} onChange={handleMonthChange}>
            {monthNames.map((name, index) => (
              <option key={index + 1} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="year">Year:</label>
          <select id="year" value={currentYear} onChange={handleYearChange}>
            {Array.from(
              { length: 5 },
              (_, i) => new Date().getFullYear() + i - 1 // Include past year
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentBudgets.length === 0 ? (
        <div className="empty-state">
          <p>
            No budget goals found for {monthNames[currentMonth - 1]}{" "}
            {currentYear}.
          </p>
          <button
            onClick={() => navigate("/budgets/new")}
            className="btn btn-primary"
          >
            Create Your First Budget Goal
          </button>
        </div>
      ) : (
        <div className="budget-grid">
          {currentBudgets.map((budget) => {
            const progress = budgetProgress[budget.id] || {
              spent: 0,
              remaining: 0,
              percentage: 0,
            };
            const category = categories[budget.category_id];

            return (
              <div key={budget.id} className="budget-card">
                <div className="budget-card-header">
                  <h3>{category?.name || "Unknown Category"}</h3>
                  <div className="budget-actions">
                    <button
                      onClick={() => navigate(`/budgets/${budget.id}/edit`)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="budget-amounts">
                  <div className="budget-amount">
                    <span className="label">Budget:</span>
                    <span className="value">
                      ${parseFloat(budget.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="budget-amount">
                    <span className="label">Spent:</span>
                    <span className="value">${progress.spent.toFixed(2)}</span>
                  </div>
                  <div className="budget-amount">
                    <span className="label">Remaining:</span>
                    <span
                      className={`value ${
                        progress.remaining < 0 ? "negative" : ""
                      }`}
                    >
                      ${progress.remaining.toFixed(2)}
                    </span>
                  </div>
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
      )}
    </div>
  );
}

export default BudgetList;
