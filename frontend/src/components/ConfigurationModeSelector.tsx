import React from "react";
import styles from "./ConfigurationModeSelector.module.css";

interface Props {
  mode: number;
  setMode: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function ConfigurationModeSelector({ mode, setMode }: Props) {
  return (
    <div className={styles["button-wrapper"]}>
      <button
        id="0"
        onClick={setMode}
        className={mode === 0 ? styles["button-selected"] : styles.button}
      >
        Training
      </button>
      <button
        id="1"
        onClick={setMode}
        className={mode === 1 ? styles["button-selected"] : styles.button}
      >
        Unlearning
      </button>
      <button
        id="2"
        onClick={setMode}
        className={mode === 2 ? styles["button-selected"] : styles.button}
      >
        Defense
      </button>
    </div>
  );
}
