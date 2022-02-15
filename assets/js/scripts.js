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
const xAxis = d3.axisBottom(xScale);

// Build Y scales and axis:
const yScale = d3.scaleBand().domain(months).range([0, height]);
const yAxis = d3.axisLeft(yScale);

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
    xAxis.tickValues(yearTicks);

    const tempVar = monthlyVariance;

    d3.select("#title").text("Monthly Global Land-Surface Temperature");
    d3.select("#description").text(
      `${minYear} - ${maxYear}: base temperature ${baseTemperature}℃`
    );

    colourScale.domain([
      d3.min(tempVar, (d) => d["variance"]),
      d3.max(tempVar, (d) => d["variance"]),
    ]);

    // Create tooltip
    const tooltip = d3.select("#container").append("div").attr("id", "tooltip");

    function mouseover(event) {
      const pointer = d3.pointer(event, d3.select("body").node());
      const cell = d3.select(this);
      const variance = (cell.attr("data-temp") - baseTemperature).toFixed(2);

      cell.style("stroke-opacity", 1);

      tooltip
        .style("display", "block")
        .style("top", `${pointer[1] - 100}px`)
        .style("left", `${pointer[0] - 30}px`)
        .attr("data-year", cell.attr("data-year"));

      tooltip.html(`
          ${tooltip.attr("data-year")} - ${
        months[cell.attr("data-month") - 1]
      }<br />
          ${cell.attr("data-temp")}℃<br />
          ${(variance >= 0 ? "+" : "") + variance}℃
        `);
    }

    function mouseout() {
      d3.select(this).style("stroke-opacity", 0);
      tooltip.style("display", "none").text("");
    }

    // Create rectangles for each of temperature variation record
    const rects = svg
      .selectAll("rect")
      .data(tempVar)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("x", (d) => xScale(d["year"]))
      .attr("y", (d) => yScale(months[d["month"] - 1]))
      .style("fill", (d) => colourScale(d["variance"]));

    // Add data for rectangles
    rects
      .attr("data-month", (d) => d["month"])
      .attr("data-year", (d) => d["year"])
      .attr("data-temp", (d) => (baseTemperature + d["variance"]).toFixed(2));

    // Add mouse-related event listeners to cells
    rects.on("mouseover", mouseover).on("mouseout", mouseout);

    svg.append("g").attr("transform", `translate(0, ${height})`).call(xAxis);

    svg.append("g").call(yAxis);
  })
  .catch((err) => console.log(err.message));
