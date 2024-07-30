import React, { useState, useEffect } from "react";

import Title from "../components/Title";
import TrainingConfiguration from "../components/TrainingConfiguration";
import UnlearningConfiguration from "../components/UnlearningConfiguration";
import DefenseConfiguration from "../components/DefenseConfiguration";
import ConfigurationBox from "../components/ConfigurationBox";

const API_URL = "http://localhost:8000";

export default function Settings() {
  const [trainedModels, setTrainedModels] = useState<string[]>([]);

  useEffect(() => {
    const func = async () => {
      try {
        const res = await fetch(`${API_URL}/trained_models`);
        if (!res.ok) {
          alert("Error occurred while fetching trained models.");
          return;
        }
        const json = await res.json();
        setTrainedModels(json);
      } catch (err) {
        console.log(err);
      }
    };
    func();
  }, []);

  return (
    <section>
      <Title title="Settings" />
      <ConfigurationBox />
      <TrainingConfiguration setTrainedModels={setTrainedModels} />
      <UnlearningConfiguration trainedModels={trainedModels} />
      <DefenseConfiguration />
    </section>
  );
}
