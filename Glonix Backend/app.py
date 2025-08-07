from flask import Flask, request, jsonify,render_template
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import pytz
import hashlib

from mail import send_order_email,send_payment_success_mail,send_quotation_email,send_order_update_email,send_quotation_update_email
import requests
IST = pytz.timezone("Asia/Kolkata")

app = Flask(__name__)
CORS(app, origins=["https://www.earlycircuit.com","http://localhost:3000","https://admin-nine-lake-10.vercel.app"], supports_credentials=True)

# MongoDB setup using provided URI
MONGO_URI = "mongodb+srv://rajkisanssvrs:Test1234@glonix-cluster.hq9e2.mongodb.net/?retryWrites=true&w=majority&appName=Glonix-Cluster"
client = MongoClient(MONGO_URI)
db = client["user_db"]
users_collection = db["users"]
quotations_collection = db["quotations"]
orders_collection = db["orders"]

# Helper function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Signup route
@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        return '', 204

# ✅ Signup route
@app.route("/signup", methods=["POST", "OPTIONS"])
def signup():
    try:
        if request.content_type != "application/json":
            return jsonify({"error": "Invalid Content-Type. Use 'application/json'"}), 415

        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Invalid JSON format"}), 400

        username = data.get("username")
        password = data.get("password")
        customername = data.get("customername")
        mobnum = data.get("mobnum")
        email = data.get("email")

        if not username or not password:
            return jsonify({"error": "Username and password are required."}), 400

        if users_collection.find_one({"username": username}):
            return jsonify({"error": "Username already exists."}), 409
        if users_collection.find_one({"email": email}):
            return jsonify({"error": "Email already exists."}), 409

        hashed_password = hash_password(password)
        users_collection.insert_one({
            "username": username,
            "password": hashed_password,
            "customername": customername,
            "mobnum": mobnum,
            "email": email,
            "logged_in": False
        })

        return jsonify({"message": "Signup successful!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Login route
@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({"error": "Username and password are required."}), 400

        user = users_collection.find_one({"username": username})
        if not user or user["password"] != hash_password(password):
            return jsonify({"error": "Invalid username or password."}), 400

        # Set logged_in = True
        users_collection.update_one(
            {"username": username},
            {"$set": {"logged_in": True}}
        )

        return jsonify({"message": "Login successful!", "username": username}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ Logout route
@app.route("/logout/<username>", methods=["POST", "OPTIONS"])
def logout(username):
    try:
        result = users_collection.update_one(
            {"username": username},
            {"$set": {"logged_in": False}}
        )
        if result.modified_count == 0:
            return jsonify({"error": "User not found or already logged out."}), 404

        return jsonify({"message": f"{username} logged out successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Get user details route
@app.route("/user/<username>", methods=["GET"])
def get_user_details(username):
    try:
        
        user = users_collection.find_one({"username": username})
        if not user:
            return jsonify({"error": "User not found."}), 404
        logged_in = user.get("logged_in")
        if logged_in == 'logged_out':
            return jsonify({"error": "User not logged in."}), 401

        # Return only selected fields
        user_details = {
            "customername": user.get("customername"),
            "mobnum": user.get("mobnum"),
            "email": user.get("email")
        }

        return jsonify(user_details), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Save quotation details route
from datetime import datetime

# Save quotation details route
@app.route("/getnextquotationid", methods=["GET"])
def get_next_quotation_id():
    last_quotation = quotations_collection.find_one({}, sort=[("quotation_id", -1)])
    
    next_quotation_id = (last_quotation["quotation_id"] + 1) if last_quotation and "quotation_id" in last_quotation else 1000
    return jsonify({"next_quotation_id": next_quotation_id})
    

@app.route("/quotation", methods=["POST"])
def save_or_update_quotation():
    try:
        if request.content_type != "application/json":
            return jsonify({"error": "Invalid Content-Type. Use 'application/json'"}), 415

        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Invalid JSON format"}), 400

        username = data.get("username")
        quotation_type = data.get("quotation_type")

        if not username or not quotation_type:
            return jsonify({"error": "Username and quotation type are required."}), 400

        valid_types = ["fabrication", "assembly", "product_enquiry", "design_enquiry"]
        if quotation_type not in valid_types:
            return jsonify({"error": f"Invalid quotation type. Choose from {valid_types}."}), 400

        current_time_ist = datetime.utcnow().replace(tzinfo=pytz.utc).astimezone(IST)

        quotation_id = data.get("quotation_id")
        quotation_details = {
            "quotation_id": quotation_id,
            "username": username,
            "quotation_type": quotation_type,
            "quotation_status": "pending",
            "viewed_status": data.get("viewed_status"),
            "created_at": current_time_ist.strftime("%Y-%m-%d %H:%M:%S")
        }

        # Type-specific fields
        if quotation_type == "fabrication":
            quotation_details.update({
                "BaseMaterial": data.get("BaseMaterial"),
                "Layers": data.get("Layers"),
                "Dimensions": data.get("Dimensions"),
                "Quantity": data.get("Quantity"),
                "Designs": data.get("Designs"),
                "Delivery": data.get("Delivery"),
                "Thickness": data.get("Thickness"),
                "Color": data.get("Color"),
                "Silkscreen": data.get("Silkscreen"),
                "Finish": data.get("Finish"),
                "CopperWeight": data.get("CopperWeight"),
                "ViaCovering": data.get("ViaCovering"),
                "MinViaSize": data.get("MinViaSize"),
                "File_Url": data.get("Url"),
                "TG": data.get("Tg"),
                "OrederRemove": data.get("Orederremove"),
                "Ftest": data.get("Ftest"),
                "GoldFinger": data.get("Goldfinger"),
            })

        elif quotation_type == "assembly":
            quotation_details.update({
                "SmdPoints": data.get("SmdPoints"),
                "ThPoints": data.get("ThPoints"),
                "TotalPoints": data.get("TotalPoints"),
                "File_Url": data.get("Url"),
            })

        elif quotation_type in ["product_enquiry", "design_enquiry"]:
            quotation_details.update({
                "Requirements": data.get("Requirements"),
                "Abstract": data.get("Abstract"),
                "File_Url": data.get("Url"),
            })

        inserted_quotation = quotations_collection.insert_one(quotation_details)
        saved_quotation = quotations_collection.find_one({"_id": inserted_quotation.inserted_id}, {"_id": 0})

        # 🔍 Fetch user details to send email
        user = users_collection.find_one({"username": username})
        if user:
            to_email = user.get("email")
            name = user.get("name", "Customer")
            phone = user.get("phone")
            file_url = data.get("Url")
            total_price = data.get("price", 0)  # Optional estimated price

            # 📧 Send email + 📲 SMS
            send_quotation_email(
                to_email=to_email,
                name=name,
                quotation_id=quotation_id,
                quotation_type=quotation_type,
                total_price=total_price,
                file_url=file_url,
                phone=phone
            )

        return jsonify({"message": "Quotation created successfully!", "quotation": saved_quotation}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
# Retrieve all quotations for a specific user (with optional filtering by type)
@app.route("/quotations/<username>", methods=["GET"])
def get_quotations(username):
    try:
        quotation_type = request.args.get("type")  # Get filter type from query param
        
        query = {"username": username}
        if quotation_type:
            query["quotation_type"] = quotation_type

        quotations = list(quotations_collection.find(query, {"_id": 0}))
        return jsonify({"quotations": quotations}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Retrieve all quotations in the database (Admin access)
@app.route("/quotations", methods=["GET"])
def get_all_quotations():
    try:
        quotations = list(quotations_collection.find({}, {"_id": 0}))  # Exclude MongoDB ID
        return jsonify({"quotations": quotations}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Retrieve all quotations of a specific type
@app.route("/quotations/type/<quotation_type>", methods=["GET"])
def get_quotations_by_type(quotation_type):
    try:
        valid_types = ["fabrication", "assembly", "product_enquiry", "design_enquiry"]
        print(quotation_type)
        if quotation_type not in valid_types:
            return jsonify({"error": f"Invalid quotation type. Choose from {valid_types}."}), 400

        quotations = list(quotations_collection.find({"quotation_type": quotation_type}, {"_id": 0}))
        return jsonify({"quotations": quotations}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/quotation/update/<int:quotation_id>", methods=["PATCH"])
def update_quotation(quotation_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided for update"}), 400

        # Remove quotation_id from body if present
        data.pop("quotation_id", None)

        data["updated_at"] = datetime.utcnow()
        update_result = quotations_collection.update_one(
            {"quotation_id": quotation_id},
            {"$set": data}
        )

        if update_result.matched_count == 0:
            return jsonify({"error": f"No quotation found with quotation_id {quotation_id}"}), 404

        updated_quotation = quotations_collection.find_one({"quotation_id": quotation_id}, {"_id": 0})

        # 🔍 Fetch user details
        username = updated_quotation.get("username")
        user = users_collection.find_one({"username": username})

        if user:
            to_email = user.get("email")
            name = user.get("name", "Customer")
            phone = user.get("phone")
            quotation_type = updated_quotation.get("quotation_type")
            file_url = updated_quotation.get("File_Url")
            total_price = updated_quotation.get("price", 0)  # Optional

            # 📧 Send update email + 📲 SMS
            send_quotation_update_email(
                to_email=to_email,
                name=name,
                quotation_id=quotation_id,
                quotation_type=quotation_type,
                new_status=updated_quotation.get("quotation_status"),
                total_price=total_price,
                file_url=file_url,
                phone=phone
            )

        return jsonify({"message": "Quotation updated successfully", "quotation": updated_quotation}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
# Retrieve all orders (same as quotations)
@app.route("/orders", methods=["GET"])
def get_all_orders():
    try:
        orders = list(orders_collection.find({}, {"_id": 0}))  # Exclude MongoDB ID
        return jsonify({"orders": orders}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/orders/<username>", methods=["GET"])
def get_orders_by_user(username):
    try:
        user_orders = list(orders_collection.find({"username": username}, {"_id": 0}))
        return jsonify({"orders": user_orders}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/orders/type/<order_type>", methods=["GET"])
def get_orders_by_type(order_type):
    try:
        valid_types = ["fabrication", "assembly", "product_enquiry", "design_enquiry"]
        print(order_type)
        if order_type not in valid_types:
            return jsonify({"error": f"Invalid order type. Choose from {valid_types}."}), 400

        orders = list(orders_collection.find({"order_type": order_type}, {"_id": 0}))
        return jsonify({"orders": orders}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/orders/id/<order_id>", methods=["GET"])
def get_order_by_id(order_id):
    try:

        order = orders_collection.find_one({"order_id": int(order_id)}, {"_id": 0})
        if not order:
            return jsonify({"error": f"No order found with order_id: {order_id}"}), 404

        return jsonify({"order": order}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/quotations/id/<quotation_id>", methods=["GET"])
def get_quotation_by_id(quotation_id):
    try:

        order = quotations_collection.find_one({"quotation_id": int(quotation_id)}, {"_id": 0})
        if not order:
            return jsonify({"error": f"No quote found with order_id: {quotation_id}"}), 404

        return jsonify({"quotation": order}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/getnextorderid", methods=["GET"])
def get_next_order():
    last_order = orders_collection.find_one({}, sort=[("order_id", -1)])
    next_order_id = (last_order["order_id"]) + 1 if last_order and "order_id" in last_order else 1000
    return jsonify({"next_order_id": next_order_id})

def get_next_order_id():
    last_order = orders_collection.find_one({}, sort=[("order_id", -1)])
    return (last_order["order_id"] + 1) if last_order and "order_id" in last_order else 1000



# Your existing setup...
IST = pytz.timezone("Asia/Kolkata")

@app.route("/order", methods=["POST"])
def save_or_update_order():
    try:
        if request.content_type != "application/json":
            return jsonify({"error": "Invalid Content-Type. Use 'application/json'"}), 415

        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Invalid JSON format"}), 400

        username = data.get("username")
        order_type = data.get("order_type")

        if not username or not order_type:
            return jsonify({"error": "Username and order type are required."}), 400

        valid_types = ["fabrication", "assembly", "product_enquiry", "design_enquiry"]
        if order_type not in valid_types:
            return jsonify({"error": f"Invalid order type. Choose from {valid_types}."}), 400

        # 📦 Fetch user info from users_collection
        user = users_collection.find_one({"username": username})
        if not user:
            return jsonify({"error": "User not found"}), 404

        name = user.get("customername")
        to_email = user.get("email")
        phone = user.get("mobnum")

        current_time_ist = datetime.utcnow().replace(tzinfo=pytz.utc).astimezone(IST)
        order_id = get_next_order_id()

        order_details = {
            "order_id": order_id,
            "username": username,
            "order_type": order_type,
            "order_status": "pending",
            "created_at": current_time_ist.strftime("%Y-%m-%d %H:%M:%S"),
            "billing_address": data.get("billing_address"),
            "shipping_address": data.get("shipping_address"),
            "price": data.get("price"),
            "total_price": data.get("total_price"),
            "reference_id": data.get("reference_id"),
            "viewed_status": data.get("viewed_status"),
            "phone": phone
        }

        # Add type-specific fields
        if order_type == "fabrication":
            order_details.update({
                "BaseMaterial": data.get("BaseMaterial"),
                "Layers": data.get("Layers"),
                "Dimensions": data.get("Dimensions"),
                "Quantity": data.get("Quantity"),
                "Designs": data.get("Designs"),
                "Delivery": data.get("Delivery"),
                "Thickness": data.get("Thickness"),
                "Color": data.get("Color"),
                "Silkscreen": data.get("Silkscreen"),
                "Finish": data.get("Finish"),
                "CopperWeight": data.get("CopperWeight"),
                "ViaCovering": data.get("ViaCovering"),
                "MinViaSize": data.get("MinViaSize"),
                "File_Url": data.get("File_Url"),
                "TG": data.get("TG"),
                "OrederRemove": data.get("OrederRemove"),
                "Ftest": data.get("Ftest"),
                "GoldFinger": data.get("GoldFinger"),
            })
        elif order_type == "assembly":
            order_details.update({
                "SmdPoints": data.get("SmdPoints"),
                "ThPoints": data.get("ThPoints"),
                "TotalPoints": data.get("TotalPoints"),
                "File_Url": data.get("File_Url"),
            })
        elif order_type in ["product_enquiry", "design_enquiry"]:
            order_details.update({
                "Requirements": data.get("Requirements"),
                "Abstract": data.get("Abstract"),
                "File_Url": data.get("File_Url"),
            })

        # Insert into DB
        inserted_order = orders_collection.insert_one(order_details)
        saved_order = orders_collection.find_one({"_id": inserted_order.inserted_id}, {"_id": 0})

        # ✅ Send confirmation email
        send_order_email(
        to_email=to_email,
        name=name,
        order_id=order_id,
        order_type=order_type,
        total_price=data.get("total_price"),
        phone=phone
    )

        return jsonify({"message": "Order created successfully!", "order": saved_order}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/orders/update/<int:order_id>", methods=["PATCH"])
def update_order(order_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided for update"}), 400

        if "order_id" in data:
            del data["order_id"]

        data["updated_at"] = datetime.utcnow()

        update_result = orders_collection.update_one(
            {"order_id": order_id},
            {"$set": data}
        )

        if update_result.matched_count == 0:
            return jsonify({"error": f"No order found with order_id {order_id}"}), 404

        # 🔍 Get updated order details
        updated_order = orders_collection.find_one({"order_id": order_id}, {"_id": 0})

        # 📦 Get user details
        username = updated_order.get("username")
        user = users_collection.find_one({"username": username})
        if not user:
            return jsonify({"error": "User not found for this order"}), 404

        # 📨 Prepare email
        to_email = user.get("email")
        name = user.get("name", "Customer")
        phone = user.get("phone")

        order_type = updated_order.get("order_type")
        total_price = updated_order.get("total_price")
        file_url = updated_order.get("File_Url")  # ✅ file URL

        # ✅ Send email with file_url
        send_order_update_email(
            to_email=to_email,
            name=name,
            phone=phone,
            order_id=order_id,
            order_type=order_type,
            total_price=total_price,
            file_url=file_url
        )

        return jsonify({"message": "Order updated successfully", "order": updated_order}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/send-payment-link", methods=["POST"])
def send_payment_link():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Invalid JSON format"}), 400

        required_fields = ["name", "email", "contact", "order_type", "total_price", "reference_id", "description"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"'{field}' is required."}), 400

        name,email,amount,reference_id = data["name"],data["email"],data["total_price"],data["reference_id"],
        base_callback_url = "https://glonix-service-backend.vercel.app/payment/callback"
        callback_url = f"{base_callback_url}?name={name}&email={email}&amount={amount}&reference_id={reference_id} "

        # Prepare payload for topup-link API
        payload = {
            "name": data["name"],
            "email": data["email"],
            "contact": data["contact"],
            "amount": data.get("total_price"),
            "reference_id": data.get("reference_id"),
            "description": data.get("description"),
            "accept_partial": data.get("accept_partial", False),
            "first_min_partial_amount": data.get("first_min_partial_amount", 0),
            "expire_after_seconds": data.get("expire_after_seconds", 3600),
            "reminder_enable": data.get("reminder_enable", True),
            "callback_url": callback_url
        }

        # Request to topup-link API
        res = requests.post("http://testwalletglonix.vercel.app/topup-link", json=payload)
        if res.status_code != 200:
            return jsonify({"error": "Failed to generate payment link"}), 500

        payment_data = res.json()
        payment_link = payment_data.get("payment_link")
        if not payment_link:
            return jsonify({"error": "Payment link not found in response"}), 500

        # Send email
        email_sent = send_order_email(
            to_email=data["email"],
            name=data["name"],
            order_id=data["reference_id"],
            order_type=data["order_type"],
            total_price=data["total_price"],
            file_url=data.get("file_url"),
            payment_link=payment_link,  # updated mail.py handles this
            is_payment_link=True
        )

        if not email_sent:
            return jsonify({"error": "Payment link generated, but email failed."}), 500

        return jsonify({
            "message": "Payment link sent successfully!",
            "payment_link": payment_link
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/payment/callback", methods=["GET"])
def payment_callback():
    name = request.args.get("name")
    email = request.args.get("email")
    amount = request.args.get("amount")
    reference_id = request.args.get("reference_id")

    if not all([name, email, amount]):
        return "Missing parameters in payment callback", 400
    send_payment_success_mail(
    name=name,
    email=email,
    amount=amount,
    reference_id=reference_id
)

    return render_template("payment_success.html", name=name, email=email, amount=amount)
if __name__ == "__main__":
    app.run(debug=True, port=5001)