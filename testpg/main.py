# main.py
from fastapi import FastAPI, Request, Form, Query
from fastapi import Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from db import db
from razorpay_client import razorpay_client
import time


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
templates = Jinja2Templates(directory="templates")

# Setup demo user
user = db.users.find_one({"email": "demo@example.com"})
if not user:
    user_id = db.users.insert_one({"name": "Demo User", "email": "demo@example.com"}).inserted_id
    db.wallets.insert_one({"user_id": user_id, "balance": 500.00, "currency": "INR"})
else:
    user_id = user["_id"]

@app.get("/", response_class=HTMLResponse)
def get_wallet(request: Request):
    wallet = db.wallets.find_one({"user_id": user_id})
    transactions = list(db.wallet_transactions.find({"user_id": user_id}).sort("timestamp", -1))
    return templates.TemplateResponse("index.html", {
        "request": request,
        "balance": wallet["balance"],
        "transactions": transactions
    })


@app.post("/topup-link")
async def create_topup_link(request: Request):
    data = await request.json()

    # Extract required fields from the JSON body
    name = data["name"]
    contact = data["contact"]
    email = data["email"]
    amount = data["amount"]
    description = data["description"]
    callback_url = data["callback_url"]
 

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
        "amount": int(amount * 100),
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

    # Assuming razorpay_client is already set up
    payment_link = razorpay_client.payment_link.create(payment_link_data)
    

    # Optional: Save to DB here if needed
    # db.wallet_transactions.insert_one(...)

    return JSONResponse({"payment_link": payment_link["short_url"]})
@app.post("/topup")
def topup(amount: float = Form(...)):
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
        "expire_by": int(time.time()) + 1000,  # 15 mins
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

    return RedirectResponse(payment_link["short_url"], status_code=303)



@app.post("/debit")
def debit(amount: float = Form(...)):
    wallet = db.wallets.find_one({"user_id": user_id})
    if wallet["balance"] >= amount:
        db.wallets.update_one({"user_id": user_id}, {"$inc": {"balance": -amount}})
        db.wallet_transactions.insert_one({
            "user_id": user_id,
            "type": "debit",
            "amount": amount,
            "status": "success",
            "reference_id": f"manual_debit_{str(ObjectId())}",
            "timestamp": datetime.utcnow()
        })
    return RedirectResponse("/", status_code=303)

@app.get("/payment/callback", response_class=HTMLResponse)
def payment_callback(
    request: Request,
    razorpay_payment_link_id: str = Query(...),
    razorpay_payment_link_reference_id: str = Query(...),
    razorpay_payment_link_status: str = Query(...),
    razorpay_payment_id: str = Query(None),
    razorpay_signature: str = Query(None)
):
    message = "Payment was not successful."

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
            message = "🎉 Payment received and wallet updated!"

    return templates.TemplateResponse("success.html", {
        "request": request,
        "message": message
    })
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)