from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class SavingsGoal(db.Model):
    __tablename__ = 'savings_goals'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    target_amount = db.Column(db.Numeric(10, 2), nullable=False)
    current_amount = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    target_date = db.Column(db.Date)
    description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationship
    user = db.relationship('User', back_populates='savings_goals')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'target_amount': float(self.target_amount),
            'current_amount': float(self.current_amount),
            'target_date': self.target_date.isoformat() if self.target_date else None,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'progress_percentage': round((float(self.current_amount) / float(self.target_amount)) * 100, 2) if float(self.target_amount) > 0 else 0
        }