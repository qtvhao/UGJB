# UGJB-Plattform

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

> Open-Source-Plattform zur Vereinheitlichung von HR-Management und Engineering-Analytik

## Das Problem

Technologieunternehmen stehen vor einer kritischen Herausforderung: **der Kluft zwischen HR-Systemen und Engineering-Tools**.

- HR-Plattformen (BambooHR, Lattice) fehlen Engineering-Metriken (GitLab, DORA-Metriken)
- Engineering-Tools (Swarmia, LinearB) enthalten keine HR-Funktionen (Skill-Tracking, FTE-Zuweisung)
- Enterprise-SaaS-Lösungen sind teuer (über $200k in 3 Jahren)
- Kundenspezifische Integrationen kosten $25k-50k pro System

**Das Ergebnis?** Talententscheidungen sind von technischen Ergebnissen entkoppelt. Engineering-Manager können die Teamkapazität nicht sehen, und HR-Teams können den Einfluss von Skills auf die Leistung nicht messen.

## Die UGJB-Lösung

UGJB (Unified Workforce & Engineering Analytics Platform) integriert HR-Management mit tiefer Engineering-Analytik in einem einzigen Open-Source-System.

### Hauptfunktionen

**Mitarbeiterverwaltung**
- Vollständige Mitarbeiterprofile mit Skills, FTE-Zuweisung und Arbeitsstatus
- Skill-Inventar mit Kompetenzniveaus und Quellenverfolgung
- Rollenbasierte Zugriffskontrolle (HR, Engineering-Lead, einzelner Mitwirkender)

**Engineering-Analytik**
- DORA-Metriken (Bereitstellungshäufigkeit, Änderungsfehlerrate, MTTR)
- GitLab/GitHub-Integration (Commits, PRs, Code-Reviews)
- Jira-Integration (Issue-Tracking, Sprint-Metriken)
- Firebase Crashlytics (Vorfallszuordnung)
- Prometheus (System-Uptime, Alert-Volumen)

**Workforce-Planung**
- Projektübergreifende Zuweisung mit FTE-Validierung
- Echtzeit-Teamkapazitätsvisualisierung
- Korrelationsanalyse Skills-Engineering-Ergebnisse

**Individuelle Dashboards**
- Konfigurierbare KPI-Dashboards für verschiedene Zielgruppen
- Integration mit DevLake, Monday.com, Lattice
- Echtzeit-Aktualisierung und historische Trends

![Mitarbeiterverwaltung](./screenshots/employees-page.png)
*Mitarbeiterverzeichnis mit Rollen-, Abteilungs- und Statusverfolgung*

![Engineering-Metriken](./screenshots/engineering-metrics-page.png)
*DORA-Metriken und Engineering-Performance-Analyse*

![Individuelle Dashboards](./screenshots/custom-dashboards-page.png)
*Konfigurierbare KPI-Dashboards für Führungskräfte und Teams erstellen*

## Schnellstart

### Voraussetzungen

- Docker und Docker Compose
- Git

### Installation

```bash
# Repository klonen
git clone https://github.com/qtvhao/UGJB.git
cd UGJB

# Alle Dienste starten
docker-compose up -d

# Gesundheitschecks verifizieren
curl http://localhost:8080/health  # API Gateway
curl http://localhost:8081         # Web UI (über nginx)
```

### Plattform-Zugriff

- **Web UI**: http://localhost:8081
- **API Gateway**: http://localhost:8080
- **API-Dokumentation**: http://localhost:8080/docs

### Grundlegende Nutzung

1. **Mitarbeiterprofil erstellen**
   ```bash
   curl -X POST http://localhost:8080/api/v1/employees \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Max Mustermann",
       "role": "Senior-Entwickler",
       "department": "Engineering",
       "status": "active",
       "fte": 100
     }'
   ```

2. **GitLab-Integration konfigurieren**
   - Zu Einstellungen > Integrationen navigieren
   - GitLab auswählen
   - API-Endpunkt und Token eingeben
   - Synchronisationsfrequenz festlegen (mindestens täglich)

3. **Engineering-Metriken anzeigen**
   - Engineering-Metriken-Seite besuchen
   - DORA-Metriken anzeigen (Bereitstellungshäufigkeit, Lead Time, Änderungsfehlerrate)
   - Code-Aktivität und Team-Output überwachen

## Warum UGJB?

### Vereinheitlichte Einblicke
Korrelieren Sie Workforce-Daten mit Engineering-Performance. Beantworten Sie Fragen wie: "Reduziert Kubernetes-Expertise die Vorfallslösungszeit?"

### Kostenoptimierung
- **Keine Benutzer-Lizenzgebühren**: Open-Source-modulare Architektur
- **3-Jahres-TCO-Ziel**: ≤$120k (vs. $200k+ für SaaS-Lösungen)
- **Standardisierte Integrationen**: 50% Reduzierung der kundenspezifischen Entwicklungszeit

### Enterprise-Grade-Zuverlässigkeit
- 99,9% Uptime-SLA
- Umfassende Observability (Prometheus, ELK)
- Domain-übergreifende Echtzeit-Synchronisation

### Anpassbarkeit
- Modulare Microservices-Architektur
- Erweiterbare Integrationsmuster
- No-Code-Automatisierungsregeln

## Technische Architektur

UGJB verwendet eine Microservices-Architektur mit 6 abgegrenzten Kontexten:

- **HR-Management** (Java/Spring Boot): Mitarbeiterregister, Zuweisungs-Engine
- **Engineering-Analytik** (Python/FastAPI): Metrics-Collector, KPI-Engine, Insights-Dashboard
- **Zielverwaltung** (TypeScript/NestJS): OKR, Key-Results-Tracking
- **Projektverwaltung** (TypeScript/NestJS): Sprint-Koordination, Task-Dispatch
- **Systemintegration** (Kotlin/Go): Data-Pipeline, API-Gateway
- **Workforce-Wohlbefinden** (Python/FastAPI): Burnout-Vorhersage, Wohlbefindens-Monitoring

**Datenspeicherung**: PostgreSQL, InfluxDB, TimescaleDB, ClickHouse, Redis
**Messaging**: Kafka, RabbitMQ
**Observability**: Prometheus, Grafana, ELK

## Integrationen

UGJB bietet sofort einsatzbereite Integrationen mit gängigen Tools:

| Tool | Zweck | Daten | Protokoll |
|------|-------|-------|-----------|
| GitLab | Versionskontrolle | Commits, PRs, Reviews | REST + Webhooks |
| Jira | Issue-Tracking | Issues, Tasks | REST + Webhooks |
| Firebase Crashlytics | Vorfallsüberwachung | Crashes, Fehler | Push-Benachrichtigungen |
| Prometheus | System-Metriken | Alerts, Uptime | Query-API |
| DevLake | Engineering-Aggregation | DORA-Metriken | REST |
| Monday.com | Projektverwaltung | Tasks, Workflows | GraphQL |
| Lattice | Performance-Management | OKR, Reviews | REST |

## Lizenz

MIT-Lizenz - siehe [LICENSE](LICENSE)-Datei für Details.

## Unterstützung

- **Dokumentation**: Konsultieren Sie das comprehensive guides-Verzeichnis für detaillierte Architektur- und Implementierungsanleitungen
- **Issues**: Reichen Sie Probleme bei [GitHub Issues](https://github.com/qtvhao/UGJB/issues) ein
- **Beiträge**: Pull Requests sind willkommen! Bitte lesen Sie zuerst unseren Beitragsleitfaden

---

**Beginnen Sie noch heute, die Kluft zwischen HR und Engineering zu überbrücken.** 🚀
