# -*- coding: utf-8 -*-
import requests
from datetime import datetime
from lxml import etree
import logging
import json


_logger = logging.getLogger(__name__)

payloads=[
  {
    "phone_number": "01720569256",
    "message": "Hello World",
    "device_id": 95733
  }
]



response=requests.post("https://smsgateway.me/api/v4/message/send", headers={
    "Authorization": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhZG1pbiIsImlhdCI6MTUzNTc4ODE2MiwiZXhwIjo0MTAyNDQ0ODAwLCJ1aWQiOjQ3MDc5LCJyb2xlcyI6WyJST0xFX1VTRVIiXX0.3vfI7j_Q_tO8pDj7RwwrJOyNU0RXXuYLVJ14hGyuiJw"
},data={"body":payloads})

print(response.text)
