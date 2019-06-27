const width = 500;
const height = 300;
const padding = 50;
const dataset = [5, 10, 15, 8, 4, 8, 5, 25, 12, 14, 18, 17, 25];

const xScale = d3
  .scaleLinear()
  .domain([0, dataset.length - 1])
  .range([padding, width - padding]);

const yScale = d3
  .scaleLinear()
  .domain([d3.min(dataset, d => d), d3.max(dataset, d => d)])
  .range([height - padding, padding]);

const yValues = [];

const calculatePathLength = () => {
  const length = yValues.reduce((acc, curr, i, array) => {
    if (i === 0) return Math.abs(curr - padding);
    return acc + Math.abs(curr - array[i - 1]);
  }, 0);

  return length;
};

const graphLine = d3
  .line()
  .x((d, i) => xScale(i))
  .y(d => {
    const scaledValue = yScale(d);
    yValues.push(scaledValue);
    return scaledValue;
  })
  .curve(d3.curveMonotoneX);

const svg = d3
  .select("#graph")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const drawnPath = svg
  .append("path")
  .datum(dataset)
  .attr("stroke", "blue")
  .attr("stroke-width", 2)
  .attr("fill", "none")
  .attr("opacity", 0)
  .attr("d", graphLine);

const pathLength = calculatePathLength();

drawnPath
  .attr("stroke-dasharray", pathLength)
  .attr("stroke-dashoffset", pathLength)
  .attr("opacity", 1)
  .transition()
  .duration(3000)
  .attr("stroke-dashoffset", 0);

const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

svg
  .append("g")
  .call(xAxis)
  .style("transform", `translateY(${height - padding / 2}px)`);

svg
  .append("g")
  .call(yAxis)
  .style("transform", `translateX(${padding / 2}px)`);

const dots = svg
  .selectAll("circle")
  .data(dataset)
  .enter()
  .append("circle")
  .attr("cx", (d, i) => xScale(i))
  .attr("cy", d => yScale(d))
  .attr("r", 5)
  .attr("fill", "blue")
  .style("opacity", 0)
  .transition()
  .duration(1000)
  .delay(2000)
  .style("opacity", 1);

const line = d3
  .line()
  .x(d => d.x)
  .y(d => d.y);

const lineCoordinates = [{ x: 50, y: padding }, { x: 50, y: height - padding }];

const drawnLine = svg
  .append("path")
  .datum(lineCoordinates)
  .attr("stroke", "#000")
  .attr("stroke-width", 1)
  .attr("stroke-dasharray", height / 40)
  .attr("fill", "none")
  .attr("d", line);

dataset.forEach((d, i) => {
  svg
    .append("text")
    .attr("x", xScale(i))
    .attr("y", yScale(d))
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .style("transform", "translateY(-10px)")
    .style("font-family", "sans-serif")
    .style("font-size", 12)
    .style("opacity", 0)
    .transition()
    .duration(1000)
    .delay(2000)
    .style("opacity", i === 0 || i === dataset.length - 1 ? 1 : 0)
    .text(d);
});

d3.select("#slider")
  .attr("min", padding)
  .attr("max", width - padding)
  .style("width", `${width - padding * 2}px`)
  .style("transform", `translateX(${padding}px`)
  .on("input", function() {
    lineCoordinates[0].x = this.value;
    lineCoordinates[1].x = this.value;
    updateLabels(this.value);
    drawnLine.attr("d", line);
  });

const labelUpdater = () => {
  const dataPoints = dataset.map((d, i) => xScale(i));
  const firstDataPoint = dataPoints[0];
  const lastDataPoint = dataPoints[dataPoints.length - 1];
  const labels = d3.selectAll("text.label");
  let currentDataPointIndex = 0;
  let previousThreshold = null;
  let nextThreshold = dataPoints[1];

  return point => {
    if (point <= previousThreshold && currentDataPointIndex !== 0) {
      labels.style("opacity", 0);
      nextThreshold = previousThreshold;
      currentDataPointIndex = currentDataPointIndex - 1;
      previousThreshold = dataPoints[currentDataPointIndex];
      d3.select('text.label[x="' + previousThreshold + '"]').style(
        "opacity",
        1
      );
    }

    if (
      point >= nextThreshold &&
      currentDataPointIndex !== dataPoints.length - 1
    ) {
      labels.style("opacity", 0);
      d3.select('text.label[x="' + nextThreshold + '"]').style("opacity", 1);
      previousThreshold = nextThreshold;
      currentDataPointIndex = currentDataPointIndex + 1;
      nextThreshold = dataPoints[currentDataPointIndex + 1];
    }
  };
};

const updateLabels = labelUpdater();
