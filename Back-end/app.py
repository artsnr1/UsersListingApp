import os
import re

from flask import Flask
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from werkzeug.security import generate_password_hash

# Init app
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
basedir = os.path.abspath(os.path.dirname(__file__))
# Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'db.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# Init db
db = SQLAlchemy(app)
# Init ma
ma = Marshmallow(app)

# User Class/Model
class User(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  first_name = db.Column(db.String(100), nullable=False)
  last_name = db.Column(db.String(100), nullable=False)
  email = db.Column(db.String(120), unique=True, nullable=False)
  password = db.Column(db.String(100), nullable=False)
  address = db.Column(db.String(200))
  status = db.Column(db.String(100), server_default="inactive")

  def __init__(self, first_name, last_name, email, password, address):
    self.first_name = first_name
    self.last_name = last_name
    self.email = email
    self.password = password
    self.address = address

  @validates('email')
  def validate_email(self, key, email):
    # if not email:
    #   raise AssertionError('No email provided')
    if not re.match("[^@]+@[^@]+\.[^@]+", email):
      raise AssertionError({"email": "Not a valid email address"}) 
    return email 

  @validates('password')
  def validate_pass(self, key, password):
    if not len(password)>=6:
      raise AssertionError({"password": 'Password should be minimum 6 characters long'}) 
    return generate_password_hash(password, method = 'sha256')

# User Schema
class UserSchema(ma.Schema):
  class Meta:
    fields = ('id', 'first_name', 'last_name', 'email', 'address', 'status')

# Init schema
user_schema = UserSchema()
users_schema = UserSchema(many=True)

import routes

# Run Server
if __name__ == '__main__':
  app.run(debug=True)
