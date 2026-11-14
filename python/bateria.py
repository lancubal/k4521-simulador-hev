"""Módulo de la planta: Batería de Alta Tensión (HV Battery)."""

import numpy as np
from parametros import Q_INICIAL, Q_MAX, Q_MIN


class Bateria:
    """Modela la batería del vehículo híbrido mediante conteo de Coulombios.

    Atributos:
        Q (float): Nivel de carga actual en Amperes-hora (Ah).
        q_min (float): Capacidad mínima permitida (Ah).
        q_max (float): Capacidad máxima permitida (Ah).
    """

    def __init__(
        self,
        q_inicial: float = Q_INICIAL,
        q_min: float = Q_MIN,
        q_max: float = Q_MAX,
    ) -> None:
        self.q_min: float = float(q_min)
        self.q_max: float = float(q_max)
        self.Q: float = float(np.clip(q_inicial, self.q_min, self.q_max))

    def actualizar(self, I_net: float, dt: float) -> float:
        """Actualiza el estado de carga aplicando integración por conteo de Coulombios.

        Ecuación:
            Q_nueva = Q_actual + (I_net * dt) / 3600

        Args:
            I_net: Corriente neta entrante/saliente de la batería (A).
            dt: Paso de tiempo de simulación (s).

        Returns:
            El nivel de carga actualizado Q (Ah), limitado entre [q_min, q_max].
        """
        q_nueva = self.Q + (I_net * dt) / 3600.0
        self.Q = float(np.clip(q_nueva, self.q_min, self.q_max))
        return self.Q
