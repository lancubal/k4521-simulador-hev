"""Módulo del actuador: Motor Térmico + Generador (MG1/ICE) con dinámica de 1er orden."""

import numpy as np
from parametros import I_C_MAX, I_C_MIN, TAU_A


class MotorGenerador:
    """Simula el retardo dinámico de primer orden del conjunto motor-generador.

    Función de transferencia continua:
        G_a(s) = 1 / (tau_a * s + 1)

    Discretización mediante filtro pasa-bajos (Euler implícito):
        alpha = dt / (tau_a + dt)
        I_c_real[k] = alpha * I_c_solicitada[k] + (1 - alpha) * I_c_real[k-1]
    """

    def __init__(
        self,
        tau_a: float = TAU_A,
        i_min: float = I_C_MIN,
        i_max: float = I_C_MAX,
        i_inicial: float = 0.0,
    ) -> None:
        self.tau_a: float = float(tau_a)
        self.i_min: float = float(i_min)
        self.i_max: float = float(i_max)
        self.I_c_real: float = float(np.clip(i_inicial, self.i_min, self.i_max))

    def actualizar(self, I_c_solicitada: float, dt: float) -> float:
        """Calcula la corriente real entregada aplicando el retardo de 1er orden y saturación.

        Args:
            I_c_solicitada: Orden de corriente enviada por la HCU (A).
            dt: Paso de tiempo de simulación (s).

        Returns:
            Corriente de carga real I_c_real (A), limitada entre [i_min, i_max].
        """
        alpha = dt / (self.tau_a + dt)
        i_nueva = alpha * I_c_solicitada + (1.0 - alpha) * self.I_c_real
        self.I_c_real = float(np.clip(i_nueva, self.i_min, self.i_max))
        return self.I_c_real
