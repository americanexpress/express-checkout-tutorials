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

require 'sinatra'
require 'stripe'

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# initial logic
set :publishable_key, ENV['PUBLISHABLE_KEY']
set :secret_key, ENV['SECRET_KEY']

Stripe.api_key = settings.secret_key

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
#routing
get '/' do
  erb :index
end

post '/' do
  @token = Stripe::Token.retrieve(params[:stripeToken])
  erb :index
end

post '/charge' do
  @amount = 500 # this is in cents

  customer = Stripe::Customer.create(
    :email => 'customer@example.com',
    :source  => params[:stripeToken]
  )

  charge = Stripe::Charge.create(
    :amount      => @amount,
    :description => 'Sinatra Charge',
    :currency    => 'usd',
    :customer    => customer.id
  )

  erb :charge
end

print "\nApp running on http://localhost:4567\n\n"
