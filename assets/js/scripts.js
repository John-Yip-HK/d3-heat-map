import * as d3 from "https://cdn.skypack.dev/d3@7";

const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const padding = 50;
const width = 1000;
const height = 400;

// References: https://www.d3-graph-gallery.com/graph/heatmap_basic.html

// append the svg object to the body of the page
const svg = d3
  .select("#container")
  .append("svg")
  .attr("width", width + padding * 2)
  .attr("height", height + padding * 2)
  .append("g")
  .attr("transform", "translate(" + padding + "," + padding + ")");

// Labels of row and columns
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Build X scales and axis:
const xScale = d3.scaleBand().range([0, width]);

// Build Y scales and axis:
const yScale = d3.scaleBand().domain(months).range([0, height]);
svg.append("g").call(d3.axisLeft(yScale));

// Build color scale
// var myColor = d3.scaleLinear().range(["white", "#69b3a2"]).domain([1, 100]);

d3.json(url, (err, data) => {
  if (err) throw err;
  else
    return new Promise((res, _) => {
      res({
        baseTemp: data["baseTemperature"],
        monthlyVariance: data["monthlyVariance"],
      });
    });
})
  .then(({ baseTemp, monthlyVariance }) => {
    const years = Array.from(
      new Set(
        monthlyVariance
          .map((data) => data["year"])
          .filter((year) => year % 10 === 0)
      )
    );

    xScale.domain(years);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));
  })
  .catch((err) => console.log(err.message));
