export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden rounded-card bg-brand-navy px-6 py-7 text-white shadow-soft md:px-10 md:py-8"
    >
      <img
        src="/assets/foto-bairro-tijucas.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.42)_52%,rgba(255,255,255,0.88)_100%)]" />
      <img
        src="/assets/logo-turismo-tijucas-2.png"
        alt="Turismo Tijucas"
        className="absolute right-8 top-1/2 hidden max-h-40 w-[min(28vw,340px)] -translate-y-1/2 object-contain drop-shadow-[0_18px_34px_rgba(0,0,0,0.30)] lg:block"
      />

      <div className="relative max-w-3xl lg:max-w-[58%]">
        <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-normal md:text-5xl">
          Observatório Municipal de Tijucas
        </h1>
      </div>
    </section>
  );
}
