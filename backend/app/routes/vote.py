from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.decorators import prevent_banned
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
@prevent_banned
def vote():
    data    = request.get_json()
    user_id = int(get_jwt_identity())
    post_id = data.get("post_id")
    vt      = data.get("vote_type")

    if vt not in ("up","down") or not post_id:
        return error_response("Invalid post_id or vote_type", 400)

    post = Post.query.get_or_404(post_id)
    val  = 1 if vt=="up" else -1

    existing = Vote.query.filter_by(user_id=user_id, post_id=post_id).first()
    if existing:
        if existing.value == val:
            db.session.delete(existing)
            msg = "Vote removed"
        else:
            existing.value = val
            msg = "Vote updated"
    else:
        new = Vote(user_id=user_id, post_id=post_id, value=val)
        db.session.add(new)
        msg = "Vote recorded"

    db.session.commit()
    return jsonify({"msg": msg, "post_id": post_id, "vote": vt}), 200

