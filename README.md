# Simulador de Control PID - HCU Toyota Sienna 2026

Motor de simulación discreta en Python (`numpy` y `matplotlib`) que modela el lazo de control cerrado del sistema de mantenimiento de carga (*Charge-Sustaining*) de la batería de alta tensión de un vehículo híbrido (Toyota Sienna 2026).

## ⚙️ Parámetros del Sistema

| Parámetro | Símbolo | Valor | Unidad |
| :--- | :---: | :---: | :---: |
| Paso de simulación | `dt` | `0.1` | s |
| Referencia (Set-point, 50% SOC) | `Q_r` | `3.25` | Ah |
| Capacidad máxima (100% SOC) | `Q_max` | `6.5` | Ah |
| Capacidad mínima (0% SOC) | `Q_min` | `0.0` | Ah |
| Ganancias PID | `K_p`, `K_i`, `K_d` | `120`, `5`, `30` | — |
| Límites del actuador (`I_c`) | `[I_min, I_max]` | `[0.0, 80.0]` | A |
| Constante de tiempo del actuador | `tau_a` | `0.5` | s |

## 🏗️ Estructura del Proyecto

- [`parametros.py`](./parametros.py): Constantes físicas y parámetros de sintonización PID.
- [`bateria.py`](./bateria.py): Clase `Bateria` (Planta e integrador por conteo de Coulombios con *clamping* estricto en `[0.0, 6.5] Ah`).
- [`motor_generador.py`](./motor_generador.py): Clase `MotorGenerador` (Actuador con filtro pasa-bajos discreto de 1er orden y saturación en `[0.0, 80.0] A`).
- [`hcu.py`](./hcu.py): Clase `HCU` (Controlador PID discreto con mecanismo *Anti-Windup* por *clamping* condicional).
- [`simulacion.py`](./simulacion.py): Event loop discreto y generador de los 3 escenarios de perturbación (`urbano`, `autopista`, `aceleracion_brusca`).
- [`graficos.py`](./graficos.py): Generación de dashboards de 3 filas (`SOC`, `Corrientes`, `Error`) con `matplotlib`.
- [`test_simulacion.py`](./test_simulacion.py): Suite de pruebas automatizadas con `pytest` para validar los criterios de aceptación.
- [`requirements.txt`](./requirements.txt): Dependencias de Python para instalación con `pip` / `.venv`.
- [`shell.nix`](./shell.nix): Entorno reproducible para Nix / NixOS.

## 🚀 Instalación y Ejecución

### Opción 1: Usando entorno virtual `.venv` (Linux / macOS / Windows)

1. Crear y activar el entorno virtual (si aún no está creado):
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # En Windows: .venv\Scripts\activate
   ```

2. Instalar las dependencias desde `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```

3. Ejecutar el simulador, generar los gráficos y correr los tests:
   ```bash
   # Ejecutar la simulación en consola para los 3 escenarios
   python simulacion.py

   # Generar los gráficos (dashboards PNG en ./resultados/)
   python graficos.py

   # Ejecutar los tests de criterios de aceptación
   pytest -v
   ```

### Opción 2: Usando `nix-shell` (NixOS / Nix)

Podés ejecutar los comandos directamente sin activar entornos manualmente:

```bash
# Ejecutar la simulación en consola para los 3 escenarios
nix-shell --run "python simulacion.py"

# Generar los gráficos (dashboards PNG en ./resultados/)
nix-shell --run "python graficos.py"

# Ejecutar los tests de criterios de aceptación
nix-shell --run "pytest -v"
```

O bien ingresar al shell interactivo de Nix:

```bash
nix-shell
python simulacion.py
python graficos.py
pytest -v
```
