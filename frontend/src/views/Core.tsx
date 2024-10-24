import React, { useState } from "react";

import Embeddings from "./Embeddings";
import PrivacyAttack from "./PrivacyAttack";
import { Slider } from "../components/ui/slider";
import { ChartScatterIcon, RepeatIcon } from "../components/ui/icons";

const EMBEDDINGS = "embeddings";
const ATTACK = "attack";

export default function Core({ height }: { height: number }) {
  const [displayMode, setDisplayMode] = useState(EMBEDDINGS);
  const [neighbors, setNeighbors] = useState([5]);
  const [dist, setDist] = useState([0.1]);

  const handleDisplayModeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const id = e.currentTarget.id;
    if (id === EMBEDDINGS) setDisplayMode(EMBEDDINGS);
    else setDisplayMode(ATTACK);
  };

  const handleReplayClick = () => {
    console.log("Replay Button Clicked !");
  };

  const isEmbeddingMode = displayMode === EMBEDDINGS;
  const isAttackMode = displayMode === ATTACK;

  return (
    <section
      style={{ height: `${height}` }}
      className="w-[1552px] px-[5px] py-0.5 border-[1px] border-solid border-[rgba(0, 0, 0, 0.2)]"
    >
      <div className="flex justify-between items-center mb-0.5">
        <div className="flex items-center border-[1px] relative top-[3px] px-3 rounded-t-[6px]">
          <div
            id={EMBEDDINGS}
            onClick={handleDisplayModeChange}
            className={`relative z-10 flex items-center mr-3 cursor-pointer pb-0.5 px-1 ${
              isAttackMode && "text-gray-400 border-none"
            }`}
          >
            <ChartScatterIcon className={isAttackMode ? "opacity-40" : ""} />
            <button className="font-semibold ml-[3px] text-lg -mb-0">
              Embeddings
            </button>
            {isEmbeddingMode && (
              <div className="absolute w-full h-0.5 bg-black right-0 bottom-[3px]" />
            )}
          </div>
          <div
            onClick={handleDisplayModeChange}
            className={`relative z-10 flex items-center cursor-pointer pb-0.5 px-1 ${
              isEmbeddingMode && "text-gray-400 border-none"
            }`}
          >
            <img
              src="/hacker.png"
              alt="Attack logo img"
              className={`w-4 ${isEmbeddingMode && "opacity-40"}`}
            />
            <button
              id={ATTACK}
              className="font-semibold ml-[3px] text-lg -mb-0"
            >
              Privacy Attack
            </button>
            {isAttackMode && (
              <div className="absolute w-full h-0.5 bg-black right-0 bottom-[3px]" />
            )}
          </div>
        </div>
        {isEmbeddingMode && (
          <div className="w-[680px] flex justify-end items-center z-10">
            <div className="flex items-center">
              <span>neighbors</span>
              <div className="flex items-center">
                <Slider
                  onValueChange={(value: number[]) => setNeighbors(value)}
                  value={neighbors}
                  defaultValue={[5]}
                  className="w-[100px] mx-2 cursor-pointer"
                  min={5}
                  max={15}
                  step={1}
                />
                <span className="w-2 text-[14px]">{neighbors}</span>
              </div>
            </div>
            <div className="flex items-center mx-8">
              <span>min_dist</span>
              <div className="flex items-center">
                <Slider
                  onValueChange={(value: number[]) => setDist(value)}
                  value={dist}
                  defaultValue={[0.1]}
                  className="w-[100px] mx-2 cursor-pointer"
                  min={0.1}
                  max={0.5}
                  step={0.05}
                />
                <span className="w-4 text-[14px]">{dist}</span>
              </div>
            </div>
            <RepeatIcon
              onClick={handleReplayClick}
              className="scale-125 cursor-pointer mr-2"
            />
          </div>
        )}
      </div>
      {isEmbeddingMode ? <Embeddings /> : <PrivacyAttack />}
    </section>
  );
}
