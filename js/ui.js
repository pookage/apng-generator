function init(){

	console.warn("TODO: be able to remove frames");

	//STATE
	//-------------------------------
	const app = {
		frames: [],
		errors: new Set(),
		elements: {
			app: document.getElementById("app"),
			frames: document.getElementById("list__frames"),
			errors: document.getElementById("list__errors"),
			addFrame: document.getElementById("input__generator__add_frame"),
			generate: document.getElementById("input__generator__generate"),
			canvas: document.getElementById("output__generator__canvas"),
			canvasHeight: document.getElementById("input__canvas__height"),
			canvasWidth: document.getElementById("input__canvas__width"),
			repeat: document.getElementById("input__generator__repeat"),
			delay: document.getElementById("input__generator__delay"),
			dispose: document.getElementById("input__generator__dispose"),
			blend: document.getElementById("input__generator__blend"),
			image: document.getElementById("output__generator__image")
		}
	}


	//EVENT LISTENERS
	//------------------------------
	app.elements.addFrame.addEventListener("click", addFrameOption);
	app.elements.canvasHeight.addEventListener("change", syncOutputDimensions);
	app.elements.canvasWidth.addEventListener("change", syncOutputDimensions);
	app.elements.generate.addEventListener("click", generateAPNG);


	//SETUP
	//-----------------------------
	syncOutputDimensions();



	//EVENT HANDLING
	//-----------------------------
	function addFrameOption(event){
		event.preventDefault();

		const frameOption = renderFrameOption();
		app.elements.frames.appendChild(frameOption);
		
		validateInputs(app.elements.frames, app.elements.addFrame, "Make sure every frame has a file!");
		validateInputs(app.elements.app, app.elements.generate);
	}//addFrameOption
	function selectFrameFile(preview, event){
		const [ file ] = event.target.files;
		const reader   = new FileReader();

		reader.addEventListener("load", () => {
			const fileData = reader.result;
			preview.src    = fileData;
			app.frames.push(fileData) //make best to do this at the end?
		});

		reader.readAsDataURL(file);

		validateInputs(app.elements.frames, app.elements.addFrame, "Make sure every frame has a file!");
		validateInputs(app.elements.app, app.elements.generate);
	}//selectFrameFile
	function syncOutputDimensions(){

		const width  = app.elements.canvasWidth.value;
		const height = app.elements.canvasHeight.value;

		app.elements.canvas.width  = width;
		app.elements.canvas.height = height;
		app.elements.image.width   = width;
		app.elements.image.height  = height;
	}//syncOutputDimensions
	function generateAPNG(){

		//grab everything we need from the UI
		const repeat  = app.elements.repeat.value;
		const delay   = app.elements.delay.value;
		const dispose = app.elements.dispose.value;
		const blend   = app.elements.blend.value;
		const output  = app.elements.image;
		const encoder = new APNGencoder(app.elements.canvas);

		//configure the encoder
		encoder.setRepeat(repeat);
		encoder.setDelay(delay);
		encoder.setDispose(dispose);
		encoder.setBlend(blend);

		//draw all the frames and save them ready
		encoder.start();
		drawFrames();
		encoder.finish();

		const base64 = bytesToBase64(encoder.stream().bin);


	}//generateAPNG


	//UTILS
	//----------------------------
	function validateInputs(container, element, message){
		const inputs = container.getElementsByTagName("input");
		const valid = [...inputs].every(input => input.validity.valid);

		if(element) element.disabled = !valid;
		if(message) {
			if(!valid) app.errors.add(message);
			else       app.errors.delete(message);
			renderErrors(app.errors);
		}

		return valid;
	}//validateInputs


	//RENDERING
	//----------------------------
	//html
	function renderFrameOption(){
		const li      = document.createElement("li");
		const preview = document.createElement("img");
		const input   = document.createElement("input");

		preview.className = "frames__frame";

		input.type     = "file";
		input.required = "true";

		input.addEventListener("change", selectFrameFile.bind(true, preview));
		li.appendChild(preview);
		li.appendChild(input);

		return li;
	}//renderFrameOption
	function renderErrors(errors){
		const fragment = document.createDocumentFragment();

		for(let error of errors){
			const li     = document.createElement("li");
			li.innerText = error;
			fragment.appendChild(li);
		}

		app.elements.errors.innerHTML = "";
		app.elements.errors.appendChild(fragment)
	}//renderErrors


}//init



window.addEventListener("load", init);