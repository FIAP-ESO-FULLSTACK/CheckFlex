# Plano de Ação de Implementação

Roadmap das lacunas obrigatórias mapeadas no `AGENTS.md`, organizadas em fases incrementais. Cada fase entrega valor demonstrável e deixa o projeto pronto para a próxima.

Princípios:
- Tudo local, sem deploy (ver `STACK.md`).
- Cada fase fecha uma ou mais user stories.
- Manter o mock atual funcionando até o repositório real estar estável (paralelo, não substituição cega).
- PRs pequenos partindo de `desenvolvimento`, seguindo `CONTRIBUTING.md`.

## Visão geral das fases

| Fase | Tema | US fechadas | Esforço |
|---|---|---|---|
| 1 | Persistência local (SQLite + Drizzle) | base para todas | M |
| 2 | Validação de identidade (código + CPF/nascimento) | Hóspede 5 | P |
| 3 | Check-out e revogação de credencial | Hóspede 2 + gap README | M |
| 4 | Internacionalização | Hóspede 6 | P |
| 5 | Métricas simples | Cliente 2 | P |
| 6 | White-label (branding por hotel) | FlexMedia 3 | M |
| 7 | Multi-tenant + identificação de totem | FlexMedia 4 + Cliente 4 | M |
| 8 | Modularização e adapter de PMS | FlexMedia 1 + 2 + Hóspede 3 + Cliente 5 | G |
| 9 | Conteúdo dinâmico no totem | Cliente 3 | P |

P = pequeno, M = médio, G = grande.

---

## Fase 1 — Persistência local com SQLite

**Objetivo**: substituir o mock em memória por um banco real em arquivo, sem perder a possibilidade de mockar nos testes.

**Tarefas**
- Adicionar `better-sqlite3` e `drizzle-orm` ao `package.json`.
- Criar `src/infrastructure/db/schema.ts` com tabelas: `hotels`, `reservations`, `guests`, `guest_accesses`, `event_logs`.
- Script `scripts/db-seed.ts` populando duas reservas (mesmos dados do mock atual).
- Implementar `SqliteCheckInRepository` espelhando `CheckInRepository`.
- Permitir alternar repositório por flag/env (`CHECKFLEX_DB=mock|sqlite`).
- Migração inicial gerada via Drizzle Kit, versionada em `drizzle/`.

**Entregável**: `npm run dev` lê e grava reservas em `./checkflex.db`. `MockCheckInRepository` segue disponível para os testes.

---

## Fase 2 — Validação de identidade (US Hóspede 5)

**Objetivo**: aplicar a decisão registrada no `AGENTS.md` — par "código da reserva + CPF" com fallback para data de nascimento.

**Tarefas**
- Estender `Reservation` com `guestDocument` (CPF) e `guestBirthDate`.
- Estender `ReservationLookup` para aceitar `code` + (`document` | `birthDate`).
- Atualizar `findReservation` (mock e SQLite) para só retornar se os dois fatores baterem.
- Em `ReservationLookupForm`: alternador "Tenho CPF" / "Sou estrangeiro" → campo correspondente.
- Mensagem de erro genérica única: "Reserva não encontrada ou dados não conferem."
- Atualizar `find-reservation-use-case.test.ts` e factories.

**Entregável**: hóspede só avança ao informar código + segundo fator que confere com o registro.

---

## Fase 3 — Check-out e revogação de credencial (US Hóspede 2 + gap README)

**Objetivo**: fechar o ciclo da estadia. Falta hoje no código.

**Tarefas**
- Nova entidade `Stay` (vínculo reserva ↔ credencial ativa, com `revokedAt`).
- Caso de uso `checkout-use-case.ts`: valida estadia ativa, marca `revokedAt`, dispara revogação simulada.
- Caso de uso `revoke-expired-access-use-case.ts`: percorre estadias com `checkOutDate < now` e revoga.
- Loop simples ao iniciar a app (`setInterval` a cada 5 min) chamando o caso acima. Sem cron externo.
- UI: nova etapa de check-out acessível pelo top-bar do totem ("Fazer check-out") com busca por código + segundo fator.
- Mensagem final com confirmação da revogação.

**Entregável**: hóspede consegue concluir check-out no totem; credenciais expiradas são automaticamente revogadas.

---

## Fase 4 — Internacionalização (US Hóspede 6)

**Objetivo**: tornar a UI utilizável por estrangeiros sem reescrever componentes.

**Tarefas**
- Instalar `next-intl`.
- Criar `messages/pt-BR.json`, `messages/en.json`, `messages/es.json`.
- Extrair todas as strings dos componentes para chaves.
- Seletor de idioma no `top-bar` (3 botões com sigla).
- Persistir idioma escolhido em `localStorage` (sobrevive ao restart do totem).
- Adicionar idioma ao log de eventos (insumo da Fase 5).

**Entregável**: hóspede troca o idioma da interface antes ou durante o fluxo.

---

## Fase 5 — Métricas simples (US Cliente 2)

**Objetivo**: implementar a decisão "métricas bem simples" do `AGENTS.md`.

**Tarefas**
- Instalar `pino` e configurar transport para arquivo `./logs/checkflex.log`.
- Registrar eventos: `check-in.completed`, `access.issued`, `language.changed`, `check-out.completed`, `access.revoked`.
- Cada evento gravado também na tabela `event_logs` do SQLite.
- Tela `/metricas` (rota pública apenas em dev) com contadores agregados consultando `event_logs`.

**Entregável**: gestor visualiza totais por evento sem precisar abrir o banco.

---

## Fase 6 — White-label (US FlexMedia 3)

**Objetivo**: remover hardcode de "Fiap Suítes" / "CheckFlex" e permitir branding por hotel.

**Tarefas**
- Tabela `hotels` ganha colunas `displayName`, `primaryColor`, `accentColor`, `logoUrl`.
- Layout lê o hotel ativo (configurado por env ou registro padrão) e injeta variáveis CSS no `<html>`.
- Substituir cores hardcoded em `globals.css` por variáveis (`--brand-primary`, etc).
- Seed cria 2 hotéis com paletas diferentes para demonstrar a troca.

**Entregável**: trocar o hotel ativo muda nome, logo e cores sem mexer em código.

---

## Fase 7 — Multi-tenant + identificação de totem (FlexMedia 4 + Cliente 4)

**Objetivo**: permitir múltiplos hotéis convivendo no mesmo banco e múltiplos totens no mesmo hotel.

**Tarefas**
- `hotels` vira chave estrangeira em `reservations`, `guest_accesses`, `event_logs`.
- Arquivo `checkflex.local.json` (não versionado) com `hotelId` e `kioskId`.
- Todas as queries passam a filtrar por `hotelId`.
- `event_logs` inclui `kioskId` para rastrear de qual totem veio o evento.
- Tela inicial do dev mode permite trocar o hotel ativo para fins de apresentação.

**Entregável**: dois hotéis cadastrados, totens distintos identificados nos logs, dados isolados.

---

## Fase 8 — Modularização e adapter de PMS (FlexMedia 1 + 2, Hóspede 3, Cliente 5)

**Objetivo**: separar módulos reutilizáveis e desacoplar o sistema de qualquer PMS específico.

**Tarefas**
- Reorganizar `src/domain` e `src/application` em pastas por módulo: `check-in/`, `check-out/`, `keys/`.
- Criar porta `PmsAdapter` (`findReservation`, `confirmCheckIn`, `closeStay`).
- Implementar `LocalPmsAdapter` (lê do SQLite local — o atual repositório vira esse adapter).
- Documentar contrato em `docs/pms-adapter.md` (referência para integrar PMS reais no futuro).
- Criar `KeyIssuanceAdapter` (interface) com implementação `GLocksMockAdapter` para emissão digital.

**Entregável**: a aplicação fala com PMS e fechadura via interfaces. Trocar de provedor exige só nova implementação.

---

## Fase 9 — Conteúdo dinâmico no totem (US Cliente 3)

**Objetivo**: permitir que o hotel exiba avisos sem alterar código.

**Tarefas**
- Tabela `kiosk_contents` (`hotelId`, `title`, `body`, `validFrom`, `validUntil`, `active`).
- Banner na tela inicial do totem renderizando o conteúdo ativo do hotel atual.
- Seed com 1 promoção exemplo por hotel.
- Edição direta no banco (sem painel admin nesta fase).

**Entregável**: hotel cadastra um aviso no banco e ele aparece imediatamente no totem.

---

## Itens fora deste plano

Mantidos fora porque são opcionais segundo o `AGENTS.md` ou decisões já tomadas:

- Pagamento no totem.
- Mapa digital do hotel.
- Avisos de restaurante/spa/lazer detalhados (cobertos parcialmente pela Fase 9, mas sem app dedicado).
- Avaliação de estadia.
- Reconhecimento facial (substituído por código + CPF/nascimento).
- Chave física RFID (adiada até existir hardware para teste).
- Painel admin com autenticação real (entra apenas se sobrar tempo, usaria Lucia conforme `STACK.md`).

## Ordem sugerida de execução

1, 2, 3 são pré-requisitos para qualquer demonstração robusta. 4 e 5 entregam UX e métricas rapidamente. 6 e 7 preparam o produto para o discurso de white-label. 8 é o investimento arquitetural maior. 9 é cosmético e pode entrar entre 6 e 7 sem prejuízo.
