import React, {
  useReducer,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useDispatch } from "react-redux";
import styles from "./TrainingConfiguration.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

import Input from "../components/Input";
import { MODELS, DATASET } from "../constants/training";
import { Status, Props, Timer } from "../types/training_config";
import { svgsActions } from "../store/svgs";
import { Action, Configuration } from "../types/training_config";

const API_URL = "http://localhost:8000";

export const initialState = {
  model: "ResNet-18",
  dataset: "CIFAR-10",
  epochs: 30,
  batch_size: 128,
  learning_rate: 0.01,
  seed: 1234,
};

export const configurationReducer = (
  state: Configuration,
  action: Action
): Configuration => {
  switch (action.type) {
    case "UPDATE_MODEL":
      return { ...state, model: action.payload as string };
    case "UPDATE_DATASET":
      return { ...state, dataset: action.payload as string };
    case "UPDATE_EPOCHS":
      return { ...state, epochs: action.payload as number };
    case "UPDATE_BATCH_SIZE":
      return { ...state, batch_size: action.payload as number };
    case "UPDATE_LEARNING_RATE":
      return { ...state, learning_rate: action.payload as number };
    case "UPDATE_SEED":
      return { ...state, seed: action.payload as number };
    default:
      return state;
  }
};

export default function TrainingConfiguration({ setTrainedModels }: Props) {
  const dispatch = useDispatch();
  const [mode, setMode] = useState<0 | 1>(0); // 0: Predefined, 1: Custom
  const [isLoading, setIsLoading] = useState<0 | 1 | 2>(0); // 0: Idle, 1: Training, 2: Inferencing
  const [statusMsg, setStatusMsg] = useState("Training . . .");
  const [statusDetail, setStatusDetail] = useState<Status | undefined>();
  const [customFile, setCustomFile] = useState<File>();

  const [configState, configDispatch] = useReducer(
    configurationReducer,
    initialState
  );

  const trainIntervalIdRef = useRef<Timer>();
  const inferenceIntervalIdRef = useRef<Timer>();
  const resultFetchedRef = useRef(false);

  const checkTrainStatus = useCallback(async () => {
    if (resultFetchedRef.current) return;
    try {
      const res = await fetch(`${API_URL}/train/status`);
      const data = await res.json();
      setStatusDetail(data);
      if (data.progress === 100) setStatusMsg("Embedding . . .");
      if (!data.is_training && !resultFetchedRef.current) {
        resultFetchedRef.current = true;
        if (trainIntervalIdRef.current) {
          clearInterval(trainIntervalIdRef.current);
          trainIntervalIdRef.current = undefined;
        }
        const resultRes = await fetch(`${API_URL}/train/result`);
        if (!resultRes.ok) {
          alert("Error occurred while fetching the training result.");
          return;
        }
        const data = await resultRes.json();
        dispatch(svgsActions.saveOriginalSvgs(data.svg_files));
        setIsLoading(0);
        setStatusDetail(undefined);
        const trainedModelsRes = await fetch(`${API_URL}/trained_models`);
        if (!trainedModelsRes.ok) {
          alert("Error occurred while fetching trained models.");
          return;
        }
        const trainedModels = await trainedModelsRes.json();
        setTrainedModels(trainedModels);
      }
    } catch (err) {
      console.log(err);
    }
  }, [dispatch, setTrainedModels]);

  const checkInferenceStatus = useCallback(async () => {
    if (resultFetchedRef.current) return;
    try {
      const res = await fetch(`${API_URL}/inference/status`);
      const data = await res.json();
      if (!data.is_inferencing && !resultFetchedRef.current) {
        resultFetchedRef.current = true;
        if (inferenceIntervalIdRef.current) {
          clearInterval(inferenceIntervalIdRef.current);
          inferenceIntervalIdRef.current = undefined;
        }
        const resultRes = await fetch(`${API_URL}/inference/result`);
        if (!resultRes.ok) {
          alert("Error occurred while fetching the inference result.");
          return;
        }
        const resultData = await resultRes.json();
        dispatch(svgsActions.saveOriginalSvgs(resultData.svg_files));
        setIsLoading(0);
      }
    } catch (err) {
      console.log(err);
    }
  }, [dispatch]);

  useEffect(() => {
    if (isLoading === 1 && !trainIntervalIdRef.current) {
      trainIntervalIdRef.current = setInterval(checkTrainStatus, 1000);
    } else if (isLoading === 2 && !inferenceIntervalIdRef.current) {
      inferenceIntervalIdRef.current = setInterval(checkInferenceStatus, 5000);
    }
    return () => {
      if (trainIntervalIdRef.current) clearInterval(trainIntervalIdRef.current);
      if (inferenceIntervalIdRef.current)
        clearInterval(inferenceIntervalIdRef.current);
    };
  }, [isLoading, checkTrainStatus, checkInferenceStatus]);

  const handleSectionClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const id = e.currentTarget.id;
    if (id === "predefined") setMode(0);
    else if (id === "custom") setMode(1);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files.length > 0)
      setCustomFile(e.currentTarget.files[0]);
  };

  const handleBtnClick = async () => {
    if (isLoading === 1) {
      try {
        setStatusMsg("Cancelling the training...");
        const res = await fetch(`${API_URL}/train/cancel`, { method: "POST" });
        if (!res.ok) {
          alert("Error occurred while cancelling the training.");
          return;
        }
        resultFetchedRef.current = true;
        setIsLoading(0);
      } catch (err) {
        console.error(err);
      }
    } else {
      resultFetchedRef.current = false;
      if (mode === 0) {
        if (
          configState.seed === 0 ||
          configState.batch_size === 0 ||
          configState.learning_rate === 0 ||
          configState.learning_rate === 0
        ) {
          alert("Please enter valid numbers");
          return;
        }
        setIsLoading(1);
        setStatusDetail(undefined);
        setStatusMsg("Training . . .");
        try {
          const data = {
            seed: configState.seed,
            batch_size: configState.batch_size,
            learning_rate: configState.learning_rate,
            epochs: configState.epochs,
          };
          const res = await fetch(`${API_URL}/train`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) {
            alert("Error occurred while sending a request for training.");
            setIsLoading(0);
          }
        } catch (err) {
          console.log(err);
          setIsLoading(0);
        }
      } else {
        if (!customFile) {
          alert("Please upload a custom training file.");
          return;
        }
        setIsLoading(2);
        try {
          setStatusMsg("Inferencing . . .");
          const formData = new FormData();
          formData.append("weights_file", customFile);
          const res = await fetch(`${API_URL}/inference`, {
            method: "POST",
            body: formData,
          });
          if (!res.ok) {
            alert("Error occurred while sending a request for inference.");
            setIsLoading(0);
            return;
          }
          setTimeout(() => {
            setStatusMsg("Embedding . . .");
          }, 250 * 1000);
        } catch (err) {
          console.error(err);
          setIsLoading(0);
        }
      }
    }
  };

  return (
    <>
      <div className={styles["subset-wrapper"]}>
        <div
          id="predefined"
          onClick={handleSectionClick}
          className={styles.predefined}
        >
          <div className={styles.mode}>
            <div className={styles["label-wrapper"]}>
              <FontAwesomeIcon
                className={styles.icon}
                icon={mode ? faCircle : faCircleCheck}
              />
              <span className={styles["predefined-label"]}>
                Predefined Settings
              </span>
            </div>
          </div>
          {isLoading === 1 ? (
            <div className={styles["status-wrapper"]}>
              <span className={styles.status}>{statusMsg}</span>
              {statusDetail && statusDetail.current_epoch >= 1 ? (
                <div className={styles["status-detail-wrapper"]}>
                  {/* TODO: class accuracy 표시 */}
                  <span className={styles["status-detail"]}>
                    Epoch: {statusDetail.current_epoch}/
                    {statusDetail.total_epochs}
                  </span>
                  <span className={styles["status-detail"]}>
                    Current Loss: {statusDetail.current_loss.toFixed(3)}
                  </span>
                  <span className={styles["status-detail"]}>
                    Best Loss: {statusDetail.best_loss.toFixed(3)}
                  </span>
                  <span className={styles["status-detail"]}>
                    Current Accuracy: {statusDetail.current_accuracy}
                  </span>
                  <span className={styles["status-detail"]}>
                    Best Accuracy: {statusDetail.best_accuracy}
                  </span>
                  <span className={styles["status-detail"]}>
                    ETA: {statusDetail.estimated_time_remaining.toFixed(2)}s
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <Input
                labelName="Model"
                value={configState.model}
                dispatch={configDispatch}
                optionData={MODELS}
                type="select"
              />
              <Input
                labelName="Dataset"
                value={configState.dataset}
                dispatch={configDispatch}
                optionData={DATASET}
                type="select"
              />
              <Input
                labelName="Epochs"
                value={configState.epochs}
                dispatch={configDispatch}
                type="number"
              />
              <Input
                labelName="Batch Size"
                value={configState.batch_size}
                dispatch={configDispatch}
                type="number"
              />
              <Input
                labelName="Learning Rate"
                value={configState.learning_rate}
                dispatch={configDispatch}
                type="number"
              />
              <Input
                labelName="Seed"
                value={configState.seed}
                dispatch={configDispatch}
                type="number"
              />
            </div>
          )}
        </div>
        <div id="custom" onClick={handleSectionClick} className={styles.custom}>
          <div className={styles["label-wrapper"]}>
            <FontAwesomeIcon
              className={styles.icon}
              icon={mode ? faCircleCheck : faCircle}
            />
            <span className={styles["predefined-label"]}>Custom Model</span>
          </div>
          {isLoading === 2 ? (
            <span className={styles["infer-status"]}>{statusMsg}</span>
          ) : (
            <div>
              <label htmlFor="custom-training">
                {customFile ? (
                  <div className={styles.upload}>
                    <span className={styles["upload-text"]}>
                      {customFile.name}
                    </span>
                  </div>
                ) : (
                  <div className={styles.upload}>Click to upload</div>
                )}
              </label>
              <input
                onChange={handleCustomFileUpload}
                className={styles["file-input"]}
                type="file"
                id="custom-training"
              />
            </div>
          )}
        </div>
      </div>
      <div className={styles["button-wrapper"]}>
        <div onClick={handleBtnClick} className={styles.button}>
          {isLoading === 1 ? "Cancel" : "Run"}
        </div>
      </div>
    </>
  );
}
