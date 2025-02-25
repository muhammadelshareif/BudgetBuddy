import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createTransaction,
  editTransaction,
  getTransactions,
} from "../../redux/transactions";
import { getCategories } from "../../redux/categories";
import "./Transactions.css";

function TransactionForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { transactionId } = useParams();
  const isEditing = !!transactionId;

  const transactionsState = useSelector((state) => state.transactions);
  const categoriesState = useSelector((state) => state.categories);

  const transaction = isEditing ? transactionsState.byId[transactionId] : null;
  const categories = Object.values(categoriesState.byId);

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category_id: "",
    type: "expense",
    transaction_date: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(getCategories());

    if (isEditing && !transaction) {
      dispatch(getTransactions());
    }

    if (transaction) {
      setFormData({
        amount: transaction.amount,
        description: transaction.description,
        category_id: transaction.category_id,
        type: transaction.type,
        transaction_date: transaction.transaction_date.split("T")[0],
      });
    }
  }, [dispatch, isEditing, transaction, transactionId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) : value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.category_id) {
      newErrors.category_id = "Please select a category";
    }
    if (!formData.transaction_date) {
      newErrors.transaction_date = "Date is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const submissionData = {
      ...formData,
      amount: Number(formData.amount),
      category_id: Number(formData.category_id),
    };

    if (isEditing) {
      await dispatch(
        editTransaction({
          id: transactionId,
          ...submissionData,
        })
      );
    } else {
      await dispatch(createTransaction(submissionData));
    }

    navigate("/transactions");
  };

  return (
    <div className="transaction-form-container">
      <h2>{isEditing ? "Edit Transaction" : "Add New Transaction"}</h2>
      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label htmlFor="type">Transaction Type:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="type"
                value="income"
                checked={formData.type === "income"}
                onChange={handleChange}
              />
              Income
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="expense"
                checked={formData.type === "expense"}
                onChange={handleChange}
              />
              Expense
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={errors.amount ? "error" : ""}
          />
          {errors.amount && (
            <span className="error-message">{errors.amount}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="category_id">Category:</label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className={errors.category_id ? "error" : ""}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <span className="error-message">{errors.category_id}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? "error" : ""}
          />
          {errors.description && (
            <span className="error-message">{errors.description}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="transaction_date">Date:</label>
          <input
            type="date"
            id="transaction_date"
            name="transaction_date"
            value={formData.transaction_date}
            onChange={handleChange}
            className={errors.transaction_date ? "error" : ""}
          />
          {errors.transaction_date && (
            <span className="error-message">{errors.transaction_date}</span>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/transactions")}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? "Update Transaction" : "Add Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TransactionForm;
