# Piattaforma UGJB

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

**Piattaforma Unificata di Gestione della Forza Lavoro e Analisi dell'Ingegneria** - Una piattaforma modulare che integra la gestione HR e l'analisi delle prestazioni ingegneristiche in un unico sistema open-source.

## Panoramica

La piattaforma UGJB consente alle organizzazioni di allineare le decisioni sui talenti con i risultati tecnici attraverso insights in tempo reale. Elimina le soluzioni SaaS frammentate combinando capacità di livello enterprise con modelli di integrazione standardizzati e componenti riutilizzabili, riducendo al contempo il costo totale di proprietà.

### Funzionalità Principali

- **Gestione Unificata della Forza Lavoro** - Profili dipendenti, tracciamento competenze, allocazione FTE e stato lavorativo
- **Analisi dell'Ingegneria** - Metriche DORA, punteggi di qualità del codice e indicatori di affidabilità
- **Integrazione con Strumenti di Sviluppo** - Jira, GitLab, Firebase Crashlytics, Prometheus
- **Dashboard in Tempo Reale** - Visualizzazioni KPI e report personalizzabili
- **Controllo degli Accessi Basato sui Ruoli** - Permessi granulari e sicurezza dei dati
- **Open-Source e Modulare** - Architettura estensibile senza vendor lock-in

## Avvio Rapido

### Prerequisiti

- Docker e Docker Compose
- Git

### Installazione

```bash
# Clonare il repository
git clone https://github.com/qtvhao/UGJB.git
cd UGJB

# Avviare tutti i servizi
docker-compose up -d

# Verificare l'endpoint di salute
curl http://localhost:8080/health
```

### Accesso alla Piattaforma

- **Web UI**: http://localhost:8081
- **API Gateway**: http://localhost:8080

## Architettura

UGJB segue un'architettura basata su microservizi con contesti delimitati chiaramente definiti:

- **Gestione HR** - Registro dipendenti e motore di allocazione
- **Analisi dell'Ingegneria** - Collettore di metriche, motore KPI, dashboard insights
- **Gestione Obiettivi** - Tracciamento di obiettivi e risultati chiave
- **Gestione Progetti** - Coordinamento sprint e assegnazione task
- **Integrazione di Sistema** - Pipeline dati e API gateway
- **Benessere della Forza Lavoro** - Previsione burnout e monitoraggio benessere

## Perché UGJB?

### Problemi Risolti

1. **Frammentazione dell'Integrazione** - Unifica i dati da Firebase, Prometheus, GitLab e Jira
2. **Silos di Dominio** - Collega la gestione delle competenze HR ai KPI ingegneristici
3. **Barriere di Costo** - ≤ 120k$ TCO a 3 anni vs 200k$+ SaaS enterprise
4. **Limitazioni di Personalizzazione** - Flussi di lavoro estensibili che mantengono la stabilità della piattaforma

### Metriche di Successo

| Metrica | Baseline | Obiettivo |
|---------|----------|-----------|
| TCO a 3 anni | 201k$-246k$ | ≤ 120k$ |
| Copertura Integrazione | 50% GitLab | 100% copertura |
| Tempo agli Insights | 72+ ore | ≤ 2 ore |
| Uptime Piattaforma | Non definito | ≥ 99.9% |

## Utilizzo di Base

### Gestire Dipendenti

```bash
# Creare profilo dipendente tramite API
curl -X POST http://localhost:8080/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mario Rossi",
    "role": "Sviluppatore Senior",
    "department": "Ingegneria",
    "status": "active",
    "fte": 100
  }'
```

### Visualizzare Metriche Ingegneristiche

Accedere al dashboard delle metriche ingegneristiche:
- Metriche DORA (frequenza deployment, lead time)
- Punteggi qualità del codice
- Deployment recenti
- Output ingegneristico del team

### Configurare Integrazioni

Connettere strumenti esterni tramite Web UI:
1. Navigare su "Integrazioni"
2. Selezionare tipo di strumento (Jira, GitLab, Firebase, Prometheus)
3. Inserire endpoint API e autenticazione
4. Impostare frequenza di sincronizzazione

## Licenza

Questo progetto è sotto licenza open-source - consultare il file [LICENSE](LICENSE) per i dettagli.

## Contributi

I contributi sono benvenuti! Sentiti libero di inviare Pull Request.

## Supporto

Per domande o supporto, apri un issue su [GitHub Issues](https://github.com/qtvhao/UGJB/issues).
