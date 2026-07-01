import { zodResolver } from '@hookform/resolvers/zod'
import { type FieldValues, type Resolver, type UseFormProps, useForm } from 'react-hook-form'
import { type z } from 'zod'

/**
 * `useForm` pre-wired with a Zod resolver; field types are inferred from the
 * schema. Intended for schemas without input/output transforms (the common
 * case) — the resolver cast collapses Zod's input/output split to one value type.
 */
export const useZodForm = <TSchema extends z.ZodType<FieldValues, FieldValues>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>,
) =>
  useForm<z.infer<TSchema>>({
    ...options,
    resolver: zodResolver(schema) as unknown as Resolver<z.infer<TSchema>>,
  })
