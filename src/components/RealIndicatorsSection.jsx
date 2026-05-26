import {
  BriefcaseBusiness,
  CircleDollarSign,
  HeartPulse,
  UsersRound,
} from "lucide-react";
import { useMemo } from "react";
import { EChartCard } from "./EChartCard.jsx";

const brInteger = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

const brCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const compactNumber = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const kpiIcons = {
  social: UsersRound,
  economy: BriefcaseBusiness,
  health: HeartPulse,
  value: CircleDollarSign,
};

function RealKpiCard({ label, value, variation, tone }) {
  const Icon = tone === "social" && label.includes("Repasse")
    ? CircleDollarSign
    : kpiIcons[tone] || UsersRound;

  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-brand-blue">
          <Icon size={22} strokeWidth={2} />
        </div>
        <span className="max-w-[58%] rounded-full bg-green-50 px-3 py-1 text-right text-xs font-bold leading-snug text-brand-green">
          {variation}
        </span>
      </div>
      <p className="mt-5 text-sm font-semibold text-brand-gray">{label}</p>
      <strong className="mt-1 block text-2xl font-extrabold tracking-normal text-brand-navy">
        {value}
      </strong>
    </article>
  );
}

export function RealIndicatorsSection({ indicators }) {
  const employmentOption = useMemo(() => {
    const data = indicators.employmentMonthly;
    return {
      color: ["#005EA8", "#2E7D4F"],
      tooltip: {
        trigger: "axis",
        valueFormatter: (value) => brInteger.format(value),
      },
      legend: { top: 0, right: 0 },
      grid: { left: 58, right: 56, top: 48, bottom: 42 },
      xAxis: {
        type: "category",
        data: data.map((row) => row.periodo),
        axisLabel: { color: "#6B7280" },
      },
      yAxis: [
        {
          type: "value",
          name: "SC",
          axisLabel: { color: "#6B7280", formatter: compactNumber.format },
        },
        {
          type: "value",
          name: "Tijucas",
          axisLabel: { color: "#6B7280", formatter: compactNumber.format },
        },
      ],
      series: [
        {
          name: "Saldo SC",
          type: "bar",
          data: data.map((row) => row.saldoSc),
          itemStyle: { borderRadius: [5, 5, 0, 0] },
        },
        {
          name: "Saldo Tijucas",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 7,
          data: data.map((row) => row.saldoTijucas),
        },
      ],
    };
  }, [indicators.employmentMonthly]);

  const healthOption = useMemo(() => {
    const data = indicators.healthMonthly;
    return {
      color: ["#005EA8", "#F2A900"],
      tooltip: {
        trigger: "axis",
        valueFormatter: (value) => brInteger.format(value),
      },
      legend: { top: 0, right: 0 },
      grid: { left: 62, right: 62, top: 48, bottom: 42 },
      xAxis: {
        type: "category",
        data: data.map((row) => row.periodo),
        axisLabel: { color: "#6B7280" },
      },
      yAxis: [
        {
          type: "value",
          name: "SC",
          axisLabel: { color: "#6B7280", formatter: compactNumber.format },
        },
        {
          type: "value",
          name: "Tijucas",
          axisLabel: { color: "#6B7280", formatter: compactNumber.format },
        },
      ],
      series: [
        {
          name: "Procedimentos SC",
          type: "line",
          showSymbol: false,
          smooth: true,
          areaStyle: { opacity: 0.1 },
          data: data.map((row) => row.procedimentosSc),
        },
        {
          name: "Procedimentos Tijucas",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 6,
          data: data.map((row) => row.procedimentosTijucas),
        },
      ],
    };
  }, [indicators.healthMonthly]);

  const bolsaFamiliaOption = useMemo(() => {
    const data = indicators.bolsaFamiliaMonthly;
    return {
      color: ["#2E7D4F", "#005EA8"],
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          const label = params[0]?.axisValue ?? "";
          return [
            `<strong>${label}</strong>`,
            ...params.map((item) => {
              const value = item.seriesName.includes("Repasse")
                ? brCurrency.format(item.value)
                : brInteger.format(item.value);
              return `${item.marker}${item.seriesName}: ${value}`;
            }),
          ].join("<br/>");
        },
      },
      legend: { top: 0, right: 0 },
      grid: { left: 58, right: 72, top: 48, bottom: 42 },
      xAxis: {
        type: "category",
        data: data.map((row) => row.periodo),
        axisLabel: { color: "#6B7280" },
      },
      yAxis: [
        {
          type: "value",
          name: "Famílias",
          axisLabel: { color: "#6B7280", formatter: compactNumber.format },
        },
        {
          type: "value",
          name: "R$",
          axisLabel: { color: "#6B7280", formatter: compactNumber.format },
        },
      ],
      series: [
        {
          name: "Repasse Tijucas",
          type: "bar",
          yAxisIndex: 1,
          data: data.map((row) => row.valorTijucas),
          itemStyle: { borderRadius: [5, 5, 0, 0] },
        },
        {
          name: "Famílias Tijucas",
          type: "line",
          smooth: true,
          symbolSize: 7,
          data: data.map((row) => row.familiasTijucas),
        },
      ],
    };
  }, [indicators.bolsaFamiliaMonthly]);

  const scatterOption = useMemo(() => {
    const allCities = indicators.municipalScatter.filter((row) => !row.isTijucas);
    const tijucas = indicators.municipalScatter.filter((row) => row.isTijucas);
    const scatterData = (rows) =>
      rows.map((row) => ({
        name: row.municipio,
        value: [
          row.familiasBeneficiarias,
          row.saldoEmpregos,
          row.procedimentosAmbulatoriais,
          row.valorMedioBeneficio,
        ],
        codigoMunicipio: row.codigoMunicipio,
      }));

    return {
      color: ["#7C8DA1", "#F2A900"],
      tooltip: {
        trigger: "item",
        formatter: (params) => {
          const [familias, saldo, procedimentos, valorMedio] = params.value;
          return [
            `<strong>${params.name}</strong>`,
            `Famílias no BF: ${brInteger.format(familias)}`,
            `Saldo empregos: ${brInteger.format(saldo)}`,
            `Proc. ambulatoriais: ${brInteger.format(procedimentos)}`,
            `Benefício médio: ${brCurrency.format(valorMedio)}`,
          ].join("<br/>");
        },
      },
      legend: { top: 0, right: 0 },
      grid: { left: 78, right: 32, top: 48, bottom: 70 },
      dataZoom: [
        { type: "inside" },
        { type: "slider", bottom: 20, height: 18 },
      ],
      xAxis: {
        type: "value",
        name: "Famílias beneficiárias",
        nameLocation: "middle",
        nameGap: 42,
        axisLabel: { color: "#6B7280", formatter: compactNumber.format },
        splitLine: { lineStyle: { color: "#DDE3EA", type: "dashed" } },
      },
      yAxis: {
        type: "value",
        name: "Saldo de empregos",
        axisLabel: { color: "#6B7280", formatter: compactNumber.format },
        splitLine: { lineStyle: { color: "#DDE3EA", type: "dashed" } },
      },
      series: [
        {
          name: "Municípios SC",
          type: "scatter",
          data: scatterData(allCities),
          symbolSize: (value) => Math.max(7, Math.sqrt(value[2]) / 8),
          itemStyle: { opacity: 0.62 },
        },
        {
          name: "Tijucas",
          type: "scatter",
          data: scatterData(tijucas),
          symbolSize: (value) => Math.max(18, Math.sqrt(value[2]) / 5),
          itemStyle: {
            borderColor: "#003B73",
            borderWidth: 2,
            opacity: 1,
          },
          label: {
            show: true,
            formatter: "{b}",
            position: "right",
            color: "#003B73",
            fontWeight: 700,
          },
        },
      ],
    };
  }, [indicators.municipalScatter]);

  return (
    <section className="flex flex-col gap-5" aria-labelledby="real-title">
      <div>
        <h2 id="real-title" className="text-xl font-extrabold text-brand-navy">
          Indicadores reais para decisão municipal
        </h2>
        <p className="text-sm font-medium text-brand-gray">
          Bolsa Família, empregos formais e produção ambulatorial com recorte de Tijucas e Santa Catarina.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {indicators.kpis.map((kpi) => (
          <RealKpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <EChartCard
          title="Mercado formal de trabalho"
          subtitle={`Saldo mensal do CAGED/MTE, ${indicators.metadata.mteInicio} a ${indicators.metadata.mteFim}`}
          option={employmentOption}
        />
        <EChartCard
          title="Produção ambulatorial SUS"
          subtitle={`Quantidade aprovada no DataSUS, últimos 36 meses disponíveis`}
          option={healthOption}
        />
        <EChartCard
          title="Bolsa Família em Tijucas"
          subtitle={`Famílias e repasse mensal, série até ${indicators.metadata.bolsaFamiliaData}`}
          option={bolsaFamiliaOption}
        />
        <EChartCard
          title="Matriz social, emprego e saúde"
          subtitle="Cada ponto é um município; o tamanho representa procedimentos ambulatoriais"
          height={360}
          option={scatterOption}
        />
      </div>
    </section>
  );
}
