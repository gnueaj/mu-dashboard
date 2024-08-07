import React, {
  useReducer,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useDispatch } from "react-redux";
import styles from "./UnlearningConfiguration.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

import ContentBox from "../components/ContentBox";
import Input from "../components/Input";
import { Status, Props, Timer } from "../types/unlearning_config";
import { UNLEARNING_METHODS, UNLEARN_CLASSES } from "../constants/unlearning";
import { svgsActions } from "../store/svgs";
import { Action, Configuration } from "../types/unlearning_config";

const API_URL = "http://localhost:8000";

export const initialState = {
  method: "Fine-Tuning",
  forget_class: "0",
  epochs: 10,
  batch_size: 64,
  learning_rate: 0.002,
};

export const unlearningConfigReducer = (
  state: Configuration,
  action: Action
): Configuration => {
  switch (action.type) {
    case "UPDATE_METHOD":
      return { ...state, method: action.payload as string };
    case "UPDATE_FORGET_CLASS":
      return { ...state, forget_class: action.payload as string };
    case "UPDATE_EPOCHS":
      return { ...state, epochs: action.payload as number };
    case "UPDATE_BATCH_SIZE":
      return { ...state, batch_size: action.payload as number };
    case "UPDATE_LEARNING_RATE":
      return { ...state, learning_rate: action.payload as number };
    default:
      return state;
  }
};

export default function UnlearningConfiguration({ trainedModels }: Props) {
  const dispatch = useDispatch();

  const [mode, setMode] = useState<0 | 1>(0); // 0: Predefined, 1: Custom
  const [isUnlearning, setIsUnlearning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [customFile, setCustomFile] = useState<File>();
  const [statusMsg, setStatusMsg] = useState("Unlearning . . .");
  const [statusDetail, setStatusDetail] = useState<Status | undefined>();
  const [trainedModel, setTrainedModel] = useState<string | undefined>(
    trainedModels[0]
  );

  const [configState, configDispatch] = useReducer(
    unlearningConfigReducer,
    initialState
  );

  const unlearningIntervalIdRef = useRef<Timer>();
  const resultFetchedRef = useRef(false);

  const checkUnlearningStatus = useCallback(async () => {
    if (resultFetchedRef.current) return;
    try {
      const res = await fetch(`${API_URL}/unlearn/status`);
      const data = await res.json();
      setStatusDetail(data);
      if (data.progress === 100) setStatusMsg("Embedding . . .");
      if (!data.is_unlearning && !resultFetchedRef.current) {
        resultFetchedRef.current = true;
        if (unlearningIntervalIdRef.current) {
          clearInterval(unlearningIntervalIdRef.current);
          unlearningIntervalIdRef.current = undefined;
        }
        const resultRes = await fetch(`${API_URL}/unlearn/result`);
        if (!resultRes.ok) {
          alert("Error occurred while fetching the unlearning result.");
          return;
        }
        const data = await resultRes.json();
        dispatch(svgsActions.saveUnlearnedSvgs(data.svg_files));
        setIsUnlearning(false);
        setStatusDetail(undefined);
      }
    } catch (err) {
      console.log(err);
    }
  }, [dispatch]);

  useEffect(() => {
    if (isUnlearning && !unlearningIntervalIdRef.current) {
      unlearningIntervalIdRef.current = setInterval(
        checkUnlearningStatus,
        1000
      );
    }
    return () => {
      if (unlearningIntervalIdRef.current)
        clearInterval(unlearningIntervalIdRef.current);
    };
  }, [checkUnlearningStatus, isUnlearning]);

  const handleSelectUnlearningMethod = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const method = e.currentTarget.value;
    configDispatch({ type: "UPDATE_METHOD", payload: method });
  };

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
    resultFetchedRef.current = false;
    if (isUnlearning) {
      try {
        setIsCancelling(true);
        const res = await fetch(`${API_URL}/unlearn/cancel`, {
          method: "POST",
        });
        if (!res.ok) {
          alert("Error occurred while cancelling the unlearning.");
          return;
        }
        resultFetchedRef.current = true;
        setIsUnlearning(false);
        setIsCancelling(false);
      } catch (err) {
        console.error(err);
      }
    } else {
      if (mode === 0) {
        if (
          configState.epochs === 0 ||
          configState.batch_size === 0 ||
          configState.learning_rate === 0
        ) {
          alert("Please enter valid numbers");
          return;
        }
        setIsUnlearning(true);
        setStatusMsg("Unlearning . . .");
        try {
          const method = configState.method;
          const end =
            method === "Fine-Tuning"
              ? "ft"
              : method === "Random-Label"
              ? "rl"
              : method === "Gradient-Ascent"
              ? "ga"
              : method === "Fisher"
              ? "fisher"
              : "retrain";
          const data = {
            batch_size: configState.batch_size,
            learning_rate: configState.learning_rate,
            epochs: configState.epochs,
            forget_class: configState.forget_class,
          };
          const res = await fetch(`${API_URL}/unlearn/${end}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) {
            alert("Error occurred while sending a request for retraining.");
            setIsUnlearning(false);
          }
        } catch (err) {
          console.error(err);
          setIsUnlearning(false);
        }
      } else {
        if (!customFile) {
          alert("Please upload a custom unlearning file.");
          return;
        }
        setIsUnlearning(true);
        try {
          const formData = new FormData();
          formData.append("weights_file", customFile);
          // TODO: 백엔드 측 custom file로 unlearning 수행하는 기능 개발되면 URL 변경할 것
          const res = await fetch(`${API_URL}/unlearn-custom`, {
            method: "POST",
            body: formData,
          });
          if (!res.ok) {
            alert(
              "Error occurred while sending a request for unlearning a custom file."
            );
            setIsUnlearning(false);
            return;
          }
        } catch (err) {
          console.error(err);
          setIsUnlearning(false);
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
              <label className={styles["predefined-label"]}>
                Predefined Method
              </label>
            </div>
            <select
              onChange={handleSelectUnlearningMethod}
              className={styles["predefined-select"]}
            >
              {UNLEARNING_METHODS.map((method, idx) => (
                <option key={idx} className={styles.option} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
          {isUnlearning ? (
            <div className={styles["status-wrapper"]}>
              <span className={styles.status}>{statusMsg}</span>
              {statusDetail && statusDetail.current_epoch >= 1 ? (
                <div className={styles["status-detail-wrapper"]}>
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
                    Current Accuracy: {statusDetail.current_accuracy.toFixed(3)}
                  </span>
                  <span className={styles["status-detail"]}>
                    Best Accuracy: {statusDetail.best_accuracy.toFixed(3)}
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
                labelName="Trained Model"
                value={trainedModel}
                setStateString={setTrainedModel}
                optionData={trainedModels}
                type="select"
                disabled={configState.method === "Retrain"}
              />
              <Input
                labelName="Forget Class"
                value={configState.forget_class}
                dispatch={configDispatch}
                optionData={UNLEARN_CLASSES}
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
            </div>
          )}
        </div>
        {/* TODO: Custom canceling status 표시 */}
        <div
          id="custom"
          onClick={handleSectionClick}
          className={styles["custom-wrapper"]}
        >
          <div className={styles.custom}>
            <div className={styles["label-wrapper"]}>
              <FontAwesomeIcon
                className={styles.icon}
                icon={mode ? faCircleCheck : faCircle}
              />
              <span className={styles["predefined-label"]}>Custom Model</span>
            </div>
            <label htmlFor="custom-unlearning">
              <div className={styles["upload"]}>Click to upload</div>
            </label>
            <input
              onChange={handleCustomFileUpload}
              className={styles["file-input"]}
              type="file"
              id="custom-unlearning"
            />
          </div>
          <div>
            <Input
              labelName="Forget Class"
              value={configState.forget_class}
              dispatch={configDispatch}
              optionData={UNLEARN_CLASSES}
              type="select"
            />
          </div>
        </div>
      </div>
      <div className={styles["button-wrapper"]}>
        <div onClick={handleBtnClick} className={styles.button}>
          {isUnlearning ? "Cancel" : "Run"}
        </div>
      </div>
    </>
  );
}
