import { useContext } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { getCkaData } from "../utils/data/getCkaData";
import { ExperimentsContext } from "../store/experiments-context";
import { CircleIcon, TriangleIcon } from "./UI/icons";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../components/UI/chart";

const GREEN = "#567C31";
const RED = "#BE4130";
const DOT_SIZE = 10;
const ANIMATION_DURATION = 500;

const chartConfig = {
  layer: {
    label: "Layer",
    color: "#000",
  },
  baselineForgetCka: {
    label: "Baseline (Forget Class)",
    color: RED,
  },
  baselineOtherCka: {
    label: "Baseline (Remain Classes)",
    color: GREEN,
  },
  comparisonForgetCka: {
    label: "Comparison (Forget Class)",
    color: RED,
  },
  comparisonOtherCka: {
    label: "Comparison (Remain Classes)",
    color: GREEN,
  },
} satisfies ChartConfig;

export default function MyLineChart({ dataset }: { dataset: string }) {
  const { baselineExperiment, comparisonExperiment } =
    useContext(ExperimentsContext);

  if (!baselineExperiment || !comparisonExperiment) return null;

  const ckaData = getCkaData(dataset, baselineExperiment, comparisonExperiment);

  return (
    <div>
      <ChartContainer
        className="w-[468px] h-[190px] relative"
        config={chartConfig}
      >
        <LineChart
          accessibilityLayer
          data={ckaData}
          width={468}
          height={190}
          margin={{
            top: 4,
            right: 4,
            bottom: 14,
            left: -25,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="layer"
            tickLine={false}
            angle={-45}
            textAnchor="end"
            tick={{ fontSize: 8, fill: "#000000" }}
          />
          <YAxis
            tickLine={false}
            tick={{ fontSize: 8, fill: "#000000" }}
            label={{
              value: "CKA Similarity",
              angle: -90,
              position: "center",
              style: {
                fontSize: 10,
                textAnchor: "middle",
                fill: "#000000",
              },
            }}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Line
            dataKey="baselineForgetCka"
            type="linear"
            stroke={chartConfig.baselineForgetCka.color}
            strokeWidth={2}
            dot={{ fill: RED, stroke: RED }}
            animationDuration={ANIMATION_DURATION}
            activeDot={false}
          />
          <Line
            dataKey="baselineOtherCka"
            type="linear"
            stroke={chartConfig.baselineOtherCka.color}
            strokeWidth={2}
            dot={{ fill: GREEN, stroke: GREEN }}
            animationDuration={ANIMATION_DURATION}
            activeDot={false}
          />
          <Line
            dataKey="comparisonForgetCka"
            type="linear"
            stroke={chartConfig.comparisonForgetCka.color}
            strokeWidth={2}
            strokeDasharray="3 3"
            animationDuration={ANIMATION_DURATION}
            dot={({ cx, cy }) => {
              return (
                <TriangleIcon
                  x={cx - DOT_SIZE / 2}
                  y={cy - DOT_SIZE / 2}
                  width={DOT_SIZE}
                  height={DOT_SIZE}
                  color={RED}
                />
              );
            }}
            activeDot={false}
          />
          <Line
            dataKey="comparisonOtherCka"
            type="linear"
            stroke={chartConfig.comparisonOtherCka.color}
            strokeWidth={2}
            strokeDasharray="3 3"
            animationDuration={ANIMATION_DURATION}
            dot={({ cx, cy }) => {
              return (
                <TriangleIcon
                  x={cx - DOT_SIZE / 2}
                  y={cy - DOT_SIZE / 2}
                  width={DOT_SIZE}
                  height={DOT_SIZE}
                  color={GREEN}
                />
              );
            }}
            activeDot={false}
          />
        </LineChart>
      </ChartContainer>
      <CustomLegend />
    </div>
  );
}

const CustomLegend = () => {
  return (
    <div className="absolute top-[120px] left-14 text-[10px] leading-[10px]">
      <div className="mb-1 flex items-center">
        <div className="relative">
          <CircleIcon
            className={`mr-2 w-[${DOT_SIZE}px] h-[${DOT_SIZE}px]`}
            style={{ color: RED }}
          />
          <div
            className="absolute top-1/2 w-[18px] h-[1px]"
            style={{
              backgroundColor: RED,
              transform: "translate(-4px, -50%)",
            }}
          />
        </div>
        <span>Baseline (Forget Class)</span>
      </div>
      <div className="mb-1 flex items-center">
        <div className="relative">
          <CircleIcon
            className={`mr-2 w-[${DOT_SIZE}px] h-[${DOT_SIZE}px]`}
            style={{ color: GREEN }}
          />
          <div
            className="absolute top-1/2 w-[18px] h-[1px]"
            style={{
              backgroundColor: GREEN,
              transform: "translate(-4px, -50%)",
            }}
          />
        </div>
        <span>Baseline (Remain Classes)</span>
      </div>
      <div className="mb-1 flex items-center">
        <div className="relative">
          <TriangleIcon width={10} height={10} color={RED} className="mr-2" />
          <div
            className="absolute top-1/2 w-[18px]"
            style={{
              borderTop: `1px dashed ${RED}`,
              transform: "translate(-4px, -50%)",
            }}
          />
        </div>
        <span>Comparison (Forget Class)</span>
      </div>
      <div className="flex items-center">
        <div className="relative">
          <TriangleIcon width={10} height={10} color={GREEN} className="mr-2" />
          <div
            className="absolute top-1/2 w-[18px]"
            style={{
              borderTop: `1px dashed ${GREEN}`,
              transform: "translate(-4px, -50%)",
            }}
          />
        </div>
        <span>Comparison (Remain Classes)</span>
      </div>
    </div>
  );
};