from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from app.models import db, Vote, Post
import logging

vote_bp = Blueprint("vote", __name__, url_prefix="/api/votes")
logger = logging.getLogger(__name__)

def error_response(message, code=400):
    logger.warning(f"{code} - {message}")
    return jsonify({"msg": message}), code

# -------------------------------
# Submit or update vote
# -------------------------------
@vote_bp.route("/", methods=["POST"])
@jwt_required()
def vote():
    data = request.get_json()
    user_id = int(get_jwt_identity())
    post_id = data.get("post_id")
    vote_type = data.get("vote_type")

    if not post_id or vote_type not in ["up", "down"]:
        return error_response("Invalid post_id or vote_type", 400)

    vote_value = 1 if vote_type == "up" else -1

    post = Post.query.get(post_id)
    if not post:
        return error_response("Post not found", 404)

    existing_vote = Vote.query.filter_by(user_id=user_id, post_id=post_id).first()

    try:
        if existing_vote:
            existing_vote.value = vote_value
            logger.info(f"User {user_id} updated vote on post {post_id} to {vote_type}")
        else:
            new_vote = Vote(user_id=user_id, post_id=post_id, value=vote_value)
            db.session.add(new_vote)
            logger.info(f"User {user_id} cast {vote_type} vote on post {post_id}")

        db.session.commit()
        return jsonify({
            "msg": "Vote recorded",
            "post_id": post_id,
            "vote": vote_type
        }), 200

    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"Vote DB error: {e}")
        return error_response("Database error", 500)
