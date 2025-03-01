// Action Types
const LOAD_BUDGETS = "budgets/LOAD_BUDGETS";
const ADD_BUDGET = "budgets/ADD_BUDGET";
const UPDATE_BUDGET = "budgets/UPDATE_BUDGET";
const REMOVE_BUDGET = "budgets/REMOVE_BUDGET";

// Action Creators
const loadBudgets = (budgets) => ({
  type: LOAD_BUDGETS,
  budgets,
});

const addBudget = (budget) => ({
  type: ADD_BUDGET,
  budget,
});

const updateBudget = (budget) => ({
  type: UPDATE_BUDGET,
  budget,
});

const removeBudget = (budgetId) => ({
  type: REMOVE_BUDGET,
  budgetId,
});

// Thunks
export const getBudgets = () => async (dispatch) => {
  const response = await fetch("/api/budgets");

  if (response.ok) {
    const budgets = await response.json();
    dispatch(loadBudgets(budgets));
    return budgets;
  }
};

export const createBudget = (budgetData) => async (dispatch) => {
  const response = await fetch("/api/budgets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(budgetData),
  });

  if (response.ok) {
    const newBudget = await response.json();
    dispatch(addBudget(newBudget));
    return newBudget;
  } else {
    const errors = await response.json();
    return errors;
  }
};

export const editBudget = (budgetData) => async (dispatch) => {
  const response = await fetch(`/api/budgets/${budgetData.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(budgetData),
  });

  if (response.ok) {
    const updatedBudget = await response.json();
    dispatch(updateBudget(updatedBudget));
    return updatedBudget;
  } else {
    const errors = await response.json();
    return errors;
  }
};

export const deleteBudget = (budgetId) => async (dispatch) => {
  const response = await fetch(`/api/budgets/${budgetId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    dispatch(removeBudget(budgetId));
    return { success: true };
  } else {
    const errors = await response.json();
    return errors;
  }
};

// Reducer
const initialState = { byId: {}, allIds: [] };

const budgetReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_BUDGETS: {
      const byId = {};
      const allIds = [];
      action.budgets.forEach((budget) => {
        byId[budget.id] = budget;
        allIds.push(budget.id);
      });
      return { byId, allIds };
    }

    case ADD_BUDGET:
      return {
        byId: { ...state.byId, [action.budget.id]: action.budget },
        allIds: [...state.allIds, action.budget.id],
      };

    case UPDATE_BUDGET:
      return {
        ...state,
        byId: { ...state.byId, [action.budget.id]: action.budget },
      };

    case REMOVE_BUDGET: {
      const newById = { ...state.byId };
      delete newById[action.budgetId];
      return {
        byId: newById,
        allIds: state.allIds.filter((id) => id !== action.budgetId),
      };
    }

    case "session/clearUserData": {
      return { byId: {}, allIds: [] };
    }

    default:
      return state;
  }
};

export default budgetReducer;
