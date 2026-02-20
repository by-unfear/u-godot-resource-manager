import { useFormContext } from "react-hook-form";
import type { SchemaField } from "../../types";
import { StringField } from "./StringField";
import { NumberField } from "./NumberField";
import { BoolField } from "./BoolField";
import { EnumField } from "./EnumField";
import { FileField } from "./FileField";
import { ImageField } from "./ImageField";
import { ColorField } from "./ColorField";
import { Vector3Field } from "./Vector3Field";
import { ArrayStringField } from "./ArrayStringField";
import { InnerArrayField } from "./InnerArrayField";
import { RelationField } from "./RelationField";

interface Props {
  field: SchemaField;
  prefix?: string; // for nested fields
}

export function FieldRenderer({ field, prefix = "" }: Props) {
  const key = prefix ? `${prefix}.${field.key}` : field.key;

  const label = (
    <div className="flex items-center gap-2 mb-1">
      <label className="text-xs text-text-secondary font-mono">{field.label}</label>
      {field.hint && (
        <span className="text-[10px] text-text-muted truncate">{field.hint}</span>
      )}
    </div>
  );

  const wrap = (children: React.ReactNode) => (
    <div key={field.key}>
      {label}
      {children}
    </div>
  );

  switch (field.type) {
    case "string":
      return wrap(<StringField name={key} />);
    case "text":
      return wrap(<StringField name={key} multiline />);
    case "int":
      return wrap(<NumberField name={key} field={field} isInt />);
    case "float":
      return wrap(<NumberField name={key} field={field} />);
    case "bool":
      return wrap(<BoolField name={key} label={field.label} />);
    case "enum":
      return wrap(<EnumField name={key} options={field.options ?? []} />);
    case "file":
      return wrap(<FileField name={key} filter={field.filter} />);
    case "image":
      return wrap(<ImageField name={key} />);
    case "color":
      return wrap(<ColorField name={key} />);
    case "vector3":
      return wrap(<Vector3Field name={key} />);
    case "array_string":
      return wrap(<ArrayStringField name={key} />);
    case "relation":
      return wrap(<RelationField name={key} resourceType={field.resource_type ?? ""} />);
    case "array_relation":
      return wrap(<ArrayStringField name={key} placeholder="ID do resource" />);
    case "inner_array":
      return wrap(
        <InnerArrayField
          name={key}
          fields={field.inner_fields ?? []}
          innerLabel={field.inner_label ?? "Item"}
        />
      );
    case "dictionary":
      return wrap(<StringField name={key} multiline placeholder="{}" />);
    default:
      return null;
  }
}
