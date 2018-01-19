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

package com.aecdemo;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import com.nimbusds.jose.JWEObject;
import com.nimbusds.jose.Payload;
import com.nimbusds.jose.crypto.AESDecrypter;

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
            System.out.println("Exception occurred while JWE decryption: "+e.getMessage());
            e.printStackTrace();
        }
        return payload.toString();
    }
}
