from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime

class Budget(db.Model):
    __tablename__ = 'budgets'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('categories.id')), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    month = db.Column(db.Integer, nullable=False)  # 1-12 for Jan-Dec
    year = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='budgets')
    category = db.relationship('Category', back_populates='budgets')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'category_id': self.category_id,
            'amount': float(self.amount),
            'month': self.month,
            'year': self.year,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'category': self.category.to_dict() if self.category else None
        }