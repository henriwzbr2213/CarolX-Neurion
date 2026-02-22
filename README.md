# Discord Gemini Dev Bot

Bot para Discord que usa Gemini para ajudar a construir aplicações **por etapas**, com respostas em **Markdown** e ingestão de contexto em arquivos/links `.md`.

## O que ele faz

- Responde quando for mencionado em canais ou em DM.
- Usa modelo Gemini configurável (padrão: `gemini-2.0-flash`).
- Estrutura a resposta por etapas: diagnóstico, plano, entrega, critérios e próxima etapa.
- Lê markdown de:
  - links terminando em `.md`
  - anexos `.md` e `.markdown`

## Configuração

1. Instale dependências:

```bash
npm install
```

2. Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

3. Preencha `.env` com tokens/chaves.

4. Rode o bot:

```bash
npm start
```

## Uso no Discord

Mencione o bot com algo como:

```text
@SeuBot etapa: arquitetura
Quero criar um SaaS de agendamento com multitenancy.
```

Etapas aceitas:

- `descoberta`
- `arquitetura`
- `implementacao`
- `testes`
- `deploy`

## Observações

- O bot limita contexto markdown carregado para evitar respostas gigantes.
- Em mensagens longas, a resposta é dividida automaticamente em blocos.
