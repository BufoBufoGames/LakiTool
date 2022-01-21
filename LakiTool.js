// ----------------------------------------------------------------
// filename: LakiTool.js
// project:  LakiTool
// author:   Nathan Dobby
// created:  2022-01-07
// ----------------------------------------------------------------

// References:
// https://github.com/antimatter15/jsgif

var resourcesLoaded = false;
var pageLoaded = false;
var updatePreviewRequested = false;
var generateAnimationRequested = true;

var previewCanvas = null;
var textBox = null;
var hScale = null;
var displayImage = null;

var encoder = null;
var lastGeneratedFileName = 'lakitu.gif';

var tilesetURL = "lakitu_blank_mk64.png";

// Load callbacks
window.onload = pageLoadedCallback;

var onError = function() { resourcesLoadedCallback(false); }
var onLoad = function() { resourcesLoadedCallback(true); }

// Create the tileset image with load callbacks
tileset = new Image();
tileset.onerror = onError;
tileset.onload = onLoad;
tileset.src = tilesetURL;


function isPageFullyLoaded()
{
	return ((resourcesLoaded == true) && (pageLoaded == true));
}

function resourcesLoadedCallback(loadResult)
{
	if (loadResult == true)
	{
		resourcesLoaded = true;
		
		attemptGenerateAnimation();
	}
	else
	{
		alert("Failed loading resources.");
	}
}

function pageLoadedCallback()
{
	pageLoaded = true;
	
	// Cache page elements
	previewCanvas = document.getElementById('previewCanvas');
	textBox = document.getElementById('text');
	horizontalScale = document.getElementById('horizontalScale');
	displayImage = document.getElementById('displayImage');
	
	// Set event handlers
	textBox.oninput = onTextChanged;
	horizontalScale.oninput = onTextChanged;
	document.getElementById('generate').onclick = onGenerateButtonClicked;
	document.getElementById('download').onclick = onDownloadButtonClicked;
	
	attemptUpdatePreview();
	attemptGenerateAnimation();
}

// On text field changed, update preview
function attemptUpdatePreview()
{
	if (updatePreviewRequested == true)
	{
		if (isPageFullyLoaded())
		{
			updatePreviewRequested = false;
			
			generateAnimation(true);
		}
	}
}

function onTextChanged()
{
	updatePreviewRequested = true;
	
	attemptUpdatePreview();
}

// On submit button pressed, generate gif
function attemptGenerateAnimation()
{
	if (generateAnimationRequested == true)
	{
		if (isPageFullyLoaded())
		{
			generateAnimationRequested = false;
			
			generateAnimation(false);
		}
	}
}

function onGenerateButtonClicked()
{
	generateAnimationRequested = true;
	
	attemptGenerateAnimation();
}

function onDownloadButtonClicked()
{
	if (isPageFullyLoaded() && (encoder != null))
	{
		encoder.download(lastGeneratedFileName);
	}
}

function generateAnimation(previewOnly)
{
	var spriteWidth = 70;
	var spriteHeight = 50;
	var numFrames = 16;
	var signText = textBox.value;
	
	// Text colour array
	var textColours = ['rgba(56, 0, 0, 1.0)', 'rgba(90, 8, 15, 1.0)', 'rgba(181, 41, 57, 1.0)', 'rgba(255, 108, 148, 1.0)',
						'rgba(255, 171, 224, 1.0)', 'rgba(255, 197, 255, 1.0)', 'rgba(255, 171, 224, 1.0)', 'rgba(254, 108, 148, 1.0)',
						'rgba(181, 41, 57, 1.0)', 'rgba(90, 8, 15, 1.0)', 'rgba(56, 0, 0, 1.0)', 'rgba(90, 8, 15, 1.0)',
						'rgba(181, 41, 57, 1.0)', 'rgba(254, 108, 148, 1.0)', 'rgba(255, 171, 224, 1.0)', 'rgba(255, 197, 255, 1.0)'];
						
	var textVSkew = [0.028, 0.024, 0.02, 0.016,
						0.012, 0.008, 0.004, 0.0,
						0.0, -0.004, -0.008, -0.012,
						-0.016, -0.02, -0.024, -0.028];
	
	var textHScale = horizontalScale.value;
	
	var previewContext = previewCanvas.getContext('2d');
	
	previewContext.fillStyle = 'rgba(0, 0, 0, 1.0)';
	previewContext.fillRect(0, 0, previewCanvas.width, previewCanvas.height); // GIF doesn't support a transparent background
	
	previewContext.font = 'bold 14px ReverseFont';
	previewContext.fillStyle = 'rgba(255, 107, 140, 1.0)';
	previewContext.textAlign = 'center';
	previewContext.textBaseline = 'middle';
	
	// shadow settings
	previewContext.shadowOffsetY = 0;
	previewContext.shadowOffsetX = 0;
	
	if (previewOnly == false)
	{
		encoder = new GIFEncoder();
		
		encoder.setQuality(1);	// Maximum Quality to preserve original colours
		encoder.setRepeat(0);	// loop forever
		encoder.setDelay(50);	// One frame every n milliseconds
		encoder.setComment("Created with LakiTool (https://github.com/BufoBufoGames/LakiTool) by BufoBufo (https://bufobufogames.itch.io/)")
		
		encoder.start();
		
		let storedTransform = previewContext.getTransform();
		
		// Frames 0-15
		for (let frameNo = 0; frameNo < numFrames; frameNo++)
		{
			previewContext.fillStyle = 'rgba(0, 0, 0, 1.0)';
			previewContext.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
			
			// Draw the sprite for this frame
			previewContext.drawImage(tileset, ((frameNo % 4) * spriteWidth), (Math.floor(frameNo / 4) * spriteHeight), spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);
			
			storedTransform = previewContext.getTransform();
			
			// H-scale, V-skew, H-skew, V-scale, H-translation, V-translation
			previewContext.setTransform(textHScale, textVSkew[frameNo], 0, 1.2, 35, 40);
			
			// Add user defined text
			previewContext.fillStyle = textColours[frameNo];
			previewContext.shadowColor = textColours[frameNo];
			previewContext.shadowBlur = 2;
			previewContext.fillText(signText, 0, 0);
			previewContext.shadowBlur = 0;
			
			previewContext.setTransform(storedTransform);
			
			// Add frame to the gif
			encoder.addFrame(previewContext);
		}
		
		// Frames 16-29 (reverse anim back to start)
		for (let frameNo = 14; frameNo > 0; frameNo--)
		{
			previewContext.fillStyle = 'rgba(0, 0, 0, 1.0)';
			previewContext.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
			
			// Draw the sprite for this frame
			previewContext.drawImage(tileset, ((frameNo % 4) * spriteWidth), (Math.floor(frameNo / 4) * spriteHeight), spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);
			
			storedTransform = previewContext.getTransform();
			
			// H-scale, V-skew, H-skew, V-scale, H-translation, V-translation
			previewContext.setTransform(textHScale, textVSkew[frameNo], 0, 1.2, 35, 40);
			
			// Add user defined text
			previewContext.fillStyle = textColours[frameNo];
			previewContext.shadowColor = textColours[frameNo];
			previewContext.shadowBlur = 2;
			previewContext.fillText(signText, 0, 0);
			previewContext.shadowBlur = 0;
			
			previewContext.setTransform(storedTransform);
			
			// Add frame to the gif
			encoder.addFrame(previewContext);
		}
		
		encoder.finish();
		
		var binary_gif = encoder.stream().getData();
		var data_url = 'data:image/gif;base64,'+ btoa(binary_gif);
		
		displayImage.src = data_url;
		
		lastGeneratedFileName = 'lakitu_' + signText + '.gif';
	}
	
	// Draw the first image again so there is somthing left on the canvas
	previewContext.drawImage(tileset, 0, 0, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);
	
	let storedTransform = previewContext.getTransform();
	
	// H-scale, V-skew, H-skew, V-scale, H-translation, V-translation
	previewContext.setTransform(textHScale, textVSkew[5], 0, 1.2, 35, 40);
	
	// Add user defined text
	previewContext.fillStyle = textColours[5];
	previewContext.shadowColor = textColours[5];
	previewContext.shadowBlur = 2;
	previewContext.fillText(signText, 0, 0);
	previewContext.shadowBlur = 0;
	
	previewContext.setTransform(storedTransform);
}
