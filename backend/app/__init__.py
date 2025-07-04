import logging
from flask import Flask
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
    app.url_map.strict_slashes = False
    app.config.from_object(Config)
    CORS(
        app,
        resources={r"/api/*": {"origins": "http://localhost:5173"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
    )


    logger = logging.getLogger(__name__)
    logger.info("Starting Flask app")

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(auth_bp)
    app.register_blueprint(post_bp)
    app.register_blueprint(vote_bp)
    app.register_blueprint(comment_bp)
    app.register_blueprint(admin_bp)

    return app
