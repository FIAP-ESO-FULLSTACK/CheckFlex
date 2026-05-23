# Fases Adiadas

Este documento registra por que as fases **6 (White-label)** e **9 (Conteúdo dinâmico)** do `PLANO.md` não são executadas nesta etapa do projeto.

## Princípio que rege a decisão

O `STACK.md` define que toda escolha deve servir aos três princípios: **simplicidade**, **custo zero** e **open source**. Quando uma fase do plano adiciona complexidade sem ganho proporcional para um projeto acadêmico local, ela é adiada.

## Fase 6 — White-label (FlexMedia US 3)

**Por que adiar**

- Exigiria migrar todas as cores hardcoded do `globals.css` para variáveis CSS dinâmicas alimentadas pelo banco.
- Cada componente passaria a depender do contexto do hotel ativo, aumentando o acoplamento entre apresentação e dados.
- A demonstração do MVP roda com um hotel só ("Fiap Suítes"). Trocar de identidade visual não traz valor visível na apresentação.
- A US é da visão **FlexMedia** (produto comercial), não do hóspede nem do gestor — tem prioridade naturalmente menor.

**Quando reabrir**

- Quando houver pelo menos dois hotéis reais a demonstrar simultaneamente.
- Após a Fase 7 (multi-tenant) estar estável, já que ela cria o conceito de `hotelId` que essa fase precisa.

**O que ficou pronto que ajuda no futuro**

- A Fase 7 cria a entidade `hotels`. Adicionar colunas `primaryColor`, `accentColor`, `logoUrl` depois é incremental.

## Fase 9 — Conteúdo dinâmico no totem (Cliente US 3)

**Por que adiar**

- Requer uma área editorial (mesmo que simples) e uma tabela só para banners/avisos.
- Sem painel de edição, o ganho real é baixo: o conteúdo precisaria ser editado direto no banco para cada apresentação.
- Não destrava nenhuma outra US obrigatória. É um item visualmente bonito, mas isolado.
- A US também é prioritária para gestor em operação real, não para um demo acadêmico.

**Quando reabrir**

- Quando existir um painel administrativo (mesmo que mínimo) para o gestor cadastrar conteúdo.
- Ou quando a apresentação exigir um banner promocional como vitrine.

**O que ficou pronto que ajuda no futuro**

- A estrutura de `event_logs` da Fase 5 já dá padrão de tabelas auxiliares ligadas ao hotel.
- A separação de adapters da Fase 8 facilita plugar uma fonte de conteúdo externa depois.

## Resumo

| Fase | Status | Motivo principal |
|---|---|---|
| 6 — White-label | Adiada | Refator pesado de UI sem ganho na apresentação |
| 9 — Conteúdo dinâmico | Adiada | Exige painel editorial que não está no MVP |

Quando essas fases voltarem ao radar, abrir PR a partir de `desenvolvimento` referenciando este arquivo e o item correspondente do `PLANO.md`.
