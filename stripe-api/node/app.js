/**
 * Copyright 2018 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

// ~~~~~~~~~~~~~~~~~~~~~~~~~
// initialize the app
const keyPublishable = process.env.PUBLISHABLE_KEY;
const keySecret = process.env.SECRET_KEY;
const app = require("express")();
const stripe = require("stripe")(keySecret);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// IF BEHIND A PROXY, please uncomment:
// var proxy = process.env.http_proxy || '';
//
// const ProxyAgent = require('http-proxy-agent');
// stripe.setHttpAgent(new ProxyAgent(proxy));
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

app.set('view engine', 'ejs');
app.use(require("body-parser").urlencoded({extended: false}));


// ~~~~~~~~~~~~~~~~~~~~~~~~~
// set routing
app.get("/", (req, res) =>
  res.render("index", { 
    keyPublishable,
    token : null 
  }
));

app.post("/charge", (req, res) => {
  let amount = 500;

  stripe.customers.create({
     email: req.body.stripeEmail,
    source: req.body.stripeToken
  })

  .then(customer =>
    stripe.charges.create({
      amount,
      description: "Sample Charge",
         currency: "usd",
         customer: customer.id
    }))

  .then(charge => res.render("charge"));
});

app.post("/", (req, res) => {
  stripe.tokens.retrieve(
    req.body.stripeToken
  )
  
  .then(token => res.render("index", {
    token: token
  }));
});

// ~~~~~~~~~~~~~~~~~~~~~~
// set the port
const port = 4567;
console.log(
  '\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n' +
    'Running on http://localhost:' + port + '\n' +
    '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n'
);
app.listen(port);