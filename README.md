# CheckFlex

CheckFlex é um sistema de autoatendimento para hospedagem, pensado para operar em um totem. O objetivo é reduzir a dependência da recepção em processos repetitivos e oferecer uma experiência de check-in mais rápida, simples e disponível por mais tempo.

Na direção atual do projeto, o hóspede realiza o self check-in no totem, recebe uma credencial temporária para acessar o quarto durante a estadia e tem esse acesso revogado automaticamente ao final da hospedagem. O foco inicial está na integração com a fechadura eletrônica G-Locks Ébano 600 Smart Plus.

## Problema que o projeto resolve

- Filas e dependência da recepção para concluir o check-in.
- Processo manual e repetitivo para validar chegada e liberar acesso ao quarto.
- Dificuldade para gerar acessos temporários com validade controlada por estadia.
- Necessidade de revogar o acesso do hóspede ao término da hospedagem.

## Solução proposta

- Web App operando em modo totem para atendimento self-service.
- Backend próprio responsável por reservas, check-in e auditoria operacional.
- Integração com a fechadura G-Locks Ébano 600 Smart Plus.
- Credencial principal do MVP: senha temporária.
- Credencial complementar: chave virtual via app da G-Locks.
- Cartão de proximidade e chave mecânica como contingência operacional.

## Como o fluxo funciona

1. O hóspede localiza a reserva no totem.
2. O sistema conduz a confirmação do check-in.
3. O hóspede informa telefone ou e-mail.
4. O sistema gera um PIN temporário para a estadia.
5. O sistema envia uma chave virtual para o app compatível.
6. No checkout, as credenciais são revogadas.

## Hardware e plataforma foco do MVP

- Totem com navegador em modo kiosk.
- Fechadura eletrônica G-Locks Ébano 600 Smart Plus.
- Gateway/Hub Wi-Fi para operação remota das fechaduras.
- Smartphone da equipe para contingência e suporte operacional.

## Declaração de não conflito de interesse

Este projeto não possui, até o momento, qualquer vínculo comercial, patrocínio, comissão, parceria ou conflito de interesse relacionado ao fabricante ou revendedor da fechadura escolhida para o MVP.

A escolha da fechadura G-Locks Ébano 600 Smart Plus foi baseada apenas na busca por um produto disponível no mercado brasileiro que atendesse ao objetivo atual do projeto: permitir self check-in com geração de acesso temporário para o hóspede, com possibilidade de operação remota e revogação ao fim da estadia.

## Fases do projeto

### Fase 0 - Descoberta e homologação

Validação do fluxo de negócio, levantamento das regras operacionais e homologação da integração com a fechadura, gateway e app compatível.

### Fase 1 - Base do produto

Estruturação do Web App, backend inicial, modelo de reservas, quartos, hospedagens e credenciais, além da base de auditoria do sistema.

### Fase 2 - MVP funcional

Entrega do fluxo principal de self check-in com geração de senha temporária, envio de chave virtual e revogação automática no checkout.

### Fase 3 - Piloto assistido

Implantação controlada em operação real, com acompanhamento próximo, coleta de feedback, ajustes de UX e refinamento das regras do processo.

## Fluxo de trabalho em time

- `main` é a branch de referência estável do projeto.
- `desenvolvimento` é a branch de integração do time.
- Todo trabalho de desenvolvimento deve nascer a partir de `desenvolvimento`.
- As branches de trabalho devem seguir o padrão `feature/*` ou `fix/*`.
- Desenvolvedores devem abrir PR apenas para `desenvolvimento`.
- Após a validação do CI em `desenvolvimento`, o repositório fica preparado para promover essa branch automaticamente para `main`.

As regras operacionais do fluxo de branches e PRs estão documentadas em [CONTRIBUTING.md](./CONTRIBUTING.md).

## Fora de escopo neste momento

- Pagamento no totem.
- Captura de documento.
- App próprio do hóspede.
- Emissão automática de cartão no totem.
- Rollout multiunidade.

## Próximos passos

- Detalhar a arquitetura da solução.
- Definir entidades e fluxos principais do sistema.
- Criar o backlog inicial do MVP.
- Validar a operação do piloto.
