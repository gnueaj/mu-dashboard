import { Label } from "./UI/label";
import { RadioGroup, RadioGroupItem } from "./UI/radio-group";
import { TRAIN, TEST } from "../views/Predictions";

interface Props {
  onValueChange: (value: string) => void;
}

export default function DatasetModeSelector({ onValueChange }: Props) {
  return (
    <div className="flex items-center relative right-4">
      {/* <span className="text-xs font-light mr-2">Dataset:</span> */}
      <RadioGroup
        className="flex"
        defaultValue={TRAIN}
        onValueChange={onValueChange}
      >
        <div className="flex items-center space-x-0.5">
          <RadioGroupItem value={TRAIN} id={TRAIN} />
          <Label className="text-xs font-light" htmlFor={TRAIN}>
            Train
          </Label>
        </div>
        <div className="flex items-center space-x-0.5">
          <RadioGroupItem value={TEST} id={TEST} />
          <Label className="text-xs font-light" htmlFor={TEST}>
            Test
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
