import { Download, FileText, Info } from "lucide-react";

export function EducacaoFooter({ metadata }) {
  return (
    <footer className="grid gap-4 md:grid-cols-3">
      <section className="educacao-surface educacao-mini-card rounded-[22px] p-4">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          <Download size={16} />
          Downloads
        </div>
        <div className="mt-3 grid gap-1.5">
          {metadata.arquivos_csv.map((fileName) => (
            <a
              key={fileName}
              href={`/downloads/educacao/${fileName}`}
              download
              className="text-xs font-semibold text-slate-100 transition hover:text-white"
            >
              {fileName}
            </a>
          ))}
        </div>
      </section>

      <section className="educacao-surface educacao-mini-card rounded-[22px] p-4">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          <FileText size={16} />
          Nota metodológica
        </div>
        <div className="mt-3 grid gap-2 text-xs leading-6 text-slate-200">
          <p>
            Indicadores de IDEB, Saeb, aprovação, reprovação, abandono e distorção
            idade-série exigem bases complementares do INEP e não devem ser inferidos
            a partir dos microdados do Censo Escolar.
          </p>
          <p>
            Os recortes desta página mostram rede, atendimento, infraestrutura e
            distribuição territorial sem expor desempenho individual por escola.
          </p>
        </div>
      </section>

      <section className="educacao-surface educacao-mini-card rounded-[22px] p-4">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          <Info size={16} />
          Fonte
        </div>
        <div className="mt-3 grid gap-1.5 text-xs leading-6 text-slate-200">
          <p>
            Fonte principal: <strong>Censo Escolar/INEP</strong>.
          </p>
          <p>Município: Tijucas/SC.</p>
          <p>Última publicação local: {metadata.gerado_em}.</p>
        </div>
      </section>
    </footer>
  );
}
