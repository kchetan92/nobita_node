const express = require('express');
const app = express();
const port = 8080;

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const NodeWebCam = require('node-webcam');
const keypress = require('keypress');

const objectPresent = []; (() => {for(let i = 0; i<6; i++){objectPresent[i]=true}})();
let currentPosition = 0;

let socketSend = false;

// const opts = {
// 	device: 'USB2.0 PC CAMERA'
// }

// const cam = NodeWebCam.create(opts);

// cam.capture("test_pic", (err, data) => {
// 	if (err) {
// 		console.log(err)
// 	}	else {
// 		console.log(data);
// 	}
// })

const getNextFreeSlot = () => {
	for(let i = currentPosition; i < 6 + currentPosition; i++) {
		if(objectPresent[i%6]) {
			return (i%6);
		}
	}
}

const loadAt = (slot) => {
	serialport.write(Buffer.from("load$"), err => {
		if(err) {
			console.log("something went wrong");
		}	else {
			console.log("msg passed");
		}
	})
}

const testCommand = (msg) => {
	serialport.write(Buffer.from(msg + "$"), err => {
		if(err) {
			console.log("something went wrong");
		}	else {
			console.log("msg passed");
		}
	})	
}

const save_object = () => {
	const free = getNextFreeSlot();
	prepareToGet(free)
}

const serialport = new SerialPort('/dev/cu.wchusbserial1430', {
	baudRate: 9600
}, (err) => {
	console.log("constructor error ", err);
});

// setInterval(() => {
// 	serialport.write(Buffer.from("long message$abc"), err => {
// 		if(err) {
// 			console.log("something went wrong");
// 		}	else {
// 			console.log("msg passed");
// 		}
// 	})
// }, 400)

app.get('/cpp/look/:at', (req, res) => {
	let opt = "save_object";

	switch(opt) {
		case "save_object": save_object(); break;
	}

	if(req.params.at) {
		console.log(req.params.at);
		socketSend ? socketSend.send("look"+req.params.at) : null;
	}	else 	{
		console.log("only get");
	}

	res.send("okcpp");

});

app.use(express.static('static'));

let server = app.listen(port, () => {
	console.log("Listening on port ", port);
});


const SocketServer = require('ws').Server;

const wss = new SocketServer({ server });

console.log("here");

wss.on("connection", (ws) => {
	socketSend = ws;
	console.log("ws");
	ws.send('message from server')
})

keypress(process.stdin);

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on("keypress", (ch, key) => {
	if(key.sequence === "h") {
		loadAt();
	}	else if(key.sequence === "j") {
		testCommand("test_sequence");
	}
})


