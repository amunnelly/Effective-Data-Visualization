// Basic dimensions

var margin = {top: 50,
        bottom: 10,
        left: 50,
        right: 10};

var heightMyCanvas = 1000;
var widthMyCanvas = 650;
var widthMyGraph = widthMyCanvas - margin.left - margin.right;
var heightMyGraph = heightMyCanvas - margin.top - margin.bottom;

var barGap = 0.25;
var commaFormatter = d3.format(',');
var decimalFormatter = d3.format('0.2f');
airportFlightLimit = 50;

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
                        var averageDelay = d3.mean(leaves, function(d){
                            return d['DepDelay'];
                            })
                        return {"flights": flights,
                                "averageDelay": averageDelay};
                    })
                    .entries(myData);
    
    myNestedData.sort(function (a,b) {
        return b.values[0].values.averageDelay - a.values[0].values.averageDelay;
    });

    // Create arrays from the nested data to make it easier to set the axes later
    var numberOfFlights = [];
    myNestedData.forEach(function(d){
            numberOfFlights.push(d.values[0].values.flights);
        });

    var airports = [];
    myNestedData.forEach(function (d) {
        if (d.values[0].values.flights > airportFlightLimit){
            airports.push(d.key);
        }
    })

    var barWidth = heightMyGraph / (airports.length - barGap);


    // We have to filter here because the longest delay doesn't have enough
    // flights associated with it to make the graph, and this messes up the axes.
    var averageDepartureDelay = [];
    myNestedData.forEach(function (d) {
        if(d.values[0].values.flights > airportFlightLimit){
        averageDepartureDelay.push(d.values[0].values.averageDelay);
    }});

    // Create x, y and color scales
    var xScale = d3.scale.linear()
                .domain([0, d3.max(averageDepartureDelay)])
                .range([0, widthMyGraph]);

    var yScale = d3.scale.ordinal()
                    .domain(airports)
                    .rangePoints([0, heightMyGraph]);


    var myColors = d3.scale.linear()
                    .domain([d3.min(numberOfFlights), d3.max(numberOfFlights)])
                    .range(['orange', 'red']);

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
    myGraph.selectAll('rect')
            .data(myNestedData)
            .enter()
            .append('rect')
            .filter(function (d) {
                return (d.values[0].values.flights > airportFlightLimit
                    && d.values[0].values.averageDelay > 0);
            })
            // We don't want too many flights coming back, and neither do we
            // want delays less than zero.
            .style('fill', function(d){
                return myColors(d.values[0].values.flights);
            })
            .attr('y', function(d,i){
                return i*(barWidth+barGap);
            })
            .attr('x', function(d){
                return 0;
            })
            .attr('width', function(d){
                return xScale(d.values[0].values.averageDelay);
                })
            .attr('height', barWidth)
            .on('mouseover', function(d){
                tooltip.transition()
                    .style('opacity', 0.9)
                    .style({'font-family': 'serif',
                            'font-style': 'italic'})
                tooltip.html(niceTooltip(d))
                    .style({"left":(d3.event.pageX)+'px',
                            "top":(d3.event.pageY)+'px'});
            });

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
            .attr("x", -(heightMyCanvas/10))
            .style("text-anchor", "middle")
            .text("Airports");

    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient('top')
                    .ticks(20);

    var myX = myCanvas.append('g')
                        .attr('class', 'x-axis')
                        .attr('transform', 'translate('
                        +margin.left+
                        ','
                        +margin.top+
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
          + (margin.top - 25) +
          ")")
        .style("text-anchor", "start")
        .attr('color', 'blue')
        .text("Average Departure Delay (minutes)");


    // Tooltip formatting
    function niceTooltip(datum){
        return datum.values[0].key + "<br/>"
        + "Flights: "
        +commaFormatter(datum.values[0].values.flights)+ "<br/>"
        + "Average Delay: "
        + decimalFormatter(datum.values[0].values.averageDelay) +" minutes.";
    }


}

// The initial loading of the data
function draw() {
    d3.csv('/data/data_final.csv', function(d){
        d['DepDelay'] = +d['DepDelay'];
        return d;
    }, drawGraph);
}
