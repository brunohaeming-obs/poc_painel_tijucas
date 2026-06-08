// Metadados de apresentação dos eixos temáticos: cores, ícones e narrativas.
// O conteúdo de dados de cada eixo vive em features/dashboard/data/thematicDashboardData.js.
import {
  Banknote,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  HardHat,
  HeartPulse,
  Leaf,
  UsersRound,
} from "lucide-react";

// Cor primária/secundária usada no botão de cada eixo no seletor.
export const axisTheme = {
  economiaEmpregos: { primary: "#007FFE", secondary: "#EFF6FF" },
  populacao: { primary: "#8D2A8A", secondary: "#FFEFFE" },
  educacao: { primary: "#F2A116", secondary: "#FDE7C2" },
  saude: { primary: "#EC4137", secondary: "#FFEAE9" },
  meioAmbiente: { primary: "#71B434", secondary: "#E7F7DA" },
  contasPublicas: { primary: "#FCD418", secondary: "#FDF5C7" },
  construcaoCivil: { primary: "#000086", secondary: "#EBF4FF" },
};

export const themeIcons = {
  contasPublicas: Banknote,
  saude: HeartPulse,
  educacao: GraduationCap,
  economiaEmpregos: BriefcaseBusiness,
  meioAmbiente: Leaf,
  populacao: UsersRound,
  construcaoCivil: HardHat || Building2,
};

export const axisNarratives = {
  economiaEmpregos:
    "A economia mostra a capacidade do município de gerar renda, manter empregos e sustentar a atividade produtiva. Este eixo ajuda a identificar setores em expansão, pressões sociais e oportunidades para políticas de desenvolvimento local.",
  populacao:
    "A população orienta a escala dos serviços públicos e a demanda por equipamentos urbanos. Entender crescimento, domicílios e perfil etário apoia o planejamento de saúde, educação, mobilidade e habitação.",
  educacao:
    "A educação acompanha acesso, permanência e aprendizagem na rede. O eixo é central para avaliar capacidade escolar, pressão por vagas e resultados que afetam o desenvolvimento de longo prazo.",
  saude:
    "A saúde revela o uso da rede assistencial e os principais pontos de pressão operacional. Monitorar procedimentos, cobertura e linhas de cuidado apoia decisões sobre oferta, equipes e prioridades de atendimento.",
  meioAmbiente:
    "O meio ambiente acompanha resíduos, licenciamento, arborização e riscos urbanos. O eixo permite observar sustentabilidade, qualidade de vida e impactos do crescimento sobre o território.",
  contasPublicas:
    "Contas públicas mostram a capacidade de arrecadar, executar o orçamento e financiar entregas. Este eixo é essencial para avaliar sustentabilidade fiscal, investimentos e prioridades de gasto.",
  construcaoCivil:
    "A construção civil indica dinâmica urbana, investimento privado e pressão sobre infraestrutura. Alvarás, área licenciada e tipos de obra ajudam a antecipar demandas por serviços e ordenamento territorial.",
};

// Evento custom usado por outras partes da página para trocar o eixo ativo.
export const THEME_SELECT_EVENT = "tijucas:select-theme";
