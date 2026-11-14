import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { SimulationDataPoint } from '../hooks/useSimulation';
import { SIMULATION_CONSTANTS } from '../lib/simulation/constants';

interface DashboardChartsProps {
  history: SimulationDataPoint[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ history }) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Gráfico 1: Evolución del SOC de la Batería (Ah) vs. Tiempo */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
              1. Estado de Carga de la Batería — SOC (Ah) vs. Tiempo
            </h3>
            <p className="text-xs text-slate-400">
              Planta integradora con límites físicos [0.0, 6.5] Ah y referencia Q_r = 3.25 Ah
            </p>
          </div>
          <span className="rounded bg-sky-500/10 px-2.5 py-1 font-mono text-xs font-semibold text-sky-400 border border-sky-500/20">
            Set-point: {SIMULATION_CONSTANTS.Q_R} Ah (50% SOC)
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={history}
              syncId="hev-pid-dashboard"
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="t"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${val}s`}
              />
              <YAxis
                domain={[0, SIMULATION_CONSTANTS.Q_MAX]}
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit=" Ah"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  fontSize: '12px',
                }}
                labelFormatter={(val) => `Tiempo: ${val} s`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine
                y={SIMULATION_CONSTANTS.Q_R}
                stroke="#10b981"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: 'Q_r = 3.25 Ah',
                  position: 'insideTopRight',
                  fill: '#10b981',
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="Q"
                name="Carga Batería Q(t) [Ah]"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Gráfico 2: Corriente del Generador I_c_real y Perturbación I_pert (A) vs. Tiempo */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
              2. Dinámica de Corrientes — Generador (I_c_real) y Perturbación (I_pert)
            </h3>
            <p className="text-xs text-slate-400">
              Respuesta de 1er orden del MotorGenerador (τ_a = 0.5 s, [0, 80] A) frente a demanda externa
            </p>
          </div>
          <span className="rounded bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-semibold text-amber-400 border border-amber-500/20">
            Saturación Actuador: [0, 80] A
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={history}
              syncId="hev-pid-dashboard"
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="t"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${val}s`}
              />
              <YAxis
                domain={[
                  SIMULATION_CONSTANTS.PERTURBATION_MIN - 10,
                  SIMULATION_CONSTANTS.I_C_MAX + 15,
                ]}
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                unit=" A"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  fontSize: '12px',
                }}
                labelFormatter={(val) => `Tiempo: ${val} s`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine
                y={SIMULATION_CONSTANTS.I_C_MAX}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{
                  value: 'Máx 80 A',
                  position: 'insideTopRight',
                  fill: '#ef4444',
                  fontSize: 11,
                }}
              />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="I_c_real"
                name="Corriente Real Generador I_c_real [A]"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="I_c_solicitada"
                name="Orden PID I_c_solicitada [A]"
                stroke="#fcd34d"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="stepAfter"
                dataKey="I_pert"
                name="Perturbación I_pert [A]"
                stroke="#c084fc"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Gráfico 3: Señal de Error (Ah) vs. Tiempo */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
              3. Señal de Error — e(t) = Q_r - Q(t) (Ah) vs. Tiempo
            </h3>
            <p className="text-xs text-slate-400">
              Convergencia a error de estado estacionario nulo (e_ss = 0) por acción integral
            </p>
          </div>
          <span className="rounded bg-rose-500/10 px-2.5 py-1 font-mono text-xs font-semibold text-rose-400 border border-rose-500/20">
            Objetivo: e_ss = 0.000 Ah
          </span>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={history}
              syncId="hev-pid-dashboard"
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="t"
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${val}s`}
              />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" Ah" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  fontSize: '12px',
                }}
                labelFormatter={(val) => `Tiempo: ${val} s`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine
                y={0}
                stroke="#10b981"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: 'e_ss = 0 Ah',
                  position: 'insideTopRight',
                  fill: '#10b981',
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="error"
                name="Error e(t) [Ah]"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};
