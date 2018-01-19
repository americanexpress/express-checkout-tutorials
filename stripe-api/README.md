# Implementing Express Checkout Using The Stripe API 

## Disclaimer

Before implementing Express Checkout button, you must agree and adhere to Stripe's [Terms of Service](https://stripe.com/amex-express-checkout/legal) and [Amex Express Checkout Button Guidelines](https://stripe.com/docs/amex-express-checkout-button-guidelines).

While we will be specifically working in the QA environment, I will also note the steps to promote the button to production.

## You will need...

* Basic knowledge of HTML / CSS / JS.
* An account with Stripe.
  * If you don't have one, you can register for free.
* A backend language of your choice. In this demo, I will be using Python and Flask.
  * There exist code samples in Node and Ruby, as well, in this repository. 

** - Stripe supports the following languages/frameworks: Ruby, Python, Node, ASP .NET, Go, PHP.

## *Implementing The Button*

American Express has partnered with Stripe to make the Express Checkout available to implement in just a few lines of code. Much of the "Getting Started" section on this page will resemble the Stripe documentation.

1. Create a file named `index.html`.

2. Follow the steps mentioned in the "Integrating the Amex Express Checkout button" section of the [Amex Express Checkout Guide](https://stripe.com/docs/amex-express-checkout) on the Stripe website.

For reference, your finished `index.html` file should look something like...

```html
<!doctype html>
<html>
   <head>
      <link rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css"
        integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb"
        crossorigin="anonymous">
   </head>

   <body>
   
      <!-- DOM elements -->
      <amex:init client_id="CLIENT_ID" env="qa" callback="aexpCallback"/>

      <form id="payment-form">
         <div id="amex-express-checkout" />
      </form>


      <!-- Javascript files -->
      <script src="https://code.jquery.com/jquery-3.2.1.js"
         integrity="sha256-DZAnKJ/6XZ9si04Hgrsxu/8s717jcIzLy3oi35EouyE="
         crossorigin="anonymous"></script>
    
      <script src="https://icm.aexp-static.com/Internet/IMDC/US_en/RegisteredCard/AmexExpressCheckout/js/AmexExpressCheckout.js"></script>
    
      <script>
         function aexpCallback(response) {
            var token = response.token;
        
            if (token) {
               console.log('Log in success!');
               var stripeToken = '<input type="hidden" name="stripeToken">';
               $('#payment-form').append($(stripeToken).val(token));
            }
         };
      </script>
   </body>
</html>
```

3. Try testing out the button with the following credentials.

* Username: **test_user**
* Password: **password**
* One-time access code: **123456**

The button should look like this.

![amex-checkout-dark](../assets/img/expchk_btn1.png)

## Linking With A Backend Service

Now we have properly fetched the user token. To properly integrate with Stripe and Express Checkout, two backend calls must be made:

* Using the token to autofill card details and account information
* Performing the transaction itself.

### Getting your Stripe API Keys

Once you've made a Stripe account, click the "API" tab on the left side, and you should be able to see your Publishable Key and reveal your Secret Key. Save this tab for later, we will return to it.

### Download your dependencies

To get Flask up and running, you must have:

* Python. I am using version 2.x, however 3.x should also work with only a few modifications.
* pip, a Python installer.
* Next, run the following commands in your project's directory:
  * `pip install flask`
  * `pip install stripe`

### Make a Python app skeleton

Create a file named `main.py`, and paste the following code in it.

```python
import os
from flask import Flask, render_template, request
import stripe

stripe_keys = {
  'secret_key': os.environ['SECRET_KEY'],
  'publishable_key': os.environ['PUBLISHABLE_KEY']
}

stripe.api_key = stripe_keys['secret_key']

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')
```

Next, create a folder named "templates" and place your index.html file in that folder.

Your directory structure should now look like...

```
application/
    main.py
    templates/
        index.html
```

### (Optional, add proxy credentials)

If you are behind a proxy, add the following lines below setting your stripe.api_key

```python
stripe.proxy = {
    "http": "http://<USERNAME>:<PASSWORD>@<PROXY>:<PORT>",
    "https": "http://<USERNAME>:<PASSWORD>@<PROXY>:<PORT>",
}
```

## Run your main.py file

It is bad procedure to place your API keys in version control, so we will be passing these values in at runtime. Run the following command:

`PUBLISHABLE_KEY=pk-xxxx SECRET_KEY=sk-xxxx python main.py`

replacing pk-xxxx and sk-xxxx with your publishable and secret keys respectively.

You should note the following response message:

```
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: 160-121-540
```

and be able to see your button at [http://localhost:5000](http://localhost:5000).

## Leveraging the token to preview account details about the user

To gather preliminary account information before the user authorizes the payment, we will create a hidden form. Once the user logs in to their Account, the hidden form will submit and pass its response to the client. This way, our user can verify that the given account is up-to-date before authorizing their transaction.

### Adding A Hidden Form

Add the following above your "#payment-form":

```html
<!-- a hidden form to gather basic account information -->
<div style="display:none;">
   <form action="/" method="post" id="hidden-form" />
</div>
```

Next, modify your aexpCallback function to pass information to and submit the hidden form.

```javascript
function aexpCallback(response) {

   var token = response.token;
   if (token) {
      var inputElem = '<input type="hidden" name="stripeToken">';
      $('#payment-form').append($(inputElem).val(token));
      $('#hidden-form' ).append($(inputElem).val(token));
   }

   $('#hidden-form').submit();
}
```

Create a post route in your `main.py` file, to gather the account information and then send this information back into the client.

```python
@app.route('/', methods=['POST'])
def fetchAccountInformation():

   # Gather account information
   token = stripe.Token.retrieve(request.form['stripeToken'])

   # pass account information into the index.html file
   return render_template('index.html', token = token)
```

### Display Relevant Account Information

Finally, display the full user account information on your HTML page. Using Flask, we can display information from multiple HTML pages using macros. Create a new file named macros.html in the "templates" directory and paste in the following.
You may also notice the `{% if <condition> %}` and `{% endif %}`. These allow the conditional display of HTML elements.

```html
{% macro account_details(token) -%}
  {% if token != null %}
    <br><br>
  <fieldset disabled class="col-md-12">
    <div class="form-group">
      <label for="disabledTextInput"><strong>Cardmember Details</strong></label><br>

      <label for="disabledTextInput">Cardmember Name</label>
      <input type="text" id="name" class="form-control"
      placeholder="{{token['card']['name']}}">

      <label for="disabledTextInput">Last 4 Digits of American Express Card</label>
      <input type="text" id="last4" class="form-control"
      placeholder="**** ***** {{token['card']['dynamic_last4']}}">
      
      <label for="disabledTextInput">Expiration Date</label>
      <input type="text" id="expirationDate" class="form-control"
      placeholder="{{token['card']['exp_month']}}/{{token['card']['exp_year']}}">
      
    </div>
  </fieldset>

  <br><br>
  <fieldset disabled class="col-md-12">
    <div class="form-group">
      <label for="disabledTextInput"><strong>Billing Address</strong></label><br>

      <input type="text" id="addressLine1" class="form-control"
      placeholder="{{token['card']['address_line1']}}">
      <input type="text" id="addressLine2" class="form-control"
      placeholder="{{token['card']['address_line2']}}">
      <input type="text" id="addressCityStateAndCountry" class="form-control"
      placeholder="{{token['card']['address_city']}} {{token['card']['address_state']}}, {{token['card']['address_country']}}">
    </div>
  </fieldset>

  <input type="hidden" name="stripeToken" value="{{token['id']}}">
  {% endif %}
{%- endmacro %}
```

Next, link to it at the bottom of the payment form like so:

```html
<!-- "#payment-form" -->
    <div id="amex-express-checkout" />

   {% from 'macros.html' import account_details with context %}
   {{ account_details(token) }}
</form>
```
Now, reload the page. Upon filling in the test Express Checkout credentials, you should see a few read-only fields with the cardmember's basic account information.

## *Completing The Transaction*

First, let's make a submit button. This should be disabled if the user has not yet logged into Express Checkout.

```html
<!-- "#payment-form" -->
   <div class="form-group col-md-12">
      {% if token != null %}
         <button id="submit-button" type="submit" class="btn btn-primary">Submit</button>
      {% else %}
         <button id="submit-button" type="submit" class="btn btn-primary" disabled>Submit</button>
      {% endif %}
   </div>
</form>
```

Upon the form submitting, Flask should redirect to a success screen. We'll call this, `success.html`.

First, let's create this file and paste the following.

```html
<!doctype html>
<html>
   <head>
      
      <!-- bootstrap -->
      <link rel="stylesheet"
         href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css"
         integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb"
         crossorigin="anonymous">
   
   </head>
   <body>

      <!-- success message -->
      <div class="col-md-12">
         <h2>Thanks, you paid <strong>$5.00</strong>!</h2>
         <p><a href="/">Try Again</a></p>
      </div>

   </body>
</html>
```

Let's add the corresponding python logic at the bottom.

```python
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

    return render_template('success.html', amount = amount)
```

And finally, let's make the form post to the `/charge` route upon submitting. Modify the `#payment-form` form element to the following.

```html
<form action="/charge" method="post" id="payment-form">
```

Run the python app one final time, clicking the submit button at the bottom and watch as the page redirects to the success screen!

If you linked your Stripe CLIENT_ID successfully, you should also see a sample $5 charge appear on your Stripe dashboard. Not to worry, no charges actually went through!

## In Conclusion

Through this tutorial, we were able to create and implement an American Express 'Express Checkout' button on a custom webpage. All the best in your coding endeavors!