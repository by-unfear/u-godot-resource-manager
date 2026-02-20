import { z } from "zod";
import type { Schema, SchemaField } from "../types";

/**
 * Gera um validador Zod dinâmico baseado no Schema do Godot.
 */
export function createResourceValidator(schema: Schema) {
  const shape: Record<string, z.ZodTypeAny> = {
    _type: z.literal(schema.type),
    _file: z.string().min(1),
    _path: z.string().min(1),
  };

  for (const field of schema.fields) {
    shape[field.key] = createFieldValidator(field);
  }

  return z.object(shape);
}

function createFieldValidator(field: SchemaField): z.ZodTypeAny {
  let validator: z.ZodTypeAny;

  switch (field.type) {
    case "string":
    case "text":
    case "file":
    case "image":
    case "relation":
      validator = z.string();
      if (field.default === "") (validator as z.ZodString).default("");
      break;

    case "int":
      validator = z.number().int();
      if (field.min !== undefined) validator = (validator as z.ZodNumber).min(field.min);
      if (field.max !== undefined) validator = (validator as z.ZodNumber).max(field.max);
      break;

    case "float":
      validator = z.number();
      if (field.min !== undefined) validator = (validator as z.ZodNumber).min(field.min);
      if (field.max !== undefined) validator = (validator as z.ZodNumber).max(field.max);
      break;

    case "bool":
      validator = z.boolean();
      break;

    case "enum":
      if (field.options && field.options.length > 0) {
        validator = z.enum(field.options as [string, ...string[]]);
      } else {
        validator = z.string();
      }
      break;

    case "color":
      validator = z.object({
        r: z.number().min(0).max(1),
        g: z.number().min(0).max(1),
        b: z.number().min(0).max(1),
        a: z.number().min(0).max(1).default(1),
      });
      break;

    case "vector3":
      validator = z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
      });
      break;

    case "array_string":
    case "array_relation":
      validator = z.array(z.string());
      break;

    case "inner_array":
      if (field.inner_fields) {
        const innerShape: Record<string, z.ZodTypeAny> = {};
        for (const inner of field.inner_fields) {
          innerShape[inner.key] = createFieldValidator(inner);
        }
        validator = z.array(z.object(innerShape));
      } else {
        validator = z.array(z.any());
      }
      break;

    case "dictionary":
      validator = z.record(z.any());
      break;

    default:
      validator = z.any();
  }

  // Permite nulo se não houver um default e não for um campo obrigatório do sistema
  if (field.default === undefined) {
    return validator.optional().nullable();
  }

  return validator;
}
