import os
import requests
from dotenv import load_dotenv

load_dotenv()

ZOHO_API_KEY = os.getenv("ZOHO_MAIL_API_KEY")
ZOHO_FROM_ADDRESS = "noreply@glonix.in"
ZOHO_API_URL = "https://api.zeptomail.in/v1.1/email"


def send_email_with_zoho(to_email, subject, html_content):
    payload = {
        "from": {"address": ZOHO_FROM_ADDRESS},
        "to": [{"email_address": {"address": to_email}}],
        "subject": subject,
        "htmlbody": html_content
    }

    headers = {
        'accept': "application/json",
        'content-type': "application/json",
        'authorization': f"Zoho-enczapikey {ZOHO_API_KEY}"
    }

    response = requests.post(ZOHO_API_URL, json=payload, headers=headers)
    print("Zoho Mail Response:", response.status_code, response.text)
    return response.status_code == 200

def send_order_email(to_email, name, order_id, total_price, order_status, file_url=None, payment_link=None, is_payment_link=False, phone=None):
    if is_payment_link:
        subject = f"💳 Complete Your Order – Payment Link Inside for Order ID {order_id}"
        intro = f"Hi <strong>{name}</strong>,<br><br>You're just one step away from completing your order!"
        mid_section = "<p>Please complete the payment using the secure link below.</p>"
    else:
        subject = f"🎉 Your Order {order_id} Was Placed Successfully!"
        intro = f"Hi <strong>{name}</strong>,<br><br>Thank you for placing your order with us."
        mid_section = "<p>We’ve received your order and will process it shortly.</p>"

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; padding: 20px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #4CAF50;">{subject}</h2>
          <p>{intro}</p>
          {mid_section}
          <hr>
          <h3 style="color: #333;">Order Summary</h3>
          <ul>
            <li><strong>Reference ID:</strong> {order_id}</li>
            <li><strong>Total Price:</strong> ₹{total_price}</li>
    """

    if file_url:
        html_content += f"""<li><strong>File:</strong> <a href="{file_url}" target="_blank">Download</a></li>"""

    html_content += "</ul>"

    if is_payment_link and payment_link:
        html_content += f"""
        <p><strong>🔗 Payment Link:</strong> <a href="{payment_link}" target="_blank" style="color: #2196F3;">Click here to pay now</a></p>
        """

    html_content += """
          <br>
          <p style="font-size: 14px; color: #999;">If you have any questions, contact support@glonix.in</p>
          <p style="font-size: 14px; color: #999;">– Glonix Team</p>
        </div>
      </body>
    </html>
    """

    try:
        send_email_with_zoho(to_email, subject, html_content)
        print("Order email sent successfully.")
        if phone:
            send_sms_campaign(order_id, name, phone, order_status)
        return True
    except Exception as e:
        print("Error sending order email:", e)
        return False

def send_sms_campaign(order_id, name, phone, order_status):
    url = "https://idology.in/api/wpbox/sendcampaigns"
    payload = {
        "campaing_id": 414,
        "token": "GiCMYNB1pz3LW1axhciAa4WWEFpf7r6TyXc1Yx6Z658018da",
        "phone": phone,
        "data": {
            "order_id": order_id,
            "name": name,
            "order_status": order_status
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        res = requests.post(url, json=payload, headers=headers)
        print("SMS Campaign Response:", res.status_code, res.text)
    except Exception as e:
        print("Error sending SMS campaign:", e)

def send_quotation_email(to_email, name, quotation_id, quotation_type, total_price, file_url=None, phone=None):
    subject = f"📄 Quotation {quotation_id} Request Received – Thank You!"
    intro = f"Hi <strong>{name}</strong>,<br><br>Thank you for submitting your <strong>{quotation_type}</strong> quotation request."
    mid_section = "<p>We’ve received your request and our team will review it shortly.</p>"

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; padding: 20px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #4CAF50;">{subject}</h2>
          <p>{intro}</p>
          {mid_section}
          <hr>
          <h3 style="color: #333;">Quotation Summary</h3>
          <ul>
            <li><strong>Reference ID:</strong> {quotation_id}</li>
            <li><strong>Quotation Type:</strong> {quotation_type}</li>
            <li><strong>Estimated Price:</strong> ₹{total_price}</li>
    """

    if file_url:
        html_content += f"""<li><strong>File:</strong> <a href="{file_url}" target="_blank">Download</a></li>"""

    html_content += """
          </ul>
          <br>
          <p style="font-size: 14px; color: #999;">If you have any questions, contact support@glonix.in</p>
          <p style="font-size: 14px; color: #999;">– Glonix Team</p>
        </div>
      </body>
    </html>
    """

    try:
        send_email_with_zoho(to_email, subject, html_content)
        print("Quotation email sent successfully.")
        if phone:
            send_sms_quotation(quotation_id, name, phone, "Received")
        return True
    except Exception as e:
        print("Error sending quotation email:", e)
        return False

def send_sms_quotation(quotation_id, name, phone, quotation_status):
    url = "https://idology.in/api/wpbox/sendcampaigns"
    payload = {
        "campaing_id": 414,
        "token": "GiCMYNB1pz3LW1axhciAa4WWEFpf7r6TyXc1Yx6Z658018da",
        "phone": phone,
        "data": {
            "quotation_id": quotation_id,
            "name": name,
            "quotation_status": quotation_status
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        res = requests.post(url, json=payload, headers=headers)
        print("SMS Quotation Response:", res.status_code, res.text)
    except Exception as e:
        print("Error sending quotation SMS:", e)

def send_payment_success_mail(name, email, amount, reference_id):
    subject = f"✅ Payment Successful Reference - {reference_id} – Thank You!"
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #4CAF50;">Payment Received!</h2>
          <p>Hi <strong>{name}</strong>,</p>
          <p>We’ve successfully received your payment.</p>
          <ul>
            <li><strong>Amount:</strong> ₹{amount}</li>
            <li><strong>Reference ID:</strong> {reference_id}</li>
          </ul>
          <p>Thank you for your trust. We’ll begin processing your order shortly.</p>
          <br>
          <p style="font-size: 14px; color: #888;">If you have any questions, feel free to contact support@glonix.in</p>
        </div>
      </body>
    </html>
    """

    try:
        send_email_with_zoho(email, subject, html_content)
        print("Payment success email sent successfully.")
        return True
    except Exception as e:
        print("Error sending payment success email:", e)
        return False

def send_order_update_email(to_email, name, order_id, order_status, total_price=None, file_url=None, phone=None):
    subject = f"📦 Order Update – Your Order {order_id} is {order_status}"
    intro = f"Hi <strong>{name}</strong>,<br><br>We wanted to keep you informed about your order status."
    mid_section = f"<p>Your order with reference ID <strong>{order_id}</strong> is now marked as <strong>{order_status}</strong>.</p>"

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; padding: 20px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2196F3;">{subject}</h2>
          <p>{intro}</p>
          {mid_section}
          <hr>
          <h3 style="color: #333;">Order Details</h3>
          <ul>
            <li><strong>Reference ID:</strong> {order_id}</li>
            <li><strong>Current Status:</strong> {order_status}</li>
            <li><strong>Total Price:</strong> ₹{total_price}</li>
    """

    if file_url:
        html_content += f"""<li><strong>File:</strong> <a href="{file_url}" target="_blank">Download</a></li>"""

    html_content += """
          </ul>
          <br>
          <p style="font-size: 14px; color: #999;">If you have any questions, feel free to contact support@glonix.in</p>
          <p style="font-size: 14px; color: #999;">– Glonix Team</p>
        </div>
      </body>
    </html>
    """

    try:
        send_email_with_zoho(to_email, subject, html_content)
        print("Order update email sent successfully.")
        if phone:
            send_sms_campaign(order_id, name, phone, order_status)
        return True
    except Exception as e:
        print("Error sending order update email:", e)
        return False