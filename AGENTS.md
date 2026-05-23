# Contexto Para Agentes de IA

Este arquivo consolida o desafio e as user stories extraidas do PDF `3ESOR - Challenge 2025-26.pptx_RevFinal.pdf`, usado como referencia do projeto CheckFlex.

## Desafio

Desenvolver um totem de autoatendimento voltado para o setor hoteleiro, permitindo que hospedes realizem check-in e check-out automatizados, com integracao a sistemas de gestao hoteleira (PMS), emissao de chaves digitais ou fisicas, reconhecimento facial e outras funcionalidades adicionais.

## User Stories - Vista FlexMedia

1. Como FlexMedia, quero estruturar a solucao em modulos reutilizaveis (check-in/out, emissao de chaves, pagamentos), para oferecer o produto como white label a outros hoteis.

2. Como FlexMedia, quero que a solucao suporte integracao com diferentes APIs de PMS, gateways de pagamento e controle de acesso, para atender demandas variadas.

3. Como FlexMedia, quero que o design e a interface do totem sejam customizaveis, para que cada hotel adapte a sua identidade visual.

4. Como FlexMedia, quero que o backend permita multiplos cadastros de hoteis, para gerenciar diferentes clientes em uma unica plataforma.

## User Stories - Vista Cliente

1. Como gestor do hotel, quero que o totem funcione de forma autonoma e confiavel, para reduzir a demanda da recepcao.

2. Como gestor do hotel, quero que o sistema registre metricas de uso (quantidade de check-ins, chaves emitidas, idiomas selecionados, pagamentos realizados), para otimizar a operacao.

   Decisao do projeto: implementacao bem simples. Basta contar eventos basicos do fluxo (check-in concluido, chave emitida, idioma selecionado) em um contador local em memoria/log estruturado, sem dashboards, sem persistencia em banco analitico e sem ferramentas externas nesta fase.

3. Como gestor do hotel, quero que o totem permita atualizacoes de conteudo, para divulgar promocoes, eventos ou servicos extras.

4. Como gestor do hotel, quero que o sistema seja escalavel, permitindo adicionar novos totens em diferentes pontos do hotel.

5. Como gestor do hotel, quero que o sistema seja compativel com diferentes PMS, para facilitar a integracao.

## User Stories - Vista Usuario

1. Como hospede, quero realizar meu check-in no totem, para evitar filas na recepcao.

2. Como hospede, quero realizar meu check-out de forma rapida, para otimizar meu tempo.

3. Como hospede, quero que o totem esteja integrado ao sistema de gestao do hotel (PMS), para que minhas informacoes estejam automaticamente atualizadas.

4. Como hospede, quero receber minha chave (digital via faceID ou fisica via cartao RFID), de acordo com a tecnologia utilizada pelo hotel, para acessar meu quarto de forma pratica.

   Decisao do projeto: a entrega de chave fisica via RFID e o caminho pretendido, mas fica adiada enquanto o projeto roda apenas online, sem hardware para teste. O MVP entrega somente credencial digital (PIN + chave virtual G-Locks). O ramo RFID sera tratado em fase posterior, com adapter dedicado, quando houver leitor/encoder disponivel.

5. Como hospede, quero que o reconhecimento facial valide minha identidade, para aumentar a seguranca no acesso.

   Decisao do projeto: nao usaremos camera nem biometria facial. A validacao de identidade sera feita pela combinacao "codigo da reserva + CPF" conferida contra o registro do PMS. Para hospedes estrangeiros sem CPF, o CPF e substituido por data de nascimento como fator de validacao. Em caso de divergencia, exibir mensagem generica sem indicar qual campo falhou.

6. Como hospede estrangeiro, quero escolher o idioma de interacao, para entender melhor todas as instrucoes.

## User Stories - Nice to Have

Estas historias aparecem no PDF como opcionais.

1. Como hospede, quero poder efetuar pagamento diretamente no totem durante o check-out, para agilizar o processo.

2. Como hospede, quero visualizar um mapa digital do hotel, para localizar meu quarto e areas comuns.

3. Como hospede, quero receber no totem avisos sobre restaurante, piscina, spa e areas de lazer, para aproveitar melhor os servicos do hotel.

4. Como hospede, quero que o totem me ofereca a opcao de avaliar minha estadia, para contribuir com melhorias.

## Orientacao Para Implementacao

- Priorize primeiro as historias nao opcionais das visoes Usuario, Cliente e FlexMedia.
- Trate pagamentos, mapa digital, avisos de servicos e avaliacao de estadia como funcionalidades opcionais.
- Preserve a direcao atual do MVP descrita no `README.md`: self check-in em modo totem, credencial temporaria e integracao inicial com fechadura eletronica.
- Ao criar novas features, relacione a implementacao a uma ou mais user stories deste arquivo.

## Lacunas Obrigatorias Mapeadas

Levantamento do que ainda falta no codigo atual frente as user stories nao opcionais. Servir de checklist para o time.

### Visao Usuario

- Check-out no totem (US 2): nao existe fluxo nem caso de uso de check-out.
- Integracao real com PMS (US 3): hoje so existe repositorio mock em memoria.
- Chave fisica RFID/cartao (US 4): adiada conforme decisao acima; manter so credencial digital no MVP online.
- Validacao de identidade (US 5): implementar par "codigo + CPF" com fallback para data de nascimento, conforme decisao acima.
- Selecao de idioma / i18n (US 6): UI esta 100% em pt-BR, sem seletor nem dicionario.

### Visao Cliente

- Metricas de uso (US 2): contadores simples conforme decisao acima.
- Atualizacao de conteudo no totem (US 3): area dinamica para promocoes/eventos ainda nao existe.
- Suporte a multiplos totens (US 4): falta identificacao de totem e configuracao por unidade.

### Visao FlexMedia

- Modulos reutilizaveis check-in/out e chaves (US 1): so o modulo de check-in foi separado.
- Adapters plugaveis para PMS e controle de acesso (US 2): existe um repositorio unico, sem abstracao por provedor.
- Branding/white label configuravel (US 3): logo, cores e nome do hotel estao hardcoded.
- Multi-tenant para varios hoteis (US 4): nao existe entidade Hotel/Tenant nem isolamento.

### Gap do MVP declarado no README

- Revogacao automatica das credenciais ao termino da estadia ainda nao foi implementada.
