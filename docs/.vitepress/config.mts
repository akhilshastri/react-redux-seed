import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'React Redux Seed',
  description: 'How-to guides for the enterprise React + Redux Toolkit seed',
  base: '/react-redux-seed/',
  // Links that leave the docs tree (repo source, root docs) are not VitePress pages.
  ignoreDeadLinks: [/^\.\.\//, 'localhostLinks'],
  themeConfig: {
    nav: [{ text: 'How-to', link: '/how-to/00-get-started' }],
    sidebar: {
      '/how-to/': [
        {
          text: 'How-to guides',
          items: [
            { text: '0. Get started', link: '/how-to/00-get-started' },
            { text: '1. Generate a feature', link: '/how-to/01-generate-a-feature' },
            { text: '2. Domain & mock backend', link: '/how-to/02-domain-and-mock' },
            { text: '3. Client state (Redux)', link: '/how-to/03-client-state-redux' },
            { text: '4. Server state (Query)', link: '/how-to/04-server-state-query' },
            { text: '5. Forms (RHF + Zod)', link: '/how-to/05-forms' },
            { text: '6. The DataGrid', link: '/how-to/06-datagrid' },
            { text: '7. Auth & RBAC', link: '/how-to/07-auth-and-rbac' },
            { text: '8. Real backend', link: '/how-to/08-real-backend' },
          ],
        },
      ],
    },
    search: { provider: 'local' },
    outline: 'deep',
  },
})
