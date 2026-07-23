type ChoiceButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  state?: "default" | "correct" | "incorrect";
};

export function ChoiceButton({
  label,
  onClick,
  disabled = false,
  state = "default",
}: ChoiceButtonProps) {
  return (
    <button
      type="button"
      className={`millionaireChoice ${state}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
