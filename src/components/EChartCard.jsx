import * as echarts from "echarts";
import { useEffect, useRef } from "react";

export function EChartCard({ title, subtitle, height = 320, option }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return undefined;

    const chart = echarts.init(chartRef.current, null, {
      renderer: "canvas",
    });
    chart.setOption(option);

    const observer = new ResizeObserver(() => {
      chart.resize();
    });
    observer.observe(chartRef.current);

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [option]);

  return (
    <article className="card p-6">
      <div className="mb-5">
        <h3 className="text-lg font-extrabold text-brand-navy">{title}</h3>
        {subtitle ? (
          <p className="text-sm font-medium text-brand-gray">{subtitle}</p>
        ) : null}
      </div>
      <div ref={chartRef} style={{ height }} />
    </article>
  );
}
