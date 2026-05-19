import { FileText } from "lucide-react";

export function BulletinsSection({ bulletins }) {
  return (
    <section aria-labelledby="boletins-title">
      <div className="mb-4">
        <h2 id="boletins-title" className="text-xl font-extrabold text-brand-navy">
          Boletins e estudos
        </h2>
        <p className="text-sm font-medium text-brand-gray">
          Publicações para leitura rápida e acompanhamento da cidade.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {bulletins.map((bulletin) => (
          <article className="card p-6" key={bulletin.title}>
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-brand-blue">
              <FileText size={23} />
            </div>
            <h3 className="text-lg font-extrabold text-brand-navy">{bulletin.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">{bulletin.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
