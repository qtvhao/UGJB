# Plataforma UGJB

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

> Plataforma de código abierto que unifica la gestión de RR.HH. con analíticas de ingeniería

## El Problema

Las empresas tecnológicas enfrentan un desafío crítico: **la brecha entre los sistemas de RR.HH. y las herramientas de ingeniería**.

- Las plataformas de RR.HH. (BambooHR, Lattice) carecen de métricas de ingeniería (GitLab, métricas DORA)
- Las herramientas de ingeniería (Swarmia, LinearB) no incluyen funciones de RR.HH. (seguimiento de habilidades, asignación de FTE)
- Las soluciones SaaS empresariales son costosas (más de $200k en 3 años)
- Las integraciones personalizadas cuestan $25k-50k por sistema

**¿El resultado?** Las decisiones de talento están desconectadas de los resultados técnicos. Los gerentes de ingeniería no pueden ver la capacidad del equipo, y los equipos de RR.HH. no pueden medir el impacto de las habilidades en el rendimiento.

## La Solución de UGJB

UGJB (Plataforma Unificada de Fuerza Laboral y Analíticas de Ingeniería) integra la gestión de RR.HH. con analíticas profundas de ingeniería en un solo sistema de código abierto.

### Características Principales

**Gestión de Empleados**
- Perfiles completos de empleados con habilidades, asignación de FTE y estado laboral
- Inventario de habilidades con niveles de competencia y seguimiento de fuentes
- Control de acceso basado en roles (RR.HH., líder de ingeniería, colaborador individual)

**Analíticas de Ingeniería**
- Métricas DORA (frecuencia de despliegue, tasa de fallos de cambios, MTTR)
- Integración GitLab/GitHub (commits, PR, revisiones de código)
- Integración Jira (seguimiento de issues, métricas de sprint)
- Firebase Crashlytics (atribución de incidentes)
- Prometheus (tiempo de actividad del sistema, volumen de alertas)

**Planificación de la Fuerza Laboral**
- Asignación entre proyectos con validación de FTE
- Visualización de capacidad del equipo en tiempo real
- Análisis de correlación habilidades-resultados de ingeniería

**Paneles Personalizados**
- Paneles de KPI configurables para diferentes audiencias
- Integración con DevLake, Monday.com, Lattice
- Actualización en tiempo real y tendencias históricas

![Gestión de Empleados](./screenshots/employees-page.png)
*Directorio de empleados con seguimiento de roles, departamentos y estado*

![Métricas de Ingeniería](./screenshots/engineering-metrics-page.png)
*Métricas DORA y analíticas de rendimiento de ingeniería*

![Paneles Personalizados](./screenshots/custom-dashboards-page.png)
*Crear paneles de KPI configurables para ejecutivos y equipos*

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

# Verificar verificaciones de salud
curl http://localhost:8080/health  # API Gateway
curl http://localhost:8081         # Web UI (a través de nginx)
```

### Acceso a la Plataforma

- **Web UI**: http://localhost:8081
- **API Gateway**: http://localhost:8080
- **Documentación API**: http://localhost:8080/docs

### Uso Básico

1. **Crear perfil de empleado**
   ```bash
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

2. **Configurar integración de GitLab**
   - Navegar a Configuración > Integraciones
   - Seleccionar GitLab
   - Ingresar endpoint API y token
   - Establecer frecuencia de sincronización (mínimo diario)

3. **Ver métricas de ingeniería**
   - Visitar página de Métricas de Ingeniería
   - Ver métricas DORA (frecuencia de despliegue, tiempo de entrega, tasa de fallos)
   - Monitorear actividad de código y resultados del equipo

## ¿Por Qué UGJB?

### Información Unificada
Correlaciona datos de la fuerza laboral con el rendimiento de ingeniería. Responde preguntas como: "¿La experiencia en Kubernetes reduce el tiempo de resolución de incidentes?"

### Optimización de Costos
- **Sin tarifas de licencia por usuario**: Arquitectura modular de código abierto
- **Objetivo de TCO de 3 años**: ≤$120k (vs $200k+ de soluciones SaaS)
- **Integraciones estandarizadas**: Reducción del 50% en tiempo de desarrollo personalizado

### Confiabilidad Empresarial
- SLA de tiempo de actividad del 99.9%
- Observabilidad integral (Prometheus, ELK)
- Sincronización en tiempo real entre dominios

### Personalización
- Arquitectura de microservicios modular
- Patrones de integración extensibles
- Reglas de automatización sin código

## Arquitectura Técnica

UGJB utiliza una arquitectura de microservicios con 6 contextos delimitados:

- **Gestión de RR.HH.** (Java/Spring Boot): Registro de empleados, motor de asignación
- **Analíticas de Ingeniería** (Python/FastAPI): Recopilador de métricas, motor de KPI, panel de información
- **Gestión de Objetivos** (TypeScript/NestJS): OKR, seguimiento de resultados clave
- **Gestión de Proyectos** (TypeScript/NestJS): Coordinación de sprints, distribución de tareas
- **Integración de Sistemas** (Kotlin/Go): Pipeline de datos, API Gateway
- **Bienestar de la Fuerza Laboral** (Python/FastAPI): Predicción de agotamiento, monitoreo de bienestar

**Almacenamiento de Datos**: PostgreSQL, InfluxDB, TimescaleDB, ClickHouse, Redis
**Mensajería**: Kafka, RabbitMQ
**Observabilidad**: Prometheus, Grafana, ELK

## Integraciones

UGJB proporciona integraciones listas para usar con herramientas comunes:

| Herramienta | Propósito | Datos | Protocolo |
|-------------|-----------|-------|-----------|
| GitLab | Control de versiones | Commits, PR, revisiones | REST + Webhooks |
| Jira | Seguimiento de issues | Issues, tareas | REST + Webhooks |
| Firebase Crashlytics | Monitoreo de incidentes | Crashes, errores | Notificaciones push |
| Prometheus | Métricas del sistema | Alertas, tiempo de actividad | API de consulta |
| DevLake | Agregación de ingeniería | Métricas DORA | REST |
| Monday.com | Gestión de proyectos | Tareas, flujos de trabajo | GraphQL |
| Lattice | Gestión de rendimiento | OKR, revisiones | REST |

## Licencia

Licencia MIT - ver archivo [LICENSE](LICENSE) para más detalles.

## Soporte

- **Documentación**: Consulte el directorio `docs/` para guías detalladas de arquitectura e implementación
- **Issues**: Envíe problemas en [GitHub Issues](https://github.com/qtvhao/UGJB/issues)
- **Contribuciones**: ¡Los Pull Requests son bienvenidos! Por favor, lea primero nuestra guía de contribución

---

**Comience a cerrar la brecha entre RR.HH. e ingeniería hoy.** 🚀
