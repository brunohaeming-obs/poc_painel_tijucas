import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function BarChartCard({ data }) {
  return (
    <article className="card min-h-[360px] p-6">
      <div className="mb-5">
        <h3 className="text-lg font-extrabold text-brand-navy">
          Indicadores por tema
        </h3>
        <p className="text-sm font-medium text-brand-gray">
          Índice consolidado fictício
        </p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 18, left: 72, bottom: 4 }}
          >
            <CartesianGrid stroke="#DDE3EA" strokeDasharray="4 4" />
            <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 12 }} />
            <YAxis
              dataKey="theme"
              type="category"
              tick={{ fill: "#374151", fontSize: 12 }}
              width={126}
            />
            <Tooltip
              contentStyle={{
                borderColor: "#DDE3EA",
                borderRadius: "12px",
                boxShadow: "0 12px 30px rgba(0, 59, 115, 0.08)",
              }}
            />
            <Bar dataKey="value" name="Pontuação" fill="#005EA8" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
