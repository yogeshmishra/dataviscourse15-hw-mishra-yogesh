/*globals d3, topojson, document*/
// These are helpers for those using JSHint
//Discussed with Sunny Hardasani and Murali Teja
var data,
    locationData,
    teamSchedules,
    selectedSeries,
    colorScale;


/* EVENT RESPONSE FUNCTIONS */

function setHover(d) {
    // There are FOUR data_types that can be hovered;
    // nothing (null), a single Game, a Team, or
    // a Location
   var displayitem = "";
   if(d == null) 
	{
		displayitem = "";
	}
	else{ 
	
	if(d.data_type == "Game")
	{
		displayitem = d["Visit Team Name"] + "@" + d["Home Team Name"];
	}
	else if(d.data_type == "Team")
	{
		displayitem = d["name"];
	}
	else if (d.data_type == "Location") 
	{
		var games = d["games"];
		console.log("games length", games.length);
		if(games.length > 0)
		{
			displayitem = displayitem + games[0]["Visit Team Name"] + "@" + games[0]["Home Team Name"];
		
			for(var j = 1; j < games.length; j++)
			{	    	
				displayitem =  displayitem + ", ";    		
    			displayitem = displayitem + games[j]["Visit Team Name"] + "@" + games[j]["Home Team Name"];
    		}
    	}
    	else {
    	displayitem = "";
		}
	}
	   // ******* TODO: PART V *******
	}
	document.getElementById("info").innerHTML = displayitem;
}

function clearHover() {
    setHover(null);
}

function changeSelection(d) {
    // There are FOUR data_types that can be selected;
    // an empty selection (null), a single Game,
    // a Team, or a Location.
	
    // ******* TODO: PART V *******
   if(d.data_type == "Game")
	{
		selectedSeries = [d];
		updateBarChart();
		updateForceDirectedGraph();
		updateMap();
	}
	else if(d.data_type == "Team")
	{
		selectedSeries = teamSchedules[d.name];
		updateBarChart();
		updateForceDirectedGraph();
		updateMap();
		
	}
	else if (d.data_type == "Location") 
	{
    // Update everything that is data-dependent
    // Note that updateBarChart() needs to come first
    // so that the color scale is set
    	selectedSeries = d["games"];
		updateBarChart();
		updateForceDirectedGraph();
		updateMap();
	}
	else if (d.data_type == null) 
	{
	}
}
/* DRAWING FUNCTIONS */

function updateBarChart() {
	 //Code inspired from the lecture site	 
	 //http://dataviscourse.net/2015/lectures/lecture-advanced-d3/
    var svgBounds = document.getElementById("barChart").getBoundingClientRect(),
        xAxisSize = 100,
        yAxisSize = 60;
    var margin = {top: 40, right: 30, bottom: 40, left: 40};
    var width = svgBounds.width - margin.left - margin.right;
    var height = svgBounds.height - margin.top - margin.bottom;
    var max =90000;
    var textWidth = 60;
    // ******* TODO: PART I *******

    // Create the x and y scales; make
    // sure to leave room for the axes
    var xScale = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0.05);

    xScale.domain(selectedSeries.map(function (d) {
        return d["Date"];
    }));

    var yScale = d3.scale.linear()
        .domain([0, max])
        .range([height , 0])
        .nice();

    var xAxis = d3.svg.axis();
    xAxis.scale(xScale);
    xAxis.orient("bottom").tickFormat('');


    var svgxAxis = d3.select("#xAxis")
        .attr("transform", "translate(" + textWidth + "," + (10 + height)  + ")")
        .call(xAxis);


    var min = d3.min(selectedSeries, function(d) { return d.attendance;});

 
	    colorScale = d3.scale.linear()
        .domain([10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000])
        .range(colorbrewer.Greens[9]);


    var yAxis = d3.svg.axis();
    yAxis.scale(yScale);
    yAxis.orient("left");
    var svgyAxis = d3.select("#yAxis")
        .attr("transform", "translate(" + textWidth + "," + 10 + ")")
        .call(yAxis);



    // Create colorScale (note that colorScale
    // is global! Other functions will refer to it)

    // Create the axes (hint: use #xAxis and #yAxis)

    // Create the bars (hint: use #bars)
    var barGroupsEnter = d3.select("#bars");
    barGroupsEnter.attr("transform", "translate(" + textWidth + "," + 10 + ")");

    var rectangle = barGroupsEnter.selectAll("rect").data(selectedSeries);
    var scales =  barGroupsEnter.selectAll("text").data(selectedSeries);
    scales
        .enter()
        .append("text").text(function (d) {
            console.log("datetime", d.Date);
            return d.Date;
        })
        .attr("x", function(d,i){
            return xScale(d.Date) + (xScale.rangeBand())/2 ;
        })
        // dy is a shift along the y axis
        .attr("dy", height + 5)
        // align it to the right
        .attr("text-anchor", "end")
        // center it
        .attr("alignment-baseline", "middle")
        .attr("transform", function(d ,i){
            return "rotate(-90," + (xScale(d.Date) + xScale.rangeBand()/2) + ",425)" ;
        });

    scales
        .text(function (d) {
            console.log("datetime", d.Date);
            return d.Date;
        })
        .attr("x", function(d,i){
            return xScale(d.Date) + (xScale.rangeBand())/2 ;
        })
        // dy is a shift along the y axis
        .attr("dy", height + 5)
        // align it to the right
        .attr("text-anchor", "end")
        // center it
        .attr("alignment-baseline", "middle")
        .attr("transform", function(d ,i){
            return "rotate(-90," + (xScale(d.Date) + xScale.rangeBand()/2) + ",425)" ;
        });

    scales
        .exit()
        .remove();
    // //Bar chart of rectangle

    rectangle
        .enter()
        .append("rect")
        .attr("x", function(d , i){
            // console.log(xScale(i));
            return xScale(d.Date);
        })
        .attr("y", function(d , i){
            // console.log(d.attendance);
            return  yScale(d.attendance);
        })
        .attr("width", xScale.rangeBand)
        .attr("height", function(d , i){
            return  height - yScale(d.attendance);
        })
        .attr("fill", function(d , i){
        		
            return  colorScale(d.attendance);
        })
        .on('click', function(d,i){  changeSelection(d);  })
  		  .on('mouseover', function(d,i){  setHover(d);  })
        .on('mouseout', function(d,i){  clearHover();  });

    rectangle
        .attr("x", function(d , i){
            // console.log(xScale(i));
            return xScale(d.Date);
        })
        .attr("y", function(d , i){
            // console.log(d.attendance);
            return  yScale(d.attendance);
        })
        .attr("width", xScale.rangeBand)
        .attr("height", function(d , i){
            return  height - yScale(d.attendance);
        })
        .attr("fill", function(d , i){
            return  colorScale(d.attendance);
        })
        .on('click', function(d,i){  changeSelection(d);  })
  		  .on('mouseover', function(d,i){  setHover(d);  })
        .on('mouseout', function(d,i){  clearHover();  });
        
        
    rectangle
        .exit()
        .remove();
    // Make the bars respond to hover and click events
}

function updateForceDirectedGraph() {
    // ******* TODO: PART II *******
    //Code inspired from the lecture site
	// http://dataviscourse.net/2015/lectures/lecture-d3-layouts-maps/
    var width = 427;
    var height = 500;
   var normalshapeSize = 50;
	var selectedShapeSize = 200;

    var force = d3.layout.force()
        // the strength of repulsion/attraction
        // the lower the value, the more repulsion
        // positive values attract each other
        .charge(-120)
        // the target distance between nodes
        .linkDistance(30)
        // how "sticky" things are - 1, no friction, 0 max friction
        .friction(0.9)
        // how strongly the nodes are pulled toward a gravity well (e.g., the center of the svg)
        .gravity(0.1)
        // tells the layout about the available space
        .size([width, height]);

    force
        // providing the layout with the nodes
        .nodes(data.vertices)
        // providing the layouts with the links
        .links(data.edges)
        // first computation
        .start();

    console.log(force.links());

    var svg = d3.select("#graph");

    var link = d3.select("#links");
    
	 var lines = link.selectAll("line").data(data.edges);
	 
    lines.enter()
        .append("line")
        .attr("class", "link");

    lines.attr("class", "link");


    var node = d3.select("#nodes");
    
	 var vertices =  node.selectAll("path").data(data.vertices);

    vertices.enter()
        .append("path")
        .attr("class", "node")
        .attr("d" , d3.svg.symbol().type(function(d){
        console.log("data_type == ", d.data_type);
        if(d.data_type == "Game")
        {
            return d3.svg.symbolTypes[0];
        }
        else
        {
            return d3.svg.symbolTypes[5];
        }}).size(function(d,i){
        if(d.data_type == "Game")
        {
            for( var j = 0; j < selectedSeries.length; j++) {
                if ((selectedSeries[j]._id == d._id)) {
                    return selectedShapeSize;
                }
            }
            return normalshapeSize;
        }
        else
        {
            return normalshapeSize;
        }}))
        .style("fill", function (d) {
            // color according to the group
            for( var j = 0; j < selectedSeries.length; j++) {
                if ((selectedSeries[j]._id == d._id)) {
                    return colorScale(d["attendance"]);
                }
            }
            return "blue";
        }).call(force.drag)
        .on('click', function(d,i){  changeSelection(d);  })
		  .on('mouseover', function(d,i){  setHover(d);  })
        .on('mouseout', function(d,i){  clearHover();  });


// changing size of the shapes :
//http://stackoverflow.com/questions/23224285/change-the-size-of-a-symbol-with-a-transition-in-d3-js  

    vertices.attr("d" , d3.svg.symbol().type(function(d){
        console.log("data_type == ", d.data_type);
        if(d.data_type == "Game")
        {
            return d3.svg.symbolTypes[0];
        }
        else
        {
            return d3.svg.symbolTypes[5];
        }}).size(function(d,i){
        if(d.data_type == "Game")
        {
            for( var j = 0; j < selectedSeries.length; j++) {
                if ((selectedSeries[j]._id == d._id)) {
                    return selectedShapeSize;
                }
            }
            return normalshapeSize;
        }
        else
        {
            return normalshapeSize;
        }}))
        .style("fill", function (d) {
            // color according to the group
            for( var j = 0; j < selectedSeries.length; j++) {
                if ((selectedSeries[j]._id == d._id)) {
                    return colorScale(d["attendance"]);
                }
            }
            return "blue";
        }).call(force.drag)
        .on('click', function(d,i){  changeSelection(d);  })
        .on('mouseover', function(d,i){  setHover(d);  })
        .on('mouseout', function(d,i){  clearHover();  });


    force.on("tick", function () {
        lines.attr("x1", function (d) {
            return d.source.x;
        })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        vertices.attr("transform", function (d) {
            return "translate(" + d.x + ", " + d.y + ")";
        });
    });

    // Update the links based on the current selection

    // Draw the nodes (hint: use #nodes), and make them respond to dragging

    // ******* TODO: PART IV *******

    // Make the nodes respond to hover and click events

    // ******* TODO: PART V *******

    // Color and size the Game nodes if they are in selectedSeries

    // ******* TODO: PART II *******

    // Finally, tell the layout engine how
    // to manipulate the nodes and links
    // that we've drawn
}

function updateMap() {
    // ******* TODO: PART III *******
	//http://stackoverflow.com/questions/20987535/plotting-points-on-a-map-with-d3
    var height = 900;
    var width  = 500;
    var svg = d3.select("#map");
    var latlong = d3.values(locationData);

    //Define map projection
    projection = d3.geo.albersUsa()
        .translate([height / 2 , width / 2])
        .scale([700]);
	
	var normalshapeSize = 3;
	var selectedShapeSize = 9;
	
	
	var gamePoints = d3.select("#points");
	
	var location = gamePoints.selectAll("circle").data(latlong);
	
 	location.enter()
 			.append("circle")
         .attr("transform", function(d) {
            return "translate(" + projection([d.longitude, d.latitude]) + ")"
          })
          .attr("r", function(d,i){
            for( var j = 0; j < selectedSeries.length; j++)
            {
               if((selectedSeries[j].latitude == d.latitude) && (selectedSeries[j].longitude == d.longitude))
                {
                    return selectedShapeSize;
                }
            }
            return normalshapeSize;
           })
        	  .style("fill", function(d, i){
            for( var j = 0; j < selectedSeries.length; j++)
            {
                if((selectedSeries[j].latitude == d.latitude) && (selectedSeries[j].longitude == d.longitude)) {
                    var avergaeAttendance = 0;
                    var games = d["games"];
                    for (var j = 0; j < games.length; j++) {
                        avergaeAttendance = avergaeAttendance + games[j].attendance;
                    }
                    avergaeAttendance = (avergaeAttendance / games.length);
                    return colorScale(avergaeAttendance);
                }
           	}
            return "blue";})
           .style("opacity", 0.8)
           .on('click', function(d,i){  changeSelection(d);  })
           .on('mouseover', function(d,i){  setHover(d);  })
           .on('mouseout', function(d,i){  clearHover();  });
           
     	location.attr("transform", function(d) {
            	return "translate(" + projection([d.longitude, d.latitude]) + ")"
            })
           .attr("r", function(d,i){
            for( var j = 0; j < selectedSeries.length; j++)
            {
                
                if((selectedSeries[j].latitude == d.latitude) && (selectedSeries[j].longitude == d.longitude))
                {
                    return selectedShapeSize;
                }
            }
            return normalshapeSize;
           })
            .style("fill", function(d, i){
                for( var j = 0; j < selectedSeries.length; j++)
                {
                    if((selectedSeries[j].latitude == d.latitude) && (selectedSeries[j].longitude == d.longitude)) {
                        var avergaeAttendance = 0;
                        var games = d["games"];
                        for (var j = 0; j < games.length; j++) {
                            avergaeAttendance = avergaeAttendance + games[j].attendance;
                        }
                        avergaeAttendance = (avergaeAttendance / games.length);
                        return colorScale(avergaeAttendance);
                    }
                }
                return "blue";})
           .style("opacity", 0.8)
           .on('click', function(d,i){  changeSelection(d);  })
           .on('mouseover', function(d,i){  setHover(d);  })
           .on('mouseout', function(d,i){  clearHover();  });

    // Code referenced from stack Overflow   http://stackoverflow.com/questions/20987535/plotting-points-on-a-map-with-d3

    // Draw the games on the map (hint: use #points)

    // NOTE: locationData is *NOT* a Javascript Array, like
    // we'd normally use for .data() ... instead, it's just an
    // object (often called an Associative Array)!

    // ******* TODO: PART V *******

    // Update the circle appearance (set the fill to the
    // mean attendance of all selected games... if there
}
    // are no matching games, revert to the circle's default style)

function drawStates(usStateData) {
    // ******* TODO: PART III *******
	//http://giscollective.org/d3-basemap-with-top/
    var height = 900;
    var width  = 500;
    var svg = d3.select("#map");


    //Define map projection
    projection = d3.geo.albersUsa()
        .translate([height / 2 , width/ 2])
        .scale([700]);
   
    //Define default path generator
    var path = d3.geo.path().projection(projection);
    svg.selectAll("#states")
        .datum(topojson.feature(usStateData,usStateData.objects.states))
        .attr("d", path)



}


/* DATA DERIVATION */

// You won't need to edit any of this code, but you
// definitely WILL need to read through it to
// understand how to do the assignment!

function dateComparator(a, b) {
    // Compare actual dates instead of strings!
    return Date.parse(a.Date) - Date.parse(b.Date);
}

function isObjectInArray(obj, array) {
    // With Javascript primitives (strings, numbers), you
    // can test its presence in an array with
    // array.indexOf(obj) !== -1

    // However, with actual objects, we need this
    // helper function:
    var i;
    for (i = 0; i < array.length; i += 1) {
        if (array[i] === obj) {
            return true;
        }
    }
    return false;
}

function deriveGraphData() {
    // Currently, each edge points to the "_id" attribute
    // of each node with "_outV" and "_inV" attributes.
    // d3.layout.force expects source and target attributes
    // that point to node index numbers.

    // This little snippet adds "source" and "target"
    // attributes to the edges:
    var indexLookup = {};
    data.vertices.forEach(function (d, i) {
        indexLookup[d._id] = i;
    });
    data.edges.forEach(function (d) {
        d.source = indexLookup[d._outV];
        d.target = indexLookup[d._inV];
    });
}

function deriveLocationData() {
    var key;

    // Obviously, lots of games are played in the same location...
    // ... but we only want one interaction target for each
    // location! In fact, when we select a location, we want to
    // know about ALL games that have been played there - which
    // is a different slice of data than what we were given. So
    // let's reshape it ourselves!

    // We're going to create a hash map, keyed by the
    // concatenated latitude / longitude strings of each game
    locationData = {};

    data.vertices.forEach(function (d) {
        // Only deal with games that have a location
        if (d.data_type === "Game" &&
            d.hasOwnProperty('latitude') &&
            d.hasOwnProperty('longitude')) {

            key = d.latitude + "," + d.longitude;

            // Each data item in our new set will be an object
            // with:

            // latitude and longitude properties,

            // a data_type property, similar to the ones in the
            // original dataset that you can use to identify
            // what type of selection the current selection is,

            // and a list of all the original game objects that
            // happened at this location

            if (!locationData.hasOwnProperty(key)) {
                locationData[key] = {
                    "latitude": d.latitude,
                    "longitude": d.longitude,
                    "data_type": "Location",
                    "games": []
                };
            }
            locationData[key].games.push(d);
        }
    });

    // Finally, let's sort each list of games by date
    for (key in locationData) {
        if (locationData.hasOwnProperty(key)) {
            locationData[key].games = locationData[key].games.sort(dateComparator);
        }
    }
}

function deriveTeamSchedules() {
    var teamName;

    // We're going to need a hash map, keyed by the
    // Name property of each team, containing a list
    // of all the games that team played, ordered by
    // date
    teamSchedules = {};

    // First pass: I'm going to sneakily iterate over
    // the *edges*... this will let me know which teams
    // are associated with which games
    data.edges.forEach(function (d) {
        // "source" always refers to a game; "target" always refers to a team
        teamName = data.vertices[d.target].name;
        if (!teamSchedules.hasOwnProperty(teamName)) {
            teamSchedules[teamName] = [];
        }
        teamSchedules[teamName].push(data.vertices[d.source]);
    });

    // Now that we've added all the game objects, we still need
    // to sort by date
    for (teamName in teamSchedules) {
        if (teamSchedules.hasOwnProperty(teamName)) {
            teamSchedules[teamName] = teamSchedules[teamName].sort(dateComparator);
        }
    }
}


/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

d3.json("data/us.json", function (error, usStateData) {
    if (error) throw error;

    drawStates(usStateData);
});
d3.json("data/pac12_2013.json", function (error, loadedData) {
    if (error) throw error;

    // Store the data in a global variable for all functions to access
    data = loadedData;

    // These functions help us get slices of the data in
    // different shapes
    deriveGraphData();
    deriveLocationData();
    deriveTeamSchedules();

    // Start off with Utah's games selected
    selectedSeries = teamSchedules["Washington"];

    // Draw everything for the first time
    updateBarChart();
    updateForceDirectedGraph();
    updateMap();


});
