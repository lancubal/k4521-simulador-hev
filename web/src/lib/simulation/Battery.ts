import { SIMULATION_CONSTANTS } from './constants';

/**
 * Planta: Batería de Alta Tensión (HV Battery).
 * Modela la integración por conteo de Coulombios con clamping estricto en [0, 6.5] Ah.
 */
export class Battery {
  public Q: number;
  public readonly qMin: number;
  public readonly qMax: number;

  constructor(
    qInitial: number = SIMULATION_CONSTANTS.Q_INITIAL,
    qMin: number = SIMULATION_CONSTANTS.Q_MIN,
    qMax: number = SIMULATION_CONSTANTS.Q_MAX,
  ) {
    this.qMin = qMin;
    this.qMax = qMax;
    this.Q = this.clamp(qInitial);
  }

  /**
   * Actualiza la carga actual Q aplicando integración discreta:
   * Q_new = Q_current + (I_net * dt) / 3600
   */
  public update(I_net: number, dt: number = SIMULATION_CONSTANTS.DT): number {
    const qNew = this.Q + (I_net * dt) / 3600.0;
    this.Q = this.clamp(qNew);
    return this.Q;
  }

  public reset(qInitial: number = SIMULATION_CONSTANTS.Q_INITIAL): void {
    this.Q = this.clamp(qInitial);
  }

  private clamp(value: number): number {
    return Math.min(this.qMax, Math.max(this.qMin, value));
  }
}
