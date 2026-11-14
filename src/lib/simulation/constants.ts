/**
 * Parámetros fijos del sistema de simulación HCU - Toyota Sienna 2026
 */
export const SIMULATION_CONSTANTS = {
  /** Frecuencia de simulación lógica (segundos) */
  DT: 0.1,
  /** Intervalo del loop en milisegundos (100 ms) */
  TICK_MS: 100,
  /** Referencia de carga objetivo (50% SOC en Ah) */
  Q_R: 3.25,
  /** Capacidad máxima de la batería (100% SOC en Ah) */
  Q_MAX: 6.5,
  /** Capacidad mínima de la batería (0% SOC en Ah) */
  Q_MIN: 0.0,
  /** Carga inicial por defecto (Ah) */
  Q_INITIAL: 2.0,
  /** Ganancia proporcional PID */
  K_P: 120,
  /** Ganancia integral PID */
  K_I: 5,
  /** Ganancia derivativa PID */
  K_D: 30,
  /** Corriente mínima del actuador (A) */
  I_C_MIN: 0.0,
  /** Corriente máxima del actuador (A) */
  I_C_MAX: 80.0,
  /** Constante de tiempo del actuador (segundos) */
  TAU_A: 0.5,
  /** Rango del slider de perturbación (A) */
  PERTURBATION_MIN: -150,
  PERTURBATION_MAX: 50,
  /** Cantidad de puntos visibles en la ventana histórica de tiempo real */
  MAX_HISTORY_POINTS: 300,
} as const;
