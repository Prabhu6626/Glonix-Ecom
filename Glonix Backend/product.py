from flask import Flask, request, jsonify
from pymongo import MongoClient
import requests

app = Flask(__name__)

# MongoDB connection
MONGO_URI = "mongodb+srv://rajkisanssvrs:Test1234@glonix-cluster.hq9e2.mongodb.net/?retryWrites=true&w=majority&appName=Glonix-Cluster"
client = MongoClient(MONGO_URI)
db = client["product_db"]
collection = db["products"]

# Add product with file upload
@app.route('/add-product', methods=['POST'])
def add_product():
    # Get the form data
    category = request.form.get('category')
    product_name = request.form.get('product_name')
    availability_number = request.form.get('availability_number')
    price = request.form.get('price')
    image_file = request.files.get('file')

    # Check if all required fields are present
    if not category or not product_name or not availability_number or not price or not image_file:
        return jsonify({"error": "Missing required fields"}), 400

    # Start from 100 and find the next unused SKU
    sku_number = 100
    while collection.find_one({"sku_number": str(sku_number)}):
        sku_number += 1
    new_sku = str(sku_number)

    # Upload image to external file store
    upload_url = 'https://file-store-api.onrender.com/products'
    files = {'file': (image_file.filename, image_file.stream, image_file.content_type)}
    data_payload = {
        'product_id': new_sku
    }

    try:
        # Send the file to the file store API
        response = requests.post(upload_url, files=files, data=data_payload)

        if response.status_code != 200:
            return jsonify({"error": "Image upload failed", "details": response.text}), 500

        # Get the file URL from the response
        file_url = response.json().get('file_url', '')

        # Create the product entry
        product = {
            "category": category,
            "product_name": product_name,
            "availability_number": int(availability_number),
            "sku_number": new_sku,
            "price": float(price),
            "image_url": file_url  # Store the image URL
        }

        # Insert product into MongoDB
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
            "file_url": product.get("image_url", "")  # Ensure to fetch the 'image_url' field
        })
        
    return jsonify(results)


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

if __name__ == '__main__':
    app.run(debug=True)