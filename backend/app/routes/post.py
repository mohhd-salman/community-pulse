from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Post, User
from app.extensions import db
from datetime import datetime, UTC

post_bp = Blueprint("posts", __name__)

# -------------------------------
# Create a new post (JWT required)
# -------------------------------
@post_bp.route("/", methods=["POST"])
@jwt_required()
def create_post():
    data = request.get_json()
    title = data.get("title")
    content = data.get("content")
    link = data.get("link")

    if not title:
        return jsonify({"msg": "Title is required"}), 400

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

    return jsonify({"msg": "Post created successfully"}), 201

# -------------------------------
# Get all posts
# -------------------------------
@post_bp.route("/", methods=["GET"])
def get_posts():
    posts = Post.query.order_by(Post.id.desc()).all()

    output = []
    for post in posts:
        output.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "link": post.link,
            "created_at": post.created_at.isoformat(),
            "author_id": post.author_id
        })

    return jsonify(output), 200
