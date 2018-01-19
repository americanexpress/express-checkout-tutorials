# Implementing American Express Checkout with the Amex Java SDK
 
## Introduction
If you haven't yet, please take a moment to review the documents listed in the [Disclaimer](../) section of the repository README.

This article should act as a supplement to the existing Guide on the American Express Developer portal: [Amex Express Checkout](https://developer.americanexpress.com/products/express-checkout/guide) 

For further details, please refer to this guide. 

## Before you start...
### You will need the following: 

* Basic knowledge of Java Web Development (Java Servlets, JSP, HTML / CSS / JavaScript)
* An account on the [Amex Developer Portal](https://developer.americanexpress.com/home)
* An application server on which to host your web app (I've used Tomcat!) Some resources for your reference:
	* [Tomcat set up in IntelliJ Community Edition](https://dzone.com/articles/headless-setup-java-project)
	* [Tomcat set up in IntelliJ (with License)](https://www.mkyong.com/intellij/intellij-idea-run-debug-web-application-on-tomcat/)
	* [Tomcat set up in Eclipse](http://crunchify.com/step-by-step-guide-to-setup-and-install-apache-tomcat-server-in-eclipse-development-environment-ide/)
* The following jars
	* com.nimbusds nimbus-jose-jwt 5.1 
	* net.minidev json-smart 2.3
	* commons-codec commons-codec 1.1
	* net.minidev asm 1.0.2
      * You can download these from the web 
      * Or if you are using Maven, you can include these artifacts in your `pom.xml` file
* The Unlimited Strength Java Cryptography Extension (JCE) file
	* You can download this from Oracle's site [here](http://www.oracle.com/technetwork/java/javase/downloads/jce8-download-2133166.html).
	* To install, put the unzipped files in `%JAVA_HOME%/jre/lib/security`

## Client-Side Code
### Implementing the Button
First, we want to put the Express Checkout Button on our page. The default button looks like this: 

![amex-checkout-dark](../assets/img/expchk_btn1.png)

The Amex Express Checkout button is loaded dynamically by making an API call to fetch the button. 

Add the necessary code to load the button on your `index.jsp` page (or whatever page on which you would like to display it) as per the instructions in the [Adding the Button](https://developer.americanexpress.com/products/express-checkout/guide#button) section of the guide.

For reference, after adding the button, your `index.jsp` should look something like: 

```
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
  <head>
  <script type="text/javascript" src="script.js"></script>
  </head>
  <body>
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
    </body>
</html>
```

*CLIENT_ID*, *REQUEST_ID* should be replaced with the CLIENT_ID, REQUEST_ID as specified in the guide on the Amex Developer Portal, in the "Adding the Button" section. 

As far as the button goes, that's it! You can run your app and visit [http://localhost:8080](http://localhost:8080) if you are using Tomcat. You can try logging in with any of the below credentials, as outlined in the [Environments & Credentials](https://developer.americanexpress.com/products/express-checkout/guide#environments) section of the guide.

| UserID        | Password      | One-Time Password  |
| ------------- |:-------------:| ------------------:|
| aectest1      | aectest       |              111111|
| aectest2      | aectest       |              111111|
| aectest3      | aectest       |              111111|
| aectest4      | aectest       |              111111|

### Adding the callback function 

Once the user completes the login, a request is sent to Amex to retrieve their information, which you can then use to populate the checkout form for them. The response contains many parameters, outlined [here](https://developer.americanexpress.com/products/express-checkout/guide#response). The one of interest to us is the `enc_data` attribute, which is the encrypted customer information.  

To retrieve the data, we first need to implement a `aec_callback_handler` function on the client side that takes the encrypted response sent back from the Amex API and sends it to our server to extract the details. 

You can implement a JavaScript function to make another request to the back end that includes the encrypted data. I created a separate `script.js` file and included the path in my `<head>` tag in `index.jsp`. I used `xmlHttpRequest` to do so--here is a sample of what the JavaScript file would look like. 

**script.js**

```
function aec_callback_handler(response) {
  // Handle the response from the Amex API giving Customer Details
  console.log('Response = ', response.enc_data);
  var dataStr = response.enc_data;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open('POST', '/checkout?data=' + dataStr);
  xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
  xmlhttp.send();
  
  // Display the customer information on the page once decrypted
  xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4) {
          if (xmlhttp.status == 200)
          {
              document.getElementById('result').innerHTML = xmlhttp.responseText;
              //alert(xmlhttp.responseText);
          }
          else
          {
              alert('Something went wrong!!');
          }
      }
  };
}
```

We also added a few lines to handle the decrypted result from the server when it's done processing, to display the customer's information on the web page. Lastly, I added a section on the main page to show the result from the server, for demo purposes. 

**index.jsp**

```
<body>
[...]
Thank you! Here is the result from the server:
<br/>
<br/>
<span id="result"></span>
</body>
[...]
```

## Server-Side Code
Now that we have all the code implemented for the user to login and go through the Express Checkout journey, we still need to decrypt the response from the Amex API so that we can make the customer's details available to us and use them to finish payment. 

To do that, I created a Java Servlet to handle & decrypt the response, and then send it back to the client. 

Since we called a `POST` method from the client, we'll need to implement the `doPost` function in the Servlet. 

### Retrieving the data from the client call
In our doPost method, we want to extract the encrypted response from the client, which we sent in the `data` param. 

Here's my `doPost` function: 

```
[...imports...]
public class CheckoutServlet extends HttpServlet {
    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Pragma", "no-cache");
        req.setCharacterEncoding("UTF-8");
        System.out.println("Here's the data from the client: "+req.getParameter("data"));
        String result = getDecryptedPayload(req.getParameter("data"), SHARED_SECRET);
        PrintWriter out = res.getWriter();
        out.print("Customer Details: " + result);
    }
[...]
```
*SHARED_SECRET* should be replaced with the SHARED_SECRET as specified in the guide on the Amex Developer Portal, in the "Environemnts & Credentials" section.

### Decrypting the data 
Great! Now that we have the data in our servlet, all we have to do is make sense of it.

Amex has provided a code snippet that you can use to decrypt the data to get the customer details in the [Decryption Sample Code](https://developer.americanexpress.com/products/express-checkout/guide#samplecode) section of the guide. 

For more information on the data within the decrypted response, you can refer to the [Retrieving the Response](https://developer.americanexpress.com/products/express-checkout/guide#response) section of the guide. 

*Note: Here's where you'll need those dependencies mentioned above. Make sure you have the jars downloaded and in your project, or in your `pom.xml` if you're using Maven. In addition, you should have the Unlimited Strength JCE policy installed on your machine.*

For reference, your Servlet code should now look like this:

**CheckoutServlet.java**
 
```
[...imports...]
public class CheckoutServlet extends HttpServlet {

    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
      // Initializing headers
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Pragma", "no-cache");
      req.setCharacterEncoding("UTF-8");
      
      // For debugging purposes
      System.out.println("Here's the data from the client: "+req.getParameter("data"));
      
      // Decrypting the payload
      String result = getDecryptedPayload(req.getParameter("data"), SHARED_SECRET);
      
      // Sending data back to client in response
      PrintWriter out = res.getWriter();
      out.print("Customer Details: " + result);
    }

    public static String getDecryptedPayload(String enc_data, String sharedSecret)
    {
      Payload payload=null;
      try {
        JWEObject jweObject = JWEObject.parse(enc_data);
        jweObject.decrypt(new AESDecrypter(sharedSecret.getBytes()));
        payload = jweObject.getPayload();
        return payload.toString();
      } catch (Exception e) {
        System.out.println("Exception occurred while JWE decryption:"+e.getMessage());
        e.printStackTrace();
      }
    return payload.toString();
    }
[...]
```

Almost done! Now all we have to do is register the URL for our servlet so that the server and client can talk to each other. 

Your `web.xml` file should look like: 

```
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd"
 version="3.1">
    <welcome-file-list>
        <welcome-file>index.jsp</welcome-file>
    </welcome-file-list>
    <servlet>
        <servlet-name>CheckoutServlet</servlet-name>
        <servlet-class>com.aecdemo.CheckoutServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>CheckoutServlet</servlet-name>
        <url-pattern>/checkout</url-pattern>
    </servlet-mapping>
</web-app>
```

All done! Now you can try running your application and test it end to end. If you're running via Tomcat, just run in your IDE or via the command line, and navigate to [http://localhost:8080](http://localhost:8080). 

## Conclusion 
Great job! Through this tutorial we were able to create a simple Java Web Application that uses American Express Checkout. If you'd like to see the code and file structure of the project, take a look in the **java-sdk** folder of this repository. Good luck and keep hacking! 



