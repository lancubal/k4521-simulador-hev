# Simulador de Control PID - HCU Toyota Sienna 2026

Simulador del lazo de control cerrado del sistema de mantenimiento de carga (*Charge-Sustaining*) de la batería de alta tensión de un vehículo híbrido (Toyota Sienna 2026), implementado en dos modalidades independientes dentro de este monorepo:

1. **Simulador Web Interactivo en Tiempo Real** (`web/`): React + TypeScript + Vite + Tailwind CSS + Recharts.
2. **Motor de Simulación Discreta en Python** (`python/`): `numpy` + `matplotlib` + `pytest`.

## Estructura del Monorepo

```text
k4521-simulador-hev/
├── python/                     # Motor de simulación y análisis en Python
│   ├── bateria.py              # Clase Bateria (Planta e integrador Coulombiano)
│   ├── motor_generador.py      # Clase MotorGenerador (Actuador y filtro pasa-bajos)
│   ├── hcu.py                  # Clase HCU (Controlador PID discreto + Anti-Windup)
│   ├── parametros.py           # Constantes físicas y ganancias PID
│   ├── simulacion.py           # Event loop discreto y escenarios de perturbación
│   ├── graficos.py             # Generación de dashboards estáticos PNG
│   ├── test_simulacion.py      # Suite de pruebas automatizadas con pytest
│   ├── requirements.txt        # Dependencias de Python
│   └── resultados/             # Dashboards exportados en PNG
├── web/                        # Simulador interactivo en React + TypeScript
│   ├── index.html              # Punto de entrada HTML
│   ├── package.json            # Dependencias y scripts de Vite/Vitest
│   ├── vite.config.ts          # Configuración de Vite
│   ├── tsconfig.json           # Configuración de TypeScript
│   └── src/                    # Código fuente del frontend (componentes, hooks, dominio)
├── shell.nix                   # Entorno reproducible para Nix / NixOS (Node.js + Python)
├── .gitignore                  # Reglas de exclusión de Git
└── README.md                   # Documentación general del repositorio
```

---

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

### Arquitectura Web (`web/src/`)
- [`web/src/lib/simulation/Battery.ts`](./web/src/lib/simulation/Battery.ts): Planta integradora por conteo de Coulombios con *clamping* en `[0, 6.5] Ah`.
- [`web/src/lib/simulation/MotorGenerator.ts`](./web/src/lib/simulation/MotorGenerator.ts): Actuador con filtro pasa-bajos de 1er orden (`tau_a = 0.5s`) y saturación en `[0, 80] A`.
- [`web/src/lib/simulation/HCU.ts`](./web/src/lib/simulation/HCU.ts): Controlador PID discreto con mecanismo *Anti-Windup* por *clamping* condicional.
- [`web/src/hooks/useSimulation.ts`](./web/src/hooks/useSimulation.ts): Hook reactivo de simulación en tiempo real (ticks de `100 ms`).
- [`web/src/components/ControlPanel.tsx`](./web/src/components/ControlPanel.tsx): Panel de control con Play/Pause/Reset, selector de velocidad, slider continuo (`-150 A` a `+50 A`) y escenarios predefinidos (*Autopista*, *Aceleración Brusca*, *Frenado Regenerativo*).
- [`web/src/components/DashboardCharts.tsx`](./web/src/components/DashboardCharts.tsx): 3 gráficos sincronizados en tiempo real (`SOC`, `Corrientes`, `Error`) con `Recharts`.

### Ejecución del Frontend Web

```bash
cd web

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

### Estructura Python (`python/`)
- [`python/parametros.py`](./python/parametros.py): Constantes físicas y parámetros de sintonización PID.
- [`python/bateria.py`](./python/bateria.py): Clase `Bateria`.
- [`python/motor_generador.py`](./python/motor_generador.py): Clase `MotorGenerador`.
- [`python/hcu.py`](./python/hcu.py): Clase `HCU`.
- [`python/simulacion.py`](./python/simulacion.py): Event loop discreto y generador de los 3 escenarios (`urbano`, `autopista`, `aceleracion_brusca`).
- [`python/graficos.py`](./python/graficos.py): Generación de dashboards estáticos en `python/resultados/`.
- [`python/test_simulacion.py`](./python/test_simulacion.py): Suite de pruebas automatizadas con `pytest`.

### Opción A: Usando entorno virtual `.venv` (Linux / macOS / Windows)

```bash
cd python

# Crear y activar entorno virtual
python3 -m venv .venv
source .venv/bin/activate        # En Bash / Zsh
# source .venv/bin/activate.fish # En Fish shell
# .venv\Scripts\activate         # En Windows CMD / PowerShell

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar simulación, generar gráficos y correr tests
python simulacion.py
python graficos.py
pytest -v
```

### Opción B: Usando `nix-shell` (NixOS / Nix)

Desde la raíz del repositorio:

```bash
nix-shell --run "cd python && pytest -v"
nix-shell --run "cd web && npm test"
```

O ingresando al shell interactivo:

```bash
nix-shell
cd python && pytest -v
cd ../web && npm test
```
