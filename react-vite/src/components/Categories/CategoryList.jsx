import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategories, deleteCategory } from "../../redux/categories";
import { Link } from "react-router-dom";
import "./Categories.css";

function CategoryList() {
  const dispatch = useDispatch();
  const categoriesState = useSelector((state) => state.categories) || {
    byId: {},
    allIds: [],
  };

  // Memoize the categories array
  const categories = useMemo(() => {
    return (categoriesState.allIds || [])
      .map((id) => categoriesState.byId?.[id])
      .filter(Boolean);
  }, [categoriesState]);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await dispatch(deleteCategory(categoryId));
    }
  };

  return (
    <div className="category-list-container">
      <div className="category-list-header">
        <h2>Categories</h2>
        <Link to="/categories/new" className="btn btn-primary">
          Add Category
        </Link>
      </div>

      {categories.length === 0 ? (
        <p>No categories found. Create one to get started!</p>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <div className="category-actions">
                <Link
                  to={`/categories/${category.id}/edit`}
                  className="btn btn-secondary"
                >
                  Edit
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(category.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryList;
