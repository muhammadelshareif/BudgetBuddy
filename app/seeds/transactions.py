from app.models import db, Transaction, environment, SCHEMA
from datetime import datetime, date, timedelta

# Adds sample transactions
def seed_transactions():
    # Get current date for reference
    today = date.today()
    
    # Sample transactions for demo user
    sample_transactions = [
        {
            'category_id': 10,  # Income category
            'amount': 3000.00,
            'description': 'Monthly salary',
            'type': 'income',
            'transaction_date': today - timedelta(days=15)
        },
        {
            'category_id': 1,  # Housing category
            'amount': 1200.00,
            'description': 'Rent payment',
            'type': 'expense',
            'transaction_date': today - timedelta(days=10)
        },
        {
            'category_id': 3,  # Food category
            'amount': 150.00,
            'description': 'Weekly groceries',
            'type': 'expense',
            'transaction_date': today - timedelta(days=7)
        },
        {
            'category_id': 4,  # Utilities category
            'amount': 80.00,
            'description': 'Electricity bill',
            'type': 'expense',
            'transaction_date': today - timedelta(days=5)
        },
        {
            'category_id': 8,  # Personal category
            'amount': 50.00,
            'description': 'Movie night',
            'type': 'expense',
            'transaction_date': today - timedelta(days=3)
        },
        {
            'category_id': 7,  # Savings category
            'amount': 500.00,
            'description': 'Monthly savings',
            'type': 'expense',
            'transaction_date': today - timedelta(days=1)
        }
    ]
    
    # Assign transactions to demo user
    for transaction_data in sample_transactions:
        transaction = Transaction(
            user_id=1,
            category_id=transaction_data['category_id'],
            amount=transaction_data['amount'],
            description=transaction_data['description'],
            type=transaction_data['type'],
            transaction_date=transaction_data['transaction_date'],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.session.add(transaction)
    
    db.session.commit()

# SQL query to TRUNCATE the transactions table.
def undo_transactions():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.transactions RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("DELETE FROM transactions")
        
    db.session.commit()