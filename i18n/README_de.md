# UGJB Plattform

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

**Vereinheitlichte Plattform für Workforce- und Engineering-Analytics** - Eine modulare Plattform, die HR-Management und Engineering-Performance-Analyse in einem einzigen Open-Source-System integriert.

## Überblick

Die UGJB-Plattform ermöglicht es Organisationen, Talententscheidungen durch Echtzeiteinblicke mit technischen Ergebnissen abzustimmen. Sie eliminiert fragmentierte SaaS-Lösungen, indem sie Enterprise-Grade-Funktionen mit standardisierten Integrationsmustern und wiederverwendbaren Komponenten kombiniert und gleichzeitig die Gesamtbetriebskosten senkt.

### Hauptfunktionen

- **Vereinheitlichtes Workforce-Management** - Mitarbeiterprofile, Skills-Tracking, FTE-Zuteilung und Arbeitsstatus
- **Engineering-Analytics** - DORA-Metriken, Code-Qualitätsscores und Zuverlässigkeitsindikatoren
- **Integration mit Entwicklungstools** - Jira, GitLab, Firebase Crashlytics, Prometheus
- **Echtzeit-Dashboards** - Anpassbare KPI-Visualisierungen und Berichte
- **Rollenbasierte Zugriffskontrolle** - Granulare Berechtigungen und Datensicherheit
- **Open-Source und modular** - Erweiterbare Architektur ohne Vendor Lock-in

## Schnellstart

### Voraussetzungen

- Docker und Docker Compose
- Git

### Installation

```bash
# Repository klonen
git clone https://github.com/qtvhao/UGJB.git
cd UGJB

# Alle Services starten
docker-compose up -d

# Health-Endpoint überprüfen
curl http://localhost:8080/health
```

### Plattformzugang

- **Web UI**: http://localhost:8081
- **API Gateway**: http://localhost:8080

## Architektur

UGJB folgt einer Microservices-basierten Architektur mit klar definierten Bounded Contexts:

- **HR-Management** - Mitarbeiterregister und Zuteilungs-Engine
- **Engineering-Analytics** - Metriken-Kollektor, KPI-Engine, Insights-Dashboard
- **Zielmanagement** - Verfolgung von Zielen und Schlüsselergebnissen
- **Projektmanagement** - Sprint-Koordination und Aufgabenzuweisung
- **Systemintegration** - Datenpipeline und API-Gateway
- **Workforce-Wellbeing** - Burnout-Vorhersage und Wellbeing-Überwachung

## Warum UGJB?

### Gelöste Probleme

1. **Integrationsfragmentierung** - Vereinheitlicht Daten von Firebase, Prometheus, GitLab und Jira
2. **Domain-Silos** - Verbindet HR-Skill-Management mit Engineering-KPIs
3. **Kostenbarrieren** - ≤ 120k$ 3-Jahres-TCO vs. 200k$+ Enterprise-SaaS
4. **Anpassungsbeschränkungen** - Erweiterbare Workflows bei Aufrechterhaltung der Plattformstabilität

### Erfolgsmetriken

| Metrik | Baseline | Ziel |
|--------|----------|------|
| 3-Jahres-TCO | 201k$-246k$ | ≤ 120k$ |
| Integrationsabdeckung | 50% GitLab | 100% Abdeckung |
| Zeit bis zu Insights | 72+ Stunden | ≤ 2 Stunden |
| Plattform-Verfügbarkeit | Undefiniert | ≥ 99.9% |

## Grundlegende Verwendung

### Mitarbeiter verwalten

```bash
# Mitarbeiterprofil über API erstellen
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

### Engineering-Metriken anzeigen

Zugriff auf das Engineering-Metriken-Dashboard:
- DORA-Metriken (Deployment-Frequenz, Lead Time)
- Code-Qualitätsscores
- Aktuelle Deployments
- Team-Engineering-Output

### Integrationen konfigurieren

Externe Tools über Web UI verbinden:
1. Zu „Integrationen" navigieren
2. Tool-Typ auswählen (Jira, GitLab, Firebase, Prometheus)
3. API-Endpoint und Authentifizierung eingeben
4. Sync-Frequenz festlegen

## Lizenz

Dieses Projekt steht unter einer Open-Source-Lizenz - siehe [LICENSE](LICENSE)-Datei für Details.

## Beiträge

Beiträge sind willkommen! Reichen Sie gerne Pull Requests ein.

## Support

Bei Fragen oder Support öffnen Sie bitte ein Issue auf [GitHub Issues](https://github.com/qtvhao/UGJB/issues).
