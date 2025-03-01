import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSavingsGoals, deleteSavingsGoal } from "../../redux/savings";
import { Link, useNavigate } from "react-router-dom";
import "./Savings.css";

function SavingsList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const savingsState = useSelector((state) => state.savings) || {
    byId: {},
    allIds: [],
  };

  // Memoize data
  const goals = useMemo(() => {
    return (savingsState.allIds || [])
      .map((id) => savingsState.byId?.[id])
      .filter(Boolean);
  }, [savingsState]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await dispatch(getSavingsGoals());
      setIsLoading(false);
    };

    fetchData();
  }, [dispatch]);

  const handleDelete = async (goalId) => {
    if (window.confirm("Are you sure you want to delete this savings goal?")) {
      await dispatch(deleteSavingsGoal(goalId));
    }
  };

  // Sort goals by progress percentage (highest first)
  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      const aProgress = a.current_amount / a.target_amount;
      const bProgress = b.current_amount / b.target_amount;
      return bProgress - aProgress;
    });
  }, [goals]);

  if (isLoading) {
    return <div className="loading">Loading savings goals...</div>;
  }

  return (
    <div className="savings-list-container">
      <div className="savings-list-header">
        <h2>Savings Goals</h2>
        <Link to="/savings/new" className="btn btn-primary">
          Add Savings Goal
        </Link>
      </div>

      {sortedGoals.length === 0 ? (
        <div className="empty-state">
          <p>You havent set up any savings goals yet.</p>
          <button
            onClick={() => navigate("/savings/new")}
            className="btn btn-primary"
          >
            Create Your First Savings Goal
          </button>
        </div>
      ) : (
        <div className="savings-grid">
          {sortedGoals.map((goal) => {
            const progressPercentage =
              (goal.current_amount / goal.target_amount) * 100;
            const remaining = goal.target_amount - goal.current_amount;

            return (
              <div key={goal.id} className="savings-card">
                <div className="savings-card-header">
                  <h3>{goal.name}</h3>
                  <div className="savings-actions">
                    <button
                      onClick={() => navigate(`/savings/${goal.id}/edit`)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="savings-description">{goal.description}</p>

                <div className="savings-amounts">
                  <div className="savings-amount">
                    <span className="label">Target:</span>
                    <span className="value">
                      ${goal.target_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="savings-amount">
                    <span className="label">Saved:</span>
                    <span className="value">
                      ${goal.current_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="savings-amount">
                    <span className="label">Remaining:</span>
                    <span className="value">${remaining.toFixed(2)}</span>
                  </div>
                </div>

                {goal.target_date && (
                  <div className="savings-target-date">
                    <span className="label">Target Date:</span>
                    <span className="value">
                      {new Date(goal.target_date).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="savings-progress-container">
                  <div
                    className={`savings-progress-bar ${
                      progressPercentage >= 100 ? "complete" : ""
                    }`}
                    style={{ width: `${Math.min(100, progressPercentage)}%` }}
                  ></div>
                </div>
                <div className="savings-progress-label">
                  {progressPercentage.toFixed(0)}% saved
                  {progressPercentage >= 100 && " 🎉"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SavingsList;
