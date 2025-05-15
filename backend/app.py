import os
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from dotenv import load_dotenv

# Charge .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

mongo = PyMongo(app)

# Route de test
@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "API sondage OK"}), 200

# Création d'une réponse
@app.route("/api/reponses", methods=["POST"])
def post_reponse():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Données manquantes"}), 400

    # On pourrait valider la forme ici…
    mongo.db.reponses.insert_one(data)
    return jsonify({"message": "Réponse enregistrée"}), 201

# Lancement
if __name__ == "__main__":
    # en dev : flask run, en prod via Gunicorn
    app.run(host="0.0.0.0", port=5000, debug=True)
