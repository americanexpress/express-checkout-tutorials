# Express Checkout Implemented through Ruby / Sinatra / Stripe API

![amex-checkout-dark](../../assets/img/expchk_btn1.png)

## Directions

1. Install Ruby. Make sure it is of version >= 2.2.0
  * If you need to update Ruby, [rvm](https://rvm.io/) is a good way to do it.
  * Here is rvm's [documentation](https://rvm.io/rvm/install#try-out-your-new-rvm-installation) on updating your Ruby verison.

2. Install dependencies: `sudo gem install sinatra stripe`
  * If you are working behind a proxy, try `sudo gem install sinatra stripe --no-http-proxy`

3. Replace `CLIENT_ID` on views/index.erb with your own Client ID.

4. Run the app.
- `PUBLISHABLE_KEY=pk_xxx SECRET_KEY=sk_xxx ruby app.rb`
- (replacing pk_xxx and sk_xxx with your publishable and secret keys)

5. Access the app through http://localhost:4567/

Note: POST requests do NOT work behind a proxy.