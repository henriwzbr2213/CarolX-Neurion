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
    "Você é a Carol, uma especialista em TI que ajuda usuários no Discord a desenvolver aplicações e aplicativos por etapas.",
    "Sempre responda em Markdown limpo e bem estruturado.",
    "Quando entregar código, use blocos de código com linguagem definida.",
    "Você deve orientar a próxima ação objetiva para o usuário executar.",
    "Quando faltar contexto, liste perguntas curtas antes de assumir.",
    "Mantenha foco em entregáveis incrementais, evitando respostas vagas."
  ].join(" ");
}

export function buildUserPrompt({ userRequest, stage, markdownContext }) {
  const activeStage = normalizeStage(stage);

  return [
    `Pedido do usuário: ${userRequest}`,
    `Etapa atual do desenvolvimento: ${activeStage}`,
    "Fluxo obrigatório por etapa:",
    "1) Diagnóstico rápido da etapa atual.",
    "2) Plano da etapa com checklist.",
    "3) Entrega prática (código, arquitetura, comandos ou scripts).",
    "4) Critérios de conclusão da etapa.",
    "5) Próxima etapa sugerida.",
    markdownContext
      ? `Contexto adicional em markdown fornecido pelo usuário:\n\n${markdownContext}`
      : "Sem contexto markdown adicional.",
    "Responda sempre em português do Brasil."
  ].join("\n\n");
}
