url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
let req = new XMLHttpRequest();

let baseTemp;
let values = [];

let xScale;
let yScale;

let minYear;
let maxYear;

let width = 1200;
let height = 600;
let padding = 60;

let canvas = d3.select('#canvas');
canvas.attr('width', width);
canvas.attr('height', height);

let tooltip = d3.select('#tooltip');

d3.select("#svgLegend").append("rect").
attr("width", 325).
attr("height", 0);

var x = d3.scaleLinear().
domain([2.8, 12.8]).
range([0, 323]);

var axis = d3.axisBottom(x);

d3.select("#legend").
attr("class", "axis").
attr("width", 325).
attr("height", 45).
append("g").
attr("id", "g-runoff").
attr("transform", "translate(0,27)").
call(axis);

let generateScales = () => {
  minYear = d3.min(values, item => {
    return item['year'];
  });

  maxYear = d3.max(values, item => {
    return item['year'];
  });

  xScale = d3.scaleLinear().
  domain([minYear, maxYear + 1]).
  range([padding, width - padding]);

  yScale = d3.scaleTime().
  domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)]).
  range([padding, height - padding]);
};

let drawCells = () => {
  canvas.selectAll('rect').
  data(values).
  enter().
  append('rect').
  attr('class', 'cell').
  attr('fill', item => {
    variance = item.variance;
    if (variance <= -2) {
      return "#0077B6";
    } else if (variance <= -1.5) {
      return "#0096C7";
    } else if (variance <= -1) {
      return '#48CAE4';
    } else if (variance <= -0.5) {
      return '#90E0EF';
    } else if (variance <= 0) {
      return '#ADE8F4';
    } else if (variance < 1) {
      return '#FF9E00';
    } else if (variance < 1.5) {
      return '#FF8500';
    } else if (variance < 2) {
      return '#FF6000';
    } else {
      return '#FF4800';
    }
  }).
  attr('data-year', item => {
    return item['year'];
  }).
  attr('data-temp', item => {
    return baseTemp + item['variance'];
  }).
  attr('data-month', item => {
    return item['month'] - 1;
  }).
  attr('height', (height - 2 * padding) / 12).
  attr('y', item => {
    return yScale(new Date(0, item['month'] - 1, 0, 0, 0, 0, 0));
  }).
  attr('width', item => {
    let numberOfYears = maxYear - minYear;
    return (width - 2 * padding) / numberOfYears;
  }).
  attr('x', item => {
    return xScale(item['year']);
  }).
  on('mouseover', item => {
    monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'];

    let target = d3.select(d3.event.target);
    target.attr("stroke", "black");
    tooltip.
    style('opacity', 0.9).
    html(`${monthNames[item['month'] - 1]} ${item['year']} - ${baseTemp + item['variance']}`).
    style("left", `${d3.event.pageX}px`).
    style("top", `${d3.event.pageY + 28}px`).
    attr('data-year', item['year']);
  }).
  on('mouseout', item => {
    const target = d3.select(d3.event.target);
    target.attr('stroke', "");
    tooltip.
    style('opacity', 0);
  });
};

let drawAxes = () => {
  let xAxis = d3.axisBottom(xScale).
  tickFormat(d3.format('d'));
  let yAxis = d3.axisLeft(yScale).
  tickFormat(d3.timeFormat('%B'));

  canvas.append('g').
  call(xAxis).
  attr('id', 'x-axis').
  attr('transform', 'translate(0, ' + (height - padding) + ')');

  canvas.append('g').
  call(yAxis).
  attr('id', 'y-axis').
  attr('transform', 'translate(' + padding + ', 0)');
};

req.open('GET', url, true);
req.onload = () => {
  let object = JSON.parse(req.responseText);
  baseTemp = object['baseTemperature'];
  values = object['monthlyVariance'];
  generateScales();
  drawCells();
  drawAxes();
};
req.send();