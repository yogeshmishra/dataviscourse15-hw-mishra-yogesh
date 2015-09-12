/*globals alert, document, d3, console*/
// These keep JSHint quiet if you're using it (highly recommended!)

function staircase() {
    // ****** TODO: PART II ******
    alert("done loading the JS1");
    var svg_parentX = document.getElementById("BarChartX");
    var svg_kidsX = svg_parentX.childNodes;
    var noofRectangle = 0;
    for (var i=0, len=svg_kidsX.length;i<len;++i){
        var rect = svg_kidsX[i];
        if (rect.nodeType!=1) continue; // skip anything that isn't an element
        rect.setAttribute("height", ((noofRectangle*10) + 10).toString());
        noofRectangle++;
        }
    noofRectangle = 0;
    var svg_parentY = document.getElementById("#BarChartY");
    var svg_kidsY = svg_parentY.childNodes;
    for (var i=0, len=svg_kidsY.length;i<len;++i){
        var rect = svg_kidsY[i];
        if (rect.nodeType!=1) continue; // skip anything that isn't an element
        rect.setAttribute("height", ((noofRectangle*10) + 10).toString());
        noofRectangle++;
    }
}

function update(error, data) {
    if (error !== null) {
        alert("Couldn't load the dataset!");
    } else {
        // D3 loads all CSV data as strings;
        // while Javascript is pretty smart
        // about interpreting strings as
        // numbers when you do things like
        // multiplication, it will still
        // treat them as strings where it makes
        // sense (e.g. adding strings will
        // concatenate them, not add the values
        // together, or comparing strings
        // will do string comparison, not
        // numeric comparison).

        // We need to explicitly convert values
        // to numbers so that comparisons work
        // when we call d3.max()
        data.forEach(function (d) {
            d.a = parseInt(d.a);
            d.b = parseFloat(d.b);
        });
    }

    // Set up the scales
    var aScale = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.a;
        })])
        .range([0, 150]);
    var bScale = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.b;
        })])
        .range([0, 150]);

    var iScale = d3.scale.linear()
        .domain([0, data.length])
        .range([0, 110]);

    // ****** TODO: PART III (you will also edit in PART V) ******

    // TODO: Select and update the 'a' bar chart bars
    var svg = d3.select("#barChartX");
    var bars = svg.selectAll("rect").data(data);
    // the data binding

    bars.enter().append("rect")
        .attr("x", function(d , i){
            return iScale(i + 1)
        })
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 0)
        .attr("opacity", 0);



    bars.transition()
        .duration(3000)
        .attr("x", function(d , i){
            return iScale(i + 1)
        })
        .attr("y", 0)
        .attr("width",10)
        .attr("height", function(d , i) {
            return aScale(d.a)
        })
        .style("class", "barChart")
        .attr("opacity", 1);

    bars.exit()
        .attr("opacity", 1)
        .transition()
        .duration(3000)
        .attr("opacity", 0)
        .remove();


    // TODO: Select and update the 'b' bar chart bars
    var svgY = d3.select("#barChartY");
    // the data binding

    var barsY = svgY.selectAll("rect").data(data);
    barsY.enter().append("rect")
        .attr("x", function(d , i){
            return iScale(i + 1)
        })
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 0)
        .attr("opacity", 0);

    barsY.transition()
        .duration(3000)
        .attr("x", function(d , i){
            return iScale(i + 1)
        })
        .attr("y", 0)
        .attr("width",10)
        .attr("height", function(d , i) {
            return bScale(d.b)
        })
        .style("class", "barChart")
        .attr("opacity", 1);

    barsY.exit()
        .attr("opacity", 1)
        .transition()
        .duration(3000)
        .attr("opacity", 0)
        .remove();

    // TODO: Select and update the 'a' line chart path using this line generator
    var aLineGenerator = d3.svg.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return aScale(d.a);
        });

    var svgLine = d3.select("#lineX");
    alert("line2");
    var svgLineX = svgLine.selectAll("path");
    alert("line3");
    svgLineX.style("class", "lines")
        .attr("d", aLineGenerator(data));

    //var svgline = d3.select("#lineX");
    //svgline.append("path")
    //    .style("class", "lines")
    //    .attr("d", aLineGenerator(data));


    // TODO: Select and update the 'b' line chart path (create your own generator)

    // TODO: Select and update the 'a' area chart path using this line generator
    var aAreaGenerator = d3.svg.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return aScale(d.a);
        });

    // TODO: Select and update the 'b' area chart path (create your own generator)

    // TODO: Select and update the scatterplot points

    // ****** TODO: PART IV ******
}

function changeData() {
    // Load the file indicated by the select menu
    var dataFile = document.getElementById('dataset').value;
    d3.csv('data/' + dataFile + '.csv', update);
}

function randomSubset() {
    // Load the file indicated by the select menu,
    // and then slice out a random chunk before
    // passing the data to update()
    var dataFile = document.getElementById('dataset').value;
    d3.csv('data/' + dataFile + '.csv', function (error, data) {
        var subset = [];
        data.forEach(function (d) {
            if (Math.random() > 0.5) {
                subset.push(d);
            }
        });

        update(error, subset);
    });
}