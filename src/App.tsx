import React from 'react';
import { Activity, Cpu } from 'lucide-react';
import { useSimulation } from './hooks/useSimulation';
import { ControlPanel } from './components/ControlPanel';
import { DashboardCharts } from './components/DashboardCharts';
import { SIMULATION_CONSTANTS } from './lib/simulation/constants';

export const App: React.FC = () => {
  const {
    history,
    latestPoint,
    currentPerturbation,
    isRunning,
    speedMultiplier,
    start,
    pause,
    reset,
    setPerturbation,
    setSpeedMultiplier,
  } = useSimulation(-20);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Barra superior estilo SCADA / Industrial */}
      <header className="border-b border-slate-800 bg-slate-900/95 px-6 py-4 shadow-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-100">
                HCU Toyota Sienna 2026 — Simulador de Control PID (Charge-Sustaining)
              </h1>
              <p className="text-xs text-slate-400">
                Lazo cerrado de regulación de carga HV • Cátedra Teoría de Control (K4521)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300">
              <Activity className="h-3.5 w-3.5 text-sky-400" />
              dt = {SIMULATION_CONSTANTS.DT}s (100ms)
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300">
              K_p={SIMULATION_CONSTANTS.K_P} | K_i={SIMULATION_CONSTANTS.K_I} | K_d={SIMULATION_CONSTANTS.K_D}
            </span>
          </div>
        </div>
      </header>

      {/* Layout Principal */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        {/* Panel Lateral de Control (4 columnas en desktop) */}
        <div className="lg:col-span-4">
          <ControlPanel
            isRunning={isRunning}
            currentPerturbation={currentPerturbation}
            speedMultiplier={speedMultiplier}
            latestPoint={latestPoint}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onPerturbationChange={setPerturbation}
            onSpeedChange={setSpeedMultiplier}
          />
        </div>

        {/* Gráficos Sincronizados en Tiempo Real (8 columnas en desktop) */}
        <div className="lg:col-span-8">
          <DashboardCharts history={history} />
        </div>
      </main>
    </div>
  );
};

export default App;
