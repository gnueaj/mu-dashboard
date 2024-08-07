import React, { useState, useEffect } from "react";
import styles from "./Settings.module.css";

import TrainingConfiguration from "../components/TrainingConfiguration";
import UnlearningConfiguration from "../components/UnlearningConfiguration";
import DefenseConfiguration from "../components/DefenseConfiguration";
import ConfigurationModeSelector from "../components/ConfigurationModeSelector";
import ContentBox from "../components/ContentBox";

const API_URL = "http://localhost:8000";

export default function Settings() {
  const [configurationMode, setConfigurationMode] = useState(0); // 0: Training, 1: Unlearning, 2:Defense
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

  const handleConfigurationModeClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    setConfigurationMode(+e.currentTarget.id);
  };

  return (
    <section className={styles.wrapper}>
      <h3>Settings</h3>
      <ConfigurationModeSelector
        mode={configurationMode}
        setMode={handleConfigurationModeClick}
      />
      {configurationMode === 0 ? (
        <TrainingConfiguration setTrainedModels={setTrainedModels} />
      ) : configurationMode === 1 ? (
        <UnlearningConfiguration trainedModels={trainedModels} />
      ) : (
        <DefenseConfiguration />
      )}
    </section>
  );
}
