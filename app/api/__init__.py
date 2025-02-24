from flask import Blueprint
from .user_routes import user_routes
from .auth_routes import auth_routes
from .category_routes import category_routes
from .transaction_routes import transaction_routes

api = Blueprint('api', __name__)

api.register_blueprint(user_routes, url_prefix='/users')
api.register_blueprint(auth_routes, url_prefix='/auth')
api.register_blueprint(category_routes, url_prefix='/categories')
api.register_blueprint(transaction_routes, url_prefix='/transactions')