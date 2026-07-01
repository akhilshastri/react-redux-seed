import { Link } from 'react-router'

import { paths } from '@/app/router/paths'
import { cn } from '@/shared/lib'
import { buttonVariants } from '@/shared/ui'

export const NotFoundPage = () => {
  return (
    <div className="grid place-items-center py-24 text-center">
      <div className="grid gap-4">
        <div>
          <h1 className="text-3xl font-semibold">404</h1>
          <p className="text-muted-foreground mt-1 text-sm">This page could not be found.</p>
        </div>
        <Link to={paths.home} className={cn(buttonVariants(), 'justify-self-center')}>
          Go home
        </Link>
      </div>
    </div>
  )
}
