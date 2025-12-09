# Plataforma UGJB

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

**Plataforma Unificada de Força de Trabalho e Análise de Engenharia** - Uma plataforma modular que integra gestão de RH com análise de desempenho de engenharia em um sistema de código aberto.

## Visão Geral

A plataforma UGJB permite que organizações alinhem decisões de talentos com resultados técnicos através de insights em tempo real. Ela elimina soluções SaaS fragmentadas combinando capacidades de nível empresarial com padrões de integração padronizados e componentes reutilizáveis, ao mesmo tempo que reduz o custo total de propriedade.

### Principais Recursos

- **Gestão Unificada de Força de Trabalho** - Perfis de funcionários, rastreamento de habilidades, alocação de FTE e status de trabalho
- **Análise de Engenharia** - Métricas DORA, pontuações de qualidade de código e indicadores de confiabilidade
- **Integração com Ferramentas de Desenvolvimento** - Jira, GitLab, Firebase Crashlytics, Prometheus
- **Dashboards em Tempo Real** - Visualizações de KPI e relatórios personalizáveis
- **Controle de Acesso Baseado em Funções** - Permissões granulares e segurança de dados
- **Código Aberto e Modular** - Arquitetura extensível sem dependência de fornecedor

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

# Verificar endpoint de saúde
curl http://localhost:8080/health
```

### Acesso à Plataforma

- **Web UI**: http://localhost:8081
- **API Gateway**: http://localhost:8080

## Arquitetura

UGJB segue uma arquitetura baseada em microsserviços com contextos delimitados claramente definidos:

- **Gestão de RH** - Registro de funcionários e motor de alocação
- **Análise de Engenharia** - Coletor de métricas, motor de KPI, dashboard de insights
- **Gestão de Objetivos** - Rastreamento de objetivos e resultados-chave
- **Gestão de Projetos** - Coordenação de sprints e atribuição de tarefas
- **Integração de Sistemas** - Pipeline de dados e API gateway
- **Bem-estar da Força de Trabalho** - Previsão de burnout e monitoramento de bem-estar

## Por que UGJB?

### Problemas Resolvidos

1. **Fragmentação de Integração** - Unifica dados do Firebase, Prometheus, GitLab e Jira
2. **Silos de Domínio** - Conecta gestão de habilidades de RH com KPIs de engenharia
3. **Barreiras de Custo** - ≤ $120k TCO de 3 anos vs $200k+ SaaS empresarial
4. **Limitações de Personalização** - Fluxos de trabalho extensíveis que mantêm a estabilidade da plataforma

### Métricas de Sucesso

| Métrica | Linha de Base | Meta |
|---------|--------------|------|
| TCO de 3 anos | $201k-$246k | ≤ $120k |
| Cobertura de Integração | 50% GitLab | 100% cobertura |
| Tempo até Insights | 72+ horas | ≤ 2 horas |
| Uptime da Plataforma | Indefinido | ≥ 99.9% |

## Uso Básico

### Gerenciar Funcionários

```bash
# Criar perfil de funcionário via API
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

### Visualizar Métricas de Engenharia

Acessar o dashboard de métricas de engenharia:
- Métricas DORA (frequência de deployment, lead time)
- Pontuações de qualidade de código
- Deployments recentes
- Output de engenharia da equipe

### Configurar Integrações

Conectar ferramentas externas via Web UI:
1. Navegar para "Integrações"
2. Selecionar tipo de ferramenta (Jira, GitLab, Firebase, Prometheus)
3. Inserir endpoint da API e autenticação
4. Definir frequência de sincronização

## Licença

Este projeto está sob uma licença de código aberto - consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para enviar Pull Requests.

## Suporte

Para questões ou suporte, abra uma issue no [GitHub Issues](https://github.com/qtvhao/UGJB/issues).
