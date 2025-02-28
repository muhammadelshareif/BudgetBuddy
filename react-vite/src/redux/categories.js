// Action Types
import { getTransactions } from "./transactions";

const LOAD_CATEGORIES = "categories/LOAD_CATEGORIES";
const ADD_CATEGORY = "categories/ADD_CATEGORY";
const UPDATE_CATEGORY = "categories/UPDATE_CATEGORY";
const REMOVE_CATEGORY = "categories/REMOVE_CATEGORY";

// Action Creators
const loadCategories = (categories) => ({
  type: LOAD_CATEGORIES,
  categories,
});

const addCategory = (category) => ({
  type: ADD_CATEGORY,
  category,
});

const updateCategory = (category) => ({
  type: UPDATE_CATEGORY,
  category,
});

const removeCategory = (categoryId) => ({
  type: REMOVE_CATEGORY,
  categoryId,
});

// Thunks
export const getCategories = () => async (dispatch) => {
  const response = await fetch("/api/categories");

  if (response.ok) {
    const categories = await response.json();
    dispatch(loadCategories(categories));
    return categories;
  }
};

export const createCategory = (categoryData) => async (dispatch) => {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(categoryData),
  });

  if (response.ok) {
    const newCategory = await response.json();
    dispatch(addCategory(newCategory));
    return newCategory;
  }
};

export const editCategory = (categoryData) => async (dispatch) => {
  const response = await fetch(`/api/categories/${categoryData.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(categoryData),
  });

  if (response.ok) {
    const updatedCategory = await response.json();
    dispatch(updateCategory(updatedCategory));
    return updatedCategory;
  }
};

export const deleteCategory = (categoryId) => async (dispatch) => {
  const response = await fetch(`/api/categories/${categoryId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    dispatch(removeCategory(categoryId));
    // Also refresh transactions since they may be affected
    dispatch(getTransactions());
    return { success: true };
  }
};

// Reducer
const initialState = { byId: {}, allIds: [] };

const categoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_CATEGORIES: {
      const byId = {};
      const allIds = [];
      action.categories.forEach((category) => {
        byId[category.id] = category;
        allIds.push(category.id);
      });
      return { byId, allIds };
    }

    case ADD_CATEGORY:
      return {
        byId: { ...state.byId, [action.category.id]: action.category },
        allIds: [...state.allIds, action.category.id],
      };

    case UPDATE_CATEGORY:
      return {
        ...state,
        byId: { ...state.byId, [action.category.id]: action.category },
      };

    case REMOVE_CATEGORY: {
      const newById = { ...state.byId };
      delete newById[action.categoryId];
      return {
        byId: newById,
        allIds: state.allIds.filter((id) => id !== action.categoryId),
      };
    }
    case "session/clearUserData": {
      return { byId: {}, allIds: [] };
    }

    default:
      return state;
  }
};

export default categoryReducer;
