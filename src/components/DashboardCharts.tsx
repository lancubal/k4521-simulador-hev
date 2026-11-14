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
  isDark?: boolean;
  history: SimulationDataPoint[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  isDark = false,
  history,
}) => {
  const cardClass = isDark
    ? 'border-slate-800 bg-slate-900/90'
    : 'border-slate-200 bg-white';
  const titleClass = isDark ? 'text-slate-100' : 'text-slate-900';
  const subtitleClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const axisStroke = isDark ? '#64748b' : '#475569';
  const tooltipStyle = isDark
    ? {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        color: '#f8fafc',
        fontSize: '12px',
      }
    : {
        backgroundColor: '#ffffff',
        borderColor: '#cbd5e1',
        color: '#0f172a',
        fontSize: '12px',
      };

  return (
    <div className="flex flex-col gap-5">
      {/* Gráfico 1: Evolución del SOC de la Batería (Ah) vs. Tiempo */}
      <section
        className={`rounded-xl border p-4 shadow-md transition-colors duration-200 ${cardClass}`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className={`text-sm font-semibold tracking-wide uppercase ${titleClass}`}>
              1. Estado de Carga de la Batería — SOC (Ah) vs. Tiempo
            </h3>
            <p className={`text-xs ${subtitleClass}`}>
              Planta integradora con límites físicos [0.0, 6.5] Ah y referencia Q_r = 3.25 Ah
            </p>
          </div>
          <span
            className={`rounded border px-2.5 py-1 font-mono text-xs font-semibold ${
              isDark
                ? 'border-sky-500/20 bg-sky-500/10 text-sky-400'
                : 'border-sky-200 bg-sky-50 text-sky-700'
            }`}
          >
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
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                dataKey="t"
                stroke={axisStroke}
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${val}s`}
              />
              <YAxis
                domain={[0, SIMULATION_CONSTANTS.Q_MAX]}
                stroke={axisStroke}
                tick={{ fontSize: 11 }}
                unit=" Ah"
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(val) => `Tiempo: ${val} s`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine
                y={SIMULATION_CONSTANTS.Q_R}
                stroke="#059669"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: 'Q_r = 3.25 Ah',
                  position: 'insideTopRight',
                  fill: '#059669',
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="Q"
                name="Carga Batería Q(t) [Ah]"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Gráfico 2: Corriente del Generador I_c_real y Perturbación I_pert (A) vs. Tiempo */}
      <section
        className={`rounded-xl border p-4 shadow-md transition-colors duration-200 ${cardClass}`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className={`text-sm font-semibold tracking-wide uppercase ${titleClass}`}>
              2. Dinámica de Corrientes — Generador (I_c_real) y Perturbación (I_pert)
            </h3>
            <p className={`text-xs ${subtitleClass}`}>
              Respuesta de 1er orden del MotorGenerador (τ_a = 0.5 s, [0, 80] A) frente a demanda externa
            </p>
          </div>
          <span
            className={`rounded border px-2.5 py-1 font-mono text-xs font-semibold ${
              isDark
                ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
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
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                dataKey="t"
                stroke={axisStroke}
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${val}s`}
              />
              <YAxis
                domain={[
                  SIMULATION_CONSTANTS.PERTURBATION_MIN - 10,
                  SIMULATION_CONSTANTS.I_C_MAX + 15,
                ]}
                stroke={axisStroke}
                tick={{ fontSize: 11 }}
                unit=" A"
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(val) => `Tiempo: ${val} s`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine
                y={SIMULATION_CONSTANTS.I_C_MAX}
                stroke="#dc2626"
                strokeDasharray="4 4"
                label={{
                  value: 'Máx 80 A',
                  position: 'insideTopRight',
                  fill: '#dc2626',
                  fontSize: 11,
                }}
              />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="I_c_real"
                name="Corriente Real Generador I_c_real [A]"
                stroke="#d97706"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="I_c_solicitada"
                name="Orden PID I_c_solicitada [A]"
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="stepAfter"
                dataKey="I_pert"
                name="Perturbación I_pert [A]"
                stroke="#9333ea"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Gráfico 3: Señal de Error (Ah) vs. Tiempo */}
      <section
        className={`rounded-xl border p-4 shadow-md transition-colors duration-200 ${cardClass}`}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className={`text-sm font-semibold tracking-wide uppercase ${titleClass}`}>
              3. Señal de Error — e(t) = Q_r - Q(t) (Ah) vs. Tiempo
            </h3>
            <p className={`text-xs ${subtitleClass}`}>
              Convergencia a error de estado estacionario nulo (e_ss = 0) por acción integral
            </p>
          </div>
          <span
            className={`rounded border px-2.5 py-1 font-mono text-xs font-semibold ${
              isDark
                ? 'border-rose-500/20 bg-rose-500/10 text-rose-400'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
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
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                dataKey="t"
                stroke={axisStroke}
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${val}s`}
              />
              <YAxis stroke={axisStroke} tick={{ fontSize: 11 }} unit=" Ah" />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(val) => `Tiempo: ${val} s`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <ReferenceLine
                y={0}
                stroke="#059669"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: 'e_ss = 0 Ah',
                  position: 'insideTopRight',
                  fill: '#059669',
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="error"
                name="Error e(t) [Ah]"
                stroke="#e11d48"
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
