# Como desenovlver em grupo

Este repositório adota um fluxo simples de trabalho em time para reduzir conflitos, manter a integração organizada e garantir que a `main` receba apenas mudanças já validadas.

## Modelo de branches

- `main`: branch estável do projeto.
- `desenvolvimento`: branch de integração do time.
- `feature/*`: branches para novas funcionalidades.
- `fix/*`: branches para correções.

As branches legadas `feature` e `fix` podem existir no repositório, mas para novos trabalhos o padrão recomendado é usar nomes descritivos como `feature/self-checkin` e `fix/validacao-reserva`.

## Regras do fluxo

1. Sempre atualize sua branch local a partir de `desenvolvimento`.
2. Crie uma branch de trabalho com prefixo `feature/` ou `fix/`.
3. Desenvolva e envie seus commits para a branch de trabalho.
4. Antes do PR, sincronize sua branch com `desenvolvimento`.
5. Abra Pull Request apenas com destino para `desenvolvimento`.
6. Após o merge em `desenvolvimento`, o CI valida os requisitos do repositório.
7. Se a validação passar e `main` estiver atrás de `desenvolvimento`, o CI cria ou atualiza automaticamente um Pull Request de `desenvolvimento` para `main`.
8. Quando o PR automático para `main` atender às regras de proteção, o GitHub conclui o merge por auto-merge.

## O que não deve acontecer

- Não abrir PR manual para `main`.
- Não fazer push direto em `main`.
- Não usar branches de trabalho criadas a partir de `main`.

## Requisitos verificados pelo CI

- O PR deve ter destino em `desenvolvimento`.
- A branch de origem deve seguir o padrão `feature/*` ou `fix/*`.
- A branch de origem deve estar sincronizada com `desenvolvimento`.
- O PR automático de promoção para `main` deve ter origem em `desenvolvimento`.
- O repositório deve manter os arquivos obrigatórios do fluxo, como `README.md`, `CONTRIBUTING.md`, template de PR e workflows.
- O README e a documentação de contribuição devem manter as seções mínimas esperadas pelo projeto.

## Configuração esperada no GitHub

Para que o fluxo funcione de ponta a ponta, o repositório deve manter as seguintes proteções no GitHub:

- Proteger `desenvolvimento` para aceitar mudanças apenas via Pull Request.
- Proteger `main` para bloquear pushes diretos.
- Exigir os checks do GitHub Actions antes do merge.
- Permitir auto-merge no repositório para que o PR automático de `desenvolvimento` para `main` possa ser concluído.
- Permitir que o GitHub Actions crie ou atualize o PR automático de promoção para `main`.
