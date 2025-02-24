from app.models import db, Category, environment, SCHEMA
from datetime import datetime

# Adds default categories
def seed_categories():
    default_categories = [
        {'name': 'Housing', 'description': 'Rent, mortgage, repairs, etc.'},
        {'name': 'Transportation', 'description': 'Car payments, gas, public transit, etc.'},
        {'name': 'Food', 'description': 'Groceries, restaurants, etc.'},
        {'name': 'Utilities', 'description': 'Electricity, water, internet, etc.'},
        {'name': 'Insurance', 'description': 'Health, auto, home, etc.'},
        {'name': 'Healthcare', 'description': 'Medical bills, medications, etc.'},
        {'name': 'Savings', 'description': 'Emergency fund, retirement, etc.'},
        {'name': 'Personal', 'description': 'Clothing, entertainment, etc.'},
        {'name': 'Debt', 'description': 'Credit card payments, loans, etc.'},
        {'name': 'Income', 'description': 'Salary, dividends, etc.'},
    ]
    
    # Assign categories to demo user (assuming user id 1 is the demo user)
    for category_data in default_categories:
        category = Category(
            user_id=1,
            name=category_data['name'],
            description=category_data['description'],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.session.add(category)
    
    db.session.commit()

# Uses a raw SQL query to TRUNCATE the categories table.
# SQLAlchemy doesn't have a built in function to do this
# TRUNCATE Removes all the data from the table, and RESET IDENTITY
# resets the auto incrementing primary key, CASCADE deletes any
# dependent entities
def undo_categories():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.categories RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("DELETE FROM categories")
        
    db.session.commit()