// Grade de botões que seleciona o eixo temático ativo no painel.
import { palette } from "../../../shared/charts/palette.js";
import { axisTheme, themeIcons } from "../config/axes.js";

function AxisThemeButton({ theme, active, onClick }) {
  const Icon = themeIcons[theme.id];
  const themeColors = axisTheme[theme.id] ?? axisTheme.economiaEmpregos;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="group min-h-[148px] rounded-lg border p-5 text-left text-brand-navy transition hover:shadow-soft"
      style={{
        borderColor: active ? themeColors.primary : palette.border,
        background: active
          ? `linear-gradient(180deg, ${themeColors.secondary} 0%, #FFFFFF 100%)`
          : "#FFFFFF",
        boxShadow: active ? `0 18px 40px ${themeColors.primary}22` : undefined,
      }}
    >
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <span
            className="grid h-11 w-11 place-items-center rounded-lg border"
            style={{
              backgroundColor: active ? themeColors.primary : themeColors.secondary,
              borderColor: `${themeColors.primary}33`,
              color: active ? "#FFFFFF" : themeColors.primary,
            }}
          >
            <Icon size={23} strokeWidth={2.2} />
          </span>
        </div>
        <div>
          <strong className="block text-lg font-extrabold leading-tight">{theme.label}</strong>
          <p
            className="mt-1 text-xs font-semibold"
            style={{ color: active ? themeColors.primary : "#6B7280" }}
          >
            Ver painel
          </p>
        </div>
      </div>
    </button>
  );
}

export function AxisSelector({ themes, activeThemeId, onSelect }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {themes.map((theme) => (
        <AxisThemeButton
          key={theme.id}
          theme={theme}
          active={theme.id === activeThemeId}
          onClick={() => onSelect(theme.id)}
        />
      ))}
    </div>
  );
}
