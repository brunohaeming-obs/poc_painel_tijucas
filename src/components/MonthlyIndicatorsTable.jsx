import { Download } from "lucide-react";

export function MonthlyIndicatorsTable({ indicators }) {
  return (
    <section className="card overflow-hidden" aria-labelledby="indicadores-mensais">
      <div className="border-b border-brand-border px-6 py-5">
        <h2 id="indicadores-mensais" className="text-xl font-extrabold text-brand-navy">
          Bases de dados disponíveis
        </h2>
        <p className="text-sm font-medium text-brand-gray">
          Arquivos já coletados e tratados para consulta, auditoria e reutilização.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-left">
          <thead className="bg-brand-chip text-sm text-slate-700">
            <tr>
              <th className="px-6 py-4 font-extrabold">Base</th>
              <th className="px-6 py-4 font-extrabold">Descrição</th>
              <th className="px-6 py-4 font-extrabold">Período</th>
              <th className="px-6 py-4 font-extrabold">Formato</th>
              <th className="px-6 py-4 font-extrabold">Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border text-sm">
            {indicators.map((item) => (
              <tr className="bg-white transition hover:bg-slate-50" key={item.indicator}>
                <td className="px-6 py-4 font-bold text-brand-navy">{item.indicator}</td>
                <td className="px-6 py-4 text-slate-700">{item.description}</td>
                <td className="px-6 py-4 text-slate-700">{item.period}</td>
                <td className="px-6 py-4 text-slate-700">
                  <span className="rounded border border-brand-border bg-brand-page px-2 py-1 text-xs font-bold">
                    {item.format}
                  </span>
                  <span className="ml-2 text-xs font-semibold text-brand-gray">
                    {item.size}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <a
                    className="inline-flex items-center gap-2 font-bold text-brand-blue hover:text-brand-navy"
                    href={item.href}
                    download
                  >
                    Baixar base
                    <Download size={16} />
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
