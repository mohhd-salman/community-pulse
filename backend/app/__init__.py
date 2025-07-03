import logging
from flask import Flask, jsonify
from flask_cors import CORS
from .config import Config
from .extensions import db, jwt, migrate
from .routes.auth import auth_bp
from .routes.post import post_bp
from .routes.vote import vote_bp
from .routes.comment import comment_bp
from .routes.admin import admin_bp


def create_app():
    """
       Creates and configures the Flask app.
       Sets up: App config from the Config class, CORS, Logging, Database, JWT, Migrations,
       All blueprints (auth, posts, votes, comments, admin)
       Returns: The configured Flask app.
    """
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
    )
    logger = logging.getLogger(__name__)
    logger.info("Starting Flask app")

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    @jwt.unauthorized_loader
    def missing_token(err):
        return jsonify({"msg": "Missing or invalid token"}), 401

    @jwt.invalid_token_loader
    def bad_token(err):
        return jsonify({"msg": "Invalid token"}), 401

    @jwt.expired_token_loader
    def expired_token(header, payload):
        return jsonify({"msg": "Token expired"}), 401

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(post_bp, url_prefix="/api/posts")
    app.register_blueprint(vote_bp, url_prefix="/api/votes")
    app.register_blueprint(comment_bp, url_prefix="/api/comments")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    return app
