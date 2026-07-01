import { useAuth } from '@/features/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

export const AdminPage = () => {
  const { user } = useAuth()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin area</CardTitle>
        <CardDescription>
          Only users with the <code>admin.access</code> permission reach this route.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">
        Signed in as <span className="text-foreground font-medium">{user?.email}</span> with roles{' '}
        <span className="text-foreground font-medium">{user?.roles.join(', ')}</span>.
      </CardContent>
    </Card>
  )
}
