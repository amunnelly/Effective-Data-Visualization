# Effective-Data-Visualization
Project for the Udacity Data Analysis Course

**Summary**
This is a visualization of part the 2008 flight data set. The visualization shows two features of the dataset – the busiest airports in terms of flights, and the airports with the greatest flight delay. As there are over one million records in the original data set, the data set had to be processed before the visualization was created.

**Design**
The first design decision was to pre-process the data, to assist both load times and to filter the amount of airports in the data set to a manageable amount. D3’s `.filter()` function could have been used to reduce the airport count, but so large a `.csv` would have led to a painfully slow visualisation.
The dataset was processed to filter out all airlines other than United Airlines, and to only use flights from Day 6. Even then, the data set is still considerable.
For the first iteration, it was decided to post the flights against the airports on the axes, and use color to illustrate the departure delay times.
 
