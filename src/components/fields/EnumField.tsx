import { useFormContext } from "react-hook-form";

interface Props { name: string; options: string[]; }

export function EnumField({ name, options }: Props) {
  const { register } = useFormContext();
  return (
    <select
      {...register(name)}
      className="w-full bg-bg-base border border-bg-border rounded px-3 py-1.5
        text-sm font-mono text-text-primary focus:outline-none focus:border-text-muted
        transition-colors cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}
