from __main__ import User, app, db, user_schema, users_schema
import csv
import datetime
import math
import os
from functools import wraps

import fpdf
import jwt
from flask import jsonify, request
from itsdangerous import URLSafeTimedSerializer
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import check_password_hash, generate_password_hash


app.config['SECRET_KEY'] = 'mysupersecret'
ts = URLSafeTimedSerializer(app.config["SECRET_KEY"])

################### Routes ###################

# Auth middlerware
def token_required(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    token = None

    if 'Authorization' in request.headers:
      token = request.headers['Authorization'].split(" ")[1]

    if not token:
      return jsonify({'error' : 'Not authenticated!'}), 401

    try: 
      data = jwt.decode(token, app.config['SECRET_KEY'])
      current_user = User.query.filter_by(id=data['id']).first()

    except:
      return jsonify({'error' : 'Not authenticated!'}), 401

    return f(current_user, *args, **kwargs)

  return decorated

# Create User/ Signup
@app.route('/signup', methods=['POST'])
def add_user():
  data = request.get_json()
  for attr in ['first_name', 'last_name', 'email', 'password']:
    if not data.get(attr):
      field = str(attr).replace('_',' ')
      errObj = {attr: f'{field} is required'}
      return jsonify({'error': errObj}), 422 

  
  first_name = data['first_name']
  last_name = data['last_name']
  email = data['email']
  # hashed_password = generate_password_hash(data['password'], method = 'sha256')
  address = data.get('address', '---')
  password = data['password']

  try: 
    new_user = User(first_name, last_name, email, password, address)
  except AssertionError as e:
    return jsonify({'error': e.args[0]}), 422

  try:
    db.session.add(new_user)
    db.session.commit()
  except SQLAlchemyError as e:
    # return jsonify({'error': e.orig.args})
    if "UNIQUE constraint failed: user.email" in str(e):
      return jsonify({'error': {"email": 'Email already exists'}}), 422
    return jsonify({'error': e.orig.args[0]}), 422

  sendmail(email)  

  return user_schema.jsonify(new_user)

# Get Verify Email
@app.route('/verify/<token>', methods=['GET'])
def confirm_email(token):
  try:
    email = ts.loads(token, salt="email-confirm-key", max_age=86400)
  except:
    return jsonify({'error': 'Invalid token'}), 401
  user = User.query.filter_by(email=email).first()
  user.status = "active"

  db.session.commit()

  return jsonify({'verified': True})


# Get All Users
@app.route('/users/<page>', methods=['GET'])
@token_required
def get_users(current_user, page):
  search_term = request.args.get('search')
  page = int(page) or 1
  per_page = 5
  if search_term: 
    all_users = User.query.filter(
      User.email.contains(search_term)
      ).order_by(
      User.id.desc()).paginate(page,per_page,error_out=False
      )
  else:
    all_users = User.query.order_by(User.id.desc()).paginate(page,per_page,error_out=False)
  
  total = all_users.total

  result = users_schema.dump(all_users.items)
  return jsonify({
    'users': result,
    'pagination': {
      'current_page': page,
      'per_page': per_page,
      'total_records': total,
      'total_pages': math.ceil(total/per_page)
      }
    })

# Get Single User
@app.route('/profile/<id>', methods=['GET'])
@token_required
def get_profile(current_user, id):
  user = User.query.get(id)
  return user_schema.jsonify(user)

# Get User Details as Pdf
@app.route('/pdf/<id>', methods=['GET'])
@token_required
def get_user_pdf(current_user, id):
  user = User.query.get(id)

  pdf = fpdf.FPDF(format='letter')
  pdf.add_page()
  pdf.set_font("Arial", size=13, style='B')
  pdf.write(5,"User Data")
  pdf.set_font("Arial", size=12, style='')
  pdf.ln()

  for attr, value in user_schema.dump(user).items():
    pdf.set_text_color(0, 0, 255)
    pdf.write(5,str(attr))
    pdf.set_text_color(0, 0, 0)
    pdf.write(5,": ")
    pdf.write(5,str(value))
    pdf.ln()
  filename = f'user{user.id}.pdf'
  pdf.output(filename)

  return sendPdfOrCsv('pdf', user)

  # return send_from_directory('./', filename, as_attachment=True, mimetype='application/pdf')

# Get User Details as CSV
@app.route('/csv/<id>', methods=['GET'])
@token_required
def get_user_csv(current_user, id):
  user = User.query.get(id)
  row_list = [['id', 'first_name', 'last_name', 'email', 'address']
              ,[user.id, user.first_name, user.last_name, user.email, user.address]]

  path = f'./user{user.id}.csv'
  with open(path, 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerows(row_list)

  return sendPdfOrCsv('csv', user)

  # return send_from_directory('./', filename, as_attachment=True, mimetype='text/csv')
  # return send_csv([user_schema.dump(user)],f'user{user.id}.csv', ['id', 'first_name', 'last_name', 'email', 'address'], mimetype='text/csv',)

# Signin
@app.route('/signin', methods=['POST'])
def login(): 
  auth = request.get_json()
  if not auth or not auth.get('email') or not auth.get('password'):
    return jsonify({'error': 'Email and password is required'}), 401

  user = User.query.filter_by(email=auth['email']).first()
  if not user:
    return jsonify({'error': 'Email or password is invalid'}), 401

  if user.status == "inactive":
    return jsonify({'error': 'Email not verified'}), 401

  if check_password_hash(user.password, auth['password']):
    token = jwt.encode({'id' : user.id, 'exp' : datetime.datetime.utcnow() + datetime.timedelta(hours=2400000)}, app.config['SECRET_KEY'])
    return jsonify({'token' : token.decode('UTF-8')})
  
  return jsonify({'error': 'Email or password is invalid'}), 401

############################################################

def sendmail(email):
  print('hiiiiiii')
  token = ts.dumps(email, salt='email-confirm-key')
  message = Mail(
      from_email='rabiar27@hotmail.com',
      to_emails=email,
      subject='Verify your account',
      html_content=f'''
      <strong> Please click this <a href="http://localhost:4200/verify/{token}">link</a> to verify your account''')
  try:
    sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
    response = sg.send(message)
    print(response.status_code)
    print(response.body)
    print(response.headers)
  except Exception as e:
    print(e)
    print('helllooo')


def sendPdfOrCsv(format,user): 
  filename = f'user{user.id}.{format}'
  path = f'./user{user.id}.{format}'
  mimetype = 'application/pdf' if format == 'pdf' else 'text/csv'

  r = app.response_class(generate(path), mimetype=mimetype)
  r.headers.set('Content-Disposition', 'attachment', filename=filename)
  return r

def generate(path):
  with open(path, 'rb') as f:
    yield from f
  os.remove(path)
