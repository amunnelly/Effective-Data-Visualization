var margin = {top: 10,
        bottom: 50,
        left: 60,
        right: 10};

var heightMyCanvas = 500;
var widthMyCanvas = 1000;
var widthMyGraph = widthMyCanvas - margin.left - margin.right;
var heightMyGraph = heightMyCanvas - margin.top - margin.bottom;

var barGap = 0;
var commaFormatter = d3.format(',')
var decimalFormatter = d3.format('0.2f')
airportFlightLimit = 50;

function drawGraph(myData){

    myNestedData = d3.nest()
                    .key(function (d) {
                        return d['Origin'];
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
        return b.values.flights - a.values.flights;
    })

    console.log(myNestedData)
    var numberOfFlights = [];
    myNestedData.forEach(function(d){
            numberOfFlights.push(d.values.flights);
        });

    var airports = [];
    myNestedData.forEach(function (d) {
        if (d.values.flights > airportFlightLimit){
            airports.push(d.key);
        }
    })

    var barWidth = widthMyGraph / (airports.length - barGap);

    var averageDepartureDelay = [];
    myNestedData.forEach(function (d) {
        averageDepartureDelay.push(d.values.averageDelay);
    })

    var yScale = d3.scale.linear()
                .domain([0, d3.max(myNestedData, function (d) {
                    return d.values.flights;
                })])
                .range([heightMyGraph, 0]);

    var xScale = d3.scale.ordinal()
                    .domain(airports)
                    .rangePoints([0, widthMyGraph]);


    var myColors = d3.scale.linear()
                    .domain([d3.min(averageDepartureDelay), d3.max(averageDepartureDelay)])
                    .range(['gold', 'blue']);

    var tooltip = d3.select('body')
                        .append('div')
                        .style({"position":"absolute",
                                "padding":"0 10px",
                            "background":"Black",
                            "color":"White",
                        "opacity":0})

    myCanvas = d3.select("#myCanvas")
                .append('svg')
                .attr('class', 'canvas')
                .style('background', 'DarkAlmond')
                .attr('height', heightMyCanvas)
                .attr('width', widthMyCanvas)

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

    myGraph.selectAll('rect')
            .data(myNestedData)
            .enter()
            .append('rect')
            .filter(function (d) {
                return d.values.flights > airportFlightLimit;
            })
            .style('fill', function(d){
                return myColors(d.values.averageDelay);
            })
            .attr('x', function(d,i){
                return i*(barWidth+barGap);
            })
            .attr('y', function(d){
                return yScale(d.values.flights);
                // return 70;
            })
            .attr('height', function(d){
                return heightMyGraph - yScale(d.values.flights);
                })
            .attr('width', barWidth)
            .on('mouseover', function(d){
                tooltip.transition()
                    .style('opacity', 0.9)
                    .style({'font-family': 'serif',
                            'font-style': 'italic'})
                tooltip.html(niceTooltip(d))
                    .style({"left":(d3.event.pageX)+'px',
                            "top":(d3.event.pageY)+'px'});
            })
            .on('mouseoff', function(d){
                tooltip.transition()
                .style('opacity', 0)
            })

            var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left')
            .ticks(10);

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
                    'stroke': 'Blue'})

        // Add the text label for the Y axis
        myCanvas.append("text")
            .attr('class', 'axis-label')
            .attr("transform", "rotate(-90)")
            .attr("y", 15)
            .attr("x", -(heightMyCanvas/2))
            .style("text-anchor", "middle")
            .text("Number of Flights");

            var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom');

            var myX = myCanvas.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate('
            +margin.left+
            ','
            +(heightMyCanvas-margin.bottom)+
            ')')
            .call(xAxis)

            myX.selectAll('text')
                .attr('text-anchor', 'right')
                .attr('transform', 'rotate(-90)')
                .attr('dx', '-2em')
            myX.selectAll('path')
            .style({'fill': 'none',
                    'stroke': 'Blue'})

    // Add the text label for the x axis
    myCanvas.append("text")
        .attr('class', 'axis-label')
        .attr("transform", "translate("
         + (widthMyCanvas / 2) +
         " ,"
          + (heightMyCanvas - 10) +
          ")")
        .style("text-anchor", "start")
        .attr('color', 'blue')
        .text("Airports");

    function niceTooltip(datum){
        return datum.key + " average delay: "
        +decimalFormatter(datum.values.averageDelay)+ " minutes.";
    }


}

function draw() {
    d3.csv('data/ua_day6_2008.csv', function(d){
        d['DepDelay'] = +d['DepDelay'];
        return d;
    }, drawGraph);
}
