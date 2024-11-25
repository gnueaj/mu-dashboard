import React, { useEffect, useRef, useContext } from "react";
import * as d3 from "d3";

import {
  BaselineNeuralNetworkIcon,
  ComparisonNeuralNetworkIcon,
} from "./UI/icons";
import { ForgetClassContext } from "../store/forget-class-context";
import { forgetClassNames } from "../constants/forgetClassNames";
import { Prob } from "../views/Embeddings";

const BASELINE_OPACITY = 0.6;
const COMPARISON_OPACITY = 1;
const TICK_PADDING = 8;
const BAR_HEIGHT = 8;
const FONT_SIZE = "14px";
const LEGEND_RECT_SIZE = 12;
const margin = { top: 30, right: 20, bottom: 20, left: 85 };

interface Props {
  width: number;
  height: number;
  imageUrl: string;
  data: (number | Prob)[];
  barChartData: {
    baseline: { class: number; value: number }[];
    comparison: { class: number; value: number }[];
  };
}

export default React.memo(function Tooltip({
  width,
  height,
  imageUrl,
  data,
  barChartData,
}: Props) {
  const { forgetClass } = useContext(ForgetClassContext);

  const svgRef = useRef(null);

  const groundTruthIdx = Number(data[2]);
  const predictionIdx = Number(data[3]);

  const firstTableauColor = d3.schemeTableau10[0];

  const groundTruth = forgetClassNames[groundTruthIdx];
  const baselinePrediction = forgetClassNames[predictionIdx];
  const comparisonIdx = barChartData.comparison.reduce((maxObj, currentObj) =>
    currentObj.value > maxObj.value ? currentObj : maxObj
  ).class;
  const comparisonPrediction = forgetClassNames[comparisonIdx];

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 300;
    const height = 300;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    const defs = svg.append("defs");

    const pattern = defs
      .append("pattern")
      .attr("id", "stripe")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 3)
      .attr("height", 3)
      .attr("patternTransform", "rotate(-45)");

    pattern
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 3)
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    const legendPattern = defs
      .append("pattern")
      .attr("id", "stripe-legend")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 3)
      .attr("height", 3)
      .attr("patternTransform", "rotate(-45)");

    legendPattern
      .append("rect")
      .attr("width", 3)
      .attr("height", 3)
      .attr("fill", "white");

    legendPattern
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", 3)
      .attr("stroke", firstTableauColor)
      .attr("stroke-width", 2);

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - margin.right - 166}, 8)`);

    legend
      .append("rect")
      .attr("width", LEGEND_RECT_SIZE)
      .attr("height", LEGEND_RECT_SIZE)
      .attr("fill", firstTableauColor);

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 10)
      .text("Baseline")
      .style("font-size", FONT_SIZE)
      .style("font-family", "Roboto Condensed");

    const comparisonLegend = legend
      .append("g")
      .attr("transform", "translate(80, 0)");

    comparisonLegend
      .append("rect")
      .attr("width", LEGEND_RECT_SIZE)
      .attr("height", LEGEND_RECT_SIZE)
      .attr("fill", firstTableauColor)
      .attr("opacity", COMPARISON_OPACITY);

    comparisonLegend
      .append("rect")
      .attr("width", LEGEND_RECT_SIZE)
      .attr("height", LEGEND_RECT_SIZE)
      .attr("fill", "url(#stripe-legend)")
      .attr("opacity", 1);

    comparisonLegend
      .append("text")
      .attr("x", 20)
      .attr("y", 10)
      .text("Comparison")
      .style("font-size", FONT_SIZE)
      .style("font-family", "Roboto Condensed");

    const xScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleBand()
      .domain(barChartData.baseline.map((d) => forgetClassNames[d.class]))
      .range([margin.top, height - margin.bottom])
      .padding(0.2);

    const gridLines = svg.append("g").attr("class", "grid-lines");

    const xAxisTicks = d3.range(0, 1.2, 0.2);

    gridLines
      .selectAll("line")
      .data(xAxisTicks)
      .enter()
      .append("line")
      .attr("x1", (d) => xScale(d))
      .attr("x2", (d) => xScale(d))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#d8d8d8")
      .attr("stroke-width", 1);

    const colors = d3.schemeTableau10;

    const g = svg.append("g");

    g.selectAll(".bar-baseline")
      .data(barChartData.baseline)
      .join("rect")
      .attr("class", "bar-baseline")
      .attr("x", margin.left)
      .attr("y", (d) => yScale(forgetClassNames[d.class]) ?? 0)
      .attr("height", BAR_HEIGHT)
      .attr("width", (d) => xScale(d.value) - margin.left)
      .attr("fill", (_, i) => colors[i])
      .attr("opacity", BASELINE_OPACITY);

    g.selectAll(".bar-comparison")
      .data(barChartData.comparison)
      .join("g")
      .attr("class", "bar-comparison")
      .each(function (d: { class: number; value: number }, i: number) {
        const g = d3.select(this);
        const x = xScale(d.value) - margin.left;
        const y = (yScale(forgetClassNames[d.class]) ?? 0) + BAR_HEIGHT;

        g.append("rect")
          .attr("x", margin.left)
          .attr("y", y)
          .attr("height", BAR_HEIGHT)
          .attr("width", x)
          .attr("fill", colors[i])
          .attr("opacity", COMPARISON_OPACITY);

        g.append("rect")
          .attr("x", margin.left)
          .attr("y", y)
          .attr("height", BAR_HEIGHT)
          .attr("width", x)
          .attr("fill", "url(#stripe)")
          .attr("opacity", 0.5);
      });

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(5)
      .tickSize(0)
      .tickPadding(TICK_PADDING)
      .tickFormat((d) => d.toString());

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", FONT_SIZE)
      .style("font-family", "Roboto Condensed");

    svg.select(".domain").remove();

    const yAxis = d3.axisLeft(yScale).tickSize(0).tickPadding(TICK_PADDING);

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .selectAll("text")
      .style("font-size", FONT_SIZE)
      .style("font-family", "Roboto Condensed");
  }, [barChartData, firstTableauColor, forgetClass]);

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className="flex items-center"
    >
      <div className="mt-2 mr-2">
        <div className="flex justify-center">
          <img src={imageUrl} alt="cifar-10" width="160" height="160" />
        </div>
        <div className="text-sm mt-1">
          <span>Ground Truth:</span>{" "}
          <span className="font-semibold">{groundTruth}</span>
        </div>
        <div className="text-sm flex flex-col">
          <p>Predicted Class</p>
          <p className="flex items-center text-nowrap">
            <BaselineNeuralNetworkIcon className="mr-1" />
            <span className="mr-0.5">Baseline:</span>
            <span className="font-semibold">{baselinePrediction}</span>
          </p>
          <p className="flex items-center text-nowrap">
            <ComparisonNeuralNetworkIcon className="mr-1" />
            <span className="mr-0.5">Comparison:</span>
            <span className="font-semibold">{comparisonPrediction}</span>
          </p>
        </div>
      </div>
      <div className="relative z-50 bottom-2.5">
        <svg ref={svgRef} className="w-full max-w-4xl" />
        <p className="text-sm absolute font-medium -bottom-[18px] right-[calc(50%-2rem)] translate-x-1/2">
          Confidence Score
        </p>
      </div>
    </div>
  );
});
