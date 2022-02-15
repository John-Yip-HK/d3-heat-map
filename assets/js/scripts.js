const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const padding = 60;
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

// Labels of y axis
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

// Discrete colours. Source: https://codepen.io/freeCodeCamp/pen/JEXgeY?editors=0010
const colours = [
  "#a50026",
  "#d73027",
  "#f46d43",
  "#fdae61",
  "#fee090",
  "#ffffbf",
  "#e0f3f8",
  "#abd9e9",
  "#74add1",
  "#4575b4",
  "#313695",
].reverse();

// Build X scales and axis:
const xScale = d3.scaleBand().range([0, width]);

// Build Y scales and axis:
const yScale = d3.scaleBand().domain(months).range([0, height]);

// Build color scale
const colourScale = d3.scaleQuantize().range(colours);

d3.json(url, (err, data) => {
  if (err) throw err;
  else
    return new Promise((res, _) => {
      res({
        baseTemperature: data["baseTemperature"],
        monthlyVariance: data["monthlyVariance"],
      });
    });
})
  .then(({ baseTemperature, monthlyVariance }) => {
    const years = [...new Set(monthlyVariance.map((data) => data["year"]))];
    const yearTicks = years.filter((year) => year % 10 === 0);

    const [minYear, maxYear] = [
      d3.min(years, (year) => year),
      d3.max(years, (year) => year),
    ];

    xScale.domain(years);

    const tempVar = monthlyVariance;

    d3.select("#title").text("Monthly Global Land-Surface Temperature");
    d3.select("#subtitle").text(
      `${minYear} - ${maxYear}: base temperature ${baseTemperature}℃`
    );

    colourScale.domain([
      d3.min(tempVar, (d) => d["variance"]),
      d3.max(tempVar, (d) => d["variance"]),
    ]);

    // Create rectangles for each of temperature variation record
    svg
      .selectAll("rect")
      .data(tempVar)
      .enter()
      .append("rect")
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("x", (d) => xScale(d["year"]))
      .attr("y", (d) => yScale(months[d["month"] - 1]))
      .style("fill", (d) => colourScale(d["variance"]))
      .style("stroke", "#000")
      .style("stroke-opacity", "0");

    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).tickValues(yearTicks));

    svg.append("g").call(d3.axisLeft(yScale));
  })
  .catch((err) => console.log(err.message));
