import os
import logging
from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from dotenv import load_dotenv
from bson import ObjectId
import jwt
import datetime
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

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

JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret")
JWT_EXPIRATION = 60 * 60 * 24  # 24h

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        app.logger.info(f"[DEBUG] Authorization header: {request.headers.get('Authorization')}")
        if "Authorization" in request.headers:
            parts = request.headers["Authorization"].split()
            if len(parts) == 2 and parts[0] == "Bearer":
                token = parts[1]
        if not token:
            return jsonify({"error": "Token manquant"}), 401
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            user_id = data["user_id"]
            oid = ObjectId(user_id)  # <-- conversion ici
            user = db.users.find_one({"_id": oid})
            if not user:
                raise Exception("Utilisateur inconnu")
            request.user = user
        except Exception as e:
            app.logger.error(f"[ERROR] Token invalide: {e!r}")
            return jsonify({"error": "Token invalide"}), 401
        return f(*args, **kwargs)
    return decorated

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
@token_required
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
@token_required
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
@token_required
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


@app.route("/api/surveys", methods=["POST"])
@token_required
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
@token_required
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
@token_required
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


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email et mot de passe requis"}), 400
    if db.users.find_one({"email": data["email"]}):
        return jsonify({"error": "Email déjà utilisé"}), 409
    hashed_pw = generate_password_hash(data["password"])
    user = {"email": data["email"], "password": hashed_pw}
    db.users.insert_one(user)
    return jsonify({"message": "Compte créé"}), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email et mot de passe requis"}), 400
    user = db.users.find_one({"email": data["email"]})
    if not user or not check_password_hash(user["password"], data["password"]):
        return jsonify({"error": "Identifiants invalides"}), 401
    token = jwt.encode({
        "user_id": str(user["_id"]),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=JWT_EXPIRATION)
    }, JWT_SECRET, algorithm="HS256")
    return jsonify({"token": token}), 200


# Lancement de l'application
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000, debug=True)
