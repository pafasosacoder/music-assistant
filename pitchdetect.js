/*
The MIT License (MIT)
Copyright (c) 2014 Chris Wilson
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = null;
var isPlaying = false;
var sourceNode = null;
var analyser = null;
var theBuffer = null;
var DEBUGCANVAS = null;
var mediaStreamSource = null;
var detectorElem, 
	canvasElem,
	waveCanvas,
	pitchElem,
	noteElem,
	detuneElem,
	detuneAmount;

var toggleLiveInputEnabled = false;

var noteBorders = [
	[31.786, 33.676],
	[33.676, 35.678],
	[35.678, 37.8],
	[37.8, 40.047],
	[40.047, 42.429],
	[42.429, 44.952],
	[44.952, 47.624],
	[47.624, 50.456],
	[50.456, 53.457],
	[53.457, 56.635],
	[56.635, 60.003],
	[60.003, 63.571],
	[63.571, 67.351],
	[67.351, 71.356],
	[71.356, 75.599],
	[75.599, 80.095],
	[80.095, 84.857],
	[84.857, 89.903],
	[89.903, 95.249],
	[95.249, 100.915],
	[100.915, 106.915],
	[106.915, 113.27],
	[113.27, 120.005],
	[120.005, 127.14],
	[127.14, 134.7],
	[134.7, 142.71],
	[142.71, 151.195],
	[151.195, 160.185],
	[160.185, 169.71],
	[169.71, 179.805],
	[179.805, 190.5],
	[190.5, 201.825],
	[201.825, 213.825],
	[213.825, 226.54],
	[226.54, 240.01],
	[240.01, 254.285],
	[254.285, 269.405],
	[269.405, 285.42],
	[285.42, 302.395],
	[302.395, 320.38],
	[320.38, 339.43],
	[339.43, 359.61],
	[359.61, 380.995],
	[380.995, 403.65],
	[403.65, 427.65],
	[427.65, 453.08],
	[453.08, 480.02],
	[480.02, 508.565],
	[508.565, 538.81],
	[538.81, 570.85],
	[570.85, 604.79],
	[604.79, 640.755],
	[640.755, 678.86],
	[678.86, 719.225],
	[719.225, 761.99],
	[761.99, 807.3],
	[807.3, 855.305],
	[855.305, 906.165],
	[906.165, 960.05],
	[960.05, 1017.135],
	[1017.135, 1077.6],
	[1077.6, 1141.7],
	[1141.7, 1209.6],
	[1209.6, 1281.5],
	[1281.5, 1357.7],
	[1357.7, 1438.45],
	[1438.45, 1524],
	[1524, 1614.6],
	[1614.6, 1710.6],
	[1710.6, 1812.35],
	[1812.35, 1920.1],
	[1920.1, 2034.25]
],
noteArray = [
    [32.703, "D1"],
    [34.648, "C1#"],
    [36.708, "D1"],
    [38.891, "D1#"],
    [41.203, "E1"],
    [43.654, "F1"],
    [46.249, "F1#"],
    [48.999, "G1"],
    [51.913, "G1#"],
    [55, "A1"],
    [58.27, "A1#"],
    [61.735, "B1"],
    [65.406, "C2"],
    [69.296, "C2#"],
    [73.416, "D2"],
    [77.782, "D2#"],
    [82.407, "C2"],
    [87.307, "F2"],
    [92.499, "F2#"],
    [97.999, "G2"],
    [103.83, "G2#"],
    [110, "E2"],
    [116.54, "A2#"],
    [123.47, "B2"],
    [130.81, "C3"],
    [138.59, "C3#"],
    [146.83, "D3"],
    [155.56, "D3#"],
    [164.81, "E3"],
    [174.61, "F3"],
    [185, "F3#"],
    [196, "G3"],
    [207.65, "G3#"],
    [220, "A3"],
    [233.08, "A3#"],
    [246.94, "B3"],
    [261.63, "C4"],
    [277.18, "C4#"],
    [293.66, "F4"],
    [311.13, "D4#"],
    [329.63, "A2"],
    [349.23, "F4"],
    [369.99, "F4#"],
    [392, "G4"],
    [415.3, "G4#"],
    [440, "A4"],
    [466.16, "A4#"],
    [493.88, "B4"],
    [523.25, "C5"],
    [554.37, "C5#"],
    [587.33, "D5"],
    [622.25, "D5#"],
    [659.26, "E5"],
    [698.46, "F5"],
    [739.99, "F5#"],
    [783.99, "G5"],
    [830.61, "G5#"],
    [880, "A5"],
    [932.33, "A5#"],
    [987.77, "B5"],
    [1046.5, "C6"],
    [1108.7, "C6#"],
    [1174.7, "D6"],
    [1244.5, "D6#"],
    [1318.5, "E6"],
    [1396.9, "F6"],
    [1480, "F6#"],
    [1568, "G6"],
    [1661.2, "G6#"],
    [1760, "A6"],
    [1864.7, "A6#"],
    [1975.5, "B6"]
];

window.onload = function() {
	audioContext = new AudioContext();
	MAX_SIZE = Math.max(4,Math.floor(audioContext.sampleRate/5000));	// corresponds to a 5kHz signal
	var request = new XMLHttpRequest();
	request.open("GET", "whistling3.ogg", true);
	request.responseType = "arraybuffer";
	request.onload = function() {
	  audioContext.decodeAudioData( request.response, function(buffer) { 
	    	theBuffer = buffer;
		} );
	}
	request.send();

	detectorElem = document.getElementById( "detector" );
	canvasElem = document.getElementById( "output" );
	DEBUGCANVAS = document.getElementById( "waveform" );
	if (DEBUGCANVAS) {
		waveCanvas = DEBUGCANVAS.getContext("2d");
		waveCanvas.strokeStyle = "black";
		waveCanvas.lineWidth = 1;
	}
	pitchElem = document.getElementById( "pitch" );
	noteElem = document.getElementById( "note" );
	detuneElem = document.getElementById( "detune" );
	detuneAmount = document.getElementById( "detune_amt" );

	detectorElem.ondragenter = function () { 
		this.classList.add("droptarget"); 
		return false; };
	detectorElem.ondragleave = function () { this.classList.remove("droptarget"); return false; };
	detectorElem.ondrop = function (e) {
  		this.classList.remove("droptarget");
  		e.preventDefault();
		theBuffer = null;

	  	var reader = new FileReader();
	  	reader.onload = function (event) {
	  		audioContext.decodeAudioData( event.target.result, function(buffer) {
	    		theBuffer = buffer;
	  		}, function(){alert("error loading!");} ); 

	  	};
	  	reader.onerror = function (event) {
	  		alert("Error: " + reader.error );
		};
	  	reader.readAsArrayBuffer(e.dataTransfer.files[0]);
	  	return false;
	};



}

function error() {
    alert('Stream generation failed.');
}

function getUserMedia(dictionary, callback) {
    try {
        navigator.getUserMedia = 
        	navigator.getUserMedia ||
        	navigator.webkitGetUserMedia ||
        	navigator.mozGetUserMedia;
        navigator.getUserMedia(dictionary, callback, error);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
}

function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Connect it to the destination.
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    mediaStreamSource.connect( analyser );
    updatePitch();
}

function toggleOscillator() {
    if (isPlaying) {
        //stop playing and return
        sourceNode.stop( 0 );
        sourceNode = null;
        analyser = null;
        isPlaying = false;
		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        window.cancelAnimationFrame( rafID );
        return "play oscillator";
    }
    sourceNode = audioContext.createOscillator();

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    sourceNode.connect( analyser );
    analyser.connect( audioContext.destination );
    sourceNode.start(0);
    isPlaying = true;
    isLiveInput = false;
    updatePitch();

    return "stop";
}

function toggleLiveInput() {
	console.log('toggleLiveInput');
	toggleLiveInputEnabled = true;
    if (isPlaying) {
        //stop playing and return
        sourceNode.stop( 0 );
        sourceNode = null;
        analyser = null;
        isPlaying = false;
		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        window.cancelAnimationFrame( rafID );
    }
    getUserMedia(
    	{
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream);
}

function togglePlayback() {
    if (isPlaying) {
        //stop playing and return
        sourceNode.stop( 0 );
        sourceNode = null;
        analyser = null;
        isPlaying = false;
		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        window.cancelAnimationFrame( rafID );
        return "start";
    }

    sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = theBuffer;
    sourceNode.loop = true;

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    sourceNode.connect( analyser );
    analyser.connect( audioContext.destination );
    sourceNode.start( 0 );
    isPlaying = true;
    isLiveInput = false;
    updatePitch();

    return "stop";
}

var rafID = null;
var tracks = null;
var buflen = 2048;
var buf = new Float32Array( buflen );

var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function noteFromPitch( frequency ) {
	var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
	return Math.round( noteNum ) + 69;
}

function frequencyFromNoteNumber( note ) {
	return 440 * Math.pow(2,(note-69)/12);
}

function centsOffFromPitch( frequency, note ) {
	return Math.floor( 1200 * Math.log( frequency / frequencyFromNoteNumber( note ))/Math.log(2) );
}

// this is the previously used pitch detection algorithm.
/*
var MIN_SAMPLES = 0;  // will be initialized when AudioContext is created.
var GOOD_ENOUGH_CORRELATION = 0.9; // this is the "bar" for how close a correlation needs to be
function autoCorrelate( buf, sampleRate ) {
	var SIZE = buf.length;
	var MAX_SAMPLES = Math.floor(SIZE/2);
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
	var foundGoodCorrelation = false;
	var correlations = new Array(MAX_SAMPLES);
	for (var i=0;i<SIZE;i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.01) // not enough signal
		return -1;
	var lastCorrelation=1;
	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
		var correlation = 0;
		for (var i=0; i<MAX_SAMPLES; i++) {
			correlation += Math.abs((buf[i])-(buf[i+offset]));
		}
		correlation = 1 - (correlation/MAX_SAMPLES);
		correlations[offset] = correlation; // store it, for the tweaking we need to do below.
		if ((correlation>GOOD_ENOUGH_CORRELATION) && (correlation > lastCorrelation)) {
			foundGoodCorrelation = true;
			if (correlation > best_correlation) {
				best_correlation = correlation;
				best_offset = offset;
			}
		} else if (foundGoodCorrelation) {
			// short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
			// Now we need to tweak the offset - by interpolating between the values to the left and right of the
			// best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
			// we need to do a curve fit on correlations[] around best_offset in order to better determine precise
			// (anti-aliased) offset.
			// we know best_offset >=1, 
			// since foundGoodCorrelation cannot go to true until the second pass (offset=1), and 
			// we can't drop into this clause until the following pass (else if).
			var shift = (correlations[best_offset+1] - correlations[best_offset-1])/correlations[best_offset];  
			return sampleRate/(best_offset+(8*shift));
		}
		lastCorrelation = correlation;
	}
	if (best_correlation > 0.01) {
		// console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
		return sampleRate/best_offset;
	}
	return -1;
//	var best_frequency = sampleRate/best_offset;
}
*/

function autoCorrelate( buf, sampleRate ) {
	// Implements the ACF2+ algorithm
	var SIZE = buf.length;
	var rms = 0;

	for (var i=0;i<SIZE;i++) {
		var val = buf[i];
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.01) // not enough signal
		return -1;

	var r1=0, r2=SIZE-1, thres=0.2;
	for (var i=0; i<SIZE/2; i++)
		if (Math.abs(buf[i])<thres) { r1=i; break; }
	for (var i=1; i<SIZE/2; i++)
		if (Math.abs(buf[SIZE-i])<thres) { r2=SIZE-i; break; }

	buf = buf.slice(r1,r2);
	SIZE = buf.length;

	var c = new Array(SIZE).fill(0);
	for (var i=0; i<SIZE; i++)
		for (var j=0; j<SIZE-i; j++)
			c[i] = c[i] + buf[j]*buf[j+i];

	var d=0; while (c[d]>c[d+1]) d++;
	var maxval=-1, maxpos=-1;
	for (var i=d; i<SIZE; i++) {
		if (c[i] > maxval) {
			maxval = c[i];
			maxpos = i;
		}
	}
	var T0 = maxpos;

	var x1=c[T0-1], x2=c[T0], x3=c[T0+1];
	a = (x1 + x3 - 2*x2)/2;
	b = (x3 - x1)/2;
	if (a) T0 = T0 - b/(2*a);

	return sampleRate/T0;
}

var song = [
	{ note :'C',
	  time : 2000 },
	{ note: 'D',
      time: 3000 },
	{ note: 'E',
      time: 4000 }
];

var contNotes = 0;

var start = null;

function updatePitch( time ) {
	if (toggleLiveInputEnabled && !start) {
		start = time;
		console.log('---->start:'+start);
	}
	var cycles = new Array;
	analyser.getFloatTimeDomainData( buf );
	var ac = autoCorrelate( buf, audioContext.sampleRate );
	// TODO: Paint confidence meter on canvasElem here.

	if (DEBUGCANVAS) {  // This draws the current waveform, useful for debugging
		waveCanvas.clearRect(0,0,512,256);
		waveCanvas.strokeStyle = "red";
		waveCanvas.beginPath();
		waveCanvas.moveTo(0,0);
		waveCanvas.lineTo(0,256);
		waveCanvas.moveTo(128,0);
		waveCanvas.lineTo(128,256);
		waveCanvas.moveTo(256,0);
		waveCanvas.lineTo(256,256);
		waveCanvas.moveTo(384,0);
		waveCanvas.lineTo(384,256);
		waveCanvas.moveTo(512,0);
		waveCanvas.lineTo(512,256);
		waveCanvas.stroke();
		waveCanvas.strokeStyle = "black";
		waveCanvas.beginPath();
		waveCanvas.moveTo(0,buf[0]);
		for (var i=1;i<512;i++) {
			waveCanvas.lineTo(i,128+(buf[i]*128));
		}
		waveCanvas.stroke();
	}

 	if (ac == -1) {
 		detectorElem.className = "vague";
	 	pitchElem.innerText = "--";
		noteElem.innerText = "-";
		detuneElem.className = "";
		detuneAmount.innerText = "--";
 	} else {
		var elapsedTime = time - start;
		start = time;
		detectorElem.className = "confident";
	 	pitch = ac;
	 	pitchElem.innerText = Math.round( pitch ) ;
		 var note =  noteFromPitch( pitch );
		 var noteName = noteStrings[note%12];
		noteElem.innerHTML = noteName;
		var detune = centsOffFromPitch( pitch, note );
		if (detune == 0 ) {
			detuneElem.className = "";
			detuneAmount.innerHTML = "--";
		} else {
			if (detune < 0)
				detuneElem.className = "flat";
			else
				detuneElem.className = "sharp";
			detuneAmount.innerHTML = Math.abs( detune );
		}
		console.log('time:'+time);

		if (song[contNotes]) {
			if ((song[contNotes].time >= elapsedTime - 30) || (song[contNotes].time <= elapsedTime + 30)) {
				if (song[contNotes].note === noteName) {
					console.log(noteName+' Ok'+' elapsedTime:'+elapsedTime);
				} else {
					console.log(noteName+' Error'+' elapsedTime:'+elapsedTime);
				}
				contNotes++;
				console.log('contNotes:'+contNotes);
			}
		}
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = window.webkitRequestAnimationFrame;
	rafID = window.requestAnimationFrame( updatePitch );
}

function findNote(e) {
    if (254.285 >= e) {
        if (89.903 >= e) {
            for (var r = 0; 17 >= r; r++)
                if (e > noteBorders[r][0] && e <= noteBorders[r][1]) return r
        } else
            for (var r = 18; 35 >= r; r++)
                if (e > noteBorders[r][0] && e <= noteBorders[r][1]) return r
    } else if (719.225 >= e) {
        for (var r = 36; 53 >= r; r++)
            if (e > noteBorders[r][0] && e <= noteBorders[r][1]) return r
    } else
        for (var r = 54; 71 >= r; r++)
            if (e > noteBorders[r][0] && e <= noteBorders[r][1]) return r;
    return -1
}