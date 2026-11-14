import { useCallback, useEffect, useRef, useState } from 'react';
import { Battery } from '../lib/simulation/Battery';
import { HCU } from '../lib/simulation/HCU';
import { MotorGenerator } from '../lib/simulation/MotorGenerator';
import { SIMULATION_CONSTANTS } from '../lib/simulation/constants';

export interface SimulationDataPoint {
  /** Tiempo acumulado de simulación (s) */
  t: number;
  /** Nivel de carga actual de la batería (Ah) */
  Q: number;
  /** Porcentaje de Estado de Carga (0% a 100%) */
  socPercent: number;
  /** Corriente ordenada por el controlador HCU (A) */
  I_c_solicitada: number;
  /** Corriente real inyectada por el MotorGenerador (A) */
  I_c_real: number;
  /** Corriente de perturbación externa I_pert = I_r - I_d (A) */
  I_pert: number;
  /** Corriente neta en la batería I_net = I_c_real + I_pert (A) */
  I_net: number;
  /** Error instantáneo e(t) = Q_r - Q(t) (Ah) */
  error: number;
  /** Acumulador integral del PID (A) */
  I_acum: number;
  /** Indica si el clamping Anti-Windup está activo en este paso */
  antiWindup: boolean;
}

function createInitialDataPoint(perturbation: number): SimulationDataPoint {
  const q0 = SIMULATION_CONSTANTS.Q_INITIAL;
  const error0 = SIMULATION_CONSTANTS.Q_R - q0;
  return {
    t: 0.0,
    Q: q0,
    socPercent: (q0 / SIMULATION_CONSTANTS.Q_MAX) * 100,
    I_c_solicitada: 0.0,
    I_c_real: 0.0,
    I_pert: perturbation,
    I_net: perturbation,
    error: error0,
    I_acum: 0.0,
    antiWindup: false,
  };
}

export function useSimulation(initialPerturbation: number = -20) {
  const batteryRef = useRef<Battery>(new Battery(SIMULATION_CONSTANTS.Q_INITIAL));
  const motorGenRef = useRef<MotorGenerator>(new MotorGenerator());
  const hcuRef = useRef<HCU>(new HCU());
  const timeRef = useRef<number>(0.0);
  const perturbationRef = useRef<number>(initialPerturbation);

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [currentPerturbation, setCurrentPerturbationState] =
    useState<number>(initialPerturbation);
  const [history, setHistory] = useState<SimulationDataPoint[]>(() => [
    createInitialDataPoint(initialPerturbation),
  ]);

  const executeTick = useCallback((stepsCount: number = 1) => {
    const dt = SIMULATION_CONSTANTS.DT;
    const battery = batteryRef.current;
    const motorGen = motorGenRef.current;
    const hcu = hcuRef.current;
    const iPert = perturbationRef.current;

    const newPoints: SimulationDataPoint[] = [];

    for (let s = 0; s < stepsCount; s++) {
      timeRef.current = Number((timeRef.current + dt).toFixed(2));
      const qMeasured = battery.Q;
      const error = SIMULATION_CONSTANTS.Q_R - qMeasured;

      // 1. HCU calcula la orden de corriente PID con Anti-Windup
      const iSolicitada = hcu.compute(qMeasured, dt);

      // 2. MotorGenerador aplica su dinámica de 1er orden
      const iReal = motorGen.update(iSolicitada, dt);

      // 3. Corriente neta e integración en la Batería
      const iNet = iReal + iPert;
      const qUpdated = battery.update(iNet, dt);

      newPoints.push({
        t: timeRef.current,
        Q: Number(qUpdated.toFixed(4)),
        socPercent: Number(((qUpdated / SIMULATION_CONSTANTS.Q_MAX) * 100).toFixed(2)),
        I_c_solicitada: Number(iSolicitada.toFixed(2)),
        I_c_real: Number(iReal.toFixed(2)),
        I_pert: Number(iPert.toFixed(2)),
        I_net: Number(iNet.toFixed(2)),
        error: Number((SIMULATION_CONSTANTS.Q_R - qUpdated).toFixed(4)),
        I_acum: Number(hcu.I_acum.toFixed(2)),
        antiWindup: hcu.isAntiWindupActive && Math.abs(error) > 1e-4,
      });
    }

    setHistory((prev) => {
      const merged = [...prev, ...newPoints];
      if (merged.length > SIMULATION_CONSTANTS.MAX_HISTORY_POINTS) {
        return merged.slice(merged.length - SIMULATION_CONSTANTS.MAX_HISTORY_POINTS);
      }
      return merged;
    });
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      executeTick(speedMultiplier);
    }, SIMULATION_CONSTANTS.TICK_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isRunning, speedMultiplier, executeTick]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const setPerturbation = useCallback((value: number) => {
    const clamped = Math.min(
      SIMULATION_CONSTANTS.PERTURBATION_MAX,
      Math.max(SIMULATION_CONSTANTS.PERTURBATION_MIN, value),
    );
    perturbationRef.current = clamped;
    setCurrentPerturbationState(clamped);
  }, []);

  const reset = useCallback(() => {
    batteryRef.current.reset(SIMULATION_CONSTANTS.Q_INITIAL);
    motorGenRef.current.reset(0.0);
    hcuRef.current.reset();
    timeRef.current = 0.0;
    setHistory([createInitialDataPoint(perturbationRef.current)]);
  }, []);

  const latestPoint = history[history.length - 1] ?? createInitialDataPoint(currentPerturbation);

  return {
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
  };
}
