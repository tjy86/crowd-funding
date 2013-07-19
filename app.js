var CAMPAIGN_GOAL = 1000;
var BALANCED_MARKETPLACE_URI = "/v1/marketplaces/TEST-MP1nb4ggHRSZdTrNOoJZpuLJ";
var BALANCED_API_KEY = "2d0a61deeff511e29f6c026ba7cd33d0";

var express = require('express');
var app = express();
app.use("/static", express.static(__dirname + '/static'));
app.use(express.bodyParser());
app.listen(1337);
console.log("App running on http://localhost:1337");

app.get("/",function(request,response){

    response.send(
        "<link rel='stylesheet' type='text/css' href='/static/fancy.css'>"+
        "<h1>Your Crowdfunding Campaign</h1>"+
        "<h2>raised ??? out of $"+CAMPAIGN_GOAL.toFixed(2)+"</h2>"+
        "<a href='/fund'> Fund This</a>"
        );

});

app.get("/fund",function(request,response){
    response.sendfile("fund.html");
});

// Pay via Balanced
app.post("/pay/balanced",function(request,response){

    // Payment Data
    var card_uri = request.body.card_uri;
    var amount = request.body.amount;
    var name = request.body.name;

    // TODO: Charge card using Balanced API
    /*response.send("Your card URI is: "+request.body.card_uri);*/

    Q.fcall(function(){

        // Create an account with the Card URI
        return _callBalanced("/accounts",{
            card_uri: card_uri
        });

    }).then(function(account){

        // Charge said account for the given amount
        return _callBalanced("/debits",{
            account_uri: account.uri,
            amount: Math.round(amount*100) // Convert from dollars to cents, as integer
        });

    }).then(function(transaction){

        // Donation data
        var donation = {
            name: name,
            amount: transaction.amount/100, // Convert back from cents to dollars.
            transaction: transaction
        };

        // TODO: Actually record the transaction in the database
        return Q.fcall(function(){
            return donation;
        });

    }).then(function(donation){

        // Personalized Thank You Page
        response.send(
            "<link rel='stylesheet' type='text/css' href='/static/fancy.css'>"+
            "<h1>Thank you, "+donation.name+"!</h1> <br>"+
            "<h2>You donated $"+donation.amount.toFixed(2)+".</h2> <br>"+
            "<a href='/'>Return to Campaign Page</a> <br>"+
            "<br>"+
            "Here's your full Donation Info: <br>"+
            "<pre>"+JSON.stringify(donation,null,4)+"</pre>"
        );

    },function(err){
        response.send("Error: "+err);
    });

});

// Calling the Balanced REST API
var Q = require('q');
var httpRequest = require('request');
function _callBalanced(url,params){

    // Promise an HTTP POST Request
    var deferred = Q.defer();
    httpRequest.post({

        url: "https://api.balancedpayments.com"+BALANCED_MARKETPLACE_URI+url,
        auth: {
            user: BALANCED_API_KEY,
            pass: "",
            sendImmediately: true
        },
        json: params

    }, function(error,response,body){

        // Handle all Bad Requests (Error 4XX) or Internal Server Errors (Error 5XX)
        if(body.status_code>=400){
            deferred.reject(body.description);
            return;
        }

        // Successful Requests
        deferred.resolve(body);

    });
    return deferred.promise;

}