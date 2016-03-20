// Basic dimensions

var margin = {top: 10,
        bottom: 50,
        left: 50,
        right: 10};

var heightMyCanvas = 650;
var widthMyCanvas = 1000;
var widthMyGraph = widthMyCanvas - margin.left - margin.right;
var heightMyGraph = heightMyCanvas - margin.top - margin.bottom;


var decimalFormatter = d3.format('0.2f');
var minimumTime = 121;

// The function that draws the graph

function drawGraph(myData){

    //Nesting the inputted data
    myNestedData = d3.nest()
                    .key(function (d) {
                        return d['Origin'];
                    })
                    .key(function (d) {
                        return d['name']
                    })
                    .rollup(function (leaves) {
                        var flights = leaves.length;
                        var airTime = d3.mean(leaves, function(d){
                            return d['AirTime'];
                        })
                        var distance = d3.mean(leaves, function(d){
                            return d['Distance'];
                            })
                        var speed = d3.mean(leaves, function(d){
                            if (d['AirTime'] > 0){
                            return (d['Distance'] / d['AirTime']) * 60;
                        }})
                        return {"flights": flights,
                        "airTime": airTime,
                        "distance": distance,
                        "speed": speed}
                    })
                    .entries(myData);
    
    myNestedData.sort(function (a,b) {
        return b.values[0].values.distance - a.values[0].values.distance;
    });

    // Convenience arrays for creating the x and y scales

    var flightCount = [];
    myNestedData.forEach(function(d){
        flightCount.push(d.values[0].values.flights);
    })


    var flightDistance = [];
    myNestedData.forEach(function (d) {
        if(d.values[0].values.airTime < minimumTime)
        flightDistance.push(d.values[0].values.distance);
    });

    var flightTime = [];
    myNestedData.forEach(function (d){
        if(d.values[0].values.airTime < minimumTime){
        flightTime.push(d.values[0].values.airTime);
    }})

    var flightSpeed = []
    myNestedData.forEach(function(d){
        flightSpeed.push(d.values[0].values.speed);
    })

    var averageSpeed = d3.mean(flightSpeed); //divide by 60 for speed per minute

    // Create x, y and color scales
    var xScale = d3.scale.linear()
                .domain([0, d3.max(flightDistance)])
                .range([0, widthMyGraph]);

    var yScale = d3.scale.linear()
                    .domain([0, d3.max(flightTime)])
                    .range([heightMyGraph, 0]);


    var myColors = d3.scale.linear()
                    .domain([d3.min(flightSpeed), d3.max(flightSpeed)])
                    .range(['red', 'white']);

    // Create a tooltip
    var tooltip = d3.select('body')
                        .append('div')
                        .style({"position":"absolute",
                                "padding":"0 10px",
                            "background":"Black",
                            "color":"White",
                        "opacity":0});

    // Drawing the canvas
    myCanvas = d3.select("#myCanvas")
                .append('svg')
                .attr('class', 'canvas')
                .style('background', 'AliceBlue')
                .attr('height', heightMyCanvas)
                .attr('width', widthMyCanvas);

    // Preparing to draw the graph
    myGraph = myCanvas.append('g')
                .attr('class', 'theGraphItself')
                .attr('transform', 'translate('
                +margin.left+
                ','
                +margin.top+
                ')')
                .attr('height', heightMyGraph)
                .attr('width', widthMyGraph)
                .append('g')
                .attr('class', 'theGraphData');

    // Drawing the graph
    myGraph.selectAll('circle')
            .data(myNestedData)
            .enter()
            .append('circle')
            .filter(function(d){
                return d.values[0].values.airTime < minimumTime;
            })
            .attr('cx', function(d){
                return xScale(d.values[0].values.distance);
            })
            .attr('cy', function(d){
                return yScale(d.values[0].values.airTime);
            })
            .attr('r', function(d){
                return 5;
                })
            .style('fill', function(d){
                return myColors(d.values[0].values.speed);
            })
            .attr('stroke', 'blue')
            .attr('strok-width', '1px')
            .on('mouseover', function(d){
                tooltip.transition()
                    .style('opacity', 0.9)
                    .style({'font-family': 'serif',
                            'font-style': 'italic'})
                tooltip.html(niceTooltip(d))
                    .style({"left":(d3.event.pageX)+'px',
                            "top":(d3.event.pageY)+'px'})
                // tempColor = this.style.fill;
                d3.select(this).attr('r', 15)
            })
            .on('mouseout', function(d){
                d3.select(this).attr('r', 5)
                tooltip.transition().style('opacity',0)
            });

    // Drawing the average speed line

    var averageSpeedLine = d3.svg.line()
    .x(function(d){
        return xScale(d);
    })
    .y(function(d){
        return yScale(d/(averageSpeed/60));
    });

    var speedLineLabel = myGraph.append('g')
                                .append('text')
                                .attr('class', 'speedLineLabel')
                                .attr('text-anchor', 'start')


    speedLineLabel.text('Average Speed: ' + decimalFormatter(averageSpeed) + ' mph.')
                    .attr('transform', 'translate('
                        +'25'+
                        ','
                        +(heightMyGraph - 20)+
                        ') rotate(-35)');

    flightDistance.unshift(0) // Allow the average speed line to start at origin
    myGraph.append('path')
            .attr('d', averageSpeedLine(flightDistance))
            .attr('stroke', 'blue')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', ("10, 5"))
            .attr('fill', 'red');


        // Creating the axes
        var yAxis = d3.svg.axis()
                        .scale(yScale)
                        .orient('left');

        myCanvas.append('g')
                .attr('class', 'y-axis')
                .attr('transform', 'translate('
                +margin.left+
                ','
                +margin.top+
                ')')
                .call(yAxis)
                .selectAll('path')
                .style({'fill': 'none',
                        'stroke': 'Blue'});

        // Add the text label for the Y axis
        myCanvas.append("text")
                .attr('class', 'axis-label')
                .attr("transform", "rotate(-90)")
                .attr("y", 15)
                .attr("x", -(heightMyCanvas/3))
                .style("text-anchor", "middle")
                .text("Flight Time (minutes)");

    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('bottom')
                    .ticks(20);

    var myX = myCanvas.append('g')
                        .attr('class', 'x-axis')
                        .attr('transform', 'translate('
                        +margin.left+
                        ','
                        +(heightMyGraph+margin.top)+
                        ')')
                        .call(xAxis)

    myX.selectAll('text')
        .attr('text-anchor', 'middle');
        
    myX.selectAll('path')
        .style({'fill': 'none',
                'stroke': 'Blue'})

    // Add the text label for the x axis
    myCanvas.append("text")
            .attr('class', 'axis-label')
            .attr("transform", "translate("
             + (widthMyCanvas / 3) +
             " ,"
              + (heightMyCanvas - 15) +
              ")")
            .style("text-anchor", "start")
            .attr('color', 'blue')
            .text("Flight Distance (miles)");


    // Tooltip formatting
    function niceTooltip(datum){
        return datum.values[0].key + "<br/>"
        + "Average speed: "
        + decimalFormatter(datum.values[0].values.speed) +" mph.";
    }


} // end of drawGraph function

// The initial loading of the data
function draw() {
    d3.csv('data/data_final.csv', function(d){
        d['Distance'] = +d['Distance'];
        d['AirTime'] = +d['AirTime'];
        return d;
    }, drawGraph);
}
