"""
Flask Login Backend  —  login-app
Endpoints:
  POST /api/login    { "username": "...", "password": "..." }
  POST /api/register { "username": "...", "password": "..." }
  GET  /api/health
"""

import os
import time
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import pooling
import bcrypt

# ── Logging ─────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ── App ──────────────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = os.environ["FLASK_SECRET_KEY"]

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
CORS(app, origins=ALLOWED_ORIGINS)

# ── DB pool (retry on startup until MySQL is ready) ──────────
DB_CONFIG = {
    "host":     os.environ["MYSQL_HOST"],
    "port":     int(os.environ.get("MYSQL_PORT", 3306)),
    "database": os.environ["MYSQL_DATABASE"],
    "user":     os.environ["MYSQL_USER"],
    "password": os.environ["MYSQL_PASSWORD"],
}

def create_pool(retries=10, delay=3):
    for attempt in range(retries):
        try:
            pool = pooling.MySQLConnectionPool(
                pool_name="loginpool",
                pool_size=5,
                **DB_CONFIG,
            )
            log.info("MySQL connection pool created.")
            return pool
        except mysql.connector.Error as e:
            log.warning("DB not ready (attempt %d/%d): %s", attempt + 1, retries, e)
            time.sleep(delay)
    raise RuntimeError("Could not connect to MySQL after multiple retries.")

db_pool = create_pool()


def get_conn():
    return db_pool.get_connection()


# ── Routes ───────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password required."}), 400

    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
    except mysql.connector.Error as e:
        log.error("DB error on login: %s", e)
        return jsonify({"success": False, "message": "Database error."}), 500

    if user and bcrypt.checkpw(password.encode(), user["password"].encode()):
        log.info("Successful login: %s", username)
        return jsonify({"success": True, "username": user["username"]}), 200

    log.warning("Failed login attempt for: %s", username)
    return jsonify({"success": False, "message": "Invalid username or password."}), 401


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password required."}), 400
    if len(username) < 3:
        return jsonify({"success": False, "message": "Username must be at least 3 characters."}), 400
    if len(password) < 4:
        return jsonify({"success": False, "message": "Password must be at least 4 characters."}), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=int(os.environ.get("BCRYPT_LOG_ROUNDS", 12))))

    try:
        conn = get_conn()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s)",
            (username, hashed.decode()),
        )
        conn.commit()
        cursor.close()
        conn.close()
        log.info("Registered new user: %s", username)
        return jsonify({"success": True, "message": "User registered successfully."}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"success": False, "message": "Username already exists."}), 409
    except mysql.connector.Error as e:
        log.error("DB error on register: %s", e)
        return jsonify({"success": False, "message": "Database error."}), 500


# ── Entry ────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", 5000))
    app.run(host="0.0.0.0", port=port)
