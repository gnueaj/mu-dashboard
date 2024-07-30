import React, { useState } from "react";
import styles from "./ConfigurationBox.module.css";

import ContentBox from "./ContentBox";

export default function ConfigurationBox() {
  const [mode, setMode] = useState(0); // 0: Training, 1: Unlearning, 2: Defense

  const handleModeBtnClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const id = +e.currentTarget.id;
    setMode(id);
  };

  return (
    <ContentBox height={270}>
      <div className={styles["button-wrapper"]}>
        <div
          id="0"
          onClick={handleModeBtnClick}
          className={mode === 0 ? styles["button-selected"] : styles.button}
        >
          Training
        </div>
        <div
          id="1"
          onClick={handleModeBtnClick}
          className={mode === 1 ? styles["button-selected"] : styles.button}
        >
          Unlearning
        </div>
        <div
          id="2"
          onClick={handleModeBtnClick}
          className={mode === 2 ? styles["button-selected"] : styles.button}
        >
          Defense
        </div>
      </div>
    </ContentBox>
  );
}
