# Simulador de Control PID - HCU Toyota Sienna 2026

Simulador del lazo de control cerrado del sistema de mantenimiento de carga (*Charge-Sustaining*) de la batería de alta tensión de un vehículo híbrido (Toyota Sienna 2026), implementado en dos modalidades independientes:
1. **Simulador Web Interactivo en Tiempo Real** (React + TypeScript + Vite + Tailwind CSS + Recharts).
2. **Motor de Simulación Discreta en Python** (`numpy` + `matplotlib` + `pytest`).

## Parámetros Fijos del Sistema

| Parámetro | Símbolo | Valor | Unidad |
| :--- | :---: | :---: | :---: |
| Paso de simulación | `dt` | `0.1` | s |
| Referencia (Set-point, 50% SOC) | `Q_r` | `3.25` | Ah |
| Capacidad máxima (100% SOC) | `Q_max` | `6.5` | Ah |
| Capacidad mínima (0% SOC) | `Q_min` | `0.0` | Ah |
| Ganancias PID | `K_p`, `K_i`, `K_d` | `120`, `5`, `30` | — |
| Límites del actuador (`I_c`) | `[I_min, I_max]` | `[0.0, 80.0]` | A |
| Constante de tiempo del actuador | `tau_a` | `0.5` | s |

---

## 1. Simulador Web Interactivo (React + TypeScript + Vite)

### Arquitectura Web (`src/`)
- [`src/lib/simulation/Battery.ts`](./src/lib/simulation/Battery.ts): Planta integradora por conteo de Coulombios con *clamping* en `[0, 6.5] Ah`.
- [`src/lib/simulation/MotorGenerator.ts`](./src/lib/simulation/MotorGenerator.ts): Actuador con filtro pasa-bajos de 1er orden (`tau_a = 0.5s`) y saturación en `[0, 80] A`.
- [`src/lib/simulation/HCU.ts`](./src/lib/simulation/HCU.ts): Controlador PID discreto con mecanismo *Anti-Windup* por *clamping* condicional.
- [`src/hooks/useSimulation.ts`](./src/hooks/useSimulation.ts): Hook reactivo de simulación en tiempo real (ticks de `100 ms`).
- [`src/components/ControlPanel.tsx`](./src/components/ControlPanel.tsx): Panel de control industrial con Play/Pause/Reset, selector de velocidad, slider continuo (`-150 A` a `+50 A`) y escenarios predefinidos (*Autopista*, *Aceleración Brusca*, *Frenado Regenerativo*).
- [`src/components/DashboardCharts.tsx`](./src/components/DashboardCharts.tsx): 3 gráficos sincronizados en tiempo real (`SOC`, `Corrientes`, `Error`) con `Recharts`.

### Ejecución del Frontend Web

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo interactivo
npm run dev

# Ejecutar los tests unitarios de dominio (Vitest)
npm test

# Compilar para producción
npm run build
```

---

## 2. Simulador Discreto en Python

### Estructura Python
- [`parametros.py`](./parametros.py): Constantes físicas y parámetros de sintonización PID.
- [`bateria.py`](./bateria.py): Clase `Bateria`.
- [`motor_generador.py`](./motor_generador.py): Clase `MotorGenerador`.
- [`hcu.py`](./hcu.py): Clase `HCU`.
- [`simulacion.py`](./simulacion.py): Event loop discreto y generador de los 3 escenarios (`urbano`, `autopista`, `aceleracion_brusca`).
- [`graficos.py`](./graficos.py): Generación de dashboards estáticos en `./resultados/`.
- [`test_simulacion.py`](./test_simulacion.py): Suite de pruebas automatizadas con `pytest`.

### Opción A: Usando entorno virtual `.venv` (Linux / macOS / Windows)

```bash
python3 -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r requirements.txt

python simulacion.py
python graficos.py
pytest -v
```

### Opción B: Usando `nix-shell` (NixOS / Nix)

```bash
nix-shell --run "python simulacion.py"
nix-shell --run "python graficos.py"
nix-shell --run "pytest -v"
```
