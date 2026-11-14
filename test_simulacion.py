"""Tests de verificación y criterios de aceptación para el simulador PID HCU."""

import numpy as np
import pytest

from bateria import Bateria
from hcu import HCU
from motor_generador import MotorGenerador
from parametros import DT, I_C_MAX, I_C_MIN, Q_MAX, Q_MIN, Q_R
from simulacion import ejecutar_simulacion, simular_todos_los_escenarios


def test_limites_fisicos_bateria():
    """Verifica que el clamping de la batería mantenga Q estrictamente en [0.0, 6.5] Ah."""
    bat = Bateria(q_inicial=2.0)

    # Descarga extrema que intentaría llevar Q por debajo de 0
    q_bajo = bat.actualizar(I_net=-50000.0, dt=1.0)
    assert q_bajo == Q_MIN
    assert bat.Q == Q_MIN

    # Carga extrema que intentaría llevar Q por encima de 6.5
    q_alto = bat.actualizar(I_net=50000.0, dt=1.0)
    assert q_alto == Q_MAX
    assert bat.Q == Q_MAX


def test_limites_y_dinamica_motor_generador():
    """Verifica el retardo de 1er orden y la saturación [0.0, 80.0] A del actuador."""
    gen = MotorGenerador(tau_a=0.5, i_min=I_C_MIN, i_max=I_C_MAX, i_inicial=0.0)

    # En el primer paso ante un escalón de 80 A, la salida debe ser alpha * 80
    alpha_esperado = DT / (0.5 + DT)
    i_paso_1 = gen.actualizar(80.0, DT)
    assert np.isclose(i_paso_1, alpha_esperado * 80.0)

    # Nunca debe superar 80 A ni bajar de 0 A aunque reciba órdenes fuera de rango
    for _ in range(200):
        val = gen.actualizar(500.0, DT)
        assert I_C_MIN <= val <= I_C_MAX

    for _ in range(200):
        val = gen.actualizar(-200.0, DT)
        assert I_C_MIN <= val <= I_C_MAX


def test_anti_windup_hcu():
    """Verifica que el controlador HCU pause la integración cuando está saturado."""
    hcu = HCU()

    # Con Q_medido = 0.0 Ah, Error = 3.25 Ah -> P = 390 A (> 80 A, saturado)
    orden = hcu.calcular_orden(Q_medido=0.0, dt=DT)
    assert orden == I_C_MAX
    # Gracias al anti-windup, I_acum no debe acumularse mientras la salida esté saturada al máximo
    assert hcu.I_acum == 0.0


def test_criterio_aceptacion_error_estacionario_autopista():
    """Criterio de aceptación 1:
    El error en estado estacionario frente a una perturbación constante (Escenario Autopista)
    debe converger a 0 gracias a la acción integral.
    """
    # Simulamos tiempo suficiente para alcanzar el régimen permanente completo
    datos = ejecutar_simulacion(escenario="autopista", t_sim=600.0, dt=DT, q_inicial=2.0)

    error_final = datos["Error"][-1]
    q_final = datos["Q"][-1]
    i_c_final = datos["I_c_real"][-1]

    # El error estacionario debe converger a 0 y la corriente del generador a +20 A
    assert abs(error_final) < 1e-3, f"El error final ({error_final}) no convergió a 0"
    assert np.isclose(q_final, Q_R, atol=1e-3)
    assert np.isclose(i_c_final, 20.0, atol=1e-2)


@pytest.mark.parametrize("escenario", ["urbano", "autopista", "aceleracion_brusca"])
def test_criterio_aceptacion_limites_fisicos_todos_los_escenarios(escenario: str):
    """Criterio de aceptación 2:
    Ninguna variable física puede violar los límites establecidos
    (Batería entre 0 y 6.5 Ah, Generador entre 0 y 80 A).
    """
    datos = ejecutar_simulacion(escenario=escenario, t_sim=300.0, dt=DT, q_inicial=2.0)

    q = datos["Q"]
    i_c_solicitada = datos["I_c_solicitada"]
    i_c_real = datos["I_c_real"]

    assert np.all(q >= Q_MIN) and np.all(q <= Q_MAX), (
        f"La carga Q violó los límites [{Q_MIN}, {Q_MAX}] en el escenario {escenario}"
    )
    assert np.all(i_c_solicitada >= I_C_MIN) and np.all(i_c_solicitada <= I_C_MAX), (
        f"La orden I_c_solicitada violó los límites [{I_C_MIN}, {I_C_MAX}] en {escenario}"
    )
    assert np.all(i_c_real >= I_C_MIN) and np.all(i_c_real <= I_C_MAX), (
        f"La corriente I_c_real violó los límites [{I_C_MIN}, {I_C_MAX}] en {escenario}"
    )
