"""
Database connection and models for Glonix Electronics
"""

import os
from datetime import datetime
from typing import Optional, List, Dict, Any
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from bson import ObjectId
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "glonix_electronics"

class DatabaseManager:
    """MongoDB database manager"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self.connect()
    
    def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(MONGODB_URL)
            # Test connection
            self.client.admin.command('ping')
            self.db = self.client[DATABASE_NAME]
            logger.info(f"Connected to MongoDB at {MONGODB_URL}")
        except ConnectionFailure as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    def close(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            logger.info("Database connection closed")
    
    # User operations
    def create_user(self, user_data: Dict[str, Any]) -> str:
        """Create a new user"""
        user_data["created_at"] = datetime.utcnow()
        user_data["updated_at"] = datetime.utcnow()
        user_data["is_active"] = True
        
        result = self.db.users.insert_one(user_data)
        logger.info(f"User created with ID: {result.inserted_id}")
        return str(result.inserted_id)
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email"""
        return self.db.users.find_one({"email": email})
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            return self.db.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None
    
    def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Update user data"""
        update_data["updated_at"] = datetime.utcnow()
        
        try:
            result = self.db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update user {user_id}: {e}")
            return False
    
    # Project operations
    def create_project(self, project_data: Dict[str, Any]) -> str:
        """Create a new project"""
        project_data["created_at"] = datetime.utcnow()
        project_data["updated_at"] = datetime.utcnow()
        project_data["status"] = "pending"
        
        result = self.db.projects.insert_one(project_data)
        logger.info(f"Project created with ID: {result.inserted_id}")
        return str(result.inserted_id)
    
    def get_user_projects(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all projects for a user"""
        try:
            projects = list(self.db.projects.find(
                {"user_id": user_id}
            ).sort("created_at", -1))
            
            # Convert ObjectId to string
            for project in projects:
                project["_id"] = str(project["_id"])
            
            return projects
        except Exception as e:
            logger.error(f"Failed to get projects for user {user_id}: {e}")
            return []
    
    def update_project_status(self, project_id: str, status: str) -> bool:
        """Update project status"""
        try:
            result = self.db.projects.update_one(
                {"_id": ObjectId(project_id)},
                {"$set": {"status": status, "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Failed to update project {project_id}: {e}")
            return False
    
    # Quote operations
    def create_quote(self, quote_data: Dict[str, Any]) -> str:
        """Create a new quote"""
        quote_data["created_at"] = datetime.utcnow()
        quote_data["status"] = "pending"
        
        result = self.db.quotes.insert_one(quote_data)
        logger.info(f"Quote created with ID: {result.inserted_id}")
        return str(result.inserted_id)
    
    def get_user_quotes(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all quotes for a user"""
        try:
            quotes = list(self.db.quotes.find(
                {"user_id": user_id}
            ).sort("created_at", -1))
            
            # Convert ObjectId to string
            for quote in quotes:
                quote["_id"] = str(quote["_id"])
            
            return quotes
        except Exception as e:
            logger.error(f"Failed to get quotes for user {user_id}: {e}")
            return []
    
    # Contact message operations
    def create_contact_message(self, message_data: Dict[str, Any]) -> str:
        """Create a new contact message"""
        message_data["created_at"] = datetime.utcnow()
        message_data["status"] = "new"
        
        result = self.db.contact_messages.insert_one(message_data)
        logger.info(f"Contact message created with ID: {result.inserted_id}")
        return str(result.inserted_id)
    
    def get_contact_messages(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent contact messages"""
        try:
            messages = list(self.db.contact_messages.find().sort("created_at", -1).limit(limit))
            
            # Convert ObjectId to string
            for message in messages:
                message["_id"] = str(message["_id"])
            
            return messages
        except Exception as e:
            logger.error(f"Failed to get contact messages: {e}")
            return []
    
    # Component operations
    def search_components(self, query: str, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search components by part number or description"""
        try:
            search_filter = {
                "$or": [
                    {"part_number": {"$regex": query, "$options": "i"}},
                    {"description": {"$regex": query, "$options": "i"}},
                    {"manufacturer": {"$regex": query, "$options": "i"}}
                ]
            }
            
            if category:
                search_filter["category"] = category
            
            components = list(self.db.components.find(search_filter).limit(50))
            
            # Convert ObjectId to string
            for component in components:
                component["_id"] = str(component["_id"])
            
            return components
        except Exception as e:
            logger.error(f"Failed to search components: {e}")
            return []
    
    def get_component_categories(self) -> List[str]:
        """Get all component categories"""
        try:
            return self.db.components.distinct("category")
        except Exception as e:
            logger.error(f"Failed to get component categories: {e}")
            return []
    
    # Analytics operations
    def get_user_stats(self) -> Dict[str, Any]:
        """Get user statistics"""
        try:
            total_users = self.db.users.count_documents({})
            active_users = self.db.users.count_documents({"is_active": True})
            
            return {
                "total_users": total_users,
                "active_users": active_users,
                "inactive_users": total_users - active_users
            }
        except Exception as e:
            logger.error(f"Failed to get user stats: {e}")
            return {}
    
    def get_project_stats(self) -> Dict[str, Any]:
        """Get project statistics"""
        try:
            pipeline = [
                {
                    "$group": {
                        "_id": "$service_type",
                        "count": {"$sum": 1},
                        "avg_value": {"$avg": "$estimated_value"}
                    }
                }
            ]
            
            stats = list(self.db.projects.aggregate(pipeline))
            return {stat["_id"]: {"count": stat["count"], "avg_value": stat.get("avg_value", 0)} for stat in stats}
        except Exception as e:
            logger.error(f"Failed to get project stats: {e}")
            return {}

# Global database instance
db_manager = DatabaseManager()

def get_database():
    """Get database manager instance"""
    return db_manager
