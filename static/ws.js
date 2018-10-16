
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

		if(rec_msg.indexOf("update_pic_") > -1) {
			let allBox = document.querySelectorAll(".box");
			let num = rec_msg.replace("update_pic_","")
			num = parseInt(num);
			if(allBox[num]) {
				allBox[num].style.backgroundImage = ""
				allBox[num].style.backgroundImage = "url(" + num + ".jpg?"+ parseInt(Math.random()*10000) +")";
			}
		}

		if(rec_msg.indexOf("delete_pic_") > -1) {
			let allBox = document.querySelectorAll(".box");
			let num = rec_msg.replace("delete_pic_","")
			num = parseInt(num);
			if(allBox[num]) {
				allBox[num].style.backgroundImage = "";
			}
		}

	}

})()