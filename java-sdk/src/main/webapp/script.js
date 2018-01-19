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