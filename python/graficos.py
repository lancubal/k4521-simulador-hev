"""Visualización de resultados de la simulación HCU - Toyota Sienna 2026."""

import os
from typing import Dict, Optional
import matplotlib.pyplot as plt
import numpy as np

from parametros import I_C_MAX, I_C_MIN, Q_MAX, Q_MIN, Q_R
from simulacion import ejecutar_simulacion, simular_todos_los_escenarios


TITULOS_ESCENARIOS = {
    "urbano": "Escenario 1: Conducción Urbana (Tráfico y Frenado Regenerativo)",
    "autopista": "Escenario 2: Autopista (Escalón de Consumo Constante -20 A)",
    "aceleracion_brusca": "Escenario 3: Aceleración Brusca (Impulso -150 A por 5 s)",
}


def graficar_dashboard(
    datos: Dict[str, np.ndarray],
    escenario: str = "autopista",
    guardar_en: Optional[str] = None,
    mostrar: bool = True,
) -> plt.Figure:
    """Genera un dashboard de 3 filas con la evolución del sistema de control PID.

    Filas del dashboard:
        1. Evolución del SOC / Carga Q (Ah) vs. Tiempo (incluyendo Set-point Q_r).
        2. Corrientes en el sistema (A) vs. Tiempo (I_c_real inyectada vs I_pert perturbación).
        3. Señal de Error (Ah) vs. Tiempo (para evaluar gráficamente el e_ss = 0).

    Args:
        datos: Diccionario retornado por `ejecutar_simulacion`.
        escenario: Nombre del escenario para el título.
        guardar_en: Ruta opcional de archivo para guardar la figura (ej. PNG).
        mostrar: Si es True, invoca `plt.show()`.

    Returns:
        Objeto ` matplotlib.figure.Figure` generado.
    """
    t = datos["t"]
    q = datos["Q"]
    error = datos["Error"]
    i_c_solicitada = datos["I_c_solicitada"]
    i_c_real = datos["I_c_real"]
    i_pert = datos["I_pert"]

    titulo_escenario = TITULOS_ESCENARIOS.get(escenario.lower(), f"Escenario: {escenario}")

    fig, axes = plt.subplots(3, 1, figsize=(11, 9), sharex=True)
    fig.suptitle(
        f"Simulador de Control PID - HCU Toyota Sienna 2026\n{titulo_escenario}",
        fontsize=13,
        fontweight="bold",
    )

    # 1. Evolución del SOC (Ah) vs. Tiempo
    ax_q = axes[0]
    ax_q.plot(t, q, label="Carga de Batería $Q(t)$ [Ah]", color="#1f77b4", linewidth=2.0)
    ax_q.axhline(
        Q_R,
        color="#2ca02c",
        linestyle="--",
        linewidth=1.5,
        label=f"Set-point $Q_r = {Q_R:.2f}$ Ah (50% SOC)",
    )
    ax_q.axhline(Q_MAX, color="#d62728", linestyle=":", alpha=0.6, label=f"$Q_{{max}} = {Q_MAX}$ Ah")
    ax_q.axhline(Q_MIN, color="#d62728", linestyle=":", alpha=0.6, label=f"$Q_{{min}} = {Q_MIN}$ Ah")
    ax_q.set_ylabel("Carga $Q$ [Ah]")
    ax_q.set_title("1. Evolución del Estado de Carga (SOC)")
    ax_q.set_ylim(-0.3, Q_MAX + 0.5)
    ax_q.grid(True, linestyle="--", alpha=0.5)
    ax_q.legend(loc="lower right", fontsize=9)

    # 2. Corrientes en el sistema (A) vs. Tiempo
    ax_i = axes[1]
    ax_i.plot(
        t,
        i_c_real,
        label="Corriente Real Generador $I_{c,real}(t)$ [A]",
        color="#ff7f0e",
        linewidth=2.0,
    )
    ax_i.plot(
        t,
        i_c_solicitada,
        label="Orden HCU $I_{c,solicitada}(t)$ [A]",
        color="#ffbb78",
        linestyle="--",
        linewidth=1.2,
        alpha=0.85,
    )
    ax_i.plot(
        t,
        i_pert,
        label="Perturbación Neta $I_{pert}(t) = I_r - I_d$ [A]",
        color="#9467bd",
        linewidth=1.6,
    )
    ax_i.axhline(
        I_C_MAX,
        color="#d62728",
        linestyle=":",
        alpha=0.7,
        label=f"Límite Actuador [{I_C_MIN:.0f}, {I_C_MAX:.0f}] A",
    )
    ax_i.axhline(I_C_MIN, color="#d62728", linestyle=":", alpha=0.7)
    ax_i.set_ylabel("Corriente [A]")
    ax_i.set_title("2. Corrientes en el Sistema (Actuador vs. Perturbación)")
    ax_i.grid(True, linestyle="--", alpha=0.5)
    ax_i.legend(loc="best", fontsize=9)

    # 3. Señal de Error (Ah) vs. Tiempo
    ax_e = axes[2]
    ax_e.plot(t, error, label="Error $e(t) = Q_r - Q(t)$ [Ah]", color="#d62728", linewidth=2.0)
    ax_e.axhline(0.0, color="black", linestyle="--", linewidth=1.2, label="Referencia Error Nulo ($e_{ss} = 0$)")
    ax_e.set_xlabel("Tiempo $t$ [s]")
    ax_e.set_ylabel("Error [Ah]")
    ax_e.set_title("3. Señal de Error del Lazo Cerrado")
    ax_e.grid(True, linestyle="--", alpha=0.5)
    ax_e.legend(loc="upper right", fontsize=9)

    fig.tight_layout(rect=[0, 0.0, 1, 0.94])

    if guardar_en:
        directorio = os.path.dirname(guardar_en)
        if directorio:
            os.makedirs(directorio, exist_ok=True)
        fig.savefig(guardar_en, dpi=150)

    if mostrar:
        plt.show()

    return fig


def generar_todos_los_graficos(
    directorio_salida: str = "resultados",
    mostrar: bool = False,
) -> Dict[str, str]:
    """Ejecuta los 3 escenarios y guarda sus dashboards en archivos PNG."""
    os.makedirs(directorio_salida, exist_ok=True)
    resultados = simular_todos_los_escenarios()
    rutas = {}

    for escenario, datos in resultados.items():
        ruta_png = os.path.join(directorio_salida, f"dashboard_{escenario}.png")
        fig = graficar_dashboard(
            datos=datos,
            escenario=escenario,
            guardar_en=ruta_png,
            mostrar=mostrar,
        )
        plt.close(fig)
        rutas[escenario] = ruta_png

    return rutas


if __name__ == "__main__":
    rutas_generadas = generar_todos_los_graficos(directorio_salida="resultados", mostrar=False)
    for esc, ruta in rutas_generadas.items():
        print(f"Gráfico generado para '{esc}': {ruta}")
