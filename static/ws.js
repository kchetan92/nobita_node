
(() => {

	let ws = new WebSocket("ws://localhost:8080");

	ws.onopen = () => {
		console.log("connected");
	}

	const resetBoxes = () => {
		let allBox = document.querySelectorAll(".selected");
		for(let i = 0; i<allBox.length; i++) {
			allBox[i].classList.remove("selected");
		}
	}

	const selectBox = (num) => {
		document.querySelector(".box" + num).classList.add("selected");
	}

	ws.onmessage = (evt) => {
		let rec_msg = evt.data;
		console.log("got ", rec_msg);

		if(rec_msg.indexOf("look") > -1) {
			resetBoxes();
			selectBox(rec_msg.replace("look", ""));
		}

	}

})()