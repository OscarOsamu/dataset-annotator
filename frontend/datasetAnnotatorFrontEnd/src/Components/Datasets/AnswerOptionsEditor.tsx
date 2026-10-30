import { useState } from "react";
import { Button, Input, Space } from "antd";

interface AnswerOptionsEditorProps {
  value?: string[];
  onChange?: (options: string[]) => void;
}

export const AnswerOptionsEditor = ({
  value = [""],
  onChange,
}: AnswerOptionsEditorProps) => {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [newOption, setNewOption] = useState("");

  const updateOption = (index: number, option: string) => {
    onChange?.(value.map((current, optionIndex) =>
      optionIndex === index ? option : current,
    ));
  };

  const addOption = () => {
    const trimmedOption = newOption.trim();
    if (!trimmedOption) return;
    onChange?.([...value, trimmedOption]);
    setNewOption("");
    setIsPromptOpen(false);
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {value.map((option, index) => (
        <Space key={index} style={{ display: "flex" }}>
          <Input
            aria-label={`Answer option ${index + 1}`}
            value={option}
            onChange={(event) => updateOption(index, event.target.value)}
            placeholder={`Option ${index + 1}`}
          />
          <Button
            aria-label={`Remove answer option ${index + 1}`}
            disabled={value.length === 1}
            onClick={() =>
              onChange?.(value.filter((_, optionIndex) => optionIndex !== index))
            }
          >
            Remove
          </Button>
        </Space>
      ))}
      {isPromptOpen ? (
        <Space.Compact style={{ width: "100%" }}>
          <Input
            autoFocus
            aria-label="New answer option"
            value={newOption}
            onChange={(event) => setNewOption(event.target.value)}
            onPressEnter={addOption}
            placeholder="Enter an answer option"
          />
          <Button type="primary" disabled={!newOption.trim()} onClick={addOption}>
            Add
          </Button>
          <Button
            onClick={() => {
              setNewOption("");
              setIsPromptOpen(false);
            }}
          >
            Cancel
          </Button>
        </Space.Compact>
      ) : (
        <Button onClick={() => setIsPromptOpen(true)}>+ Add answer</Button>
      )}
    </Space>
  );
};