from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from app.models import db, SavingsGoal
from datetime import datetime

savings_routes = Blueprint('savings', __name__)

# Get all savings goals for current user
@savings_routes.route('', methods=['GET'])
@login_required
def get_savings_goals():
    goals = SavingsGoal.query.filter(SavingsGoal.user_id == current_user.id).all()
    return jsonify([goal.to_dict() for goal in goals])

# Get a specific savings goal
@savings_routes.route('/<int:id>', methods=['GET'])
@login_required
def get_savings_goal(id):
    goal = SavingsGoal.query.get(id)
    
    if not goal:
        return jsonify({'error': 'Savings goal not found'}), 404
    
    if goal.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    return jsonify(goal.to_dict())

# Create a new savings goal
@savings_routes.route('', methods=['POST'])
@login_required
def create_savings_goal():
    data = request.json
    
    # Validate required fields
    required_fields = ['name', 'target_amount']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # Create new savings goal
    new_goal = SavingsGoal(
        user_id=current_user.id,
        name=data['name'],
        target_amount=data['target_amount'],
        current_amount=data.get('current_amount', 0.00),
        description=data.get('description', '')
    )
    
    # Handle target date if provided
    if 'target_date' in data and data['target_date']:
        try:
            new_goal.target_date = datetime.fromisoformat(data['target_date']).date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    db.session.add(new_goal)
    db.session.commit()
    
    return jsonify(new_goal.to_dict()), 201

# Update a savings goal
@savings_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_savings_goal(id):
    goal = SavingsGoal.query.get(id)
    
    if not goal:
        return jsonify({'error': 'Savings goal not found'}), 404
    
    if goal.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    
    # Update fields if provided
    if 'name' in data:
        goal.name = data['name']
    
    if 'target_amount' in data:
        goal.target_amount = data['target_amount']
    
    if 'current_amount' in data:
        goal.current_amount = data['current_amount']
    
    if 'description' in data:
        goal.description = data['description']
    
    if 'target_date' in data:
        if data['target_date']:
            try:
                goal.target_date = datetime.fromisoformat(data['target_date']).date()
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        else:
            goal.target_date = None
    
    goal.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(goal.to_dict())

# Delete a savings goal
@savings_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_savings_goal(id):
    goal = SavingsGoal.query.get(id)
    
    if not goal:
        return jsonify({'error': 'Savings goal not found'}), 404
    
    if goal.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(goal)
    db.session.commit()
    
    return jsonify({'message': 'Savings goal successfully deleted'})