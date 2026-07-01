import { useEffect } from 'react'

import { type User, userInputSchema } from '@/domain'
import { FormField, useZodForm } from '@/shared/forms'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
} from '@/shared/ui'

import { useCreateUser, useUpdateUser } from '../api/use-users'

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
}

export const UserDialog = ({ open, onOpenChange, user }: UserDialogProps) => {
  const isEdit = Boolean(user)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const form = useZodForm(userInputSchema, {
    defaultValues: { name: '', email: '', role: 'viewer' },
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      user
        ? { name: user.name, email: user.email, role: user.roles[0] ?? 'viewer' }
        : { name: '', email: '', role: 'viewer' },
    )
  }, [open, user, form])

  const pending = createUser.isPending || updateUser.isPending
  const failed = createUser.isError || updateUser.isError

  const onSubmit = form.handleSubmit((values) => {
    const done = () => onOpenChange(false)
    if (isEdit && user) {
      updateUser.mutate({ id: user.id, input: values }, { onSuccess: done })
    } else {
      createUser.mutate(values, { onSuccess: done })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit user' : 'New user'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the user’s details.' : 'Create a new user.'}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" noValidate onSubmit={onSubmit}>
          <FormField control={form.control} name="name" label="Name" placeholder="Ada Lovelace" />
          <FormField
            control={form.control}
            name="email"
            label="Email"
            type="email"
            placeholder="ada@example.com"
          />
          <div className="grid gap-1.5">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              className="border-input focus-visible:ring-ring h-9 rounded-md border bg-transparent px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
              {...form.register('role')}
            >
              <option value="viewer">viewer</option>
              <option value="admin">admin</option>
            </select>
          </div>

          {failed ? (
            <p className="text-destructive text-sm">
              Could not save — you may not have permission (admin only).
            </p>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
