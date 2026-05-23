# Stack do CheckFlex

Guia de tecnologias do projeto. Todas as escolhas seguem três princípios: **simplicidade**, **custo zero** e **open source**.

Projeto acadêmico que roda **apenas localmente** (`npm run dev`). Sem deploy, sem provedor de nuvem, sem conta paga.

## Princípios da escolha

- Tudo precisa rodar offline na máquina do aluno.
- Nada de SaaS, conta paga ou free tier limitado.
- Banco em arquivo, sem servidor externo.
- "Clonou o repo, `npm install`, `npm run dev`, abriu localhost:3000."

## Frontend

| Camada | Escolha | Licença | Por quê |
|---|---|---|---|
| Framework | **Next.js 15** | MIT | App Router, server actions, roda local sem config. |
| UI lib | **React 19** | MIT | Base do Next, sem custo adicional. |
| Linguagem | **TypeScript** | Apache 2.0 | Tipagem reduz bugs do fluxo de check-in. |
| Componentes | **Radix UI Primitives** | MIT | Acessibilidade pronta, headless, sem CSS pago. |
| Estilo | **CSS modules + variáveis** | nativo | Sem dependência de UI kit. Facilita white-label por hotel. |

## Backend

| Camada | Escolha | Licença | Por quê |
|---|---|---|---|
| Runtime | **Node.js 20 LTS** | MIT | Padrão da indústria, gratuito. |
| API | **Next.js Route Handlers** | MIT | Mesma base do frontend, sem servidor separado. |
| Validação | **Zod** | MIT | Schema único compartilhado entre front e back. |

## Banco de dados

- **SQLite** (Public Domain) em arquivo único dentro do repositório (`./checkflex.db` ou similar).
- Zero setup, zero servidor, zero conta. Funciona offline.
- Banco fica versionado por seed (`npm run db:seed`), facilitando demonstração reproduzível.

## ORM e migrações

- **Drizzle ORM** (Apache 2.0): leve, SQL-first, gera migrações em arquivo dentro do repo.
- Alternativa avaliada: Prisma. Descartada por puxar binário pesado e gerar overhead desnecessário num projeto acadêmico.

## Internacionalização (US Hóspede 6)

- **next-intl** (MIT): dicionários em JSON dentro do repo, sem serviço externo.

## Autenticação

- **Lucia Auth** (MIT) caso seja implementado painel administrativo.
- No totem do hóspede, validação é por reserva + CPF/data de nascimento (regra do `AGENTS.md`), sem auth tradicional.

## Métricas de uso (US Cliente 2)

- Contadores em memória + log estruturado via **pino** (MIT) gravando em arquivo local.
- Sem dashboards. Apresentação pode ler o log direto ou exibir totais numa tela simples.

## Testes e qualidade

| Necessidade | Escolha | Licença |
|---|---|---|
| Testes unitários | **Vitest** | MIT |
| Lint | **ESLint** | MIT |
| Format | **Prettier** | MIT |
| Type check | **tsc --noEmit** | Apache 2.0 |

Todos rodam local, sem SaaS.

## O que ficou de fora propositalmente

- Qualquer provedor de nuvem (Vercel, Render, Fly, Railway, AWS, etc.).
- Banco em nuvem (Supabase, Neon, Planetscale, Mongo Atlas).
- SaaS de auth (Auth0, Clerk).
- Telemetria paga (Datadog, New Relic).
- UI kits proprietários (Material UI Pro, Ant Pro).
- Pipeline de CI/CD complexo. Para um projeto acadêmico, validar local com `npm run test && npm run lint && npm run typecheck && npm run build` é suficiente.

## Resumo em uma linha

Next.js + SQLite + Drizzle + Radix, tudo OSS, tudo offline, tudo rodando no `npm run dev`.
