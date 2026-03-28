---
name: build-news-editor
description: "기사 수정 가이드 기반 웹앱을 구축하는 오케스트레이터. 프론트엔드, 분석 엔진, QA 에이전트 팀으로 단일 HTML 웹앱을 제작한다. '웹사이트 만들어', '기사 수정 앱', '웹앱 개발' 요청 시 사용."
---

# Build News Editor Orchestrator

기사 수정 가이드 기반 웹앱을 에이전트 팀으로 구축하는 오케스트레이터.

## 실행 모드: 에이전트 팀

## 에이전트 구성

| 팀원 | 에이전트 타입 | 역할 | 출력 |
|------|-------------|------|------|
| frontend | frontend-developer | UI/UX + HTML/CSS | index.html |
| engine | engine-developer | 분석 엔진 JS | engine.js |
| qa | qa-tester | 통합 테스트 + 버그 수정 | 최종 검증된 파일 |

## 워크플로우

### Phase 1: 준비
- 신입기자_기사수정_가이드.md 확인
- _workspace/ 생성

### Phase 2: 팀 구성 + 병렬 개발
- frontend와 engine이 API 인터페이스 협의 후 병렬 개발
- 각자 산출물을 프로젝트 루트에 저장

### Phase 3: 통합 + QA
- qa가 frontend + engine 통합 검증
- 버그 발견 시 직접 수정
- 최종 품질 보고

### Phase 4: 정리
- 팀 종료, 결과 보고
