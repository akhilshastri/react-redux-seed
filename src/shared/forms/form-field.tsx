import { type Control, Controller, type FieldPath, type FieldValues } from 'react-hook-form'

import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  type?: string
  placeholder?: string
  autoComplete?: string
}

/** Controller-bound labelled input with inline error display. */
export const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  autoComplete,
}: FormFieldProps<T>) => (
  <Controller
    control={control}
    name={name}
    render={({ field, fieldState }) => (
      <div className="grid gap-1.5">
        <Label htmlFor={name}>{label}</Label>
        <Input
          id={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={fieldState.error ? true : undefined}
          {...field}
          value={field.value ?? ''}
        />
        {fieldState.error ? (
          <p className="text-destructive text-sm">{fieldState.error.message}</p>
        ) : null}
      </div>
    )}
  />
)
