// Action Types
const LOAD_SAVINGS_GOALS = "savings/LOAD_SAVINGS_GOALS";
const ADD_SAVINGS_GOAL = "savings/ADD_SAVINGS_GOAL";
const UPDATE_SAVINGS_GOAL = "savings/UPDATE_SAVINGS_GOAL";
const REMOVE_SAVINGS_GOAL = "savings/REMOVE_SAVINGS_GOAL";

// Action Creators
const loadSavingsGoals = (goals) => ({
  type: LOAD_SAVINGS_GOALS,
  goals,
});

const addSavingsGoal = (goal) => ({
  type: ADD_SAVINGS_GOAL,
  goal,
});

const updateSavingsGoal = (goal) => ({
  type: UPDATE_SAVINGS_GOAL,
  goal,
});

const removeSavingsGoal = (goalId) => ({
  type: REMOVE_SAVINGS_GOAL,
  goalId,
});

// Thunks
export const getSavingsGoals = () => async (dispatch) => {
  const response = await fetch("/api/savings");

  if (response.ok) {
    const goals = await response.json();
    dispatch(loadSavingsGoals(goals));
    return goals;
  }
};

export const createSavingsGoal = (goalData) => async (dispatch) => {
  const response = await fetch("/api/savings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(goalData),
  });

  if (response.ok) {
    const newGoal = await response.json();
    dispatch(addSavingsGoal(newGoal));
    return newGoal;
  } else {
    const errors = await response.json();
    return errors;
  }
};

export const editSavingsGoal = (goalData) => async (dispatch) => {
  const response = await fetch(`/api/savings/${goalData.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(goalData),
  });

  if (response.ok) {
    const updatedGoal = await response.json();
    dispatch(updateSavingsGoal(updatedGoal));
    return updatedGoal;
  } else {
    const errors = await response.json();
    return errors;
  }
};

export const deleteSavingsGoal = (goalId) => async (dispatch) => {
  const response = await fetch(`/api/savings/${goalId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    dispatch(removeSavingsGoal(goalId));
    return { success: true };
  } else {
    const errors = await response.json();
    return errors;
  }
};

// Reducer
const initialState = { byId: {}, allIds: [] };

const savingsReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_SAVINGS_GOALS: {
      const byId = {};
      const allIds = [];
      action.goals.forEach((goal) => {
        byId[goal.id] = goal;
        allIds.push(goal.id);
      });
      return { byId, allIds };
    }

    case ADD_SAVINGS_GOAL:
      return {
        byId: { ...state.byId, [action.goal.id]: action.goal },
        allIds: [...state.allIds, action.goal.id],
      };

    case UPDATE_SAVINGS_GOAL:
      return {
        ...state,
        byId: { ...state.byId, [action.goal.id]: action.goal },
      };

    case REMOVE_SAVINGS_GOAL: {
      const newById = { ...state.byId };
      delete newById[action.goalId];
      return {
        byId: newById,
        allIds: state.allIds.filter((id) => id !== action.goalId),
      };
    }

    case "session/clearUserData": {
      return { byId: {}, allIds: [] };
    }

    default:
      return state;
  }
};

export default savingsReducer;
