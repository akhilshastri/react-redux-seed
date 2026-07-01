/**
 * Code scaffolder. Run with `npm run gen <generator> <name>`.
 *
 * Generators create files only — they never splice into shared files. MSW
 * handlers auto-wire via import.meta.glob; slice + route registration are
 * printed as next-steps (a guarded data-router can't be safely auto-edited).
 *
 * @param {import('plop').NodePlopAPI} plop
 */
export default function (plop) {
  const camel = plop.getHelper('camelCase')
  const pascal = plop.getHelper('pascalCase')

  // Function action: receives answers, returns a message plop logs verbatim.
  const nextSteps = (lines) => (answers) => {
    const render = (line) =>
      line
        .replaceAll('{{camelCase name}}', camel(answers.name))
        .replaceAll('{{pascalCase name}}', pascal(answers.name))
    return ['', 'Next steps:', ...lines.map(render)].join('\n  ') + '\n'
  }

  plop.setGenerator('domain', {
    description: 'A domain entity (zod schema + type)',
    prompts: [{ type: 'input', name: 'name', message: 'Entity name (e.g. invoice)' }],
    actions: [
      {
        type: 'add',
        path: 'src/domain/{{kebabCase name}}.ts',
        templateFile: 'plop-templates/domain/entity.ts.hbs',
      },
      nextSteps(['Re-export it from src/domain/index.ts.']),
    ],
  })

  plop.setGenerator('mock', {
    description: 'An MSW handler for a resource (auto-wired via glob)',
    prompts: [{ type: 'input', name: 'name', message: 'Resource name (e.g. invoice)' }],
    actions: [
      {
        type: 'add',
        path: 'src/mocks/handlers/{{kebabCase name}}.ts',
        templateFile: 'plop-templates/mock/handler.ts.hbs',
      },
      nextSteps(['The handler auto-wires — no shared-file edits needed.']),
    ],
  })

  plop.setGenerator('feature', {
    description: 'A vertical feature slice (store + api + component + handler)',
    prompts: [{ type: 'input', name: 'name', message: 'Feature name (e.g. invoice)' }],
    actions: [
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/store/{{kebabCase name}}-slice.ts',
        templateFile: 'plop-templates/feature/slice.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/api/query-keys.ts',
        templateFile: 'plop-templates/feature/query-keys.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/api/use-{{kebabCase name}}.ts',
        templateFile: 'plop-templates/feature/use-list.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/components/{{kebabCase name}}-page.tsx',
        templateFile: 'plop-templates/feature/page.tsx.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/index.ts',
        templateFile: 'plop-templates/feature/index.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/mocks/handlers/{{kebabCase name}}.ts',
        templateFile: 'plop-templates/mock/handler.ts.hbs',
      },
      nextSteps([
        'Register the reducer in src/app/store/root-reducer.ts:',
        '    {{camelCase name}}: {{camelCase name}}Slice.reducer,',
        'Add a route in src/app/router/routes.tsx:',
        '    { path: paths.{{camelCase name}}, element: <{{pascalCase name}}Page /> }',
        'The MSW handler auto-wires (glob) — no edit needed.',
      ]),
    ],
  })
}
