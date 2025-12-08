# Piattaforma UGJB

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

> Piattaforma open source che unifica la gestione HR e l'analisi ingegneristica

## Il Problema

Le aziende tecnologiche affrontano una sfida critica: **il divario tra sistemi HR e strumenti di ingegneria**.

- Le piattaforme HR (BambooHR, Lattice) mancano di metriche ingegneristiche (GitLab, metriche DORA)
- Gli strumenti di ingegneria (Swarmia, LinearB) non includono funzionalità HR (tracciamento competenze, allocazione FTE)
- Le soluzioni SaaS aziendali sono costose (oltre $200k in 3 anni)
- Le integrazioni personalizzate costano $25k-50k per sistema

**Il risultato?** Le decisioni sui talenti sono disconnesse dai risultati tecnici. I manager di ingegneria non possono vedere la capacità del team e i team HR non possono misurare l'impatto delle competenze sulle prestazioni.

## La Soluzione UGJB

UGJB (Piattaforma Unificata di Forza Lavoro e Analisi Ingegneristica) integra la gestione HR con analisi ingegneristiche approfondite in un unico sistema open source.

### Funzionalità Principali

**Gestione Dipendenti**
- Profili completi dei dipendenti con competenze, allocazione FTE e stato lavorativo
- Inventario competenze con livelli di competenza e tracciamento delle fonti
- Controllo accessi basato sui ruoli (HR, lead ingegneristico, contributore individuale)

**Analisi Ingegneristica**
- Metriche DORA (frequenza deploy, tasso fallimento modifiche, MTTR)
- Integrazione GitLab/GitHub (commit, PR, revisioni codice)
- Integrazione Jira (tracciamento issue, metriche sprint)
- Firebase Crashlytics (attribuzione incidenti)
- Prometheus (uptime sistema, volume alert)

**Pianificazione Forza Lavoro**
- Allocazione tra progetti con validazione FTE
- Visualizzazione capacità team in tempo reale
- Analisi correlazione competenze-risultati ingegneristici

**Dashboard Personalizzati**
- Dashboard KPI configurabili per diversi pubblici
- Integrazione con DevLake, Monday.com, Lattice
- Aggiornamento in tempo reale e tendenze storiche

![Gestione Dipendenti](./screenshots/employees-page.png)

![Metriche Ingegneristiche](./screenshots/engineering-metrics-page.png)

![Dashboard Personalizzati](./screenshots/custom-dashboards-page.png)

## Avvio Rapido

### Prerequisiti

- Docker e Docker Compose
- Git

### Installazione

```bash
git clone https://github.com/qtvhao/UGJB.git
cd UGJB
docker-compose up -d
curl http://localhost:8080/health
```

### Accesso alla Piattaforma

- **Web UI**: http://localhost:8081
- **API Gateway**: http://localhost:8080
- **Documentazione API**: http://localhost:8080/docs

## Perché UGJB?

- **Nessun costo di licenza per utente**: Architettura modulare open source
- **TCO 3 anni**: ≤$120k (vs $200k+ soluzioni SaaS)
- **Integrazioni standardizzate**: Riduzione 50% tempo sviluppo personalizzato
- **Affidabilità aziendale**: SLA uptime 99,9%

## Licenza

Licenza MIT - vedere il file [LICENSE](LICENSE) per i dettagli.

---

**Inizia a colmare il divario tra HR e ingegneria oggi.** 🚀
