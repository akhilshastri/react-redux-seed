import { isRouteErrorResponse, useRouteError } from 'react-router'

export const RootErrorBoundary = () => {
  const error = useRouteError()

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong'
  const detail =
    error instanceof Error ? error.message : isRouteErrorResponse(error) ? error.data : null

  return (
    <div className="bg-background text-foreground grid min-h-dvh place-items-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {detail ? <p className="text-muted-foreground mt-2 text-sm">{String(detail)}</p> : null}
      </div>
    </div>
  )
}
