# using the configure_keys information, initialize the firebase connection
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

import json

# cred = credentials.Certificate('/Users/jacksonb/Desktop/active/cdp/credentials.json')
# firebase_admin.initialize_app(cred, {
#     'databaseURL' : 'https://cdp-sea.firebaseio.com/'
# })
#
# firebase_head = db.reference()
#
# with open('db.json', 'w') as out_file:
#     json.dump(firebase_head.get(), out_file)

with open('db.json', 'r') as in_file:
    db = json.load(in_file)
