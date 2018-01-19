# Copyright 2018 American Express Travel Related Services Company, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
# or implied. See the License for the specific language governing
# permissions and limitations under the License.

import os
from flask import Flask, render_template, request
import stripe

stripe_keys = {
  'secret_key': os.environ['SECRET_KEY'],
  'publishable_key': os.environ['PUBLISHABLE_KEY']
}

stripe.api_key = stripe_keys['secret_key']

# if you are behind a proxy, please uncomment this and add in
# your proxy credentials
#
# stripe.proxy = {
#     "http": "http://<USERNAME>:<PASSWORD>@<PROXY>:<PORT>",
#     "https": "http://<USERNAME>:<PASSWORD>@<PROXY>:<PORT>"
# }

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/charge', methods=['POST'])
def charge():

    # Amount in cents
    amount = 500

    customer = stripe.Customer.create(
        email='customer@example.com',
        source=request.form['stripeToken']
    )

    charge = stripe.Charge.create(
        customer=customer.id,
        amount=amount,
        currency='usd',
        description='Flask Charge'
    )

    return render_template('charge.html', amount = amount)

@app.route('/', methods=['POST'])
def fetchToken():
    token = stripe.Token.retrieve(request.form['stripeToken'])
    return render_template('index.html', token = token)

if __name__ == '__main__':
    app.run(debug=True)