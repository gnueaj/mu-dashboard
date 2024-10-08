import { useState, useEffect } from "react";
import styles from "./ProgressBar.module.css";

interface Props {
  eta: number | undefined;
}

const TIME_UNIT = 500;

export default function ProgressBar({ eta }: Props) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prevElapsedTime) => prevElapsedTime + TIME_UNIT);
    }, TIME_UNIT);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const maxTime = eta && Math.round(eta * 1000);

  return <progress className={styles.bar} value={elapsedTime} max={maxTime} />;
}
