from .extensions import db
from datetime import datetime, UTC
from werkzeug.security import generate_password_hash, check_password_hash

# ------------------------
# User Model
# ------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(UTC))

    posts = db.relationship(
        "Post", backref="author", lazy=True,
        cascade="all, delete-orphan", passive_deletes=True
    )
    votes = db.relationship(
        "Vote", backref="voter", lazy=True,
        cascade="all, delete-orphan", passive_deletes=True
    )
    comments = db.relationship(
        "Comment", backref="author", lazy=True,
        cascade="all, delete-orphan", passive_deletes=True
    )

    is_admin = db.Column(db.Boolean, default=False)
    is_banned = db.Column(db.Boolean, default=False)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)


# ------------------------
# Post Model
# ------------------------
class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=True)
    link = db.Column(db.String(300), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(UTC))

    author_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id", name="fk_post_author_id", ondelete="CASCADE"),
        nullable=False
    )

    votes = db.relationship(
        "Vote", backref="post", lazy=True,
        cascade="all, delete-orphan", passive_deletes=True
    )
    comments = db.relationship(
        "Comment", backref="post", lazy=True,
        cascade="all, delete-orphan", passive_deletes=True
    )


# ------------------------
# Vote Model
# ------------------------
class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    value = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(UTC))

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id", name="fk_vote_user_id", ondelete="CASCADE"),
        nullable=False
    )
    post_id = db.Column(
        db.Integer,
        db.ForeignKey("post.id", name="fk_vote_post_id", ondelete="CASCADE"),
        nullable=False
    )

    # one vote per user per post
    __table_args__ = (
        db.UniqueConstraint('user_id', 'post_id', name='unique_user_vote'),
    )


# ------------------------
# Comment Model
# ------------------------
class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(UTC))

    author_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id", name="fk_comment_author_id", ondelete="CASCADE"),
        nullable=False
    )
    post_id = db.Column(
        db.Integer,
        db.ForeignKey("post.id", name="fk_comment_post_id", ondelete="CASCADE"),
        nullable=False
    )
