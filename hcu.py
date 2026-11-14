"""Módulo del controlador: Hybrid Control Unit (HCU) con control PID y Anti-Windup."""

import numpy as np
from parametros import I_C_MAX, I_C_MIN, K_D, K_I, K_P, Q_R


class HCU:
    """Controlador PID discreto con mecanismo Anti-Windup (clamping condicional).

    Atributos:
        Q_r (float): Referencia de carga objetivo (Ah).
        K_p (float): Ganancia proporcional.
        K_i (float): Ganancia integral.
        K_d (float): Ganancia derivativa.
        e_prev (float): Error en el instante anterior (Ah).
        I_acum (float): Término integral acumulado (A).
    """

    def __init__(
        self,
        q_r: float = Q_R,
        k_p: float = K_P,
        k_i: float = K_I,
        k_d: float = K_D,
        i_min: float = I_C_MIN,
        i_max: float = I_C_MAX,
    ) -> None:
        self.Q_r: float = float(q_r)
        self.K_p: float = float(k_p)
        self.K_i: float = float(k_i)
        self.K_d: float = float(k_d)
        self.i_min: float = float(i_min)
        self.i_max: float = float(i_max)

        self.e_prev: float = 0.0
        self.I_acum: float = 0.0

    def calcular_orden(self, Q_medido: float, dt: float) -> float:
        """Calcula la orden de corriente de carga I_c mediante ley PID con Anti-Windup.

        Args:
            Q_medido: Carga actual medida en la batería (Ah).
            dt: Paso de tiempo de simulación (s).

        Returns:
            Orden_I_c (A) saturada entre [i_min, i_max].
        """
        error = self.Q_r - Q_medido

        # Acción Proporcional
        p_term = self.K_p * error

        # Acción Derivativa
        d_term = self.K_d * (error - self.e_prev) / dt

        # Candidato de acción Integral
        delta_i = self.K_i * error * dt
        i_acum_candidata = self.I_acum + delta_i

        # Orden tentativa sin saturar
        orden_tentativa = p_term + i_acum_candidata + d_term

        # Mecanismo Anti-Windup (Clamping condicional):
        # Si la salida está saturada y el error tiene el mismo signo que la acción
        # integral (empujando en la dirección de la saturación), se pausa la suma en I_acum.
        saturado_alto = orden_tentativa > self.i_max and error > 0.0
        saturado_bajo = orden_tentativa < self.i_min and error < 0.0
        mismo_signo_integral = (error * i_acum_candidata) > 0.0

        if (saturado_alto or saturado_bajo) and mismo_signo_integral:
            # Pausar integración para evitar integral windup
            orden_i_c = p_term + self.I_acum + d_term
        else:
            self.I_acum = i_acum_candidata
            orden_i_c = orden_tentativa

        # Saturar la salida entre [0, 80] A
        orden_i_c_saturada = float(np.clip(orden_i_c, self.i_min, self.i_max))

        # Actualizar el error previo
        self.e_prev = error

        return orden_i_c_saturada
