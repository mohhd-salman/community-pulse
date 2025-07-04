from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.decorators import prevent_banned
from app.models import db, User, Post, Comment, Vote
import logging
from sqlalchemy import func

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")
logger = logging.getLogger(__name__)

def error_response(message, code=403):
    logger.warning(f"{code} - {message}")
    return jsonify({"msg": message}), code

def is_admin_user(user_id):
    user = User.query.get(user_id)
    return user and user.is_admin


# -------------------------------
# Ban or Unban a User
# -------------------------------
@admin_bp.route("/users/<int:user_id>/ban", methods=["PATCH"])
@jwt_required()
@prevent_banned
def toggle_ban_user(user_id):
    admin_id = int(get_jwt_identity())
    if not is_admin_user(admin_id):
        return error_response("Admin access required")

    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)

    user.is_banned = not user.is_banned
    db.session.commit()
    status = "banned" if user.is_banned else "unbanned"

    logger.info(f"Admin {admin_id} {status} user {user_id}")
    return jsonify({"msg": f"User {status}"}), 200


# -------------------------------
# View All Users
# -------------------------------
@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@prevent_banned
def view_users():
    admin_id = int(get_jwt_identity())
    if not is_admin_user(admin_id):
        return error_response("Admin access required")

    users = User.query.all()
    data = [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "created_at": u.created_at.isoformat(),
            "is_admin": u.is_admin,
            "is_banned": u.is_banned
        } for u in users
    ]

    logger.info(f"Admin {admin_id} viewed all users")
    return jsonify(data), 200


# -------------------------------
# Get Analytics
# -------------------------------
@admin_bp.route("/analytics", methods=["GET"])
@jwt_required()
@prevent_banned
def get_analytics():
    admin_id = int(get_jwt_identity())
    if not is_admin_user(admin_id):
        return error_response("Admin access required")

    total_users = User.query.count()
    banned_users = User.query.filter_by(is_banned=True).count()
    active_admins = User.query.filter_by(is_admin=True).count()

    total_posts = Post.query.count()
    total_comments = Comment.query.count()

    top_post = (
        db.session.query(Post)
        .outerjoin(Vote)
        .group_by(Post.id)
        .order_by(func.sum(Vote.value).desc())
        .first()
    )

    top_post_data = {
        "id": top_post.id,
        "title": top_post.title,
        "upvotes": sum(v.value for v in top_post.votes if v.value == 1),
        "comments": len(top_post.comments)
    } if top_post else None

    logger.info(f"Admin {admin_id} fetched analytics")

    return jsonify({
        "total_users": total_users,
        "banned_users": banned_users,
        "active_admins": active_admins,
        "total_posts": total_posts,
        "total_comments": total_comments,
        "top_post": top_post_data
    }), 200
