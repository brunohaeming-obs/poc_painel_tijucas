"use client";

import * as echarts from "echarts";
import { useEffect, useRef } from "react";

export function EChartCard({ title, subtitle, height = 320, option, variant = "light", actions = null }) {
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
    <article
      className={
        variant === "midnight"
          ? "rounded-lg border border-white/10 bg-[#10293c]/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur 2xl:p-6"
          : variant === "dark"
          ? "rounded-lg border border-white bg-white p-5 2xl:p-6"
          : "card p-6"
      }
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3
            className={
              variant === "midnight"
                ? "text-base font-extrabold text-white"
                : variant === "dark"
                ? "text-base font-extrabold text-brand-navy"
                : "text-lg font-extrabold text-brand-navy"
            }
          >
            {title}
          </h3>
          {subtitle ? (
            <p
              className={
                variant === "midnight"
                  ? "text-xs font-semibold text-sky-100/80"
                  : variant === "dark"
                  ? "text-xs font-semibold text-slate-700"
                  : "text-sm font-medium text-brand-gray"
              }
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div ref={chartRef} style={{ height }} />
    </article>
  );
}
