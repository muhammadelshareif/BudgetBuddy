import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTransactions, deleteTransaction } from "../../redux/transactions";
import { getCategories } from "../../redux/categories";
import { Link } from "react-router-dom";
import "./Transactions.css";

function TransactionList() {
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

  // Memoize transactions and categories
  const transactions = useMemo(() => {
    return (transactionsState.allIds || [])
      .map((id) => transactionsState.byId?.[id])
      .filter(Boolean);
  }, [transactionsState]);

  const categories = useMemo(() => {
    return categoriesState.byId || {};
  }, [categoriesState]);

  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    dispatch(getTransactions());
    dispatch(getCategories());
  }, [dispatch]);

  const handleDelete = async (transactionId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await dispatch(deleteTransaction(transactionId));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Memoize filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction) return false;

      // Filter by type
      if (filters.type !== "all" && transaction.type !== filters.type) {
        return false;
      }

      // Filter by category
      if (
        filters.category !== "all" &&
        transaction.category_id?.toString() !== filters.category
      ) {
        return false;
      }

      // Filter by date range
      if (
        filters.startDate &&
        new Date(transaction.transaction_date) < new Date(filters.startDate)
      ) {
        return false;
      }

      if (
        filters.endDate &&
        new Date(transaction.transaction_date) > new Date(filters.endDate)
      ) {
        return false;
      }

      return true;
    });
  }, [transactions, filters]);

  // Memoize sorted transactions
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort(
      (a, b) =>
        new Date(b?.transaction_date || 0) - new Date(a?.transaction_date || 0)
    );
  }, [filteredTransactions]);

  return (
    <div className="transaction-list-container">
      <div className="transaction-list-header">
        <h2>Transactions</h2>
        <Link to="/transactions/new" className="btn btn-primary">
          Add Transaction
        </Link>
      </div>

      <div className="transaction-filters">
        <div className="filter-group">
          <label htmlFor="type">Type:</label>
          <select
            id="type"
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="all">All Categories</option>
            {Object.values(categories).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="startDate">From:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="endDate">To:</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {sortedTransactions.length === 0 ? (
        <p>No transactions found matching your filters.</p>
      ) : (
        <div className="transaction-table-container">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((transaction) => (
                <tr key={transaction.id} className={transaction.type}>
                  <td>
                    {new Date(
                      transaction.transaction_date
                    ).toLocaleDateString()}
                  </td>
                  <td>
                    {categories[transaction.category_id]?.name || "Unknown"}
                  </td>
                  <td>{transaction.description}</td>
                  <td className={transaction.type}>
                    {transaction.type === "income" ? "+" : "-"}$
                    {Math.abs(parseFloat(transaction.amount || 0)).toFixed(2)}
                  </td>
                  <td>
                    <div className="transaction-actions">
                      <Link
                        to={`/transactions/${transaction.id}/edit`}
                        className="btn-edit"
                      >
                        Edit
                      </Link>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionList;
