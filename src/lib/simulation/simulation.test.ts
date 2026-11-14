import { describe, expect, it } from 'vitest';
import { Battery } from './Battery';
import { MotorGenerator } from './MotorGenerator';
import { HCU } from './HCU';
import { SIMULATION_CONSTANTS } from './constants';

describe('Clases de Dominio - Simulador HCU PID', () => {
  it('Battery aplica conteo de Coulombios y clamping estricto entre 0 y 6.5 Ah', () => {
    const battery = new Battery(2.0);
    expect(battery.Q).toBe(2.0);

    // Descarga severa
    expect(battery.update(-50000, 1.0)).toBe(SIMULATION_CONSTANTS.Q_MIN);
    // Carga severa
    expect(battery.update(50000, 1.0)).toBe(SIMULATION_CONSTANTS.Q_MAX);
  });

  it('MotorGenerator aplica filtro de 1er orden y satura entre 0 y 80 A', () => {
    const mg = new MotorGenerator(0.5, 0, 80, 0);
    const dt = 0.1;
    const alpha = dt / (0.5 + dt);

    const firstStep = mg.update(80, dt);
    expect(firstStep).toBeCloseTo(alpha * 80, 5);

    for (let i = 0; i < 100; i++) {
      const val = mg.update(200, dt);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(80);
    }
  });

  it('HCU congela I_acum (Anti-windup) ante saturación sostenida de -150 A y evita overshoot catastrófico', () => {
    const battery = new Battery(2.0);
    const mg = new MotorGenerator();
    const hcu = new HCU();
    const dt = SIMULATION_CONSTANTS.DT;

    // 1. Forzar -150 A durante 100 pasos (10 segundos)
    for (let k = 0; k < 100; k++) {
      const cmd = hcu.compute(battery.Q, dt);
      const real = mg.update(cmd, dt);
      battery.update(real - 150, dt);
    }

    // El actuador debe estar al máximo y el anti-windup debe haber congelado I_acum en 0
    expect(hcu.I_acum).toBe(0);
    expect(hcu.isAntiWindupActive).toBe(true);

    // 2. Soltar el slider a 0 A y dejar que recupere durante 300 segundos
    let maxQ = 0;
    for (let k = 0; k < 3000; k++) {
      const cmd = hcu.compute(battery.Q, dt);
      const real = mg.update(cmd, dt);
      const q = battery.update(real + 0, dt);
      if (q > maxQ) maxQ = q;
    }

    // No debe existir overshoot catastrófico hacia 6.5 Ah
    expect(maxQ).toBeLessThan(3.6);
  });

  it('Converge a error estacionario 0 en escenario Autopista (-20 A)', () => {
    const battery = new Battery(2.0);
    const mg = new MotorGenerator();
    const hcu = new HCU();
    const dt = SIMULATION_CONSTANTS.DT;

    for (let k = 0; k < 6000; k++) {
      const cmd = hcu.compute(battery.Q, dt);
      const real = mg.update(cmd, dt);
      battery.update(real - 20, dt);
    }

    const finalError = SIMULATION_CONSTANTS.Q_R - battery.Q;
    expect(Math.abs(finalError)).toBeLessThan(1e-3);
    expect(mg.I_c_real).toBeCloseTo(20, 1);
  });
});
