import { type ComponentProps } from 'react'

import { cn } from '@/shared/lib'

export const Label = ({ className, ...props }: ComponentProps<'label'>) => {
  return (
    <label
      className={cn(
        'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  )
}
