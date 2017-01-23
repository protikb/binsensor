// main.js
var obj = require('./mq_to_mongo.js');

var mongo_uri = "candidate.63.mongolayer.com:10191/test_bins";
var mongo_auth = "testbin:testbin";

var mqueue_uri = "localhost";
var mqueue_auth = "testbin:testbin";

var model = obj.connectMongo(mongo_uri, mongo_auth);
obj.pushData(model, mqueue_uri);

//!end