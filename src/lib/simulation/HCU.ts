import { SIMULATION_CONSTANTS } from './constants';

/**
 * Controlador: Hybrid Control Unit (HCU) con ley PID discreta y Anti-Windup.
 */
export class HCU {
  public I_acum: number = 0.0;
  public e_prev: number = 0.0;
  public isAntiWindupActive: boolean = false;

  public readonly Q_r: number;
  public readonly K_p: number;
  public readonly K_i: number;
  public readonly K_d: number;
  public readonly iMin: number;
  public readonly iMax: number;

  constructor(
    Q_r: number = SIMULATION_CONSTANTS.Q_R,
    K_p: number = SIMULATION_CONSTANTS.K_P,
    K_i: number = SIMULATION_CONSTANTS.K_I,
    K_d: number = SIMULATION_CONSTANTS.K_D,
    iMin: number = SIMULATION_CONSTANTS.I_C_MIN,
    iMax: number = SIMULATION_CONSTANTS.I_C_MAX,
  ) {
    this.Q_r = Q_r;
    this.K_p = K_p;
    this.K_i = K_i;
    this.K_d = K_d;
    this.iMin = iMin;
    this.iMax = iMax;
  }

  /**
   * Calcula la orden de corriente de carga I_c_solicitada (A).
   * Aplica Anti-Windup por clamping condicional: si la suma PID supera 80 A
   * o es menor a 0 A, satura la salida; si está saturado Y el nuevo error
   * tiene el mismo signo que la acción integral (empujando hacia la saturación),
   * congela la acumulación de I_acum.
   */
  public compute(
    Q_medido: number,
    dt: number = SIMULATION_CONSTANTS.DT,
  ): number {
    const error = this.Q_r - Q_medido;

    // Término Proporcional
    const P = this.K_p * error;

    // Término Derivativo
    const D = (this.K_d * (error - this.e_prev)) / dt;

    // Candidato de actualización Integral
    const deltaI = this.K_i * error * dt;
    const candidateI = this.I_acum + deltaI;

    // Suma PID tentativa antes de saturar
    const rawOutput = P + candidateI + D;

    const isSaturatedHigh = rawOutput > this.iMax && error > 0;
    const isSaturatedLow = rawOutput < this.iMin && error < 0;
    const sameSignAsIntegral = error * candidateI > 0;

    let finalUnsaturatedOutput: number;

    if ((isSaturatedHigh || isSaturatedLow) && sameSignAsIntegral) {
      // Congelar I_acum para evitar integral windup
      this.isAntiWindupActive = true;
      finalUnsaturatedOutput = P + this.I_acum + D;
    } else {
      this.isAntiWindupActive = false;
      this.I_acum = candidateI;
      finalUnsaturatedOutput = rawOutput;
    }

    // Actualizar error previo
    this.e_prev = error;

    // Saturación de salida [0, 80] A
    return this.clamp(finalUnsaturatedOutput);
  }

  public reset(): void {
    this.I_acum = 0.0;
    this.e_prev = 0.0;
    this.isAntiWindupActive = false;
  }

  private clamp(value: number): number {
    return Math.min(this.iMax, Math.max(this.iMin, value));
  }
}
