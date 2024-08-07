import React, { useState } from "react";
import styles from "./DefenseConfiguration.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

import ContentBox from "../components/ContentBox";
import Input from "../components/Input";

const METHODS = ["method1", "method2", "method3", "method4"];
const UNLEARNED_MODELS = ["Model 1", "Model 2", "Model 3"];

export default function DefenseConfiguration() {
  const [defenseMode, setDefenseMode] = useState<0 | 1>(0);
  const [defenseMethod, setDefenseMethod] = useState("method1");
  const [unlearnedModels, setUnlearnedModels] =
    useState<string[]>(UNLEARNED_MODELS);
  const [selectedUnlearnedModel, setSelectedUnlearnedModel] = useState(
    UNLEARNED_MODELS[0]
  );
  const [defenseParameter1, setDefenseParameter1] = useState(0);
  const [defenseParameter2, setDefenseParameter2] = useState(0);
  const [defenseParameter3, setDefenseParameter3] = useState(0);
  const [defenseCustomFile, setDefenseCustomFile] = useState<File>();

  // useEffect(() => {
  //   const func = async () => {
  //     try {
  //       const res = await fetch(`${API_URL}/trained_models`);
  //       if (!res.ok) {
  //         alert("Error occurred while fetching trained models.");
  //         return;
  //       }
  //       const json = await res.json();
  //       setTrainedModels(json);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   func();
  // }, []);

  const handlePredefinedClick = () => {
    setDefenseMode(0);
  };

  const handleCustomClick = () => {
    setDefenseMode(1);
  };

  const handleSelectDefenseMethod = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const method = e.currentTarget.value;
    setDefenseMethod(method);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.currentTarget.files
      ? e.currentTarget.files[0]
      : null;
    if (!uploadedFile) return;
    setDefenseCustomFile(uploadedFile);
  };

  const handleRunBtnClick = async () => {
    // try {
    //   const data = {
    //     seed: trainingSeed,
    //     batch_size: trainingBatchSize,
    //     learning_rate: trainingLearningRate,
    //     epochs: trainingEpochs,
    //   };
    //   const res = await fetch(`${API_URL}/train`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(data),
    //   });
    //   if (!res.ok) {
    //     alert("Error occurred while sending a request for training.");
    //     return;
    //   }
    //   const json = await res.json();
    //   console.log(json);
    // } catch (err) {
    //   console.log(err);
    // }
  };

  return (
    <>
      <div className={styles["subset-wrapper"]}>
        <div
          id="defense-predefined"
          onClick={handlePredefinedClick}
          className={styles.predefined}
        >
          <div className={styles.mode}>
            <div className={styles["label-wrapper"]}>
              <FontAwesomeIcon
                className={styles.icon}
                icon={defenseMode ? faCircle : faCircleCheck}
              />
              <label className={styles["predefined-label"]}>
                Predefined Method
              </label>
            </div>
            <select
              onChange={handleSelectDefenseMethod}
              className={styles["predefined-select"]}
            >
              {METHODS.map((method, idx) => (
                <option key={idx} className={styles.option} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
          <Input
            labelName="Unlearned Model"
            value={selectedUnlearnedModel}
            setStateString={setSelectedUnlearnedModel}
            optionData={unlearnedModels}
            type="select"
          />
          <Input
            labelName="parameter_1"
            value={defenseParameter1}
            setStateNumber={setDefenseParameter1}
            type="number"
          />
          <Input
            labelName="parameter_2"
            value={defenseParameter2}
            setStateNumber={setDefenseParameter2}
            type="number"
          />
          <Input
            labelName="parameter_3"
            value={defenseParameter3}
            setStateNumber={setDefenseParameter3}
            type="number"
          />
        </div>
        <div
          id="defense-custom"
          onClick={handleCustomClick}
          className={styles.custom}
        >
          <div className={styles["label-wrapper"]}>
            <FontAwesomeIcon
              className={styles.icon}
              icon={defenseMode ? faCircleCheck : faCircle}
            />
            <span className={styles["predefined-label"]}>Custom Model</span>
          </div>
          <label htmlFor="custom-defense">
            <div className={styles["upload-btn"]}>Click to upload</div>
          </label>
          <input
            className={styles["file-input"]}
            type="file"
            id="custom-defense"
          />
        </div>
      </div>
      <div
        onClick={handleRunBtnClick}
        id="defense-run"
        className={styles["button-wrapper"]}
      >
        Run
      </div>
    </>
  );
}
