from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from app.models import db, Budget, Category
from datetime import datetime

budget_routes = Blueprint('budgets', __name__)

# Get all budgets for current user
@budget_routes.route('', methods=['GET'])
@login_required
def get_budgets():
    budgets = Budget.query.filter(Budget.user_id == current_user.id).all()
    return jsonify([budget.to_dict() for budget in budgets])

# Get a specific budget
@budget_routes.route('/<int:id>', methods=['GET'])
@login_required
def get_budget(id):
    budget = Budget.query.get(id)
    
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404
    
    if budget.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    return jsonify(budget.to_dict())

# Create a new budget
@budget_routes.route('', methods=['POST'])
@login_required
def create_budget():
    data = request.json
    
    # Validate required fields
    required_fields = ['category_id', 'amount', 'month', 'year']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # Validate the category belongs to the user
    category = Category.query.get(data['category_id'])
    if not category or category.user_id != current_user.id:
        return jsonify({'error': 'Invalid category'}), 400
    
    # Check if budget already exists for this category/month/year
    existing_budget = Budget.query.filter(
        Budget.user_id == current_user.id,
        Budget.category_id == data['category_id'],
        Budget.month == data['month'],
        Budget.year == data['year']
    ).first()
    
    if existing_budget:
        return jsonify({'error': 'A budget for this category and month already exists'}), 400
    
    # Validate month and year
    if not (1 <= int(data['month']) <= 12):
        return jsonify({'error': 'Month must be between 1 and 12'}), 400
    
    if not (datetime.now().year <= int(data['year']) <= datetime.now().year + 5):
        return jsonify({'error': 'Year must be current or up to 5 years in the future'}), 400
    
    new_budget = Budget(
        user_id=current_user.id,
        category_id=data['category_id'],
        amount=data['amount'],
        month=data['month'],
        year=data['year']
    )
    
    db.session.add(new_budget)
    db.session.commit()
    
    return jsonify(new_budget.to_dict()), 201

# Update a budget
@budget_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_budget(id):
    budget = Budget.query.get(id)
    
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404
    
    if budget.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    
    # Validate the category if provided
    if 'category_id' in data:
        category = Category.query.get(data['category_id'])
        if not category or category.user_id != current_user.id:
            return jsonify({'error': 'Invalid category'}), 400
        budget.category_id = data['category_id']
    
    # Update other fields if provided
    if 'amount' in data:
        budget.amount = data['amount']
    
    if 'month' in data:
        if not (1 <= int(data['month']) <= 12):
            return jsonify({'error': 'Month must be between 1 and 12'}), 400
        budget.month = data['month']
    
    if 'year' in data:
        if not (datetime.now().year <= int(data['year']) <= datetime.now().year + 5):
            return jsonify({'error': 'Year must be current or up to 5 years in the future'}), 400
        budget.year = data['year']
    
    budget.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(budget.to_dict())

# Delete a budget
@budget_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_budget(id):
    budget = Budget.query.get(id)
    
    if not budget:
        return jsonify({'error': 'Budget not found'}), 404
    
    if budget.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(budget)
    db.session.commit()
    
    return jsonify({'message': 'Budget successfully deleted'})