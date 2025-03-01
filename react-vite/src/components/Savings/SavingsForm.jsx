import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createSavingsGoal,
  getSavingsGoals,
  editSavingsGoal,
} from "../../redux/savings";
import "./Savings.css";

function SavingsForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { goalId } = useParams();
  const isEditing = !!goalId;

  const savingsState = useSelector((state) => state.savings) || {
    byId: {},
    allIds: [],
  };
  const goal = isEditing ? savingsState.byId[goalId] : null;

  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    current_amount: "",
    target_date: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (isEditing) {
        await dispatch(getSavingsGoals());
      }
      setIsLoading(false);
    };

    fetchData();
  }, [dispatch, isEditing]);

  useEffect(() => {
    if (isEditing && goal) {
      setFormData({
        name: goal.name,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount,
        target_date: goal.target_date ? goal.target_date.split("T")[0] : "",
        description: goal.description || "",
      });
    }
  }, [isEditing, goal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      newErrors.target_amount = "Please enter a valid target amount";
    }

    if (formData.current_amount && parseFloat(formData.current_amount) < 0) {
      newErrors.current_amount = "Current amount cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const savingsData = {
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount) || 0,
    };

    if (isEditing) {
      const result = await dispatch(
        editSavingsGoal({ id: goalId, ...savingsData })
      );
      if (result.error) {
        setErrors({ submit: result.error });
        return;
      }
    } else {
      const result = await dispatch(createSavingsGoal(savingsData));
      if (result.error) {
        setErrors({ submit: result.error });
        return;
      }
    }

    navigate("/savings");
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="savings-form-container">
      <h2>{isEditing ? "Edit Savings Goal" : "Create Savings Goal"}</h2>

      {errors.submit && <div className="error-message">{errors.submit}</div>}

      <form onSubmit={handleSubmit} className="savings-form">
        <div className="form-group">
          <label htmlFor="name">Goal Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "error" : ""}
            placeholder="e.g., Vacation Fund, Emergency Fund"
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="target_amount">Target Amount ($):</label>
          <input
            type="number"
            id="target_amount"
            name="target_amount"
            value={formData.target_amount}
            onChange={handleChange}
            min="0.01"
            step="0.01"
            className={errors.target_amount ? "error" : ""}
            placeholder="e.g., 1000.00"
          />
          {errors.target_amount && (
            <div className="error-message">{errors.target_amount}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="current_amount">Current Amount ($):</label>
          <input
            type="number"
            id="current_amount"
            name="current_amount"
            value={formData.current_amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={errors.current_amount ? "error" : ""}
            placeholder="e.g., 250.00"
          />
          {errors.current_amount && (
            <div className="error-message">{errors.current_amount}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="target_date">Target Date (Optional):</label>
          <input
            type="date"
            id="target_date"
            name="target_date"
            value={formData.target_date}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional):</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Brief description of your savings goal"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/savings")}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? "Update Goal" : "Create Goal"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SavingsForm;
