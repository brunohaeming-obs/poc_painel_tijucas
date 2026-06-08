import { EducacaoKpiCard } from "./EducacaoKpiCard.jsx";

export function EducacaoKpiGrid({
  items,
  variant = "default",
  isActive = true,
  animateKey = "",
  stretch = false,
}) {
  return (
    <div className={`grid gap-x-5 gap-y-5 sm:grid-cols-2 ${stretch ? "h-full auto-rows-fr" : ""}`.trim()}>
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
