import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCategory,
  editCategory,
  getCategories,
} from "../../redux/categories";
import "./Categories.css";

function CategoryForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const isEditing = !!categoryId;

  const categoriesState = useSelector((state) => state.categories);
  const category = isEditing ? categoriesState.byId[categoryId] : null;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing && !category) {
      dispatch(getCategories());
    }

    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
      });
    }
  }, [dispatch, isEditing, category, categoryId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (isEditing) {
      await dispatch(
        editCategory({
          id: categoryId,
          ...formData,
        })
      );
    } else {
      await dispatch(createCategory(formData));
    }

    navigate("/categories");
  };

  return (
    <div className="category-form-container">
      <h2>{isEditing ? "Edit Category" : "Create New Category"}</h2>
      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-group">
          <label htmlFor="name">Category Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "error" : ""}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/categories")}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? "Update Category" : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CategoryForm;
