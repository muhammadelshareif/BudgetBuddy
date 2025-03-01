from app.models import db, Budget, environment, SCHEMA
from datetime import datetime

def seed_budgets():
    # Current month and year
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    budgets = [
        # Housing budget for user 1
        Budget(
            user_id=1,
            category_id=1,  # Housing category
            amount=1500.00,
            month=current_month,
            year=current_year,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        ),
        # Food budget for user 1
        Budget(
            user_id=1,
            category_id=3,  # Food category
            amount=500.00,
            month=current_month,
            year=current_year,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        ),
        # Transportation budget for user 1
        Budget(
            user_id=1,
            category_id=2,  # Transportation category
            amount=300.00,
            month=current_month,
            year=current_year,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    ]
    
    db.session.add_all(budgets)
    db.session.commit()

def undo_budgets():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.budgets RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("DELETE FROM budgets")
        
    db.session.commit()