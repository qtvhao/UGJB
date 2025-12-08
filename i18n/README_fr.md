# Plateforme UGJB

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

> Plateforme open source unifiant la gestion RH et l'analyse d'ingénierie

## Le Problème

Les entreprises technologiques font face à un défi critique : **le fossé entre les systèmes RH et les outils d'ingénierie**.

- Les plateformes RH (BambooHR, Lattice) manquent de métriques d'ingénierie (GitLab, métriques DORA)
- Les outils d'ingénierie (Swarmia, LinearB) n'incluent pas les fonctionnalités RH (suivi des compétences, allocation FTE)
- Les solutions SaaS d'entreprise sont coûteuses (plus de 200k$ sur 3 ans)
- Les intégrations personnalisées coûtent 25k$-50k$ par système

**Le résultat ?** Les décisions sur les talents sont déconnectées des résultats techniques. Les managers en ingénierie ne peuvent pas voir la capacité de l'équipe, et les équipes RH ne peuvent pas mesurer l'impact des compétences sur la performance.

## La Solution UGJB

UGJB (Plateforme Unifiée de Gestion de la Main-d'œuvre et d'Analyse d'Ingénierie) intègre la gestion RH avec une analyse approfondie de l'ingénierie dans un système open source unique.

### Fonctionnalités Principales

**Gestion des Employés**
- Profils complets des employés avec compétences, allocation FTE et statut professionnel
- Inventaire des compétences avec niveaux de maîtrise et suivi des sources
- Contrôle d'accès basé sur les rôles (RH, responsable ingénierie, contributeur individuel)

**Analyse d'Ingénierie**
- Métriques DORA (fréquence de déploiement, taux d'échec des changements, MTTR)
- Intégration GitLab/GitHub (commits, PR, revues de code)
- Intégration Jira (suivi des problèmes, métriques de sprint)
- Firebase Crashlytics (attribution des incidents)
- Prometheus (temps de disponibilité système, volume d'alertes)

**Planification de la Main-d'œuvre**
- Allocation entre projets avec validation FTE
- Visualisation de la capacité d'équipe en temps réel
- Analyse de corrélation compétences-résultats d'ingénierie

**Tableaux de Bord Personnalisés**
- Tableaux de bord KPI configurables pour différents publics
- Intégration avec DevLake, Monday.com, Lattice
- Actualisation en temps réel et tendances historiques

![Gestion des Employés](./screenshots/employees-page.png)
*Annuaire des employés avec suivi des rôles, départements et statuts*

![Métriques d'Ingénierie](./screenshots/engineering-metrics-page.png)
*Métriques DORA et analyse de performance d'ingénierie*

![Tableaux de Bord Personnalisés](./screenshots/custom-dashboards-page.png)
*Créer des tableaux de bord KPI configurables pour les cadres et les équipes*

## Démarrage Rapide

### Prérequis

- Docker et Docker Compose
- Git

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/qtvhao/UGJB.git
cd UGJB

# Démarrer tous les services
docker-compose up -d

# Vérifier les contrôles de santé
curl http://localhost:8080/health  # API Gateway
curl http://localhost:8081         # Web UI (via nginx)
```

### Accès à la Plateforme

- **Web UI**: http://localhost:8081
- **API Gateway**: http://localhost:8080
- **Documentation API**: http://localhost:8080/docs

### Utilisation de Base

1. **Créer un profil d'employé**
   ```bash
   curl -X POST http://localhost:8080/api/v1/employees \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Jean Dupont",
       "role": "Développeur Senior",
       "department": "Ingénierie",
       "status": "active",
       "fte": 100
     }'
   ```

2. **Configurer l'intégration GitLab**
   - Naviguer vers Paramètres > Intégrations
   - Sélectionner GitLab
   - Saisir le point de terminaison API et le jeton
   - Définir la fréquence de synchronisation (minimum quotidien)

3. **Afficher les métriques d'ingénierie**
   - Visiter la page Métriques d'Ingénierie
   - Voir les métriques DORA (fréquence de déploiement, délai de livraison, taux d'échec)
   - Surveiller l'activité du code et les résultats de l'équipe

## Pourquoi UGJB ?

### Insights Unifiés
Corrélation des données de main-d'œuvre avec la performance d'ingénierie. Répondez à des questions comme : "L'expertise Kubernetes réduit-elle le temps de résolution des incidents ?"

### Optimisation des Coûts
- **Pas de frais de licence par utilisateur** : Architecture modulaire open source
- **Objectif TCO sur 3 ans** : ≤120k$ (vs 200k$+ pour les solutions SaaS)
- **Intégrations standardisées** : Réduction de 50% du temps de développement personnalisé

### Fiabilité de Niveau Entreprise
- SLA de disponibilité de 99,9%
- Observabilité complète (Prometheus, ELK)
- Synchronisation en temps réel entre domaines

### Personnalisation
- Architecture microservices modulaire
- Modèles d'intégration extensibles
- Règles d'automatisation sans code

## Architecture Technique

UGJB utilise une architecture microservices avec 6 contextes délimités :

- **Gestion RH** (Java/Spring Boot) : Registre des employés, moteur d'allocation
- **Analyse d'Ingénierie** (Python/FastAPI) : Collecteur de métriques, moteur KPI, tableau de bord
- **Gestion des Objectifs** (TypeScript/NestJS) : OKR, suivi des résultats clés
- **Gestion de Projet** (TypeScript/NestJS) : Coordination de sprint, répartition des tâches
- **Intégration Système** (Kotlin/Go) : Pipeline de données, API Gateway
- **Bien-être de la Main-d'œuvre** (Python/FastAPI) : Prédiction de l'épuisement, surveillance du bien-être

**Stockage de Données** : PostgreSQL, InfluxDB, TimescaleDB, ClickHouse, Redis
**Messagerie** : Kafka, RabbitMQ
**Observabilité** : Prometheus, Grafana, ELK

## Intégrations

UGJB fournit des intégrations prêtes à l'emploi avec des outils courants :

| Outil | Objectif | Données | Protocole |
|-------|----------|---------|-----------|
| GitLab | Contrôle de version | Commits, PR, revues | REST + Webhooks |
| Jira | Suivi des problèmes | Problèmes, tâches | REST + Webhooks |
| Firebase Crashlytics | Surveillance des incidents | Crashes, erreurs | Notifications push |
| Prometheus | Métriques système | Alertes, disponibilité | API de requête |
| DevLake | Agrégation d'ingénierie | Métriques DORA | REST |
| Monday.com | Gestion de projet | Tâches, flux de travail | GraphQL |
| Lattice | Gestion de la performance | OKR, évaluations | REST |

## Licence

Licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Support

- **Documentation** : Consultez le répertoire `docs/` pour des guides détaillés d'architecture et d'implémentation
- **Problèmes** : Soumettez les problèmes sur [GitHub Issues](https://github.com/qtvhao/UGJB/issues)
- **Contributions** : Les Pull Requests sont les bienvenues ! Veuillez d'abord lire notre guide de contribution

---

**Commencez à combler le fossé entre RH et ingénierie dès aujourd'hui.** 🚀
