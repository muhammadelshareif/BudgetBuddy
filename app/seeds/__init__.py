from flask.cli import AppGroup
from .users import seed_users, undo_users
from .categories import seed_categories, undo_categories
from .transactions import seed_transactions, undo_transactions

from app.models.db import db, environment, SCHEMA

# Creates a seed group to hold our commands
# So we can type `flask seed --help`
seed_commands = AppGroup('seed')


# Creates the `flask seed all` command
@seed_commands.command('all')
def seed():
    if environment == 'production':

        undo_users()
        undo_categories()
        undo_transactions()
    seed_users()
    seed_categories()
    seed_transactions()
    # Add other seed functions here


# Creates the `flask seed undo` command
@seed_commands.command('undo')
def undo():
    undo_transactions()
    undo_categories()
    undo_users()
    # Add other undo functions here


# Individual seed commands
@seed_commands.command('categories')
def seed_cats():
    seed_categories()


@seed_commands.command('transactions')
def seed_trans():
    seed_transactions()