import { ChangeEvent, useEffect, useState } from "react";
import { Form } from "react-bootstrap";

const DEBOUNCE_INTERVAL = 500; // In ms

interface IDebouncedFieldProps {
  initialValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isInvalid?: boolean;
}

let timeout: NodeJS.Timeout | null = null;

export const DebouncedInput: React.FC<IDebouncedFieldProps> = ({
  onChange,
  initialValue,
  placeholder,
  className,
  isInvalid,
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

  const preventSomeCharachters = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ([".", "e", "-"].includes(e.key)) e.preventDefault();
  };

  // In case when reseting filters
  useEffect(() => {
    setDebouncedValue(initialValue ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form.Control
      type="number"
      placeholder={placeholder}
      value={debouncedValue}
      onChange={saveWithDebounce}
      className={className}
      onKeyDown={preventSomeCharachters}
      autoFocus
      isInvalid={isInvalid}
    />
  );
};
