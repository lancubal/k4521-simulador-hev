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
  isDark?: boolean;
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
    darkClass:
      'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20',
    lightClass:
      'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100',
  },
  {
    id: 'aceleracion',
    label: 'Aceleración Brusca',
    description: 'Demanda máxima (-150 A)',
    value: -150,
    darkClass:
      'border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
    lightClass:
      'border-rose-300 bg-rose-50 text-rose-900 hover:bg-rose-100',
  },
  {
    id: 'regenerativo',
    label: 'Frenado Regenerativo',
    description: 'Recuperación (+30 A)',
    value: 30,
    darkClass:
      'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20',
    lightClass:
      'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100',
  },
  {
    id: 'neutro',
    label: 'Reposo / Neutro',
    description: 'Sin perturbación (0 A)',
    value: 0,
    darkClass:
      'border-slate-500/40 bg-slate-500/10 text-slate-300 hover:bg-slate-500/20',
    lightClass:
      'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200',
  },
] as const;

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isDark = false,
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
    <aside
      className={`flex flex-col gap-5 rounded-xl border p-5 shadow-md transition-colors duration-200 ${
        isDark
          ? 'border-slate-800 bg-slate-900/90'
          : 'border-slate-200 bg-white'
      }`}
    >
      {/* Encabezado de Control */}
      <div
        className={`flex items-center justify-between border-b pb-4 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <Sliders className={`h-5 w-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <div>
            <h2
              className={`text-sm font-semibold tracking-wider uppercase ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              Panel de Operación HCU
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Control de Tiempo y Perturbaciones
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
            isRunning
              ? isDark
                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                : 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : isDark
                ? 'border-amber-500/30 bg-amber-500/15 text-amber-300'
                : 'border-amber-300 bg-amber-50 text-amber-700'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isRunning ? 'animate-pulse bg-emerald-500' : 'bg-amber-500'
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
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
              isDark
                ? 'border-amber-500/40 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
                : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Pause className="h-4 w-4" />
            Pausar
          </button>
        ) : (
          <button
            type="button"
            onClick={onStart}
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
              isDark
                ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                : 'border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            <Play className="h-4 w-4" />
            Iniciar / Reanudar
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
            isDark
              ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
              : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          Reiniciar
        </button>
      </div>

      {/* Selector de velocidad de simulación */}
      <div
        className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 ${
          isDark
            ? 'border-slate-800 bg-slate-950/60'
            : 'border-slate-200 bg-slate-50'
        }`}
      >
        <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
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
                  ? 'bg-emerald-600 text-white'
                  : isDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Slider Continuo de Perturbación */}
      <div
        className={`rounded-xl border p-4 ${
          isDark
            ? 'border-slate-800 bg-slate-950/80'
            : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="perturbation-slider"
            className={`flex items-center gap-2 text-xs font-semibold tracking-wide uppercase ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            <Zap className={`h-4 w-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            Perturbación Externa (I_pert)
          </label>
          <span
            className={`font-mono text-base font-bold ${
              currentPerturbation < 0
                ? isDark
                  ? 'text-rose-400'
                  : 'text-rose-600'
                : currentPerturbation > 0
                  ? isDark
                    ? 'text-emerald-400'
                    : 'text-emerald-600'
                  : isDark
                    ? 'text-slate-300'
                    : 'text-slate-700'
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
          className={`h-2.5 w-full cursor-pointer appearance-none rounded-lg accent-purple-600 ${
            isDark ? 'bg-slate-800' : 'bg-slate-200'
          }`}
        />

        <div className="mt-1.5 flex justify-between font-mono text-[11px] text-slate-500">
          <span>-150 A (Descarga)</span>
          <span>0 A</span>
          <span>+50 A (Regen)</span>
        </div>
      </div>

      {/* Botones Predefinidos de Escenarios */}
      <div>
        <h3
          className={`mb-2.5 text-xs font-semibold tracking-wider uppercase ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
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
                  isDark ? preset.darkClass : preset.lightClass
                } ${
                  isSelected
                    ? isDark
                      ? 'ring-2 ring-white/40'
                      : 'ring-2 ring-slate-900/25'
                    : ''
                }`}
              >
                <span className="text-xs font-bold">{preset.label}</span>
                <span className="text-[11px] opacity-80">{preset.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Telemetría Industrial en Vivo */}
      <div className={`border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <h3
          className={`mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          <Gauge className={`h-4 w-4 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
          Telemetría Instantánea (t = {latestPoint.t.toFixed(1)} s)
        </h3>

        <div className="grid grid-cols-2 gap-2.5 font-mono">
          <div
            className={`rounded-lg border p-2.5 ${
              isDark
                ? 'border-slate-800 bg-slate-950/70'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Carga Batería (Q)
            </div>
            <div className={`text-base font-bold ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
              {latestPoint.Q.toFixed(3)} Ah
            </div>
            <div className="text-[11px] text-slate-500">
              SOC: {latestPoint.socPercent.toFixed(1)}% (Ref: 50%)
            </div>
          </div>

          <div
            className={`rounded-lg border p-2.5 ${
              isDark
                ? 'border-slate-800 bg-slate-950/70'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Error (Q_r - Q)
            </div>
            <div
              className={`text-base font-bold ${
                Math.abs(latestPoint.error) < 0.01
                  ? isDark
                    ? 'text-emerald-400'
                    : 'text-emerald-600'
                  : isDark
                    ? 'text-rose-400'
                    : 'text-rose-600'
              }`}
            >
              {latestPoint.error >= 0
                ? `+${latestPoint.error.toFixed(4)}`
                : latestPoint.error.toFixed(4)}{' '}
              Ah
            </div>
            <div className="text-[11px] text-slate-500">Set-point: 3.25 Ah</div>
          </div>

          <div
            className={`rounded-lg border p-2.5 ${
              isDark
                ? 'border-slate-800 bg-slate-950/70'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Generador (I_c_real)
            </div>
            <div className={`text-base font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              {latestPoint.I_c_real.toFixed(1)} A
            </div>
            <div className="text-[11px] text-slate-500">
              Orden HCU: {latestPoint.I_c_solicitada.toFixed(1)} A
            </div>
          </div>

          <div
            className={`rounded-lg border p-2.5 ${
              isDark
                ? 'border-slate-800 bg-slate-950/70'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Integrador (I_acum)
            </div>
            <div className={`text-base font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
              {latestPoint.I_acum.toFixed(2)} A
            </div>
            <div className="text-[11px] text-slate-500">
              I_net:{' '}
              {latestPoint.I_net >= 0
                ? `+${latestPoint.I_net.toFixed(1)}`
                : latestPoint.I_net.toFixed(1)}{' '}
              A
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
