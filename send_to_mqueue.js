// send dummy data to mqueue
// later to be incorporated in the code on the board

var amqp = require('amqplib/callback_api');
var moment = require('moment');

amqp.connect('amqp://localhost', function(err, conn) {
	conn.createChannel(function(err, ch){
		var queue_name = 'sensor_data';

		sensed_level = 78;
		var timestamp = moment();
	    timestamp = timestamp.format('dddd, MMMM Do YYYY, h:mm:ss a');
		var msg = { bin_id: "b0001",
			sensor_id: "s0001",
			level: sensed_level,
			time: timestamp
		};
		console.log(msg.time);
		msg = JSON.stringify(msg);
		console.log(typeof msg);
		
		console.log("Percent full (%): " + sensed_level + "  " + timestamp );

		ch.assertQueue(queue_name, {durable:true});
		ch.sendToQueue(queue_name, new Buffer(msg), {persistent:true});
	});
	setTimeout(function() {conn.close(); process.exit(0)}, 1000);
});