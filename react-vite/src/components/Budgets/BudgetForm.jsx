import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { createBudget, getBudgets, editBudget } from "../../redux/budgets";
import { getCategories } from "../../redux/categories";
import "./Budgets.css";

function BudgetForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { budgetId } = useParams();
  const isEditing = !!budgetId;

  const budgetsState = useSelector((state) => state.budgets) || {
    byId: {},
    allIds: [],
  };
  const categoriesState = useSelector((state) => state.categories) || {
    byId: {},
    allIds: [],
  };

  const budget = isEditing ? budgetsState.byId[budgetId] : null;
  const categories = Object.values(categoriesState.byId || {});

  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    month: new Date().getMonth() + 1, // 1-12
    year: new Date().getFullYear(),
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        dispatch(getCategories()),
        isEditing ? dispatch(getBudgets()) : Promise.resolve(),
      ]);
      setIsLoading(false);
    };

    fetchData();
  }, [dispatch, isEditing]);

  useEffect(() => {
    if (isEditing && budget) {
      setFormData({
        category_id: budget.category_id,
        amount: budget.amount,
        month: budget.month,
        year: budget.year,
      });
    }
  }, [isEditing, budget]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.category_id) {
      newErrors.category_id = "Please select a category";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const budgetData = {
      ...formData,
      amount: parseFloat(formData.amount),
      month: parseInt(formData.month),
      year: parseInt(formData.year),
      category_id: parseInt(formData.category_id),
    };

    if (isEditing) {
      const result = await dispatch(
        editBudget({ id: budgetId, ...budgetData })
      );
      if (result.error) {
        setErrors({ submit: result.error });
        return;
      }
    } else {
      const result = await dispatch(createBudget(budgetData));
      if (result.error) {
        setErrors({ submit: result.error });
        return;
      }
    }

    navigate("/budgets");
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
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="budget-form-container">
      <h2>{isEditing ? "Edit Budget Goal" : "Create Budget Goal"}</h2>

      {errors.submit && <div className="error-message">{errors.submit}</div>}

      <form onSubmit={handleSubmit} className="budget-form">
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
            <div className="error-message">{errors.category_id}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="amount">Budget Amount:</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            className={errors.amount ? "error" : ""}
          />
          {errors.amount && (
            <div className="error-message">{errors.amount}</div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="month">Month:</label>
            <select
              id="month"
              name="month"
              value={formData.month}
              onChange={handleChange}
            >
              {monthNames.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="year">Year:</label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
            >
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() + i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/budgets")}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? "Update Budget" : "Create Budget"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BudgetForm;
