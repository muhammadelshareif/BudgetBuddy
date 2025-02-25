from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required
from app.models import db, Transaction, Category
from datetime import datetime, date

transaction_routes = Blueprint('transactions', __name__)

# Get all transactions for current user
@transaction_routes.route('', methods=['GET'])
@login_required
def get_transactions():
    transactions = Transaction.query.filter(Transaction.user_id == current_user.id).all()
    return jsonify([transaction.to_dict() for transaction in transactions])

# Get a specific transaction
@transaction_routes.route('/<int:id>', methods=['GET'])
@login_required
def get_transaction(id):
    transaction = Transaction.query.get(id)
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    if transaction.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    return jsonify(transaction.to_dict())

# Create a new transaction
@transaction_routes.route('', methods=['POST'])
@login_required
def create_transaction():
    data = request.json
    
    # Validate required fields
    required_fields = ['category_id', 'amount', 'description', 'type', 'transaction_date']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # Validate the category belongs to the user
    category = Category.query.get(data['category_id'])
    if not category or category.user_id != current_user.id:
        return jsonify({'error': 'Invalid category'}), 400
    
    # Validate transaction type
    if data['type'] not in ['income', 'expense']:
        return jsonify({'error': 'Type must be either "income" or "expense"'}), 400
    
    # Parse transaction date
    try:
        transaction_date = date.fromisoformat(data['transaction_date'])
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    new_transaction = Transaction(
        user_id=current_user.id,
        category_id=data['category_id'],
        amount=data['amount'],
        description=data['description'],
        type=data['type'],
        transaction_date=transaction_date
    )
    
    db.session.add(new_transaction)
    db.session.commit()
    
    return jsonify(new_transaction.to_dict()), 201

# Update a transaction
@transaction_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_transaction(id):
    transaction = Transaction.query.get(id)
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    if transaction.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    
    # If category is being updated, validate it belongs to user
    if 'category_id' in data:
        category = Category.query.get(data['category_id'])
        if not category or category.user_id != current_user.id:
            return jsonify({'error': 'Invalid category'}), 400
        transaction.category_id = data['category_id']
    
    # Update other fields if provided
    if 'amount' in data:
        transaction.amount = data['amount']
    
    if 'description' in data:
        transaction.description = data['description']
    
    if 'type' in data:
        if data['type'] not in ['income', 'expense']:
            return jsonify({'error': 'Type must be either "income" or "expense"'}), 400
        transaction.type = data['type']
    
    if 'transaction_date' in data:
        try:
            transaction.transaction_date = date.fromisoformat(data['transaction_date'])
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
    
    transaction.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(transaction.to_dict())

# Delete a transaction
@transaction_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_transaction(id):
    transaction = Transaction.query.get(id)
    
    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404
    
    if transaction.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    db.session.delete(transaction)
    db.session.commit()
    
    return jsonify({'message': 'Transaction successfully deleted'})