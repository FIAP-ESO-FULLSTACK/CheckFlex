#!/usr/bin/env bash

# Executa a esteira mínima de qualidade do frontend.
# A ordem privilegia feedback rápido: primeiro lint e testes, depois typecheck e build.

set -euo pipefail

# Falha cedo quando o projeto Node ainda não está disponível no diretório atual.
if [ ! -f "package.json" ]; then
  echo "::error::package.json não encontrado. O frontend não pode ser validado."
  exit 1
fi

# Valida padrões de código e problemas estáticos simples.
echo "Executando lint..."
npm run lint

# Garante o comportamento esperado da aplicação e das regras de negócio cobertas.
echo "Executando testes..."
npm run test

# Confirma a integridade dos contratos TypeScript.
echo "Executando typecheck..."
npm run typecheck

# Verifica se a aplicação consegue gerar o artefato de produção.
echo "Executando build..."
npm run build
