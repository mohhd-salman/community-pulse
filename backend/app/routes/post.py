from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from app.decorators import prevent_banned
from app.models import Post, User, Vote
from app.extensions import db
from datetime import datetime, UTC
import logging

post_bp = Blueprint(
     "posts",
     __name__,
     url_prefix="/api/posts"
)
logger = logging.getLogger(__name__)

def error_response(message, code=400):
    logger.warning(f"{code} - {message}")
    return jsonify({"msg": message}), code


# -------------------------------
# Create a new post
# -------------------------------
@post_bp.route("/", methods=["POST"])
@jwt_required()
@prevent_banned
def create_post():
    data = request.get_json()
    title = data.get("title")
    content = data.get("content")
    link = data.get("link")

    if not title:
        return error_response("Title is required", 400)

    user_id = int(get_jwt_identity())
    new_post = Post(
        title=title,
        content=content,
        link=link,
        author_id=user_id,
        created_at=datetime.now(UTC)
    )

    db.session.add(new_post)
    db.session.commit()
    logger.info(f"Post created by user {user_id}")

    return jsonify({"msg": "Post created successfully"}), 201


# -------------------------------
# Get all / filtered posts
# -------------------------------
@post_bp.route("/", methods=["GET"])
def get_posts():
    author_id = request.args.get("author_id", type=int)
    keyword = request.args.get("keyword", type=str)
    sort = request.args.get("sort", default="recent", type=str)
    q = (
        db.session
          .query(
             Post,
             func.coalesce(func.sum(Vote.value), 0).label("score")
          )
          .outerjoin(Vote)
          .group_by(Post.id)
    )
    if author_id:
        q = q.filter(Post.author_id == author_id)
    if keyword:
        il = f"%{keyword}%"
        q = q.filter(
            Post.title.ilike(il) |
            Post.content.ilike(il)
        )

    if sort == "top":
        q = q.order_by(func.sum(Vote.value).desc(), Post.created_at.desc())
    else:
        q = q.order_by(Post.created_at.desc())

    results = q.all()

    output = []
    for post, score in results:
        upvotes   = sum(1 for v in post.votes if v.value == 1)
        downvotes = sum(1 for v in post.votes if v.value == -1)
        comments = [
            {
                "id": c.id,
                "content": c.content,
                "author_id": c.author_id,
                "author_name": c.author.name if c.author else "Unknown",
                "created_at": c.created_at.isoformat()
            }
            for c in post.comments
        ]

        output.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "link": post.link,
            "created_at": post.created_at.isoformat(),
            "author_id": post.author_id,
            "author_name": post.author.name if post.author else "Unknown",
            "upvotes": upvotes,
            "downvotes": downvotes,
            "score": score,
            "comments": comments
        })

    return jsonify(output), 200

# -------------------------------
# Get single posts
# -------------------------------
@post_bp.route("/<int:post_id>", methods=["GET"])
@jwt_required(optional=True)
def get_single_post(post_id):
    post = Post.query.get_or_404(post_id)
    comments = [
        {
            "id": c.id,
            "content": c.content,
            "author_id": c.author_id,
            "author_name": c.author.name if c.author else "Unknown",
            "created_at": c.created_at.isoformat()
        }
        for c in post.comments
    ]

    upvotes = sum(1 for v in post.votes if v.value == 1)
    downvotes = sum(1 for v in post.votes if v.value == -1)

    user_vote = None
    user_id = get_jwt_identity()
    if user_id:
        existing = Vote.query.filter_by(user_id=int(user_id), post_id=post_id).first()
        if existing:
            user_vote = "up" if existing.value == 1 else "down"

    return jsonify({
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "link": post.link,
        "created_at": post.created_at.isoformat(),
        "author_id": post.author_id,
        "author_name": post.author.name if post.author else "Unknown",
        "upvotes": upvotes,
        "downvotes": downvotes,
        "user_vote": user_vote,
        "comments": comments
    }), 200



# -------------------------------
# Delete post (user or admin)
# -------------------------------
@post_bp.route("/<int:post_id>", methods=["DELETE"])
@jwt_required()
@prevent_banned
def delete_post(post_id):
    user_id = int(get_jwt_identity())
    post = Post.query.get(post_id)
    user = User.query.get(user_id)

    if not post:
        return error_response("Post not found", 404)
    if post.author_id != user_id and not user.is_admin:
        return error_response("Unauthorized", 403)

    db.session.delete(post)
    db.session.commit()
    logger.info(f"Post {post_id} deleted by user {user_id}")
    return jsonify({"msg": "Post deleted"}), 200


# -------------------------------
# Edit post
# -------------------------------
@post_bp.route("/<int:post_id>", methods=["PATCH"])
@jwt_required()
@prevent_banned
def edit_post(post_id):
    user_id = int(get_jwt_identity())
    post = Post.query.get(post_id)
    user = User.query.get(user_id)

    if not post:
        return error_response("Post not found", 404)

    if post.author_id != user_id and not user.is_admin:
        return error_response("Unauthorized", 403)

    data = request.get_json()
    post.title   = data.get("title",   post.title)
    post.content = data.get("content", post.content)
    post.link    = data.get("link",    post.link)

    db.session.commit()
    logger.info(f"Post {post_id} updated by user {user_id}")
    return jsonify({"msg": "Post updated"}), 200


# -------------------------------
# Get vote count
# -------------------------------
@post_bp.route("/<int:post_id>/votes", methods=["GET"])
@jwt_required()
@prevent_banned
def get_post_votes(post_id):
    post = Post.query.get(post_id)
    if not post:
        return error_response("Post not found", 404)

    upvotes = sum(1 for v in post.votes if v.value == 1)
    downvotes = sum(1 for v in post.votes if v.value == -1)

    return jsonify({
        "post_id": post_id,
        "upvotes": upvotes,
        "downvotes": downvotes
    }), 200
