"""Parámetros fijos del sistema de simulación HCU - Toyota Sienna 2026."""

# Paso de simulación (segundos)
DT: float = 0.1

# Tiempo total de simulación por defecto (segundos)
T_SIM: float = 600.0

# Parámetros de la batería (Ah)
Q_R: float = 3.25      # Referencia (Set-point: 50% SOC)
Q_MAX: float = 6.5     # Capacidad máxima (100% SOC)
Q_MIN: float = 0.0     # Capacidad mínima (0% SOC)
Q_INICIAL: float = 2.0 # Carga inicial por defecto para observar la recuperación

# Ganancias del controlador PID (HCU)
K_P: float = 120.0
K_I: float = 5.0
K_D: float = 30.0

# Parámetros del actuador (MotorGenerador)
I_C_MIN: float = 0.0   # Corriente mínima de carga (A)
I_C_MAX: float = 80.0  # Corriente máxima de carga (A)
TAU_A: float = 0.5     # Constante de tiempo del actuador (segundos)
