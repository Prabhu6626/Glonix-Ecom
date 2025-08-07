from pymongo import MongoClient
import certifi

# MongoDB Atlas connection string
MONGO_URI = "mongodb+srv://rajkisanssvrs:Test1234@glonix-cluster.hq9e2.mongodb.net/?retryWrites=true&w=majority&appName=Glonix-Cluster"

# Create a secure connection using certifi
client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where()
)

# Replace with your database name
db_name = "ecommerce"  # <-- change this to your actual database name
db = client[db_name]

# List and print all collection names in the database
try:
    collections = db.list_collection_names()
    print(f"Collections in database '{db_name}':")
    for name in collections:
        print(f" - {name}")
except Exception as e:
    print(f"Error: {e}")