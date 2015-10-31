/*globals VolumeRenderer, d3, console*/

var renderer,
	color1,
	color2,
    allHistograms = {};

	
function color2rgb(color)
{
	var r = parseInt(color.substr(1, 2), 16);
	var g = parseInt(color.substr(3, 2), 16);
	var b = parseInt(color.substr(5, 2), 16);
	return new Array(r, g, b);
}

function rgb2color(rgb)
{
 var s = "#";
	 for (var i = 0; i <3; i++)
	 {
		  var c = Math.round(rgb[i]).toString(16);
		  if (c.length == 1)
			c = '0' + c;
		  s += c;
	 }
 return s.toUpperCase();
}


function getGradientList( Gradient_result, colorA , colorB, noOfSteps)
{
	var Gradient = new Array(3);
	for (var N = 0; N < noOfSteps; N++)
	{
		for (var c = 0; c <3; c++) // RGB channels were calculated
		{
			Gradient[c] = colorA[c] + (colorB[c]-colorA[c]) / 255 * N;
		}	
		Gradient_result.push(rgb2color(Gradient));
	}
	return Gradient_result;
}

function Calculategradient(ColorA, ColorB,  ColorC, ratioA, ratioB, ratioC)
{
	var Gradient_result = [];
	var noofSteps = 255;
	
	
	var Color1 = [	Math.round(ColorA.rgb[0]*255),
				Math.round(ColorA.rgb[1]*255),
				Math.round(ColorA.rgb[2]*255) ];
	
	var Color2 = [	Math.round(ColorB.rgb[0]*255),
				Math.round(ColorB.rgb[1]*255),
				Math.round(ColorB.rgb[2]*255) ];
	
	var Color3 = [	Math.round(ColorC.rgb[0]*255),
				Math.round(ColorC.rgb[1]*255),
				Math.round(ColorC.rgb[2]*255) ];
	
	var stepsChannel1 = Math.round((ratioA)/(ratioA + ratioB + ratioC) * noofSteps);
	var stepsChannel2 = Math.round((ratioB)/(ratioA + ratioB + ratioC) * noofSteps);
	var stepsChannel3 = Math.round((ratioC)/(ratioA + ratioB + ratioC) * noofSteps);
	
	
	var TotalnoofSteps = stepsChannel1 + stepsChannel2 + stepsChannel3; 
	
	if(TotalnoofSteps < 256)
	{
		stepsChannel3 = stepsChannel3 + (256 - TotalnoofSteps); // To make sure we get total 0-255 different steps
	}
	Gradient_result =  getGradientList( Gradient_result, Color1 , Color2, stepsChannel1);
	Gradient_result =  getGradientList( Gradient_result, Color2 , Color3, stepsChannel2);
	Gradient_result =  getGradientList( Gradient_result, Color3 , Color1, stepsChannel3);
	
	return Gradient_result;
}
 
function callUpdateTransferFunction(color1,color2,color3,ratio1,ratio2,ratio3){
	
	this.color = Calculategradient (color1,color2,color3,ratio1,ratio2,ratio3);
	
	
	updateTransferFunction(this.color);
}

//Refer: http://www.javascripter.net/faq/hextorgb.htm
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}

function updateTransferFunction(colors) {
	
var index = 0;

renderer.updateTransferFunction(function (value) {
        // ******* Your solution here! *******
        
        // Given a voxel value in the range [0.0, 1.0],
        // return a (probably somewhat transparent) color
		var str = 'rgba('+ (hexToR(colors[index%255])) + ',' + (hexToG(colors[index%255])) + ',' + (hexToB(colors[index%255])) + ',' + value + ')';		
		index++;
		return str;
    });
}

function setup() {
    d3.select('#volumeMenu').on('change', function () {
        renderer.switchVolume(this.value);        
    });    
}

/*

You shouldn't need to edit any code beyond this point
(though, as this assignment is more open-ended, you are
welcome to edit as you see fit)

*/


function getHistogram(volumeName, binSize) {
    /*
    This function resamples the histogram
    and returns bins from 0.0 to 1.0 with
    the appropriate counts
    (binSize should be between 0.0 and 1.0)
    
    */
    
    var steps = 256,    // the original histograms ranges from 0-255, not 0.0-1.0
        result = [],
        thisBin,
        i = 0.0,
        j,
        nextBin;
    while (i < 1.0) {
        thisBin = {
            count : 0,
            lowBound : i,
            highBound : i + binSize
        };
        j = Math.floor(i * steps);
        nextBin = Math.floor((i + binSize) * steps);
        while (j < nextBin && j < steps) {
            thisBin.count += Number(allHistograms[volumeName][j].count);
            j += 1;
        }
        i += binSize;
        result.push(thisBin);
    }
    return result;
}

/*
Program execution starts here:

We create a VolumeRenderer once we've loaded all the csv files,
and VolumeRenderer calls setup() once it has finished loading
its volumes and shader code

*/

var loadedHistograms = 0,
    volumeName,
    histogramsToLoad = {
        'bonsai' : 'volumes/bonsai.histogram.csv',
        'foot' : 'volumes/foot.histogram.csv',
        'teapot' : 'volumes/teapot.histogram.csv'
    };

function generateCollector(name) {
    /*
    This may seem like an odd pattern; why are we generating a function instead of
    doing this inline?
    
    The trick is that the "volumeName" variable in the for loop below changes, but the callbacks
    are asynchronous; by the time any of the files are loaded, "volumeName" will always refer
    to "teapot"**. By generating a function this way, we are storing "volumeName" at the time that
    the call is issued in "name".
    
    ** This is yet ANOTHER javascript quirk: technically, the order that javascript iterates
    over an object's properties is arbitrary (you wouldn't want to rely on the last value
    actually being "teapot"), though in practice most browsers iterate in the order that
    properties were originally assigned.
    
    */
    return function (error, data) {
        if (error) {
            throw new Error("Encountered a problem loading the histograms!");
        }
        allHistograms[name] = data;
        loadedHistograms += 1;
        if (loadedHistograms === Object.keys(histogramsToLoad).length) {
            renderer = new VolumeRenderer('renderContainer', {
                'bonsai': 'volumes/bonsai.raw.png',
                'foot': 'volumes/foot.raw.png',
                'teapot': 'volumes/teapot.raw.png'
            }, setup);
        }
    };
}

for(volumeName in histogramsToLoad) {
    if (histogramsToLoad.hasOwnProperty(volumeName)) {
        d3.csv(histogramsToLoad[volumeName], generateCollector(volumeName));
    }
}




