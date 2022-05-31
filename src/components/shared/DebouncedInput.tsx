import { ChangeEvent, useEffect, useState } from "react";
import { Form } from "react-bootstrap";

const DEBOUNCE_INTERVAL = 400; // In ms

interface IDebouncedFieldProps {
  initialValue?: string;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
}

let timeout: NodeJS.Timeout | null = null;

export const DebouncedInput: React.FC<IDebouncedFieldProps> = ({
  onChange,
  initialValue,
  placeholder,
  className,
}) => {
  const [debouncedValue, setDebouncedValue] = useState(initialValue ?? "");

  const saveWithDebounce = (ev: ChangeEvent<HTMLInputElement>) => {
    const inputValue = ev.target.value ?? "";
    setDebouncedValue(inputValue);
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      onChange(inputValue);
    }, DEBOUNCE_INTERVAL);
  };

  // In case when reseting filters
  useEffect(() => {
    setDebouncedValue(initialValue ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form.Control
      type="text"
      placeholder={placeholder}
      value={debouncedValue}
      onChange={saveWithDebounce}
      className={className}
    />
  );
};
