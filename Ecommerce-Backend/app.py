from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient,ReturnDocument
import requests
from bson import ObjectId
from mail import send_order_email, send_sms_campaign,send_order_update_email


app = Flask(__name__)
CORS(app)  # <-- Add this line to enable CORS for all routes
# MongoDB connection
import certifi

# MongoDB Atlas connection string
MONGO_URI = "mongodb+srv://rajkisanssvrs:Test1234@glonix-cluster.hq9e2.mongodb.net/?retryWrites=true&w=majority&appName=Glonix-Cluster"

# Create a secure connection using certifi
client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where()
)
# Existing product DB and collection
db = client["product_db"]
collection = db["products"]

# New ecommerce DB and orders collection
ecommerce_db = client["ecommerce"]
orders_collection = ecommerce_db["orders"]
enquiries_collection = ecommerce_db["enquiries"]


@app.route('/add-product', methods=['POST'])
def add_product():
    category = request.form.get('category')
    product_name = request.form.get('product_name')
    availability_number = request.form.get('availability_number')
    price = request.form.get('price')
    package_type = request.form.get('package_type')
    image_file = request.files.get('file')
    description = request.form.get('description')

    missing_fields = []
    if not category: missing_fields.append("category")
    if not product_name: missing_fields.append("product_name")
    if not availability_number: missing_fields.append("availability_number")
    if not price: missing_fields.append("price")
    if not image_file: missing_fields.append("image_file")
    if not package_type: missing_fields.append("package_type")

    if missing_fields:
        return jsonify({
            "error": "Missing required fields",
            "missing_fields": missing_fields
        }), 400

    try:
        sku_number = 100
        while collection.find_one({"sku_number": str(sku_number)}):
            sku_number += 1
        new_sku = str(sku_number)

        # ⛏️ Read file fully into memory (prevents IncompleteRead)
        files = {'file': (image_file.filename, image_file.read(), image_file.content_type)}
        data_payload = {'product_id': new_sku}
        upload_url = 'https://file-store-api.onrender.com/products'

        response = requests.post(upload_url, files=files, data=data_payload)
        if response.status_code != 200:
            return jsonify({"error": "Image upload failed", "details": response.text}), 500

        file_url = response.json().get('file_url', '')
        product = {
            "category": category,
            "product_name": product_name,
            "availability_number": int(availability_number),
            "sku_number": new_sku,
            "price": float(price),
            "package_type": package_type,
            "image_url": file_url,
            "description": description
        }

        collection.insert_one(product)

        return jsonify({
            "message": "Product added successfully!",
            "sku_number": new_sku,
            "image_url": file_url
        }), 201

    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)}), 500

# Get all products with stock status
@app.route('/products', methods=['GET'])
def get_products():
    products = list(collection.find({}, {"_id": 0}))  # Retrieve all products excluding _id field
    results = []

    for product in products:
        # Check stock status
        availability = product.get('availability_number', 0)
        status = "Available Stock" if availability > 0 else "Out of Stock"
        
        # Add product details along with the file URL
        results.append({
            "category": product["category"],
            "product_name": product["product_name"],
            "sku_number": product["sku_number"],
            "price": product["price"],
            "stock_status": status,
            "file_url": product.get("image_url", ""),  # Ensure to fetch the 'image_url' field
            "package_type": product.get("package_type", ""),  # Add package_type here
            "description": product.get("description", ""),
            "availability_number": product.get("availability_number", 0)
        })
        
    return jsonify(results)
@app.route('/orders/<username>', methods=['GET'])
def get_orders_by_username(username):
    orders = list(orders_collection.find(
        {"username": {"$regex": f"^{username}$", "$options": "i"}}
    ))

    if not orders:
        return jsonify({"message": f"No orders found for user: {username}"}), 404

    return jsonify({"orders": orders}), 200

@app.route('/orders-admin', methods=['GET'])
def get_all_orders():
    orders = list(orders_collection.find())
    for order in orders:
        order['_id'] = str(order['_id'])  # Convert ObjectId to string
    return jsonify({"orders": orders}), 200


@app.route('/reduce-stock/<sku_number>', methods=['PUT'])
def reduce_stock(sku_number):
    data = request.get_json()
    reduce_by = int(data.get('quantity', 0))

    if reduce_by <= 0:
        return jsonify({"error": "Quantity must be greater than 0"}), 400

    # Find product
    product = collection.find_one({"sku_number": sku_number})
    if not product:
        return jsonify({"error": "Product not found"}), 404

    current_stock = product.get("availability_number", 0)

    if current_stock < reduce_by:
        return jsonify({"error": "Not enough stock available"}), 400

    # Reduce and update
    new_stock = current_stock - reduce_by
    collection.update_one(
        {"sku_number": sku_number},
        {"$set": {"availability_number": new_stock}}
    )

    return jsonify({
        "message": "Stock reduced successfully",
        "sku_number": sku_number,
        "updated_stock": new_stock
    })

# Update stock (subtract quantity)
@app.route('/update-product/<sku_number>', methods=['PUT'])
def update_product(sku_number):
    data = request.get_json()
    
    # Only allow updates for valid fields
    allowed_fields = ['category', 'product_name', 'availability_number', 'price']
    update_fields = {k: v for k, v in data.items() if k in allowed_fields}

    if not update_fields:
        return jsonify({"error": "No valid fields to update"}), 400

    result = collection.update_one(
        {"sku_number": sku_number},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Product not found"}), 404

    return jsonify({"message": "Product updated successfully!"})

@app.route('/delete-product/<sku_number>', methods=['DELETE'])
def delete_product(sku_number):
    result = collection.delete_one({"sku_number": sku_number})

    if result.deleted_count == 0:
        return jsonify({"error": "Product not found"}), 404

    return jsonify({"message": f"Product with SKU {sku_number} deleted successfully!"})

def get_next_order_id():
    counter = orders_collection.find_one_and_update(
        {"_id": "orderid"},
        {"$inc": {"sequence_value": 1}},
        return_document=ReturnDocument.AFTER,
        upsert=True  # Creates the doc if it doesn't exist
    )
    return f"EO{counter['sequence_value']}"

@app.route('/buy-products', methods=['POST'])
def buy_products():
    data = request.get_json()
    username = data.get('username')

    name = data.get('name')
    email = data.get('email')
    mobile = data.get('mobile')
    billing_address = data.get('billing_address')
    shipping_address = data.get('shipping_address')
    items = data.get('items')  # List of dicts: [{sku_number: 'SKU001', quantity: 2}, ...]

    if not all([username,name, email, mobile, billing_address, shipping_address, items]):
        return jsonify({"error": "Missing required fields"}), 400

    if not isinstance(items, list) or not all('sku_number' in item and 'quantity' in item for item in items):
        return jsonify({"error": "Items must be a list of {'sku_number': str, 'quantity': int}"}), 400

    order_items = []
    total_price = 0
    updates = []


    for item in items:
        sku = item['sku_number']
        quantity = item['quantity']

        if not isinstance(quantity, int) or quantity <= 0:
            return jsonify({"error": f"Invalid quantity for SKU {sku}"}), 400

        product = collection.find_one({"sku_number": sku})
        if not product:
            return jsonify({"error": f"Product with SKU {sku} not found"}), 404

        current_stock = product.get("availability_number", 0)
        if current_stock < quantity:
            return jsonify({"error": f"Insufficient stock for SKU {sku}. Available: {current_stock}"}), 400

        # Add item to order summary
        order_items.append({
            "sku_number": sku,
            "product_name": product["product_name"],
            "quantity": quantity,
            "price": product["price"],
            "image_url": product["image_url"],
        })

        total_price = data.get("total_price", 0)

        # Prepare stock update
        updates.append({
            "sku_number": sku,
            "new_stock": current_stock - quantity
        })

    # All stock checks passed — proceed to update
    for update in updates:
        collection.update_one(
            {"sku_number": update["sku_number"]},
            {"$set": {"availability_number": update["new_stock"]}}
        )

    order_id = get_next_order_id()
    order = {
        "_id": order_id,
        "buyer_name": name,
        "username": username,
        "email": email,
        "mobile": mobile,
        "billing_address": billing_address,
        "shipping_address": shipping_address,
        "items": order_items,
        "total_price": total_price,
        "status": "Processing"
    }

    orders_collection.insert_one(order)
    # Send email notification

    email_sent = send_order_email(
    to_email=email,
    name=name,
    order_id=order_id,
    total_price=total_price,
    order_status="Processing",
    phone=mobile
)

    if not email_sent:
        return jsonify({
            "message": "Order placed, but failed to send email notification.",
            "order_id": order_id,
            "email_status": "failed",
            "order": order
        }), 201

    # If success
    return jsonify({
        "message": "Order placed successfully!",
        "order_id": order_id,
        "email_status": "sent",
        "order": order
    }), 201



@app.route('/update-order-status/<order_id>', methods=['PUT'])
def update_order_status(order_id):
    data = request.get_json()
    new_status = data.get("status")

    if not new_status:
        return jsonify({"error": "Missing 'status' field"}), 400

    # Find the order in the database
    order = orders_collection.find_one({"_id": order_id})

    if not order:
        return jsonify({"error": "Order not found"}), 404

    # Update the status field
    result = orders_collection.update_one(
        {"_id": order_id},
        {"$set": {"status": new_status}}
    )

    # Extract details from order document
    email = order.get("email")
    name = order.get("buyer_name")
    mobile = order.get("mobile")  # use whichever field you store
    total_price = order.get("total_price")

    #order_type = order.get("order_type", "Product")  # default if missing

    # Call your email + SMS notification function
    send_order_update_email(
        to_email=email,
        name=name,
        order_id=order_id,
        order_status=new_status,
        total_price=total_price,
        phone=mobile
    )

    return jsonify({"message": "Order status updated and notification sent."}), 200

@app.route('/enquire-product/<sku_number>', methods=['POST'])
def enquire_product(sku_number):
    data = request.get_json()

    name = data.get('name')
    email = data.get('email')
    mobile = data.get('mobile')
    message = data.get('message')

    if not all([name, email, message]):
        return jsonify({"error": "Missing required fields: name, email, and message are required."}), 400

    # Check if product exists
    product = collection.find_one({"sku_number": sku_number})
    if not product:
        return jsonify({"error": "Product not found"}), 404

    enquiry = {
        "sku_number": sku_number,
        "product_name": product["product_name"],
        "enquirer_name": name,
        "email": email,
        "mobile": mobile,
        "message": message,
        "status": "New"  # For future tracking
    }

    insert_result = enquiries_collection.insert_one(enquiry)
    enquiry["_id"] = str(insert_result.inserted_id)

    return jsonify({
        "message": "Enquiry submitted successfully!",
        "enquiry": enquiry
    }), 201
@app.route('/update-enquiry-status/<enquiry_id>', methods=['PUT'])
def update_enquiry_status(enquiry_id):
    data = request.get_json()
    new_status = data.get("status")

    if not new_status:
        return jsonify({"error": "Missing status"}), 400

    result = enquiries_collection.update_one(
        {"_id": ObjectId(enquiry_id)},
        {"$set": {"status": new_status}}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Enquiry not found"}), 404

    return jsonify({"message": "Enquiry status updated"}), 200

if __name__ == '__main__':
    app.run(port=5001,host='0.0.0.0',debug=True)