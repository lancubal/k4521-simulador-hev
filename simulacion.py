"""Bucle principal de simulación del sistema de control PID - HCU Toyota Sienna 2026."""

from typing import Dict
import numpy as np

from bateria import Bateria
from hcu import HCU
from motor_generador import MotorGenerador
from parametros import (
    DT,
    I_C_MAX,
    I_C_MIN,
    K_D,
    K_I,
    K_P,
    Q_INICIAL,
    Q_MAX,
    Q_MIN,
    Q_R,
    TAU_A,
    T_SIM,
)


def generar_perfil_perturbacion(escenario: str, t: np.ndarray) -> np.ndarray:
    """Genera el vector de corriente de perturbación I_pert[k] = I_r[k] - I_d[k].

    Escenarios soportados:
        1. 'urbano': Fluctuaciones pequeñas por tráfico y picos positivos breves
           de frenado regenerativo.
        2. 'autopista': Consumo constante negativo severo (escalón de -20 A).
        3. 'aceleracion_brusca': Consumo masivo repentino (impulso de -150 A
           durante 5 segundos sobre consumo base de marcha).

    Args:
        escenario: Nombre del escenario ('urbano', 'autopista', 'aceleracion_brusca').
        t: Vector de tiempo de simulación (s).

    Returns:
        Array de NumPy con la corriente de perturbación I_pert (A) en cada paso.
    """
    nombre = escenario.strip().lower()
    i_pert = np.zeros_like(t, dtype=float)

    if nombre == "urbano":
        # Consumo base moderado con oscilaciones suaves de tráfico urbano
        i_pert = (
            -8.0
            + 5.0 * np.sin(2.0 * np.pi * t / 45.0)
            + 3.0 * np.cos(2.0 * np.pi * t / 18.0)
        )
        # Picos positivos breves de frenado regenerativo periódicos
        for t_ini in range(40, int(t[-1]), 65):
            mascara = (t >= t_ini) & (t <= t_ini + 4.0)
            i_pert[mascara] = 35.0

    elif nombre == "autopista":
        # Escalón de consumo constante negativo severo (-20 A)
        i_pert[:] = -20.0

    elif nombre in ("aceleracion_brusca", "aceleracion", "impulso"):
        # Consumo base de crucero (-10 A) con un impulso masivo de -150 A durante 5 segundos
        i_pert[:] = -10.0
        t_impulso = 150.0 if t[-1] >= 200.0 else 50.0
        mascara_impulso = (t >= t_impulso) & (t < t_impulso + 5.0)
        i_pert[mascara_impulso] = -150.0

    else:
        raise ValueError(
            f"Escenario desconocido '{escenario}'. "
            "Opciones válidas: 'urbano', 'autopista', 'aceleracion_brusca'."
        )

    return i_pert


def ejecutar_simulacion(
    escenario: str = "autopista",
    t_sim: float = T_SIM,
    dt: float = DT,
    q_inicial: float = Q_INICIAL,
) -> Dict[str, np.ndarray]:
    """Ejecuta el lazo cerrado de simulación discreta paso a paso.

    En cada paso k:
        1. Leer estado de la batería (Q).
        2. HCU calcula la orden pedida (I_c_solicitada).
        3. MotorGenerador calcula la corriente inyectada real (I_c_real).
        4. Calcular corriente neta: I_net = I_c_real + I_pert[k].
        5. Batería actualiza su carga con I_net.
        6. Guardar registros (Q, Error, I_c_solicitada, I_c_real, I_pert, I_net) en arrays de NumPy.

    Args:
        escenario: Perfil de manejo ('urbano', 'autopista', 'aceleracion_brusca').
        t_sim: Tiempo total de simulación en segundos.
        dt: Paso de integración discreta en segundos.
        q_inicial: Estado de carga inicial de la batería en Ah.

    Returns:
        Diccionario con los vectores de NumPy registrados durante la simulación.
    """
    # Vector de tiempo continuo desde 0 hasta t_sim con paso dt
    n_pasos = int(round(t_sim / dt)) + 1
    t = np.linspace(0.0, t_sim, n_pasos)

    # Vector de perturbaciones externas
    i_pert = generar_perfil_perturbacion(escenario, t)

    # Instanciación de componentes del sistema
    bateria = Bateria(q_inicial=q_inicial, q_min=Q_MIN, q_max=Q_MAX)
    hcu = HCU(q_r=Q_R, k_p=K_P, k_i=K_I, k_d=K_D, i_min=I_C_MIN, i_max=I_C_MAX)
    generador = MotorGenerador(tau_a=TAU_A, i_min=I_C_MIN, i_max=I_C_MAX)

    # Arrays de NumPy para registro de variables
    q_hist = np.zeros(n_pasos, dtype=float)
    error_hist = np.zeros(n_pasos, dtype=float)
    i_c_solicitada_hist = np.zeros(n_pasos, dtype=float)
    i_c_real_hist = np.zeros(n_pasos, dtype=float)
    i_net_hist = np.zeros(n_pasos, dtype=float)

    for k in range(n_pasos):
        # 1. Leer estado actual de la batería
        q_medido = bateria.Q
        error_actual = hcu.Q_r - q_medido

        # 2. HCU calcula la orden pedida
        orden_i_c = hcu.calcular_orden(q_medido, dt)

        # 3. MotorGenerador calcula la corriente inyectada real
        i_c_real = generador.actualizar(orden_i_c, dt)

        # 4. Calcular corriente neta
        i_net = i_c_real + i_pert[k]

        # 6. Guardar registros del instante k
        q_hist[k] = q_medido
        error_hist[k] = error_actual
        i_c_solicitada_hist[k] = orden_i_c
        i_c_real_hist[k] = i_c_real
        i_net_hist[k] = i_net

        # 5. Batería actualiza su carga con I_net para el siguiente paso
        bateria.actualizar(i_net, dt)

    return {
        "t": t,
        "Q": q_hist,
        "Error": error_hist,
        "I_c_solicitada": i_c_solicitada_hist,
        "I_c_real": i_c_real_hist,
        "I_pert": i_pert,
        "I_net": i_net_hist,
    }


def simular_todos_los_escenarios(
    t_sim: float = T_SIM,
    dt: float = DT,
    q_inicial: float = Q_INICIAL,
) -> Dict[str, Dict[str, np.ndarray]]:
    """Ejecuta la simulación para los 3 escenarios definidos en el plan."""
    escenarios = ["urbano", "autopista", "aceleracion_brusca"]
    return {
        esc: ejecutar_simulacion(escenario=esc, t_sim=t_sim, dt=dt, q_inicial=q_inicial)
        for esc in escenarios
    }


if __name__ == "__main__":
    resultados = simular_todos_los_escenarios()
    for nombre, datos in resultados.items():
        print(
            f"[{nombre.upper()}] "
            f"Q_final = {datos['Q'][-1]:.4f} Ah | "
            f"Error_final = {datos['Error'][-1]:.6f} Ah | "
            f"I_c_real_final = {datos['I_c_real'][-1]:.2f} A"
        )
