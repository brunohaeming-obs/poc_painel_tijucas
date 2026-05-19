import { ExternalLink } from "lucide-react";

export function MonthlyIndicatorsTable({ indicators }) {
  return (
    <section className="card overflow-hidden" aria-labelledby="indicadores-mensais">
      <div className="border-b border-brand-border px-6 py-5">
        <h2 id="indicadores-mensais" className="text-xl font-extrabold text-brand-navy">
          Tabela de indicadores mensais
        </h2>
        <p className="text-sm font-medium text-brand-gray">
          Fontes simuladas preparadas para integração futura.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[820px] w-full text-left">
          <thead className="bg-brand-chip text-sm text-slate-700">
            <tr>
              <th className="px-6 py-4 font-extrabold">Indicador</th>
              <th className="px-6 py-4 font-extrabold">Descrição</th>
              <th className="px-6 py-4 font-extrabold">Frequência</th>
              <th className="px-6 py-4 font-extrabold">Última atualização</th>
              <th className="px-6 py-4 font-extrabold">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border text-sm">
            {indicators.map((item) => (
              <tr className="bg-white transition hover:bg-slate-50" key={item.indicator}>
                <td className="px-6 py-4 font-bold text-brand-navy">{item.indicator}</td>
                <td className="px-6 py-4 text-slate-700">{item.description}</td>
                <td className="px-6 py-4 text-slate-700">{item.frequency}</td>
                <td className="px-6 py-4 text-slate-700">{item.updatedAt}</td>
                <td className="px-6 py-4">
                  <a
                    className="inline-flex items-center gap-2 font-bold text-brand-blue hover:text-brand-navy"
                    href="#indicadores-mensais"
                  >
                    Ver indicador
                    <ExternalLink size={16} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
