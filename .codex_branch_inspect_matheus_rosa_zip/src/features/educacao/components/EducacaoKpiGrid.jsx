import { EducacaoKpiCard } from "./EducacaoKpiCard.jsx";

export function EducacaoKpiGrid({ items, variant = "default", isActive = true, animateKey = "" }) {
  return (
    <div className="grid h-full gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <EducacaoKpiCard
          key={item.key}
          item={item}
          variant={variant}
          isActive={isActive}
          animateKey={animateKey}
        />
      ))}
    </div>
  );
}
