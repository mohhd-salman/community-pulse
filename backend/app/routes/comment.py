from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.decorators import prevent_banned
from app.models import db, Comment, User
import logging

comment_bp = Blueprint("comment_bp", __name__, url_prefix="/api/comments")
logger = logging.getLogger(__name__)


def error_response(message, code=400):
    logger.warning(f"{code} - {message}")
    return jsonify({"msg": message}), code


# -------------------------------
# Add a Comment
# -------------------------------
@comment_bp.route("/", methods=["POST"])
@jwt_required()
@prevent_banned
def add_comment():
    data = request.get_json()
    user_id = int(get_jwt_identity())

    content = data.get("content")
    post_id = data.get("post_id")

    if not content or not post_id:
        return error_response("Content and post_id are required", 400)

    try:
        comment = Comment(
            content=content,
            author_id=user_id,
            post_id=post_id
        )
        db.session.add(comment)
        db.session.commit()

        logger.info(f"User {user_id} added comment to post {post_id}")
        return jsonify({"msg": "Comment added"}), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding comment: {e}")
        return error_response("Internal server error", 500)


# -------------------------------
# Delete a Comment
# -------------------------------
@comment_bp.route("/<int:comment_id>", methods=["DELETE"])
@jwt_required()
@prevent_banned
def delete_comment(comment_id):
    user_id = int(get_jwt_identity())
    comment = Comment.query.get(comment_id)
    user = User.query.get(user_id)

    if not comment:
        return error_response("Comment not found", 404)

    if comment.author_id != user_id and not (user and user.is_admin):
        return error_response("Unauthorized", 403)

    try:
        db.session.delete(comment)
        db.session.commit()
        logger.info(f"User {user_id} deleted comment {comment_id}")
        return jsonify({"msg": "Comment deleted"}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting comment {comment_id}: {e}")
        return error_response("Internal server error", 500)
