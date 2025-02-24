from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from app.models import db, Category
from datetime import datetime

category_routes = Blueprint('categories', __name__)

# Get all categories for current user
@category_routes.route('', methods=['GET'])
@login_required
def get_categories():
    categories = Category.query.filter(Category.user_id == current_user.id).all()
    return jsonify([category.to_dict() for category in categories])

# Get a specific category
@category_routes.route('/<int:id>', methods=['GET'])
@login_required
def get_category(id):
    category = Category.query.get(id)
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    if category.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    return jsonify(category.to_dict())

# Create a new category
@category_routes.route('', methods=['POST'])
@login_required
def create_category():
    data = request.json
    
    if not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400
        
    new_category = Category(
        user_id=current_user.id,
        name=data.get('name'),
        description=data.get('description', '')
    )
    
    db.session.add(new_category)
    db.session.commit()
    
    return jsonify(new_category.to_dict()), 201

# Update a category
@category_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_category(id):
    category = Category.query.get(id)
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    if category.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    
    if 'name' in data:
        category.name = data['name']
    
    if 'description' in data:
        category.description = data['description']
    
    category.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(category.to_dict())

# Delete a category
@category_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_category(id):
    category = Category.query.get(id)
    
    if not category:
        return jsonify({'error': 'Category not found'}), 404
    
    if category.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(category)
    db.session.commit()
    
    return jsonify({'message': 'Category successfully deleted'})