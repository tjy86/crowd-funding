var CAMPAIGN_GOAL = 1000;

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