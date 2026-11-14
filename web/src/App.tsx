import React, { useState } from 'react';
import { Activity, Cpu, Moon, Sun } from 'lucide-react';
import { useSimulation } from './hooks/useSimulation';
import { ControlPanel } from './components/ControlPanel';
import { DashboardCharts } from './components/DashboardCharts';
import { SIMULATION_CONSTANTS } from './lib/simulation/constants';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const isDark = theme === 'dark';

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
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Barra superior estilo SCADA / Industrial */}
      <header
        className={`border-b px-6 py-4 shadow-sm transition-colors duration-200 ${
          isDark
            ? 'border-slate-800 bg-slate-900/95'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                isDark
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-emerald-600/30 bg-emerald-50 text-emerald-600'
              }`}
            >
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h1
                className={`text-lg font-bold tracking-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                HCU Toyota Sienna 2026 — Simulador de Control PID (Charge-Sustaining)
              </h1>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Lazo cerrado de regulación de carga HV • Cátedra Teoría de Control (K4521)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 ${
                isDark
                  ? 'border-slate-800 bg-slate-950 text-slate-300'
                  : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
            >
              <Activity className={`h-3.5 w-3.5 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
              dt = {SIMULATION_CONSTANTS.DT}s (100ms)
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 ${
                isDark
                  ? 'border-slate-800 bg-slate-950 text-slate-300'
                  : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
            >
              K_p={SIMULATION_CONSTANTS.K_P} | K_i={SIMULATION_CONSTANTS.K_I} | K_d={SIMULATION_CONSTANTS.K_D}
            </span>

            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-sans text-xs font-medium transition cursor-pointer ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shadow-2xs'
              }`}
              title="Cambiar entre modo claro y oscuro"
            >
              {isDark ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  Modo Claro
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-slate-600" />
                  Modo Oscuro
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Layout Principal */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-12">
        {/* Panel Lateral de Control (4 columnas en desktop) */}
        <div className="lg:col-span-4">
          <ControlPanel
            isDark={isDark}
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
          <DashboardCharts isDark={isDark} history={history} />
        </div>
      </main>
    </div>
  );
};

export default App;
