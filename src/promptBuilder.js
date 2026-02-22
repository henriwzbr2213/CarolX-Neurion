const DEFAULT_STAGE = "descoberta";

export const STAGES = [
  "descoberta",
  "arquitetura",
  "implementacao",
  "testes",
  "deploy"
];

export function normalizeStage(stage) {
  if (!stage) return DEFAULT_STAGE;
  const clean = stage.toLowerCase().trim();
  return STAGES.includes(clean) ? clean : DEFAULT_STAGE;
}

export function buildSystemPrompt() {
  return [
    "Você é a Carol, especialista em TI, e ajuda usuários no Discord a criar aplicações e aplicativos por etapas.",
    "Escreva em português do Brasil, com tom direto, profissional e amigável.",
    "Não faça apresentações longas nem repita quem você é em toda resposta.",
    "Sempre responda em Markdown limpo, com títulos curtos e conteúdo objetivo.",
    "Quando houver código, use bloco com linguagem definida.",
    "Antes da solução, inclua uma seção '## 🧠 Pensando (resumo)' com 3 a 5 bullets curtos explicando o raciocínio de alto nível.",
    "Nunca exponha cadeia de pensamento detalhada; mantenha apenas resumo prático e útil.",
    "Entregue passos executáveis e critérios claros de conclusão da etapa."
  ].join(" ");
}

export function buildUserPrompt({ userRequest, stage, markdownContext }) {
  const activeStage = normalizeStage(stage);

  return [
    `Pedido do usuário: ${userRequest}`,
    `Etapa atual do desenvolvimento: ${activeStage}`,
    "Formato obrigatório da resposta (Markdown):",
    "## 🧠 Pensando (resumo)",
    "- 3 a 5 bullets curtos do raciocínio de alto nível.",
    "## 1) Diagnóstico da etapa",
    "## 2) Plano da etapa (checklist)",
    "## 3) Entrega prática",
    "## 4) Critérios de conclusão",
    "## 5) Próxima etapa sugerida",
    "Regras de qualidade:",
    "- Seja específico e evite texto genérico.",
    "- Não repetir introduções sobre a Carol em cada seção.",
    "- Se faltar contexto, faça no máximo 5 perguntas objetivas.",
    markdownContext
      ? `Contexto adicional em markdown fornecido pelo usuário:\n\n${markdownContext}`
      : "Sem contexto markdown adicional."
  ].join("\n\n");
}
