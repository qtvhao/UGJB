# UGJB 플랫폼

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

> 인사 관리와 엔지니어링 분석을 통합한 오픈 소스 플랫폼

## 문제점

기술 회사는 중요한 과제에 직면해 있습니다: **HR 시스템과 엔지니어링 도구 간의 격차**

- HR 플랫폼(BambooHR, Lattice)에는 엔지니어링 지표(GitLab, DORA 메트릭)가 부족합니다
- 엔지니어링 도구(Swarmia, LinearB)에는 HR 기능(기술 추적, FTE 할당)이 포함되지 않습니다
- 엔터프라이즈 SaaS 솔루션은 비용이 높습니다(3년간 $200k 초과)
- 사용자 정의 통합은 시스템당 $25k-50k가 필요합니다

**결과는?** 인재 결정이 기술 성과와 분리됩니다. 엔지니어링 관리자는 팀 역량을 볼 수 없고, HR 팀은 성과에 대한 기술의 영향을 측정할 수 없습니다.

## UGJB의 솔루션

UGJB(통합 인력 및 엔지니어링 분석 플랫폼)는 HR 관리와 심층 엔지니어링 분석을 단일 오픈 소스 시스템으로 통합합니다.

### 주요 기능

**직원 관리**
- 기술, FTE 할당 및 근무 상태가 포함된 완전한 직원 프로필
- 숙련도 수준 및 출처 추적이 포함된 기술 인벤토리
- 역할 기반 접근 제어(HR, 엔지니어링 리드, 개인 기여자)

**엔지니어링 분석**
- DORA 메트릭(배포 빈도, 변경 실패율, MTTR)
- GitLab/GitHub 통합(커밋, PR, 코드 리뷰)
- Jira 통합(이슈 추적, 스프린트 메트릭)
- Firebase Crashlytics(인시던트 귀속)
- Prometheus(시스템 가동 시간, 경고 볼륨)

**인력 계획**
- FTE 검증을 통한 프로젝트 간 할당
- 실시간 팀 용량 시각화
- 기술-엔지니어링 성과 상관관계 분석

**사용자 정의 대시보드**
- 다양한 대상을 위한 구성 가능한 KPI 대시보드
- DevLake, Monday.com, Lattice와 통합
- 실시간 새로고침 및 기록 추세

![직원 관리](./screenshots/employees-page.png)
*역할, 부서 및 상태 추적이 포함된 직원 디렉토리*

![엔지니어링 메트릭](./screenshots/engineering-metrics-page.png)
*DORA 메트릭 및 엔지니어링 성과 분석*

![사용자 정의 대시보드](./screenshots/custom-dashboards-page.png)
*임원 및 팀을 위한 구성 가능한 KPI 대시보드 생성*

## 빠른 시작

### 사전 요구사항

- Docker 및 Docker Compose
- Git

### 설치

```bash
# 저장소 복제
git clone https://github.com/qtvhao/UGJB.git
cd UGJB

# 모든 서비스 시작
docker-compose up -d

# 상태 확인 검증
curl http://localhost:8080/health  # API 게이트웨이
curl http://localhost:8081         # Web UI (nginx를 통해)
```

### 플랫폼 액세스

- **Web UI**: http://localhost:8081
- **API 게이트웨이**: http://localhost:8080
- **API 문서**: http://localhost:8080/docs

### 기본 사용법

1. **직원 프로필 생성**
   ```bash
   curl -X POST http://localhost:8080/api/v1/employees \
     -H "Content-Type: application/json" \
     -d '{
       "name": "홍길동",
       "role": "시니어 개발자",
       "department": "엔지니어링",
       "status": "active",
       "fte": 100
     }'
   ```

2. **GitLab 통합 구성**
   - 설정 > 통합으로 이동
   - GitLab 선택
   - API 엔드포인트 및 토큰 입력
   - 동기화 빈도 설정(최소 일일)

3. **엔지니어링 메트릭 보기**
   - 엔지니어링 메트릭 페이지 방문
   - DORA 메트릭 보기(배포 빈도, 리드 타임, 변경 실패율)
   - 코드 활동 및 팀 산출물 모니터링

## 왜 UGJB인가?

### 통합 인사이트
인력 데이터를 엔지니어링 성과와 연관시킵니다. "Kubernetes 전문 지식이 인시던트 해결 시간을 줄이는가?"와 같은 질문에 답하세요.

### 비용 최적화
- **사용자 라이선스 수수료 없음**: 오픈 소스 모듈식 아키텍처
- **3년 TCO 목표**: ≤$120k (SaaS 솔루션의 $200k+와 비교)
- **표준화된 통합**: 사용자 정의 개발 시간 50% 감소

### 엔터프라이즈급 신뢰성
- 99.9% 가동 시간 SLA
- 포괄적인 관찰 가능성(Prometheus, ELK)
- 도메인 간 실시간 동기화

### 사용자 정의 가능성
- 모듈식 마이크로서비스 아키텍처
- 확장 가능한 통합 패턴
- 노코드 자동화 규칙

## 기술 아키텍처

UGJB는 6개의 경계 컨텍스트를 가진 마이크로서비스 아키텍처를 사용합니다:

- **HR 관리**(Java/Spring Boot): 직원 등록, 할당 엔진
- **엔지니어링 분석**(Python/FastAPI): 메트릭 수집기, KPI 엔진, 인사이트 대시보드
- **목표 관리**(TypeScript/NestJS): OKR, 주요 결과 추적
- **프로젝트 관리**(TypeScript/NestJS): 스프린트 조정, 작업 디스패치
- **시스템 통합**(Kotlin/Go): 데이터 파이프라인, API 게이트웨이
- **인력 웰빙**(Python/FastAPI): 번아웃 예측, 웰빙 모니터링

**데이터 저장소**: PostgreSQL, InfluxDB, TimescaleDB, ClickHouse, Redis
**메시징**: Kafka, RabbitMQ
**관찰 가능성**: Prometheus, Grafana, ELK

## 통합

UGJB는 일반적인 도구에 대한 기본 통합을 제공합니다:

| 도구 | 목적 | 데이터 | 프로토콜 |
|------|------|------|---------|
| GitLab | 버전 관리 | 커밋, PR, 리뷰 | REST + Webhooks |
| Jira | 이슈 추적 | 이슈, 작업 | REST + Webhooks |
| Firebase Crashlytics | 인시던트 모니터링 | 크래시, 오류 | 푸시 알림 |
| Prometheus | 시스템 메트릭 | 경고, 가동 시간 | 쿼리 API |
| DevLake | 엔지니어링 집계 | DORA 메트릭 | REST |
| Monday.com | 프로젝트 관리 | 작업, 워크플로 | GraphQL |
| Lattice | 성과 관리 | OKR, 리뷰 | REST |

## 라이선스

MIT 라이선스 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 지원

- **문서**: 자세한 아키텍처 및 구현 가이드는 comprehensive guides 디렉토리를 참조하세요
- **이슈**: [GitHub Issues](https://github.com/qtvhao/UGJB/issues)에서 문제 제출
- **기여**: Pull Requests를 환영합니다! 먼저 기여 가이드를 읽어주세요

---

**오늘부터 HR과 엔지니어링 간의 격차를 해소하세요.** 🚀
