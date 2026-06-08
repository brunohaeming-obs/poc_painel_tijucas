import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const integerFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 0,
});

function formatCurrencyAxis(value) {
  if (value >= 1_000_000) {
    return `R$ ${integerFormatter.format(value / 1_000_000)} mi`;
  }

  return currencyFormatter.format(value);
}

export function BolsaFamiliaScChartCard({ data }) {
  return (
    <article className="card min-h-[420px] p-6">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-brand-navy">
            Bolsa Familia em Santa Catarina
          </h3>
          <p className="text-sm font-medium text-brand-gray">
            Familias beneficiarias e valor total repassado
          </p>
        </div>
        <span className="w-fit rounded border border-brand-border bg-brand-soft px-3 py-1 text-xs font-bold text-brand-blue">
          jan/2004 a mai/2026
        </span>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 8, left: 4, bottom: 4 }}
          >
            <CartesianGrid stroke="#DDE3EA" strokeDasharray="4 4" />
            <XAxis
              dataKey="periodo"
              minTickGap={28}
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />
            <YAxis
              yAxisId="familias"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickFormatter={(value) => integerFormatter.format(value)}
              width={74}
            />
            <YAxis
              yAxisId="valor"
              orientation="right"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              tickFormatter={formatCurrencyAxis}
              width={78}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === "Valor total repassado") {
                  return [currencyFormatter.format(value), name];
                }

                return [integerFormatter.format(value), name];
              }}
              labelFormatter={(label) => `Periodo: ${label}`}
              contentStyle={{
                borderColor: "#DDE3EA",
                borderRadius: "12px",
                boxShadow: "0 12px 30px rgba(0, 59, 115, 0.08)",
              }}
            />
            <Legend />
            <Bar
              yAxisId="valor"
              dataKey="valorTotalRepassado"
              name="Valor total repassado"
              fill="#2E7D4F"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="familias"
              type="monotone"
              dataKey="familiasBeneficiarias"
              name="Familias beneficiarias"
              stroke="#005EA8"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
