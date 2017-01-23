// Author : thetroubledk1d
// start_time : 20-01-2017 05:00 p.m.

// Required libraries
// mqueue to local
var amqp = require('amqplib/callback_api');
// local to mongo
var mongoose = require('mongoose');

// These methods and properties would be pushed and available
module.exports = {
    /*
    receive_data: function(addr, auth, q_name) {
        // auth = uname:pwd
        serverAddr = 'amqp://' + auth + '@' +  addr + '/vhost/';

        amqp.connect(serverAddr, function(err, conn) {
            conn.createChannel(function(err, ch) {
                var queue_name = q_name || 'sensor_data';

                ch.assertQueue(q, {durable: true});
                console.log(" [] Waiting for messages in %s. To exit, press CTRL+C.", queue_name);
                ch.consume(q, function(msg) {
                    console.log(" [x] Received %s", msg.content.toString());
                    // push the data to mongosb and get an ackMsg
                    var ackMsg = pushData(msg);
                }, {noAck: false});
            })
        })
    },
    */

    connectMongo : function(db_adrr, auth, schema, collection) {
        //auth = uname:pwd
        db_url = 'mongodb://' + auth + '@' + db_adrr;

        //temporary local db
        // db_url = 'mongodb://localhost:27017';
        console.log("Connecting to %s", db_url);

        /* Alternatively; direct method but not working
        mongoose.connect(db_url, function(err, conn) {
            if (err) 
                console.error.bind(console, "connection error");
            if (conn) 
                console.log("Connection to db is established...");
        });
        */

        mongoose.connect(db_url);
        var db = mongoose.connection;
        setTimeout(function() {db.on('error', console.error.bind(console, "connection error"));
        db.once('open', function () {
          console.log("Connection to testDb is open...");
        });
        }, 10000);

        
        /* Atlernatively 
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, "connection error"));
        db.once('open', function() {
            console.log("Connection to db is established...");
        });
        */

        // define schema
        var default_schema = { bin_id: String,
            sensor_id: String,
            level: Number,
            time: String };
        var Schema = schema || default_schema;

        // define collection
        var default_collection = 'bin';
        var Collection = collection || default_collection;

        var modelSchema = new mongoose.Schema(Schema);
        var model = mongoose.model(Collection, modelSchema);
        console.log("Mongoose model created!");
        return model;
    },

    pushData : function(mongoose_model, amqp_uri, amqp_auth) {
        // Format : auth = uname:pwd
        // uri = 'amqp://' + amqp_auth + '@' +  amqp_uri + '/vhost/';
        uri = 'amqp://' + amqp_uri;

        amqp.connect(uri, function(err, conn) {
            conn.createChannel(function(err, ch) {
                // var queue_name = q_name || 'sensor_data';
                var queue_name = 'sensor_data';

                ch.assertQueue(queue_name, {durable: true});
                console.log(" [] Waiting for messages in %s. To exit, press CTRL+C.", queue_name);
                ch.consume(queue_name, function(msg) {
                    // var obj = JSON.parse(msg.content);
                    console.log(" [x] Received %s", msg.content.toString());
                    var obj = JSON.parse(msg.content.toString());
                    console.log(obj);
                    console.log(obj.time);
                    // console.log(" [x] Received \n");
                    // console.log(msg.content.toString());
                    // push the data to mongosb and get an ackMsg
                    // try pushing this code in a separate function
                    mongoose_model.create(obj);
                    // ch.ack(msg);


                    setTimeout(function() {
                        // Check if the document was written
                    mongoose_model.findOne(obj, 'bin_id time', function(err, data) {
                        // if (err) console.bind.error(console, "Error!, Document not written");
                        // else {
                            // console.log("Hurray!, %s data was written", data.bin_id);
                            // ch.ack(msg);
                        // }
                        console.log(err);
                        if (data !== null) {
                        console.log(data);
                        console.log(data.time);
                        console.log(data.bin_id);
                        ch.ack(msg);
                    }   
                    });
                    
                    }, 50)
                    
                }, {noAck: false});
            })
        })  
    }
};
