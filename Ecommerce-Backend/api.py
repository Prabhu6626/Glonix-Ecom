import http.client
import json

# Correct host (domain only)
api_host = "metaconnectapi.com"

# Path of the endpoint (from the base domain)
endpoint_path = "/api/wpbox/sendmessage"

# Mock data
token = "d69dAJNo6Iuf4V4rPVc2Z7mZmmt2rwoHhzfDWyrsa2c6ab00"
phone = "916382803705"

# Create connection to host
conn = http.client.HTTPSConnection(api_host)

# Prepare payload
payload = json.dumps({
    "token": token,
    "phone": phone,
    "message": "Do you like our service",
    "header": "Hello there",
    "footer": "Thanks",
    "buttons": [
        {"id": "yes_12", "title": "Yes"},
        {"id": "no_12", "title": "No"}
    ]
})

# Set headers
headers = {
    "Content-Type": "application/json"
}

# Send POST request
conn.request("POST", endpoint_path, payload, headers)

# Get the response
res = conn.getresponse()
data = res.read()

# Output response
print(data.decode("utf-8"))