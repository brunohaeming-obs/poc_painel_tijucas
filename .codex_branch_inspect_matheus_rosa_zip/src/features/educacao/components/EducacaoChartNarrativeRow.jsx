export function EducacaoChartNarrativeRow({ chart, narrative, reverse = false }) {
  return (
    <div
      className={`grid gap-6 xl:items-stretch ${
        reverse
          ? "xl:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]"
          : "xl:grid-cols-[minmax(0,1.28fr)_minmax(280px,0.72fr)]"
      }`}
    >
      {reverse ? (
        <>
          <div className="flex h-full items-center">{narrative}</div>
          <div>{chart}</div>
        </>
      ) : (
        <>
          <div>{chart}</div>
          <div className="flex h-full items-center">{narrative}</div>
        </>
      )}
    </div>
  );
}
