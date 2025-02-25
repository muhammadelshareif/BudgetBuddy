// Action Types
const LOAD_TRANSACTIONS = "transactions/LOAD_TRANSACTIONS";
const ADD_TRANSACTION = "transactions/ADD_TRANSACTION";
const UPDATE_TRANSACTION = "transactions/UPDATE_TRANSACTION";
const REMOVE_TRANSACTION = "transactions/REMOVE_TRANSACTION";

// Action Creators
const loadTransactions = (transactions) => ({
  type: LOAD_TRANSACTIONS,
  transactions,
});

const addTransaction = (transaction) => ({
  type: ADD_TRANSACTION,
  transaction,
});

const updateTransaction = (transaction) => ({
  type: UPDATE_TRANSACTION,
  transaction,
});

const removeTransaction = (transactionId) => ({
  type: REMOVE_TRANSACTION,
  transactionId,
});

// Thunks
export const getTransactions = () => async (dispatch) => {
  const response = await fetch("/api/transactions");

  if (response.ok) {
    const transactions = await response.json();
    dispatch(loadTransactions(transactions));
    return transactions;
  }
};

export const createTransaction = (transactionData) => async (dispatch) => {
  const response = await fetch("/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transactionData),
  });

  if (response.ok) {
    const newTransaction = await response.json();
    dispatch(addTransaction(newTransaction));
    return newTransaction;
  }
};

export const editTransaction = (transactionData) => async (dispatch) => {
  const response = await fetch(`/api/transactions/${transactionData.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transactionData),
  });

  if (response.ok) {
    const updatedTransaction = await response.json();
    dispatch(updateTransaction(updatedTransaction));
    return updatedTransaction;
  }
};

export const deleteTransaction = (transactionId) => async (dispatch) => {
  const response = await fetch(`/api/transactions/${transactionId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    dispatch(removeTransaction(transactionId));
    return { success: true };
  }
};

// Reducer
const initialState = { byId: {}, allIds: [] };

const transactionReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_TRANSACTIONS: {
      const byId = {};
      const allIds = [];
      action.transactions.forEach((transaction) => {
        byId[transaction.id] = transaction;
        allIds.push(transaction.id);
      });
      return { byId, allIds };
    }

    case ADD_TRANSACTION:
      return {
        byId: { ...state.byId, [action.transaction.id]: action.transaction },
        allIds: [...state.allIds, action.transaction.id],
      };

    case UPDATE_TRANSACTION:
      return {
        ...state,
        byId: { ...state.byId, [action.transaction.id]: action.transaction },
      };

    case REMOVE_TRANSACTION: {
      const newById = { ...state.byId };
      delete newById[action.transactionId];
      return {
        byId: newById,
        allIds: state.allIds.filter((id) => id !== action.transactionId),
      };
    }

    default:
      return state;
  }
};

export default transactionReducer;
