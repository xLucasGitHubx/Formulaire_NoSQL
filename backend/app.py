import os
import logging
from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Initialiser Flask
app = Flask(__name__)
CORS(app)

# Configuration
MONGO_URI    = os.getenv("MONGO_URI")          # ex: mongodb://localhost:27017
MONGO_DBNAME = os.getenv("MONGO_DBNAME")       # ex: ma_base
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

# Logger les valeurs pour debug
logging.basicConfig(level=logging.INFO)
app.logger.info(f"[DEBUG] MONGO_URI    → {MONGO_URI!r}")
app.logger.info(f"[DEBUG] MONGO_DBNAME → {MONGO_DBNAME!r}")

# Initialiser la connexion PyMongo
client = MongoClient(MONGO_URI)
db = client[MONGO_DBNAME]
app.logger.info(f"[DEBUG] Database connectée → {db.name!r}")

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

    try:
        result = db.reponses.insert_one(data)
        app.logger.info(f"[DEBUG] Insert réussi, nouvel _id → {result.inserted_id}")
    except Exception as e:
        app.logger.error(f"[ERROR] Échec de l’insertion : {e!r}")
        return jsonify({"error": "Impossible d’enregistrer la réponse"}), 500

    # Lister les collections après insert (debug)
    collections = db.list_collection_names()
    app.logger.info(f"[DEBUG] Collections après insert → {collections}")

    return jsonify({"message": "Réponse enregistrée", "id": str(result.inserted_id)}), 201

# Lancement de l'application
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
