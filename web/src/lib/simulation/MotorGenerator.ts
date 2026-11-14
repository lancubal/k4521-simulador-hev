import { SIMULATION_CONSTANTS } from './constants';

/**
 * Actuador: Conjunto Motor Térmico + Generador (ICE + MG1).
 * Simula la inercia mecánica de 1er orden mediante filtro pasa-bajos discreto.
 */
export class MotorGenerator {
  public I_c_real: number;
  public readonly tau_a: number;
  public readonly iMin: number;
  public readonly iMax: number;

  constructor(
    tau_a: number = SIMULATION_CONSTANTS.TAU_A,
    iMin: number = SIMULATION_CONSTANTS.I_C_MIN,
    iMax: number = SIMULATION_CONSTANTS.I_C_MAX,
    iInitial: number = 0.0,
  ) {
    this.tau_a = tau_a;
    this.iMin = iMin;
    this.iMax = iMax;
    this.I_c_real = this.clamp(iInitial);
  }

  /**
   * Actualiza la corriente real entregada por el generador:
   * alpha = dt / (tau_a + dt)
   * I_c_real = alpha * I_c_solicitada + (1 - alpha) * I_c_real_prev
   */
  public update(
    I_c_solicitada: number,
    dt: number = SIMULATION_CONSTANTS.DT,
  ): number {
    const alpha = dt / (this.tau_a + dt);
    const iNew = alpha * I_c_solicitada + (1.0 - alpha) * this.I_c_real;
    this.I_c_real = this.clamp(iNew);
    return this.I_c_real;
  }

  public reset(iInitial: number = 0.0): void {
    this.I_c_real = this.clamp(iInitial);
  }

  private clamp(value: number): number {
    return Math.min(this.iMax, Math.max(this.iMin, value));
  }
}
