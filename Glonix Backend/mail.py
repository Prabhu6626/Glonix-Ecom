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
    return response.status_code == 201


def send_order_email(to_email, name, order_id, order_type, total_price, phone, file_url=None, payment_link=None, is_payment_link=False):
    if is_payment_link:
        subject = "\ud83d\udcb3 Complete Your Order – Payment Link Inside"
        intro = f"Hi <strong>{name}</strong>,<br><br>You're just one step away from completing your <strong>{order_type}</strong> order!"
        mid_section = f"<p>Please complete the payment using the secure link below.</p>"
    else:
        subject = "\ud83c\udf89 Your Order Was Placed Successfully!"
        intro = f"Hi <strong>{name}</strong>,<br><br>Thank you for placing your <strong>{order_type}</strong> order with us."
        mid_section = "<p>We’ve received your order and will process it shortly.</p>"

    html_content = f"""
    <html><body><div style='font-family: Arial;'>
    <h2>{subject}</h2>
    <p>{intro}</p>
    {mid_section}
    <hr>
    <h3>Order Summary</h3>
    <ul>
      <li><strong>Reference ID:</strong> {order_id}</li>
      <li><strong>Order Type:</strong> {order_type}</li>
      <li><strong>Total Price:</strong> ₹{total_price}</li>
    """
    if file_url:
        html_content += f"<li><strong>File:</strong> <a href='{file_url}' target='_blank'>Download</a></li>"

    if is_payment_link and payment_link:
        html_content += f"<p><strong>\ud83d\udd17 Payment Link:</strong> <a href='{payment_link}' target='_blank'>Click here to pay now</a></p>"

    html_content += """
    </ul>
    <p>If you have any questions, contact support@glonix.in</p>
    <p>– Glonix Team</p>
    </div></body></html>
    """

    if send_email_with_zoho(to_email, subject, html_content):
        print("Mail sent successfully.")
        send_sms_campaign(order_id, name, phone, "Placed")
        return True
    else:
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

    try:
        res = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        print("SMS Campaign Response:", res.status_code, res.text)
    except Exception as e:
        print("Error sending SMS campaign:", e)

# Other email functions like send_quotation_email, send_order_update_email etc. would follow a similar replacement using send_email_with_zoho()
def send_quotation_email(to_email, name, quotation_id, total_price, file_url=None, phone=None):
    subject = "📄 Your Quotation is Ready!"
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; padding: 20px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2196F3;">Quotation Created</h2>
          <p>Hi <strong>{name}</strong>,</p>
          <p>We’ve generated a quotation for you. Please find the details below.</p>
          <ul>
            <li><strong>Quotation ID:</strong> {quotation_id}</li>
            <li><strong>Total Price:</strong> ₹{total_price}</li>
    """

    if file_url:
        html_content += f"""<li><strong>File:</strong> <a href="{file_url}" target="_blank">Download</a></li>"""

    html_content += """
          </ul>
          <p style="font-size: 14px; color: #999;">Contact us if you have any questions.</p>
          <p style="font-size: 14px; color: #999;">– Glonix Team</p>
        </div>
      </body>
    </html>
    """

    return send_email_with_zoho(to_email, subject, html_content)
def send_order_update_email(to_email, name, order_id, order_type, new_status, phone=None):
    subject = f"🔔 Order Update – {new_status.capitalize()}"
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #FF9800;">Order Status Updated</h2>
          <p>Hi <strong>{name}</strong>,</p>
          <p>Your <strong>{order_type}</strong> order with ID <strong>{order_id}</strong> has been updated to status: <strong>{new_status}</strong>.</p>
          <p>We’ll keep you posted on the progress.</p>
          <p style="font-size: 14px; color: #999;">– Glonix Team</p>
        </div>
      </body>
    </html>
    """

    try:
        send_email_with_zoho(to_email, subject, html_content)
        print("Order update email sent successfully.")
        if phone:
            send_sms_campaign(order_id, name, phone, new_status)
        return True
    except Exception as e:
        print("Error sending order update email:", e)
        return False
def send_payment_success_mail(name, email, amount, reference_id):
    subject = "✅ Payment Successful – Thank You!"
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
        print("payment success email sent successfully.")
        return True
    except Exception as e:
        print("Error sending payment success email:", e)
        return False

def send_quotation_update_email(to_email, name, quotation_id, quotation_type, new_status, file_url=None, phone=None):
    subject = f"🔄 Quotation Update – {quotation_type} is {new_status}"
    intro = f"Hi <strong>{name}</strong>,<br><br>We’d like to inform you about an update on your <strong>{quotation_type}</strong> quotation request."
    mid_section = f"<p>The status of your quotation <strong>#{quotation_id}</strong> has been updated to <strong>{new_status}</strong>.</p>"

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; padding: 20px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2196F3;">{subject}</h2>
          <p>{intro}</p>
          {mid_section}
          <hr>
          <h3 style="color: #333;">Quotation Details</h3>
          <ul>
            <li><strong>Reference ID:</strong> {quotation_id}</li>
            <li><strong>Quotation Type:</strong> {quotation_type}</li>
            <li><strong>Current Status:</strong> {new_status}</li>
    """

    if file_url:
        html_content += f"""<li><strong>Updated File:</strong> <a href="{file_url}" target="_blank">Download</a></li>"""

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
        print("email sent successfully.")
        return True
    except Exception as e:
        print("Error sending success email:", e)
        return False