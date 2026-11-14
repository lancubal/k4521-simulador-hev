import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Zap,
  Sliders,
} from 'lucide-react';
import { SIMULATION_CONSTANTS } from '../lib/simulation/constants';
import { SimulationDataPoint } from '../hooks/useSimulation';

interface ControlPanelProps {
  isRunning: boolean;
  currentPerturbation: number;
  speedMultiplier: number;
  latestPoint: SimulationDataPoint;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onPerturbationChange: (value: number) => void;
  onSpeedChange: (speed: number) => void;
}

const PRESETS = [
  {
    id: 'autopista',
    label: 'Autopista',
    description: 'Crucero constante (-20 A)',
    value: -20,
    colorClass:
      'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20',
  },
  {
    id: 'aceleracion',
    label: 'Aceleración Brusca',
    description: 'Demanda máxima (-150 A)',
    value: -150,
    colorClass:
      'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
  },
  {
    id: 'regenerativo',
    label: 'Frenado Regenerativo',
    description: 'Recuperación (+30 A)',
    value: 30,
    colorClass:
      'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20',
  },
  {
    id: 'neutro',
    label: 'Reposo / Neutro',
    description: 'Sin perturbación (0 A)',
    value: 0,
    colorClass:
      'border-slate-500/40 bg-slate-500/10 text-slate-300 hover:bg-slate-500/20',
  },
] as const;

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  currentPerturbation,
  speedMultiplier,
  latestPoint,
  onStart,
  onPause,
  onReset,
  onPerturbationChange,
  onSpeedChange,
}) => {
  return (
    <aside className="flex flex-col gap-5 rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
      {/* Encabezado de Control */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <Sliders className="h-5 w-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-semibold tracking-wider text-slate-100 uppercase">
              Panel de Operación HCU
            </h2>
            <p className="text-xs text-slate-400">
              Control de Tiempo y Perturbaciones
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            isRunning
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isRunning ? 'animate-pulse bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          {isRunning ? 'EN EJECUCIÓN' : 'PAUSADO'}
        </span>
      </div>

      {/* Botones Play / Pause / Reset */}
      <div className="grid grid-cols-2 gap-3">
        {isRunning ? (
          <button
            type="button"
            onClick={onPause}
            className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/15 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:bg-amber-500/25 cursor-pointer"
          >
            <Pause className="h-4 w-4" />
            Pausar
          </button>
        ) : (
          <button
            type="button"
            onClick={onStart}
            className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-4 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/30 cursor-pointer"
          >
            <Play className="h-4 w-4" />
            Iniciar / Reanudar
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          Reiniciar
        </button>
      </div>

      {/* Selector de velocidad de simulación */}
      <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3.5 py-2.5">
        <span className="text-xs font-medium text-slate-400">
          Velocidad de Simulación:
        </span>
        <div className="flex gap-1.5">
          {[1, 2, 5, 10].map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => onSpeedChange(spd)}
              className={`rounded px-2.5 py-1 text-xs font-mono font-semibold transition cursor-pointer ${
                speedMultiplier === spd
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Slider Continuo de Perturbación */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="perturbation-slider"
            className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-300 uppercase"
          >
            <Zap className="h-4 w-4 text-purple-400" />
            Perturbación Externa (I_pert)
          </label>
          <span
            className={`font-mono text-base font-bold ${
              currentPerturbation < 0
                ? 'text-rose-400'
                : currentPerturbation > 0
                  ? 'text-emerald-400'
                  : 'text-slate-300'
            }`}
          >
            {currentPerturbation > 0 ? `+${currentPerturbation}` : currentPerturbation} A
          </span>
        </div>

        <input
          id="perturbation-slider"
          type="range"
          min={SIMULATION_CONSTANTS.PERTURBATION_MIN}
          max={SIMULATION_CONSTANTS.PERTURBATION_MAX}
          step={1}
          value={currentPerturbation}
          onChange={(e) => onPerturbationChange(Number(e.target.value))}
          className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-purple-500"
        />

        <div className="mt-1.5 flex justify-between font-mono text-[11px] text-slate-500">
          <span>-150 A (Descarga)</span>
          <span>0 A</span>
          <span>+50 A (Regen)</span>
        </div>
      </div>

      {/* Botones Predefinidos de Escenarios */}
      <div>
        <h3 className="mb-2.5 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Perfiles de Manejo Predefinidos
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {PRESETS.map((preset) => {
            const isSelected = currentPerturbation === preset.value;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onPerturbationChange(preset.value)}
                className={`flex flex-col items-start rounded-lg border p-2.5 text-left transition cursor-pointer ${
                  preset.colorClass
                } ${isSelected ? 'ring-2 ring-white/40' : ''}`}
              >
                <span className="text-xs font-bold">{preset.label}</span>
                <span className="text-[11px] opacity-80">{preset.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Telemetría Industrial en Vivo */}
      <div className="border-t border-slate-800 pt-4">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          <Gauge className="h-4 w-4 text-sky-400" />
          Telemetría Instantánea (t = {latestPoint.t.toFixed(1)} s)
        </h3>

        <div className="grid grid-cols-2 gap-2.5 font-mono">
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
            <div className="text-[11px] text-slate-400">Carga Batería (Q)</div>
            <div className="text-base font-bold text-sky-400">
              {latestPoint.Q.toFixed(3)} Ah
            </div>
            <div className="text-[11px] text-slate-500">
              SOC: {latestPoint.socPercent.toFixed(1)}% (Ref: 50%)
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
            <div className="text-[11px] text-slate-400">Error (Q_r - Q)</div>
            <div
              className={`text-base font-bold ${
                Math.abs(latestPoint.error) < 0.01
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {latestPoint.error >= 0 ? `+${latestPoint.error.toFixed(4)}` : latestPoint.error.toFixed(4)}{' '}
              Ah
            </div>
            <div className="text-[11px] text-slate-500">Set-point: 3.25 Ah</div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
            <div className="text-[11px] text-slate-400">Generador (I_c_real)</div>
            <div className="text-base font-bold text-amber-400">
              {latestPoint.I_c_real.toFixed(1)} A
            </div>
            <div className="text-[11px] text-slate-500">
              Orden HCU: {latestPoint.I_c_solicitada.toFixed(1)} A
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2.5">
            <div className="text-[11px] text-slate-400">Integrador (I_acum)</div>
            <div className="text-base font-bold text-indigo-400">
              {latestPoint.I_acum.toFixed(2)} A
            </div>
            <div className="text-[11px] text-slate-500">
              I_net: {latestPoint.I_net >= 0 ? `+${latestPoint.I_net.toFixed(1)}` : latestPoint.I_net.toFixed(1)} A
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
