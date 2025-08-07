import requests

url = "https://api.zeptomail.in/v1.1/email"

payload = "{\n\"from\": { \"address\": \"noreply@glonix.in\"},\n\"to\": [{\"email_address\": {\"address\": \"rajkisanssvrs@gmail.com\",\"name\": \"Raj\"}}],\n\"subject\":\"Test Email\",\n\"htmlbody\":\"<div><b> Test email sent successfully.  </b></div>\"\n}"
headers = {
'accept': "application/json",
'content-type': "application/json",
'authorization': "Zoho-enczapikey PHtE6r0ORuDr3jV7o0VS5vKwH8SgNokor+1kKAhGtI0WD6RSTU0G+I15mmCwrB1+AfBBF/PJmYxrueuatuKHdG7vY2kaVWqyqK3sx/VYSPOZsbq6x00auVUbdkTbVo7tcNBs1SDSv9/eNA==",
}

response = requests.request("POST", url, data=payload, headers=headers)

print(response.text)