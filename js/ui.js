function init(){

	console.warn("TODO: be able to remove frames");

	//STATE
	//-------------------------------
	const app = {
		frames: [],
		errors: new Set(),
		elements: {
			app:          document.getElementById("app"),
			frames:       document.getElementById("list__frames"),
			errors:       document.getElementById("list__errors"),
			addFrame:     document.getElementById("input__generator__add_frame"),
			generate:     document.getElementById("input__generator__generate"),
			canvas:       document.getElementById("output__generator__canvas"),
			canvasHeight: document.getElementById("input__canvas__height"),
			canvasWidth:  document.getElementById("input__canvas__width"),
			repeat:       document.getElementById("input__generator__repeat"),
			fps:          document.getElementById("input__generator__fps"),
			dispose:      document.getElementById("input__generator__dispose"),
			blend:        document.getElementById("input__generator__blend"),
			image:        document.getElementById("output__generator__image")
		},
		tooltips: {
			dispose: {
				0: {
					name: "NONE",
					description: "No disposal is done on this frame before rendering the next; the contents of the output buffer are left as is"
				},
				1: {
					name: "BACKGROUND",
					description: "The frame's region of the output buffer is to be cleared to fully transparent black before rendering the next frame.",
				},
				2: {
					name: "PREVIOUS",
					description: "The frame's region of the output buffer is to be reverted to the previous contents before rendering the next frame."
				}
			},
			blend: {
				0: {
					name: "SOURCE",
					description: "All color components of the frame, including alpha, overwrite the current contents of the frame's output buffer region."
				}, 
				1: {
					name: "OVER",
					description: "The frame should be composited onto the output buffer based on its alpha"
				}
			}
		}
	};


	//EVENT LISTENERS
	//------------------------------
	app.elements.addFrame.addEventListener("click", addFrameOption);
	app.elements.canvasHeight.addEventListener("input", syncOutputDimensions);
	app.elements.canvasWidth.addEventListener("input", syncOutputDimensions);
	app.elements.generate.addEventListener("click", generateAPNG);
	app.elements.dispose.addEventListener("input", updateTooltip);
	app.elements.blend.addEventListener("input", updateTooltip);


	//SETUP
	//-----------------------------
	syncOutputDimensions();
	updateTooltip({ target: app.elements.dispose });
	updateTooltip({ target: app.elements.blend });



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
		const imageSrc = URL.createObjectURL(file);
		const frame    = new Image();

		frame.src   = imageSrc;
		preview.src = imageSrc;
		app.frames.push(frame);

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
	function updateTooltip(event){
		const input       = event.target;
		const attribute   = input.dataset.label;
		const value       = input.value;
		const container   = input.parentElement;
		const details     = container.getElementsByTagName("details")[0];
		const tooltip     = app.tooltips[attribute][value];
		const name        = document.createElement("summary");
		const description = document.createElement("span");
		const fragment    = document.createDocumentFragment();

		name.innerText        = tooltip.name;
		description.innerText = tooltip.description;
		details.innerHTML = "";

		fragment.appendChild(name);
		fragment.appendChild(description);
		details.appendChild(fragment);
	}//updateTooltip


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
	function generateAPNG(event){

		event.preventDefault();

		//grab everything we need from the UI
		const repeat  = app.elements.repeat.value;
		const fps     = app.elements.fps.value;
		const dispose = app.elements.dispose.value;
		const blend   = app.elements.blend.value;
		const output  = app.elements.image;
		const encoder = new APNGencoder(app.elements.canvas);
		const ms      = 1000 / fps;
		const delay   = ms / 10;

		//configure the encoder
		encoder.setRepeat(repeat);
		encoder.setDelay(delay);
		encoder.setDispose(dispose);
		encoder.setBlend(blend);

		//draw all the frames and save them ready
		encoder.start();
		drawFrames(encoder);
		encoder.finish();

		const base64 = bytesToBase64(encoder.stream().bin);
		const imgURL = `data:image/png;base64,${base64}`;

		app.elements.image.src = imgURL;
	}//generateAPNG


	//RENDERING
	//----------------------------
	//html
	function renderFrameOption(){
		const li      = document.createElement("li");
		const preview = document.createElement("img");
		const input   = document.createElement("input");

		li.className      = "frames__item";
		preview.className = "frames__frame";
		preview.src       = "";

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
	//canvas
	function drawFrames(encoder){

		const { 
			width,     // (number) of natural pixels in width the canvas has
			height,    // (number) of natural pixels in height the canvas has
		} = app.elements.canvas;
	
		const context = app.elements.canvas.getContext("2d");

		context.clearRect(0, 0, width, height);

		for(let frame of app.frames){
			context.drawImage(frame, 0, 0, width, height);
			encoder.addFrame(context);
			context.clearRect(0, 0, width, height);
		}
	}//drawFrames


}//init



window.addEventListener("load", init);