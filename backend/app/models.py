from .extensions import db
from datetime import datetime, UTC


# ------------------------
# User Model
# ------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(UTC))

    posts = db.relationship("Post", backref="author", lazy=True)
    votes = db.relationship("Vote", backref="voter", lazy=True)
    is_admin = db.Column(db.Boolean, default=False)
    is_banned = db.Column(db.Boolean, default=False)

# ------------------------
# Post Model
# ------------------------
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=True)
    link = db.Column(db.String(300), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(UTC))

    author_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    votes = db.relationship("Vote", backref="post", lazy=True, cascade="all, delete")

# ------------------------
# Vote Model
# ------------------------
class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.Integer, nullable=False)  # +1 or -1
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(UTC))

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("post.id"), nullable=False)

    # one vote per user per post
    __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='unique_user_vote'),)

# ------------------------
# Comment Model
# ------------------------
class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(UTC))

    author_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("post.id"), nullable=False)

    author = db.relationship("User", backref="comments")
    post = db.relationship("Post", backref="comments")

