# Plataforma UGJB

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

> Plataforma de código aberto que unifica gestão de RH e análise de engenharia

## O Problema

Empresas de tecnologia enfrentam um desafio crítico: **a lacuna entre sistemas de RH e ferramentas de engenharia**.

- Plataformas de RH (BambooHR, Lattice) carecem de métricas de engenharia (GitLab, métricas DORA)
- Ferramentas de engenharia (Swarmia, LinearB) não incluem funcionalidades de RH (rastreamento de habilidades, alocação de FTE)
- Soluções SaaS empresariais são caras (mais de $200k em 3 anos)
- Integrações personalizadas custam $25k-50k por sistema

**O resultado?** Decisões de talento estão desconectadas dos resultados técnicos. Gerentes de engenharia não conseguem ver a capacidade da equipe, e equipes de RH não conseguem medir o impacto das habilidades no desempenho.

## A Solução UGJB

UGJB (Plataforma Unificada de Força de Trabalho e Análise de Engenharia) integra gestão de RH com análise profunda de engenharia em um único sistema de código aberto.

### Principais Recursos

**Gestão de Funcionários**
- Perfis completos de funcionários com habilidades, alocação de FTE e status de trabalho
- Inventário de habilidades com níveis de proficiência e rastreamento de fonte
- Controle de acesso baseado em função (RH, líder de engenharia, contribuidor individual)

**Análise de Engenharia**
- Métricas DORA (frequência de implantação, taxa de falha de mudanças, MTTR)
- Integração GitLab/GitHub (commits, PRs, revisões de código)
- Integração Jira (rastreamento de issues, métricas de sprint)
- Firebase Crashlytics (atribuição de incidentes)
- Prometheus (tempo de atividade do sistema, volume de alertas)

**Planejamento de Força de Trabalho**
- Alocação entre projetos com validação de FTE
- Visualização de capacidade da equipe em tempo real
- Análise de correlação habilidades-resultados de engenharia

**Painéis Personalizados**
- Painéis de KPI configuráveis para diferentes públicos
- Integração com DevLake, Monday.com, Lattice
- Atualização em tempo real e tendências históricas

![Gestão de Funcionários](./screenshots/employees-page.png)
*Diretório de funcionários com rastreamento de funções, departamentos e status*

![Métricas de Engenharia](./screenshots/engineering-metrics-page.png)
*Métricas DORA e análise de desempenho de engenharia*

![Painéis Personalizados](./screenshots/custom-dashboards-page.png)
*Criar painéis de KPI configuráveis para executivos e equipes*

## Início Rápido

### Pré-requisitos

- Docker e Docker Compose
- Git

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/qtvhao/UGJB.git
cd UGJB

# Iniciar todos os serviços
docker-compose up -d

# Verificar verificações de saúde
curl http://localhost:8080/health  # API Gateway
curl http://localhost:8081         # Web UI (via nginx)
```

### Acesso à Plataforma

- **Web UI**: http://localhost:8081
- **API Gateway**: http://localhost:8080
- **Documentação da API**: http://localhost:8080/docs

### Uso Básico

1. **Criar perfil de funcionário**
   ```bash
   curl -X POST http://localhost:8080/api/v1/employees \
     -H "Content-Type: application/json" \
     -d '{
       "name": "João Silva",
       "role": "Desenvolvedor Sênior",
       "department": "Engenharia",
       "status": "active",
       "fte": 100
     }'
   ```

2. **Configurar integração do GitLab**
   - Navegar para Configurações > Integrações
   - Selecionar GitLab
   - Inserir endpoint da API e token
   - Definir frequência de sincronização (mínimo diário)

3. **Visualizar métricas de engenharia**
   - Visitar página de Métricas de Engenharia
   - Ver métricas DORA (frequência de implantação, lead time, taxa de falha)
   - Monitorar atividade de código e saída da equipe

## Por Que UGJB?

### Insights Unificados
Correlacione dados de força de trabalho com desempenho de engenharia. Responda perguntas como: "A experiência em Kubernetes reduz o tempo de resolução de incidentes?"

### Otimização de Custos
- **Sem taxas de licença por usuário**: Arquitetura modular de código aberto
- **Meta de TCO de 3 anos**: ≤$120k (vs $200k+ de soluções SaaS)
- **Integrações padronizadas**: Redução de 50% no tempo de desenvolvimento personalizado

### Confiabilidade Empresarial
- SLA de 99,9% de tempo de atividade
- Observabilidade abrangente (Prometheus, ELK)
- Sincronização em tempo real entre domínios

### Personalização
- Arquitetura de microsserviços modular
- Padrões de integração extensíveis
- Regras de automação sem código

## Arquitetura Técnica

UGJB usa uma arquitetura de microsserviços com 6 contextos delimitados:

- **Gestão de RH** (Java/Spring Boot): Registro de funcionários, motor de alocação
- **Análise de Engenharia** (Python/FastAPI): Coletor de métricas, motor de KPI, painel de insights
- **Gestão de Objetivos** (TypeScript/NestJS): OKR, rastreamento de resultados-chave
- **Gestão de Projetos** (TypeScript/NestJS): Coordenação de sprint, despacho de tarefas
- **Integração de Sistemas** (Kotlin/Go): Pipeline de dados, API Gateway
- **Bem-estar da Força de Trabalho** (Python/FastAPI): Predição de burnout, monitoramento de bem-estar

**Armazenamento de Dados**: PostgreSQL, InfluxDB, TimescaleDB, ClickHouse, Redis
**Mensageria**: Kafka, RabbitMQ
**Observabilidade**: Prometheus, Grafana, ELK

## Integrações

UGJB fornece integrações prontas para uso com ferramentas comuns:

| Ferramenta | Propósito | Dados | Protocolo |
|------------|-----------|-------|-----------|
| GitLab | Controle de versão | Commits, PRs, revisões | REST + Webhooks |
| Jira | Rastreamento de issues | Issues, tarefas | REST + Webhooks |
| Firebase Crashlytics | Monitoramento de incidentes | Crashes, erros | Notificações push |
| Prometheus | Métricas do sistema | Alertas, tempo de atividade | API de consulta |
| DevLake | Agregação de engenharia | Métricas DORA | REST |
| Monday.com | Gestão de projetos | Tarefas, fluxos de trabalho | GraphQL |
| Lattice | Gestão de desempenho | OKR, avaliações | REST |

## Licença

Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Suporte

- **Documentação**: Consulte o diretório `docs/` para guias detalhados de arquitetura e implementação
- **Issues**: Envie problemas em [GitHub Issues](https://github.com/qtvhao/UGJB/issues)
- **Contribuições**: Pull Requests são bem-vindos! Por favor, leia primeiro nosso guia de contribuição

---

**Comece a preencher a lacuna entre RH e engenharia hoje.** 🚀
