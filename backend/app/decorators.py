from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models import User

def prevent_banned(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = User.query.get(get_jwt_identity())
        if user.is_banned:
            return jsonify({"msg":"Your account is banned"}), 403
        return fn(*args, **kwargs)
    return wrapper
