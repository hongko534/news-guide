---
name: news-editing-guide
description: "신입 기자를 위한 기사 수정 가이드를 작성하는 오케스트레이터 스킬. 3명의 리서처 에이전트 팀이 표현/구조/정확성 영역의 수정 사례를 병렬 조사한 뒤, 리더가 종합 가이드를 작성한다. '기사 수정 가이드', '신입 기자 가이드', '기사 교열 가이드', '기사 작성 가이드' 등 기사 수정 가이드 작성 요청 시 반드시 이 스킬을 사용할 것."
---

# News Editing Guide Orchestrator

신입 기자를 위한 기사 수정 가이드를 작성하는 에이전트 팀 오케스트레이터.

## 실행 모드: 에이전트 팀

## 에이전트 구성

| 팀원 | 에이전트 타입 | 역할 | 출력 |
|------|-------------|------|------|
| expression | expression-researcher | 표현/문장 수정 사례 조사 | `_workspace/01_expression_cases.md` |
| structure | structure-researcher | 기사 구조/형식 수정 사례 조사 | `_workspace/01_structure_cases.md` |
| accuracy | accuracy-researcher | 정확성/윤리 수정 사례 조사 | `_workspace/01_accuracy_ethics_cases.md` |
| (리더) | — | 통합 가이드 작성 | 최종 가이드 문서 |

## 워크플로우

### Phase 1: 준비
1. 사용자 입력 분석 — 가이드의 범위, 대상 독자, 특별 요구사항 파악
2. `_workspace/` 디렉토리 생성

### Phase 2: 팀 구성

1. 팀 생성:
   ```
   TeamCreate(
     team_name: "news-editing-team",
     members: [
       {
         name: "expression",
         agent_type: "expression-researcher",
         model: "opus",
         prompt: "당신은 expression-researcher입니다. .claude/agents/expression-researcher.md의 역할 정의를 Read로 읽고 따르세요. .claude/skills/research-editing-cases/skill.md도 읽고 조사 방법을 참고하세요. WebSearch와 WebFetch를 적극 활용하여 신문 기사의 표현/문장 수정 사례를 최대한 많이 수집하세요. 수집한 사례는 _workspace/01_expression_cases.md에 저장하세요. 다른 팀원에게 도움이 될 발견이 있으면 SendMessage로 공유하세요."
       },
       {
         name: "structure",
         agent_type: "structure-researcher",
         model: "opus",
         prompt: "당신은 structure-researcher입니다. .claude/agents/structure-researcher.md의 역할 정의를 Read로 읽고 따르세요. .claude/skills/research-editing-cases/skill.md도 읽고 조사 방법을 참고하세요. WebSearch와 WebFetch를 적극 활용하여 신문 기사의 구조/형식 수정 사례를 최대한 많이 수집하세요. 수집한 사례는 _workspace/01_structure_cases.md에 저장하세요. 다른 팀원에게 도움이 될 발견이 있으면 SendMessage로 공유하세요."
       },
       {
         name: "accuracy",
         agent_type: "accuracy-researcher",
         model: "opus",
         prompt: "당신은 accuracy-researcher입니다. .claude/agents/accuracy-researcher.md의 역할 정의를 Read로 읽고 따르세요. .claude/skills/research-editing-cases/skill.md도 읽고 조사 방법을 참고하세요. WebSearch와 WebFetch를 적극 활용하여 신문 기사의 정확성/윤리 수정 사례를 최대한 많이 수집하세요. 수집한 사례는 _workspace/01_accuracy_ethics_cases.md에 저장하세요. 다른 팀원에게 도움이 될 발견이 있으면 SendMessage로 공유하세요."
       }
     ]
   )
   ```

2. 작업 등록:
   ```
   TaskCreate(tasks: [
     { title: "표현/문장 수정 사례 조사", description: "맞춤법, 비문, 중복 표현, 관용구 오용, 문체, 피동·사동 등 문장 수준 수정 사례를 웹에서 조사하여 _workspace/01_expression_cases.md에 저장", assignee: "expression" },
     { title: "기사 구조/형식 수정 사례 조사", description: "리드, 역피라미드, 제목, 인용문, 단락 구성 등 구조적 수정 사례를 웹에서 조사하여 _workspace/01_structure_cases.md에 저장", assignee: "structure" },
     { title: "정확성/윤리 수정 사례 조사", description: "팩트체크 실패, 수치 오용, 출처 표기, 편향, 차별 표현 등 정확성/윤리 수정 사례를 웹에서 조사하여 _workspace/01_accuracy_ethics_cases.md에 저장", assignee: "accuracy" }
   ])
   ```

### Phase 3: 조사 수행

**실행 방식:** 팀원들이 자체 조율하며 병렬 조사

- 3명의 리서처가 각자 영역을 독립적으로 웹 조사
- 흥미로운 발견이 있으면 팀원 간 SendMessage로 공유
  - 예: expression이 문장 오류가 사실 왜곡으로 이어진 사례 발견 → accuracy에게 공유
  - 예: accuracy가 기사 구조가 편향을 만든 사례 발견 → structure에게 공유
- 각 팀원은 완료 시 산출물 파일 저장 + 리더에게 알림

**리더 모니터링:**
- TaskGet으로 전체 진행률 확인
- 팀원이 유휴 상태가 되면 자동 알림 수신
- 팀원이 막혔을 때 SendMessage로 검색어 제안 등 지원

### Phase 4: 통합 가이드 작성

1. 3개 산출물을 Read로 수집
2. 사례를 카테고리별로 재정리
3. 종합 가이드 문서 작성:

**가이드 구조:**
```
# 신입 기자를 위한 기사 수정 가이드

## 들어가며
- 이 가이드의 목적과 활용법

## 제1장: 문장과 표현
### 1.1 맞춤법과 띄어쓰기
### 1.2 비문과 주술 호응
### 1.3 중복 표현과 군더더기
### 1.4 관용구와 외래어
### 1.5 기사 문체
### 1.6 피동·사동 표현

## 제2장: 기사 구조와 형식
### 2.1 리드(첫 문단) 작성
### 2.2 역피라미드 구조
### 2.3 기사 제목
### 2.4 인용문 처리
### 2.5 단락 구성
### 2.6 기사 유형별 구조

## 제3장: 정확성과 윤리
### 3.1 사실 확인(팩트 체크)
### 3.2 수치와 통계 사용
### 3.3 출처 표기
### 3.4 공정성과 균형
### 3.5 인권과 차별 표현
### 3.6 선정성 자제

## 부록: 자주 틀리는 표현 체크리스트
```

4. 각 섹션에는 반드시 수정 전/후 사례를 포함
5. 최종 파일 저장: 프로젝트 루트에 `신입기자_기사수정_가이드.md`

### Phase 5: 정리
1. 팀원들에게 종료 요청 (SendMessage)
2. `_workspace/` 디렉토리 보존 (조사 원자료로 사후 참고용)
3. 사용자에게 결과 요약 보고

## 데이터 흐름

```
[리더] → TeamCreate → [expression] ←SendMessage→ [accuracy]
                           │                          │
                      [structure] ←───SendMessage───→ │
                           │              │           │
                           ↓              ↓           ↓
                  expression_cases  structure_cases  accuracy_cases
                           │              │           │
                           └──────── Read ────────────┘
                                      ↓
                               [리더: 통합]
                                      ↓
                          신입기자_기사수정_가이드.md
```

## 에러 핸들링

| 상황 | 전략 |
|------|------|
| 팀원 1명 실패/중지 | 리더가 감지 → SendMessage로 상태 확인 → 재시작 또는 해당 영역을 리더가 직접 조사 |
| 팀원 과반 실패 | 사용자에게 알리고 진행 여부 확인 |
| 특정 영역 사례 부족 | 검색어를 변형하여 재조사 지시, 일반 원칙으로 보충 |
| 타임아웃 | 현재까지 수집된 부분 결과 사용 |
| 팀원 간 데이터 충돌 | 출처 명시 후 병기, 삭제하지 않음 |

## 테스트 시나리오

### 정상 흐름
1. 사용자가 "신입 기자를 위한 기사 수정 가이드를 만들어주세요" 요청
2. Phase 1에서 범위 파악 (표현/구조/정확성 3개 영역)
3. Phase 2에서 3명 팀원 + 3개 작업으로 팀 구성
4. Phase 3에서 팀원들이 병렬 웹 조사, 발견 공유
5. Phase 4에서 3개 산출물 통합하여 가이드 작성
6. Phase 5에서 팀 정리
7. 예상 결과: `신입기자_기사수정_가이드.md` 생성 (3개 장, 각 장에 5개 이상 수정 사례)

### 에러 흐름
1. Phase 3에서 accuracy 리서처가 에러로 중지
2. 리더가 유휴 알림 수신
3. SendMessage로 상태 확인 → 재시작 시도
4. 재시작 실패 시 리더가 직접 정확성/윤리 영역 간략 조사
5. 나머지 2개 영역 결과 + 리더의 보충 조사로 가이드 작성
6. 최종 가이드에 "정확성/윤리 영역은 추가 보완 필요" 표시
