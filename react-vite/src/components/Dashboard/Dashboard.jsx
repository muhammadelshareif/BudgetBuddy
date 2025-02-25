import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTransactions } from "../../redux/transactions";
import { getCategories } from "../../redux/categories";
import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const dispatch = useDispatch();

  // Get state with fallbacks for when it's not initialized yet
  const transactionsState = useSelector((state) => state.transactions) || {
    byId: {},
    allIds: [],
  };
  const categoriesState = useSelector((state) => state.categories) || {
    byId: {},
    allIds: [],
  };

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

  const [monthlyData, setMonthlyData] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
  });

  useEffect(() => {
    dispatch(getTransactions());
    dispatch(getCategories());
  }, [dispatch]);

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
