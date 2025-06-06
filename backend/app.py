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
CORS(app, resources={r"/api/*": {"origins": "*"}})

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


# ─── Routes pour gérer les “surveys” ─────────────────────────────────────────────

@app.route("/api/surveys", methods=["GET"])
def get_all_surveys():
    surveys = []
    for doc in db.surveys.find():
        surveys.append({
            "_id": str(doc["_id"]),
            "name": doc.get("name"),
            "questions": doc.get("questions", [])
        })
    return jsonify(surveys), 200


@app.route("/api/surveys/<string:survey_id>", methods=["GET"])
def get_survey_by_id(survey_id):
    from bson import ObjectId
    try:
        oid = ObjectId(survey_id)
    except Exception:
        return jsonify({"error": "ID invalide"}), 400

    doc = db.surveys.find_one({"_id": oid})
    if not doc:
        return jsonify({"error": "Survey introuvable"}), 404

    return jsonify({
        "_id": str(doc["_id"]),
        "name": doc.get("name"),
        "questions": doc.get("questions", [])
    }), 200


@app.route("/api/responses", methods=["POST"])
def post_response():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Données manquantes"}), 400

    try:
        result = db.reponses.insert_one(data)
        app.logger.info(f"[DEBUG] Insert réussi, nouvel _id → {result.inserted_id}")
    except Exception as e:
        app.logger.error(f"[ERROR] Échec de l’insertion : {e!r}")
        return jsonify({"error": "Impossible d’enregistrer la réponse"}), 500

    return jsonify({"message": "Réponse enregistrée", "id": str(result.inserted_id)}), 201


def create_survey():
    data = request.get_json()
    if not data or "name" not in data or "questions" not in data:
        return jsonify({"error": "Payload invalide"}), 400

    name = data["name"].strip()
    questions = data["questions"]
    if not name or not isinstance(questions, list):
        return jsonify({"error": "Payload invalide"}), 400

    try:
        result = db.surveys.insert_one({
            "name": name,
            "questions": questions
        })
        doc = db.surveys.find_one({"_id": result.inserted_id})
    except Exception as e:
        app.logger.error(f"[ERROR] Impossible de créer le survey : {e!r}")
        return jsonify({"error": "Erreur serveur lors de la création du survey"}), 500

    return jsonify({
        "_id": str(doc["_id"]),
        "name": doc.get("name"),
        "questions": doc.get("questions", [])
    }), 201


@app.route("/api/surveys/<string:survey_id>", methods=["PUT"])
def update_survey(survey_id):
    from bson import ObjectId
    try:
        oid = ObjectId(survey_id)
    except Exception:
        return jsonify({"error": "ID invalide"}), 400

    data = request.get_json()
    if not data or "name" not in data or "questions" not in data:
        return jsonify({"error": "Payload invalide"}), 400

    name = data["name"].strip()
    questions = data["questions"]
    if not name or not isinstance(questions, list):
        return jsonify({"error": "Payload invalide"}), 400

    result = db.surveys.update_one(
        {"_id": oid},
        {"$set": {"name": name, "questions": questions}}
    )
    if result.matched_count == 0:
        return jsonify({"error": "Survey introuvable"}), 404

    doc = db.surveys.find_one({"_id": oid})
    return jsonify({
        "_id": str(doc["_id"]),
        "name": doc.get("name"),
        "questions": doc.get("questions", [])
    }), 200


@app.route("/api/surveys/<string:survey_id>", methods=["DELETE"])
def delete_survey(survey_id):
    from bson import ObjectId
    try:
        oid = ObjectId(survey_id)
    except Exception:
        return jsonify({"error": "ID invalide"}), 400

    result = db.surveys.delete_one({"_id": oid})
    if result.deleted_count == 0:
        return jsonify({"error": "Survey introuvable"}), 404

    return "", 204


# Lancement de l'application
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000, debug=True)
