# Plateforme UGJB

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

**Plateforme Unifiée de Gestion des Effectifs et d'Analyse de l'Ingénierie** - Une plateforme modulaire intégrant la gestion RH et l'analyse des performances d'ingénierie dans un système open-source unique.

## Aperçu

La plateforme UGJB permet aux organisations d'aligner les décisions en matière de talents avec les résultats techniques grâce à des insights en temps réel. Elle élimine les solutions SaaS fragmentées en combinant des capacités de niveau entreprise avec des modèles d'intégration standardisés et des composants réutilisables, tout en réduisant le coût total de possession.

### Fonctionnalités Principales

- **Gestion Unifiée des Effectifs** - Profils des employés, suivi des compétences, allocation FTE et statut de travail
- **Analyse de l'Ingénierie** - Métriques DORA, scores de qualité du code et indicateurs de fiabilité
- **Intégration avec les Outils de Développement** - Jira, GitLab, Firebase Crashlytics, Prometheus
- **Tableaux de Bord en Temps Réel** - Visualisations KPI et rapports personnalisables
- **Contrôle d'Accès Basé sur les Rôles** - Permissions granulaires et sécurité des données
- **Open-Source et Modulaire** - Architecture extensible sans dépendance aux fournisseurs

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

# Vérifier l'endpoint de santé
curl http://localhost:8080/health
```

### Accès à la Plateforme

- **Web UI** : http://localhost:8081
- **API Gateway** : http://localhost:8080

## Architecture

UGJB suit une architecture basée sur les microservices avec des contextes délimités clairement définis :

- **Gestion RH** - Registre des employés et moteur d'allocation
- **Analyse de l'Ingénierie** - Collecteur de métriques, moteur KPI, tableau de bord d'insights
- **Gestion des Objectifs** - Suivi des objectifs et résultats clés
- **Gestion de Projets** - Coordination des sprints et attribution des tâches
- **Intégration Système** - Pipeline de données et passerelle API
- **Bien-être des Effectifs** - Prédiction de l'épuisement professionnel et surveillance du bien-être

## Pourquoi UGJB ?

### Problèmes Résolus

1. **Fragmentation de l'Intégration** - Unifie les données de Firebase, Prometheus, GitLab et Jira
2. **Silos de Domaine** - Connecte la gestion des compétences RH aux KPI d'ingénierie
3. **Barrières de Coût** - ≤ 120k$ TCO sur 3 ans vs 200k$+ SaaS d'entreprise
4. **Limitations de Personnalisation** - Workflows extensibles maintenant la stabilité de la plateforme

### Métriques de Succès

| Métrique | Ligne de Base | Objectif |
|----------|--------------|----------|
| TCO sur 3 ans | 201k$-246k$ | ≤ 120k$ |
| Couverture d'Intégration | 50% GitLab | 100% couverture |
| Temps jusqu'aux Insights | 72+ heures | ≤ 2 heures |
| Disponibilité de la Plateforme | Non défini | ≥ 99.9% |

## Utilisation de Base

### Gérer les Employés

```bash
# Créer un profil d'employé via l'API
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

### Voir les Métriques d'Ingénierie

Accéder au tableau de bord des métriques d'ingénierie :
- Métriques DORA (fréquence de déploiement, délai d'exécution)
- Scores de qualité du code
- Déploiements récents
- Production d'ingénierie de l'équipe

### Configurer les Intégrations

Connecter des outils externes via l'interface Web :
1. Naviguer vers « Intégrations »
2. Sélectionner le type d'outil (Jira, GitLab, Firebase, Prometheus)
3. Saisir l'endpoint API et l'authentification
4. Définir la fréquence de synchronisation

## Licence

Ce projet est sous licence open-source - consultez le fichier [LICENSE](LICENSE) pour plus de détails.

## Contributions

Les contributions sont les bienvenues ! N'hésitez pas à soumettre des Pull Requests.

## Support

Pour des questions ou du support, ouvrez une issue sur [GitHub Issues](https://github.com/qtvhao/UGJB/issues).
