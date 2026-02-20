import { useFormContext } from "react-hook-form";

interface Props {
  name: string;
  multiline?: boolean;
  placeholder?: string;
}

const base = `w-full bg-bg-base border border-bg-border rounded px-3 py-1.5
  text-sm font-mono text-text-primary placeholder:text-text-muted
  focus:outline-none focus:border-text-muted transition-colors`;

export function StringField({ name, multiline, placeholder }: Props) {
  const { register } = useFormContext();
  if (multiline) {
    return (
      <textarea
        {...register(name)}
        rows={3}
        placeholder={placeholder}
        className={`${base} resize-y`}
      />
    );
  }
  return (
    <input
      {...register(name)}
      type="text"
      placeholder={placeholder}
      className={base}
    />
  );
}
