# Guia de Testes do Cliente

Este documento reúne as credenciais cadastradas pelo seed e instruções para validar o fluxo do hóspede no totem. Tudo roda local: o banco SQLite (`./checkflex.db`) é criado pelo seed e usado pela aplicação.

## Como subir o ambiente

```bash
npm install
npm run db:reset      # apaga o banco e re-popula com os dados abaixo
npm run dev
```

Acesse:

- Totem: http://localhost:3000
- Painel de métricas: http://localhost:3000/metricas

> Para zerar o estado durante a apresentação (reservas voltarem para "reserved" e métricas voltarem a 0), basta rodar `npm run db:reset` novamente.

## Reservas cadastradas

| Código | Hotel | Hóspede | Quarto | 2º fator (validação) | Tipo | Check-in | Check-out |
|---|---|---|---|---|---|---|---|
| `CKF-5042` | Fiap Suítes | Marina Alves | 504 — Suíte Horizonte | CPF: `123.456.789-09` | Hóspede com CPF | 14/03/2026 | 17/03/2026 |
| `CKF-2128` | Fiap Suítes | Rafael Costa | 212 — Quarto Jardim | Nascimento: `22/05/1990` | Hóspede estrangeiro | 14/03/2026 | 15/03/2026 |
| `PMR-8081` | Praia Mar Resort | Larissa Mendes | 808 — Bangalô Sereia | CPF: `987.654.321-00` | Outro hotel | 20/03/2026 | 23/03/2026 |

> A reserva `PMR-8081` pertence a outro hotel. Para enxergá-la no totem é preciso subir o servidor com `CHECKFLEX_HOTEL_ID=praia-mar-hotel npm run dev`. Isso comprova o isolamento multi-tenant.

## Roteiros de teste

### 1. Check-in com CPF (caminho feliz)

1. Selecione "Check-in" no topo.
2. Código: `CKF-5042`.
3. Opção "Tenho CPF" e digite `12345678909` (ou com máscara).
4. Continuar → revisar reserva → marcar termos → confirmar.
5. Esperado: PIN `320504` exibido + chave digital "G-Locks".

### 2. Check-in com data de nascimento (hóspede estrangeiro)

1. Código: `CKF-2128`.
2. Marque "Sou estrangeiro" e digite `22/05/1990`.
3. Esperado: revisão da reserva de Rafael Costa, PIN `320212`.

### 3. Validação falha com dados errados

1. Código: `CKF-5042`.
2. Digite CPF qualquer (ex.: `000`).
3. Esperado: mensagem genérica "Reserva não encontrada ou dados não conferem.".

### 4. Check-out

1. Faça o check-in antes (passo 1 ou 2).
2. Troque para a aba "Check-out".
3. Repita o código e o 2º fator usados no check-in.
4. Esperado: tela "Boa viagem, …" indicando a credencial revogada.

### 5. Idioma

1. No topo, alterne entre `PT`, `EN`, `ES`.
2. Esperado: textos do formulário e dos cards mudam imediatamente. A escolha sobrevive ao refresh (`localStorage`).

### 6. Métricas

1. Após rodar os passos 1–5, acesse http://localhost:3000/metricas.
2. Esperado: contadores para `check-in.completed`, `access.issued`, `check-out.completed`, `language.changed` e `access.revoked`.

## Layout para totem (operação web)

A UI continua sendo web, mas foi calibrada para uso em quiosque touch. Resoluções otimizadas:

| Tipo de totem | Resolução | Comportamento |
|---|---|---|
| Vertical (portrait) | 1080 × 1920, 1280 × 1920 | Largura limitada a 1080px centralizada, tipografia maior, campos com 64px de altura mínima |
| Horizontal (landscape) | 1920 × 1080 | Largura limitada a 1480px, campos com 60px de altura |
| Tablet/totem compacto | 1024 × 768 e 1280 × 800 | Layout fluido herda das regras gerais |
| Mobile (debug) | < 720px | Tudo em coluna única |

Recomendações para rodar como totem real:

1. Abrir o Chrome/Edge em modo kiosk fullscreen: `chrome --kiosk http://localhost:3000`.
2. Configurar o sistema operacional para iniciar o navegador automaticamente.
3. No DevTools, simular um totem 1080×1920 via "Toggle Device Toolbar" → "Edit" → adicionar perfil `Kiosk 1080x1920`.
4. Para personalizar qual hotel/totem está ativo, exporte as envs antes de subir o app:
   ```bash
   CHECKFLEX_HOTEL_ID=praia-mar-hotel CHECKFLEX_KIOSK_ID=kiosk-pool-04 npm run dev
   ```

## Resumo das credenciais (cola rápida)

```
CKF-5042  +  CPF 12345678909      (Marina Alves)
CKF-2128  +  Nascimento 22/05/1990 (Rafael Costa, estrangeiro)
PMR-8081  +  CPF 98765432100       (Larissa Mendes — outro hotel)
```
