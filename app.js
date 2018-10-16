const express = require('express');
const app = express();
const port = 8080;

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const NodeWebCam = require('node-webcam');
const keypress = require('keypress');

const objectPresent = []; (() => {for(let i = 0; i<6; i++){objectPresent[i]=false}})();
let currentPosition = 0;

let socketSend = false;

const opts = {
	device: 'USB2.0 PC CAMERA #3'
}

const cam = NodeWebCam.create(opts);

cam.list((list) => {
	console.log(list);
})

cam.capture("test_pic", (err, data) => {
	if (err) {
		console.log(err)
	}	else {
		console.log(data);
	}
})

const updatePicture = (num) => {
	cam.capture("static/" + num, (err, data) => {
		if (err) {
			console.log(err)
		}	else {
			console.log(data);
			socketSend ? socketSend.send("update_pic_"+ num) : null;
		}
	})
}

const getNextFreeSlot = () => {
	for(let i = currentPosition; i < 6 + currentPosition; i++) {
		if(!objectPresent[i%6]) {
			return (i%6);
		}
	}
	return false;
}

const calculateRotation = (start, end) => {
	console.log(start,",", end)
	let deg = (end - start)*60;

	if(deg >= 180) {
		deg = 360 - deg;
	}

	if(deg <= -180) {
		deg = 360 + deg;
	}

	return deg;
}

const prepareToGet = (deg) => {
	console.log(deg);
	sendMessage("load_" + deg);
}



// const loadAt = (slot) => {
// 	serialport.write(Buffer.from("load$"), err => {
// 		if(err) {
// 			console.log("something went wrong");
// 		}	else {
// 			console.log("msg passed");
// 		}
// 	})
// }

const sendMessage = (msg) => {
	serialport.write(Buffer.from(msg + "$"), err => {
		if(err) {
			console.log("something went wrong");
		}	else {
			console.log("msg passed");
		}
	})	
}

const saveObject = () => {
	const free = getNextFreeSlot();
	if(free === false) {
		console.log("all full");
		return;
	}
	const degree = calculateRotation(currentPosition, free);
	prepareToGet(degree);

	currentPosition = free;
	objectPresent[free] = true;
	updatePicture(free);

	console.log("cp, ", objectPresent);
}

const ejectObject = (at) => {
	const target = parseInt(at);
	if(!objectPresent[target]) {
		return;
	}
	const degree = calculateRotation(target, ((currentPosition+3)%6));
	currentPosition = target - 3;
	if(currentPosition < 0) {
		currentPosition = currentPosition + 6;
	}
	sendMessage("ejct_" + degree);
	socketSend ? socketSend.send("delete_pic_"+ target) : null;

	objectPresent[target] = false;
	console.log("cp, ", objectPresent);
}

const serialport = new SerialPort('/dev/cu.wchusbserial14310', {
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

app.get('/cpp/look/:at/stare/:str', (req, res) => {

	if(req.params.at) {
		console.log(req.params.at);
		socketSend ? socketSend.send("look"+req.params.at) : null;
	}	else 	{
		console.log("only get");
	}

	if(req.params.str === "yes") {
		socketSend ? socketSend.send("delete"+req.params.at) : null;
		ejectObject(req.params.at);
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
		saveObject();
	}	else if(key.sequence === "j") {
		testCommand("test_sequence");
	}	else if(key.sequence === "s") {
		sendMessage("test_sort");
	}	else if(key.sequence === "l") {
		sendMessage("test_lift");
	}	else if(key.sequence === "t") {
		sendMessage("test_drop");
	}	else if(key.sequence === "o") {
		sendMessage("move_lift");
	}	else if(key.sequence === "n") {
		sendMessage("move_trapdoor");
	}	else if(key.sequence === "y") {
		ejectObject(currentPosition);
	}	else if(key.sequence === "p") {
		sendMessage("move_sorter");
	}	else if(key.sequence === "x") {
		sendMessage("move_rev_lift");
	}

})


