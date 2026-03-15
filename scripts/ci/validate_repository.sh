#!/usr/bin/env bash

set -euo pipefail

required_files=(
  "README.md"
  "CONTRIBUTING.md"
  "package.json"
  "tsconfig.json"
  "tsconfig.typecheck.json"
  "eslint.config.mjs"
  "vitest.config.ts"
  "vitest.setup.ts"
  "app/layout.tsx"
  "app/page.tsx"
  ".github/pull_request_template.md"
  ".github/workflows/validate-pr-to-development.yml"
  ".github/workflows/promote-development-to-main.yml"
  "scripts/ci/run_frontend_checks.sh"
)

readme_sections=(
  "## Problema que o projeto resolve"
  "## Solução proposta"
  "## Como o fluxo funciona"
  "## Hardware e plataforma foco do MVP"
  "## Fases do projeto"
  "## Fluxo de trabalho em time"
  "## Fora de escopo neste momento"
  "## Próximos passos"
)

contributing_sections=(
  "## Modelo de branches"
  "## Regras do fluxo"
  "## Requisitos verificados pelo CI"
  "## Configuração esperada no GitHub"
)

assert_file_exists_and_not_empty() {
  local file="$1"

  if [ ! -s "$file" ]; then
    echo "::error file=$file::Arquivo obrigatório ausente ou vazio."
    exit 1
  fi
}

assert_text_present() {
  local file="$1"
  local expected_text="$2"

  if ! grep -Fq "$expected_text" "$file"; then
    echo "::error file=$file::Texto obrigatório não encontrado: $expected_text"
    exit 1
  fi
}

assert_no_windows_line_endings() {
  local file="$1"

  if grep -n $'\r' "$file" >/dev/null; then
    echo "::error file=$file::O arquivo contém finais de linha Windows (CRLF)."
    exit 1
  fi
}

echo "Validando arquivos obrigatórios do repositório..."

for file in "${required_files[@]}"; do
  assert_file_exists_and_not_empty "$file"
  assert_no_windows_line_endings "$file"
done

echo "Validando seções obrigatórias do README..."

for section in "${readme_sections[@]}"; do
  assert_text_present "README.md" "$section"
done

echo "Validando seções obrigatórias do guia de contribuição..."

for section in "${contributing_sections[@]}"; do
  assert_text_present "CONTRIBUTING.md" "$section"
done

echo "Validando base mínima do frontend..."

assert_text_present "package.json" "\"build\": \"next build\""
assert_text_present "package.json" "\"lint\": \"eslint . --max-warnings=0\""
assert_text_present "package.json" "\"test\": \"vitest run\""
assert_text_present "package.json" "\"typecheck\": \"tsc --noEmit -p tsconfig.typecheck.json\""
assert_text_present "app/page.tsx" "CheckInExperience"
assert_text_present "app/layout.tsx" "CheckFlex"

echo "Validação estrutural do repositório concluída com sucesso."
