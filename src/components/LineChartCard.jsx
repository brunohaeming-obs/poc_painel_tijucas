import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function LineChartCard({ data }) {
  return (
    <article className="card min-h-[360px] p-6">
      <div className="mb-5">
        <h3 className="text-lg font-extrabold text-brand-navy">
          Evolução de indicadores selecionados
        </h3>
        <p className="text-sm font-medium text-brand-gray">
          Empresas e Empregos
        </p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 14, left: -18, bottom: 4 }}>
            <CartesianGrid stroke="#DDE3EA" strokeDasharray="4 4" />
            <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderColor: "#DDE3EA",
                borderRadius: "12px",
                boxShadow: "0 12px 30px rgba(0, 59, 115, 0.08)",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="saldo" name="Saldo de empregos" stroke="#005EA8" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="admissoes" name="Admissões" stroke="#2E7D4F" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="demissoes" name="Demissões" stroke="#F2A900" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
