export function HealthMethodologyFooter({ lastUpdate }: { lastUpdate: string }) {
  return (
    <footer className="rounded-[24px] border border-red-200 bg-[#FFEAE9] px-6 py-5 text-sm text-slate-700 shadow-[0_14px_34px_rgba(236,65,55,0.08)]">
      <h3 className="text-base font-extrabold text-slate-950">Como interpretar os dados</h3>
      <p className="mt-2 leading-7">
        Alguns indicadores de saúde podem apresentar valores acima de 100%. Isso ocorre porque os cálculos usam
        registros administrativos, estimativas populacionais e parâmetros de cobertura. Portanto, os números devem
        ser lidos como aproximações de cobertura ou capacidade, e não como contagem direta de pessoas atendidas.
      </p>
      <div className="mt-4 grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 md:grid-cols-2">
        <p>Fontes: DataSUS/SIA; Relatórios Públicos da APS; DataSUS/TabNet.</p>
        <p className="md:text-right">Última atualização dos dados: {lastUpdate}</p>
      </div>
    </footer>
  );
}
