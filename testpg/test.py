from flask import Flask, request, render_template, redirect, jsonify
from flask_cors import CORS
from bson import ObjectId
from datetime import datetime
from werkzeug.security import generate_password_hash,check_password_hash
import time

from db import db
from razorpay_client import razorpay_client

app = Flask(__name__)
CORS(app, origins=["https://www.earlycircuit.com","http://localhost:3000"], supports_credentials=True)

@app.route("/create-user", methods=["POST"])
def create_user():
    data = request.json
    name = data.get("username")
    email = data.get("email")
    password = data.get("password")

    # Basic validation
    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    # Check if user exists
    user = db.users.find_one({"email": email})

    if not user:
        hashed_password = generate_password_hash(password)
        user_id = db.users.insert_one({
            "username": name,
            "email": email,
            "password": hashed_password
        }).inserted_id

        db.wallets.insert_one({
            "user_id": user_id,
            "balance": 0.00,
            "currency": "INR"
        })

        message = "User and wallet created"
    else:
        user_id = user["_id"]
        message = "User already exists"

    return jsonify({
        "message": message,
        "user_id": str(user_id)
    })
# @app.route("/", methods=["GET"])
# def get_wallet():
#     user_id = request.args.get("user_id")
#     wallet = db.wallets.find_one({"user_id": user_id})
#     transactions = list(db.wallet_transactions.find({"user_id": user_id}).sort("timestamp", -1))
#     return render_template("index.html", balance=wallet["balance"], transactions=transactions)

@app.route("/topup-link", methods=["POST"])
def create_topup_link():
    data = request.get_json()
    print(data)

    name = data.get("name")
    contact = data.get("contact")
    email = data.get("email")
    amount = data.get("amount")
    description = data.get("description")
    callback_url = data.get("callback_url")

    reference_id = data.get("reference_id", f"wallet_topup_{str(ObjectId())}")
    expire_after_seconds = data.get("expire_after_seconds", 1000)
    accept_partial = data.get("accept_partial", True)
    first_min_partial_amount = data.get("first_min_partial_amount", 100)
    reminder_enable = data.get("reminder_enable", True)

    customer = {
        "name": name,
        "contact": contact,
        "email": email
    }
    print(float(amount)*100)

    payment_link_data = {
        "amount": int(float(amount) * 100),
        "currency": "INR",
        "accept_partial": accept_partial,
        "first_min_partial_amount": first_min_partial_amount,
        "expire_by": int(time.time()) + expire_after_seconds,
        "reference_id": reference_id,
        "description": description,
        "customer": customer,
        "notify": {"sms": True, "email": True},
        "reminder_enable": reminder_enable,
        "notes": {"purpose": "Wallet top-up"},
        "callback_url": callback_url,
        "callback_method": "get"
    }

    payment_link = razorpay_client.payment_link.create(payment_link_data)

    return jsonify({"payment_link": payment_link["short_url"]})

@app.route("/topuplinkwallet", methods=["POST"])
def create_topup_link_with_wallet_transaction():
    data = request.get_json()
    print(data)

    name = data.get("name")
    contact = data.get("contact")
    email = data.get("email")
    amount = data.get("amount")
    description = data.get("description")
    callback_url = data.get("callback_url")

    reference_id = data.get("reference_id", f"wallet_topup_{str(ObjectId())}")
    expire_after_seconds = data.get("expire_after_seconds", 1000)
    accept_partial = data.get("accept_partial", True)
    first_min_partial_amount = data.get("first_min_partial_amount", 100)
    reminder_enable = data.get("reminder_enable", True)

    customer = {
        "name": name,
        "contact": contact,
        "email": email
    }

    payment_link_data = {
        "amount": float(amount) * 100,
        "currency": "INR",
        "accept_partial": accept_partial,
        "first_min_partial_amount": first_min_partial_amount,
        "expire_by": int(time.time()) + expire_after_seconds,
        "reference_id": reference_id,
        "description": description,
        "customer": customer,
        "notify": {"sms": True, "email": True},
        "reminder_enable": reminder_enable,
        "notes": {"purpose": "Wallet top-up"},
        "callback_url": callback_url,
        "callback_method": "get"
    }

    # Create payment link
    payment_link = razorpay_client.payment_link.create(payment_link_data)

    # Get user by email to fetch user_id
    user = db.users.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Insert pending transaction into the wallet_transactions collection
    db.wallet_transactions.insert_one({
        "user_id": user["_id"],
        "type": "credit",
        "amount": float(amount),
        "status": "pending",
        "reference_id": reference_id,
        "razorpay_payment_link_id": payment_link["id"],
        "timestamp": datetime.utcnow()
    })

    return jsonify({
        "message": "Payment link created and transaction recorded",
        "payment_link": payment_link["short_url"]
    })

@app.route("/topup", methods=["POST"])
def topup():
    amount = float(request.form.get("amount"))

    customer = {
        "name": "Demo User",
        "contact": "+916382803705",
        "email": "rajkisanssvrs@gmail.com"
    }

    reference_id = f"wallet_topup_{str(ObjectId())}"

    payment_link_data = {
        "amount": int(amount * 100),
        "currency": "INR",
        "accept_partial": True,
        "first_min_partial_amount": 100,
        "expire_by": int(time.time()) + 1000,
        "reference_id": reference_id,
        "description": f"Wallet top-up of ₹{amount}",
        "customer": customer,
        "notify": {"sms": True, "email": True},
        "reminder_enable": True,
        "notes": {"purpose": "Wallet top-up"},
        "callback_url": "https://testwalletglonix.vercel.app/payment/callback",
        "callback_method": "get"
    }

    payment_link = razorpay_client.payment_link.create(payment_link_data)

    db.wallet_transactions.insert_one({
        "user_id": user_id,
        "type": "credit",
        "amount": amount,
        "status": "pending",
        "reference_id": reference_id,
        "razorpay_payment_link_id": payment_link["id"],
        "timestamp": datetime.utcnow()
    })

    return redirect(payment_link["short_url"])
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = db.users.find_one({"email": email})

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    wallet = db.wallets.find_one({"user_id": user["_id"]})
    if not wallet:
        return jsonify({"error": "Wallet not found"}), 404

    return jsonify({
        "message": "Login successful",
        "user_id": str(user["_id"]),
        "balance": wallet["balance"],
        "currency": wallet["currency"]
    })
@app.route("/debit", methods=["POST"])
def debit():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    amount = data.get("amount")

    # Basic validations
    if not email or not password or amount is None:
        return jsonify({"error": "Email, password, and amount are required"}), 400

    try:
        amount = float(amount)
    except ValueError:
        return jsonify({"error": "Invalid amount format"}), 400

    # Authenticate user
    user = db.users.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    # Check wallet and balance
    wallet = db.wallets.find_one({"user_id": user["_id"]})
    if not wallet:
        return jsonify({"error": "Wallet not found"}), 404

    if wallet["balance"] < amount:
        return jsonify({"error": "Insufficient balance"}), 402

    # Perform debit
    db.wallets.update_one({"user_id": user["_id"]}, {"$inc": {"balance": -amount}})

    # Log transaction
    transaction = {
        "user_id": user["_id"],
        "type": "debit",
        "amount": amount,
        "status": "success",
        "reference_id": f"manual_debit_{str(ObjectId())}",
        "timestamp": datetime.utcnow()
    }
    db.wallet_transactions.insert_one(transaction)

    # Fetch updated balance
    updated_wallet = db.wallets.find_one({"user_id": user["_id"]})

    return jsonify({
        "message": "Amount debited successfully",
        "user": user["username"],
        "balance": updated_wallet["balance"],
        "currency": updated_wallet["currency"],
        "transaction_id": transaction["reference_id"]
    })


@app.route("/payment/callback", methods=["GET"])
def payment_callback():
    razorpay_payment_link_id = request.args.get("razorpay_payment_link_id")
    razorpay_payment_link_reference_id = request.args.get("razorpay_payment_link_reference_id")
    razorpay_payment_link_status = request.args.get("razorpay_payment_link_status")
    razorpay_payment_id = request.args.get("razorpay_payment_id")
    razorpay_signature = request.args.get("razorpay_signature")

    payment_status = "failed"
    balance = 0.0

    if razorpay_payment_link_status == "paid":
        txn = db.wallet_transactions.find_one({
            "reference_id": razorpay_payment_link_reference_id,
            "status": "pending"
        })

        if txn:
            db.wallets.update_one(
                {"user_id": txn["user_id"]},
                {"$inc": {"balance": txn["amount"]}}
            )
            db.wallet_transactions.update_one(
                {"_id": txn["_id"]},
                {"$set": {
                    "status": "success",
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature
                }}
            )
            payment_status = "success"

            updated_wallet = db.wallets.find_one({"user_id": txn["user_id"]})
            balance = updated_wallet.get("balance", 0.0)

    # Redirect with payment status and balance as query parameters
    redirect_url = f"http://localhost:3000/payment?payment={payment_status}&balance={balance}"
    return redirect(redirect_url)

@app.route('/get_payments', methods=['GET'])
def get_payments():
    try:
        payments = razorpay_client.payment.all()
        # print(payments.get("items", []))
        return jsonify(payments.get("items", []))  # Safely return items or an empty list
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8000)