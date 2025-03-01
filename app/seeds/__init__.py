from flask.cli import AppGroup
from .users import seed_users, undo_users
from .categories import seed_categories, undo_categories
from .transactions import seed_transactions, undo_transactions
from .budgets import seed_budgets, undo_budgets
from .savings import seed_savings_goals, undo_savings_goals

from app.models.db import db, environment, SCHEMA

# Creates a seed group to hold our commands
# So we can type `flask seed --help`
seed_commands = AppGroup('seed')


# Creates the `flask seed all` command
@seed_commands.command('all')
def seed():
    if environment == 'production':
        undo_budgets()
        undo_transactions()
        undo_categories()
        undo_users()
    seed_users()
    seed_categories()
    seed_transactions()
    seed_budgets()
    # Add other seed functions here
    seed_savings_goals()

# Creates the `flask seed undo` command
@seed_commands.command('undo')
def undo():
    undo_budgets()
    undo_transactions()
    undo_categories()
    undo_users()
    # Add other undo functions here
    undo_savings_goals()

# Individual seed commands
@seed_commands.command('categories')
def seed_cats():
    seed_categories()


@seed_commands.command('transactions')
def seed_trans():
    seed_transactions()


@seed_commands.command('budgets')
def seed_budg():
    seed_budgets()
    
@seed_commands.command('savings')
def seed_save():
    seed_savings_goals()