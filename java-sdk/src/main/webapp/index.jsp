<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
  <head>
    <script type="text/javascript" src="script.js"></script>
  </head>
  <body>
  Welcome to the American Express Checkout Java SDK Demo! Please click on the button below to use Express Checkout.
  <br/>
  <br/>
  Please use the following credentials for testing.
  <br/>
  <strong>Username: </strong> aectest1 <br/>
  <strong>Password: </strong> aectest <br/>
  <strong>One-Time Password (OTP): </strong> 111111
  <br/>
  <br/>

  <%--START: Code to load button dynamically from Amex API--%>
  <div id="amex-express-checkout"></div>
  <script>
    var aec_init= {
      "client_id": CLIENT_ID,
      "request_id": REQUEST_ID,
      "theme": "desktop",
      "button_color": "dark",
      "action": "checkout",
      "locale": "en_US",
      "country": "US",
      "callback": "aec_callback_handler",
      "env": "qa",
      "dialog_type": "popup",
      "button_type": "standard",
      "disable_btn": "false"
    }
  </script>
  <script src="https://icm.aexp-static.com/Internet/IMDC/AmexExpressCheckout/js/2.0/AEC.js"></script>
  <%--END: Code to load button dynamically from Amex API--%>

  Thank you! Here is the result from the server:
  <br/>
  <br/>
  <span id="result"></span>
  </body>
</html>
