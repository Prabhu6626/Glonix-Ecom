from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from typing import Optional, List, Dict, Any
from database import get_database

app = FastAPI(title="Glonix Electronics API")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_manager = get_database()

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: str
    email: str
    full_name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime

class ProjectCreate(BaseModel):
    title: str
    description: str
    service_type: str
    requirements: Optional[str] = None
    estimated_value: Optional[float] = None
    deadline: Optional[datetime] = None

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    phone: Optional[str] = None
    service_interest: Optional[str] = None
    message: str

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db_manager.get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user

# API Routes
@app.post("/auth/register", response_model=Token)
async def register(user: UserCreate):
    # Check if user already exists
    if db_manager.get_user_by_email(user.email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    user_data = {
        "email": user.email,
        "hashed_password": hashed_password,
        "full_name": user.full_name,
        "company": user.company,
        "phone": user.phone,
    }
    
    user_id = db_manager.create_user(user_data)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
async def login(user: UserLogin):
    # Authenticate user
    db_user = db_manager.get_user_by_email(user.email)
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return User(
        id=str(current_user["_id"]),
        email=current_user["email"],
        full_name=current_user["full_name"],
        company=current_user.get("company"),
        phone=current_user.get("phone"),
        created_at=current_user["created_at"]
    )

@app.get("/auth/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    return {"valid": True, "user": current_user["email"]}

@app.post("/projects")
async def create_project(project: ProjectCreate, current_user: dict = Depends(get_current_user)):
    """Create a new project"""
    project_data = {
        "user_id": str(current_user["_id"]),
        "title": project.title,
        "description": project.description,
        "service_type": project.service_type,
        "requirements": project.requirements,
        "estimated_value": project.estimated_value,
        "deadline": project.deadline,
    }
    
    project_id = db_manager.create_project(project_data)
    return {"project_id": project_id, "message": "Project created successfully"}

@app.get("/projects")
async def get_user_projects(current_user: dict = Depends(get_current_user)):
    """Get all projects for the current user"""
    projects = db_manager.get_user_projects(str(current_user["_id"]))
    return {"projects": projects}

@app.get("/quotes")
async def get_user_quotes(current_user: dict = Depends(get_current_user)):
    """Get all quotes for the current user"""
    quotes = db_manager.get_user_quotes(str(current_user["_id"]))
    return {"quotes": quotes}

@app.post("/contact")
async def submit_contact_message(message: ContactMessage):
    """Submit a contact message"""
    message_data = {
        "name": message.name,
        "email": message.email,
        "company": message.company,
        "phone": message.phone,
        "service_interest": message.service_interest,
        "message": message.message,
    }
    
    message_id = db_manager.create_contact_message(message_data)
    return {"message_id": message_id, "message": "Contact message submitted successfully"}

@app.get("/components/search")
async def search_components(
    q: str, 
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Search components"""
    components = db_manager.search_components(q, category)
    return {"components": components}

@app.get("/components/categories")
async def get_component_categories(current_user: dict = Depends(get_current_user)):
    """Get all component categories"""
    categories = db_manager.get_component_categories()
    return {"categories": categories}

@app.get("/analytics/users")
async def get_user_analytics(current_user: dict = Depends(get_current_user)):
    """Get user analytics (admin only)"""
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    stats = db_manager.get_user_stats()
    return {"user_stats": stats}

@app.get("/analytics/projects")
async def get_project_analytics(current_user: dict = Depends(get_current_user)):
    """Get project analytics (admin only)"""
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    stats = db_manager.get_project_stats()
    return {"project_stats": stats}

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    db_manager.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
