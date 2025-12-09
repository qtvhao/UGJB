# Plataforma UGJB

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

**Plataforma Unificada de Análisis de Ingeniería y Fuerza Laboral** - Una plataforma modular que integra la gestión de recursos humanos con el análisis de rendimiento de ingeniería en un sistema de código abierto.

## Descripción General

La plataforma UGJB permite a las organizaciones alinear las decisiones de talento con los resultados técnicos a través de información en tiempo real. Elimina las soluciones SaaS fragmentadas combinando capacidades de nivel empresarial con patrones de integración estandarizados y componentes reutilizables, al tiempo que reduce el costo total de propiedad.

### Características Principales

- **Gestión Unificada de la Fuerza Laboral** - Perfiles de empleados, seguimiento de habilidades, asignación de FTE y estado laboral
- **Análisis de Ingeniería** - Métricas DORA, puntuaciones de calidad de código e indicadores de fiabilidad
- **Integración con Herramientas de Desarrollo** - Jira, GitLab, Firebase Crashlytics, Prometheus
- **Paneles en Tiempo Real** - Visualizaciones de KPI y informes personalizables
- **Control de Acceso Basado en Roles** - Permisos detallados y seguridad de datos
- **Código Abierto y Modular** - Arquitectura extensible sin dependencia de proveedores

## Inicio Rápido

### Requisitos Previos

- Docker y Docker Compose
- Git

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/qtvhao/UGJB.git
cd UGJB

# Iniciar todos los servicios
docker-compose up -d

# Verificar el endpoint de salud
curl http://localhost:8080/health
```

### Acceso a la Plataforma

- **Web UI**: http://localhost:8081
- **API Gateway**: http://localhost:8080

## Arquitectura

UGJB sigue una arquitectura basada en microservicios con contextos delimitados claramente definidos:

- **Gestión de RR.HH.** - Registro de empleados y motor de asignación
- **Análisis de Ingeniería** - Recopilador de métricas, motor de KPI, panel de información
- **Gestión de Objetivos** - Seguimiento de objetivos y resultados clave
- **Gestión de Proyectos** - Coordinación de sprints y asignación de tareas
- **Integración de Sistemas** - Pipeline de datos y API gateway
- **Bienestar de la Fuerza Laboral** - Predicción de agotamiento y monitoreo del bienestar

## ¿Por Qué UGJB?

### Problemas Resueltos

1. **Fragmentación de Integración** - Unifica datos de Firebase, Prometheus, GitLab y Jira
2. **Silos de Dominio** - Conecta la gestión de habilidades de RR.HH. con KPIs de ingeniería
3. **Barreras de Costos** - ≤ $120k TCO a 3 años vs $200k+ SaaS empresarial
4. **Limitaciones de Personalización** - Flujos de trabajo extensibles que mantienen la estabilidad de la plataforma

### Métricas de Éxito

| Métrica | Línea Base | Objetivo |
|---------|------------|----------|
| TCO a 3 años | $201k-$246k | ≤ $120k |
| Cobertura de Integración | 50% GitLab | 100% cobertura |
| Tiempo hasta Información | 72+ horas | ≤ 2 horas |
| Tiempo de Actividad de la Plataforma | No definido | ≥ 99.9% |

## Uso Básico

### Gestionar Empleados

```bash
# Crear perfil de empleado a través de API
curl -X POST http://localhost:8080/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "role": "Desarrollador Senior",
    "department": "Ingeniería",
    "status": "active",
    "fte": 100
  }'
```

### Ver Métricas de Ingeniería

Acceder al panel de métricas de ingeniería:
- Métricas DORA (frecuencia de despliegue, tiempo de entrega)
- Puntuaciones de calidad de código
- Despliegues recientes
- Producción de ingeniería del equipo

### Configurar Integraciones

Conectar herramientas externas a través de la Web UI:
1. Navegar a "Integraciones"
2. Seleccionar tipo de herramienta (Jira, GitLab, Firebase, Prometheus)
3. Ingresar endpoint de API y autenticación
4. Establecer frecuencia de sincronización

## Licencia

Este proyecto está bajo una licencia de código abierto - consulte el archivo [LICENSE](LICENSE) para más detalles.

## Contribuciones

¡Las contribuciones son bienvenidas! No dude en enviar Pull Requests.

## Soporte

Para preguntas o soporte, abra un issue en [GitHub Issues](https://github.com/qtvhao/UGJB/issues).
