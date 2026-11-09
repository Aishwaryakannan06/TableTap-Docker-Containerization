
import os
import json
import sqlite3
from datetime import datetime
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Docker-compatible database location
DATABASE = os.environ.get("DATABASE_PATH", "tabletap.db")

# Create the database directory if it doesn't exist
os.makedirs(os.path.dirname(DATABASE) or ".", exist_ok=True)


def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def create_database():
    connection = get_db_connection()

    try:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_number TEXT NOT NULL,
                items TEXT NOT NULL,
                total REAL NOT NULL,
                status TEXT DEFAULT 'Pending',
                created_at TEXT NOT NULL
            )
        """)

        connection.commit()
    finally:
        connection.close()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/orders", methods=["POST"])
def place_order():
    data = request.get_json(silent=True)

    if not data or not isinstance(data.get("items"), list):
        return jsonify({"error": "Invalid order"}), 400

    items = data["items"]

    if not items:
        return jsonify({"error": "Your cart is empty"}), 400

    total = 0

    for item in items:
        try:
            quantity = int(item["quantity"])
            price = float(item["price"])
        except (KeyError, TypeError, ValueError):
            return jsonify({"error": "Invalid item details"}), 400

        if quantity <= 0 or price < 0:
            return jsonify({"error": "Invalid quantity or price"}), 400

        total += quantity * price

    connection = get_db_connection()

    try:
        cursor = connection.execute(
            """
            INSERT INTO orders (table_number, items, total, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (
                "01",
                json.dumps(items),
                total,
                datetime.now().isoformat(timespec="seconds")
            )
        )

        order_id = cursor.lastrowid
        connection.commit()

    finally:
        connection.close()

    return jsonify({
        "message": "Order received successfully!",
        "order_id": order_id,
        "total": total
    }), 201


if __name__ == "__main__":
    create_database()
    app.run(host="0.0.0.0", port=5000, debug=False)
