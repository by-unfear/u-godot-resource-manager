import { useFormContext } from "react-hook-form";

interface Props { name: string; label: string; }

export function BoolField({ name, label }: Props) {
  const { register } = useFormContext();
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        {...register(name)}
        type="checkbox"
        className="w-4 h-4 rounded accent-blue-400 cursor-pointer"
      />
      <span className="text-sm text-text-secondary">{label}</span>
    </label>
  );
}
