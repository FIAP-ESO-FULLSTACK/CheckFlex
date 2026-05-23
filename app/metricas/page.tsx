import { getServerEventLogger } from "@/infrastructure/server/check-in-services";

// Página interna usada pelo gestor para conferir contadores rápidos sem
// abrir o banco. Sem auth: roda apenas localmente conforme STACK.md.
export default async function MetricsPage() {
  const summary = await getServerEventLogger().summarize();

  return (
    <main className="kiosk-shell">
      <div className="ambient ambient--top" />
      <div className="ambient ambient--bottom" />

      <section className="top-bar">
        <div>
          <span className="eyebrow">CheckFlex</span>
          <h1 className="top-bar__title">Métricas</h1>
        </div>
      </section>

      <section className="workspace workspace--focused">
        <div className="workspace__main">
          <article className="surface surface--feature">
            <div className="surface__header">
              <div>
                <span className="eyebrow">Operação</span>
                <h2>Eventos registrados</h2>
              </div>
            </div>

            <div className="surface__content metrics-grid">
              {Object.entries(summary.byType).map(([type, count]) => (
                <div className="metrics-grid__card" key={type}>
                  <span className="metrics-grid__label">{type}</span>
                  <strong className="metrics-grid__value">{count}</strong>
                </div>
              ))}
            </div>

            <div className="surface__footer">
              <p className="soft-note">Total de eventos: {summary.total}.</p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
