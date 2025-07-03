from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User
from app.extensions import db
import logging

auth_bp = Blueprint("auth", __name__)
logger = logging.getLogger(__name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not name or not email or not password:
        logger.warning("Missing fields during registration.")
        return jsonify({"msg": "Name, email, and password are required"}), 400

    if User.query.filter_by(email=email).first():
        logger.info(f"Registration attempt with existing email: {email}")
        return jsonify({"msg": "Email already registered"}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(name=name, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    logger.info(f"User registered successfully: {email}")
    return jsonify({"msg": "Registration successful"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"msg": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        logger.warning(f"Failed login attempt for email: {email}")
        return jsonify({"msg": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    logger.info(f"User logged in: {email}")
    return jsonify({"access_token": token}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at.isoformat(),
        "posts": [
            {"id": p.id, "title": p.title, "created_at": p.created_at.isoformat()}
            for p in user.posts
        ]
    }), 200


@auth_bp.route("/update", methods=["PATCH"])
@jwt_required()
def update_user_info():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    new_name = data.get("name", "").strip()
    new_email = data.get("email", "").strip()

    if new_email and User.query.filter(User.email == new_email, User.id != user_id).first():
        return jsonify({"msg": "Email already in use"}), 409

    if new_name:
        user.name = new_name
    if new_email:
        user.email = new_email

    db.session.commit()
    logger.info(f"User {user.id} updated their info")
    return jsonify({"msg": "User info updated"}), 200


@auth_bp.route("/change-password", methods=["PATCH"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    old_pw = data.get("old_password", "")
    new_pw = data.get("new_password", "")

    if not old_pw or not new_pw:
        return jsonify({"msg": "Both old and new passwords are required"}), 400

    if not check_password_hash(user.password, old_pw):
        return jsonify({"msg": "Old password is incorrect"}), 403

    user.password = generate_password_hash(new_pw)
    db.session.commit()
    logger.info(f"User {user.email} changed their password")
    return jsonify({"msg": "Password updated successfully"}), 200

@auth_bp.route("/is-admin", methods=["GET"])
@jwt_required()
def check_admin():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    return jsonify({
        "is_admin": user.is_admin if user else False
    }), 200
