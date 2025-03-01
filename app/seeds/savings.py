from app.models import db, SavingsGoal, environment, SCHEMA
from datetime import datetime, timedelta

def seed_savings_goals():
    # Current date
    today = datetime.now().date()
    
    # Target dates
    vacation_date = today + timedelta(days=365)
    car_date = today + timedelta(days=730)
    emergency_date = today + timedelta(days=180)
    
    goals = [
        # Vacation fund for demo user
        SavingsGoal(
            user_id=1,
            name="Summer Vacation",
            target_amount=2000.00,
            current_amount=500.00,
            target_date=vacation_date,
            description="Savings for a beach vacation next summer",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        ),
        # New car fund for demo user
        SavingsGoal(
            user_id=1,
            name="New Car",
            target_amount=10000.00,
            current_amount=2500.00,
            target_date=car_date,
            description="Down payment for a new car",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        ),
        # Emergency fund for demo user
        SavingsGoal(
            user_id=1,
            name="Emergency Fund",
            target_amount=5000.00,
            current_amount=1000.00,
            target_date=emergency_date,
            description="Emergency savings fund",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    ]
    
    db.session.add_all(goals)
    db.session.commit()

def undo_savings_goals():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.savings_goals RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("DELETE FROM savings_goals")
        
    db.session.commit()