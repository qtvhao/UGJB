# UGJB 플랫폼

[![GitHub](https://img.shields.io/badge/github-repo-blue?logo=github)](https://github.com/qtvhao/UGJB)
[![License](https://img.shields.io/github/license/qtvhao/UGJB.svg?color=blue)](LICENSE)

**통합 인력 및 엔지니어링 분석 플랫폼** - HR 관리와 엔지니어링 성과 분석을 하나의 오픈소스 시스템에 통합하는 모듈식 플랫폼.

## 개요

UGJB 플랫폼은 실시간 인사이트를 통해 조직이 인재 결정을 기술 성과와 연계할 수 있도록 지원합니다. 분산된 SaaS 솔루션을 제거하고 표준화된 통합 패턴 및 재사용 가능한 구성 요소와 함께 엔터프라이즈급 기능을 결합하면서 총 소유 비용을 절감합니다.

### 주요 기능

- **통합 인력 관리** - 직원 프로필, 기술 추적, FTE 할당 및 근무 상태
- **엔지니어링 분석** - DORA 메트릭, 코드 품질 점수 및 신뢰성 지표
- **개발 도구 통합** - Jira, GitLab, Firebase Crashlytics, Prometheus
- **실시간 대시보드** - 사용자 정의 가능한 KPI 시각화 및 보고서
- **역할 기반 액세스 제어** - 세분화된 권한 및 데이터 보안
- **오픈소스 및 모듈식** - 확장 가능한 아키텍처, 벤더 종속성 없음

## 빠른 시작

### 사전 요구 사항

- Docker 및 Docker Compose
- Git

### 설치

```bash
# 저장소 복제
git clone https://github.com/qtvhao/UGJB.git
cd UGJB

# 모든 서비스 시작
docker-compose up -d

# 헬스 엔드포인트 확인
curl http://localhost:8080/health
```

### 플랫폼 액세스

- **Web UI**: http://localhost:8081
- **API Gateway**: http://localhost:8080

## 아키텍처

UGJB는 명확하게 정의된 경계 컨텍스트를 가진 마이크로서비스 기반 아키텍처를 따릅니다:

- **HR 관리** - 직원 레지스트리 및 할당 엔진
- **엔지니어링 분석** - 메트릭 수집기, KPI 엔진, 인사이트 대시보드
- **목표 관리** - 목표 및 핵심 결과 추적
- **프로젝트 관리** - 스프린트 조정 및 작업 할당
- **시스템 통합** - 데이터 파이프라인 및 API 게이트웨이
- **인력 웰빙** - 번아웃 예측 및 웰빙 모니터링

## 왜 UGJB인가?

### 해결된 문제

1. **통합 파편화** - Firebase, Prometheus, GitLab 및 Jira의 데이터 통합
2. **도메인 사일로** - HR 기술 관리를 엔지니어링 KPI와 연결
3. **비용 장벽** - ≤ $120k 3년 TCO vs $200k+ 엔터프라이즈 SaaS
4. **사용자 정의 제한** - 플랫폼 안정성을 유지하는 확장 가능한 워크플로

### 성공 지표

| 지표 | 기준선 | 목표 |
|------|--------|------|
| 3년 총 소유 비용 | $201k-$246k | ≤ $120k |
| 통합 커버리지 | 50% GitLab | 100% 커버리지 |
| 인사이트 시간 | 72+ 시간 | ≤ 2 시간 |
| 플랫폼 가동 시간 | 정의되지 않음 | ≥ 99.9% |

## 기본 사용법

### 직원 관리

```bash
# API를 통한 직원 프로필 생성
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

### 엔지니어링 메트릭 보기

엔지니어링 메트릭 대시보드 액세스:
- DORA 메트릭 (배포 빈도, 리드 타임)
- 코드 품질 점수
- 최근 배포
- 팀 엔지니어링 산출물

### 통합 구성

Web UI를 통해 외부 도구 연결:
1. "통합"으로 이동
2. 도구 유형 선택 (Jira, GitLab, Firebase, Prometheus)
3. API 엔드포인트 및 인증 입력
4. 동기화 빈도 설정

## 라이선스

이 프로젝트는 오픈소스 라이선스를 따릅니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 기여

기여를 환영합니다! Pull Request를 자유롭게 제출하세요.

## 지원

질문이나 지원이 필요하면 [GitHub Issues](https://github.com/qtvhao/UGJB/issues)에서 이슈를 개설하세요.
