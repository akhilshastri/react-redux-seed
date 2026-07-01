import { type ComponentProps, useEffect, useRef } from 'react'

import { cn } from '@/shared/lib'

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  indeterminate?: boolean
}

export const Checkbox = ({ className, indeterminate, ...props }: CheckboxProps) => {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate ?? false
  }, [indeterminate])

  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn('border-input accent-primary size-4 rounded', className)}
      {...props}
    />
  )
}
