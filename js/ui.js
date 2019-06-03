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
			generate: document.getElementById("input__generator__generate")
		}
	}


	//EVENT LISTENERS
	//------------------------------
	app.elements.addFrame.addEventListener("click", addFrameOption);


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