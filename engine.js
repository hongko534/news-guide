// 기사 분석 엔진 — 신입기자 기사수정 가이드 기반
// 카테고리: spelling (맞춤법/표기), expression (표현/문체), structure (구조), ethics (정확성/윤리)

const rules = [
  // ============================================================
  // 1. 맞춤법/표기 (spelling)
  // ============================================================

  // 1-1. 자주 틀리는 맞춤법
  { pattern: /않된다/g, replacement: '안 된다', category: 'spelling', reason: "'안'은 부사('아니'의 줄임), '않'은 보조 용언('아니하'의 줄임)입니다.", severity: 'error' },
  { pattern: /않되/g, replacement: '안 되', category: 'spelling', reason: "'안'은 부사('아니'의 줄임), '않'은 보조 용언('아니하'의 줄임)입니다.", severity: 'error' },
  { pattern: /돼었/g, replacement: '되었', category: 'spelling', reason: "'돼'는 '되어'의 줄임말입니다. '되어었다'는 성립하지 않습니다.", severity: 'error' },
  { pattern: /들어나/g, replacement: '드러나', category: 'spelling', reason: "'드러나다'가 표준 표기입니다. '들어나다'는 존재하지 않는 단어입니다.", severity: 'error' },
  { pattern: /어떻해/g, replacement: '어떡해', category: 'spelling', reason: "'어떠하게 해'를 축약한 형태가 '어떡해'입니다.", severity: 'error' },
  { pattern: /웬지/g, replacement: '왠지', category: 'spelling', reason: "'왠지'는 '왜인지'의 준말입니다. '웬'은 '어찌 된'이라는 다른 뜻입니다.", severity: 'error' },
  { pattern: /촛점/g, replacement: '초점', category: 'spelling', reason: "사이시옷이 적용되지 않는 한자어 결합입니다.", severity: 'error' },
  { pattern: /알맞는/g, replacement: '알맞은', category: 'spelling', reason: "'알맞다'는 형용사이므로 관형사형은 '-은'입니다.", severity: 'error' },
  { pattern: /회계년도/g, replacement: '회계연도', category: 'spelling', reason: "표준어는 '연도'입니다. '년도'는 비표준입니다.", severity: 'error' },
  { pattern: /어의없/g, replacement: '어이없', category: 'spelling', reason: "'어이없다'가 표준어입니다. '어의(御醫)'는 다른 단어입니다.", severity: 'error' },
  { pattern: /모자른/g, replacement: '모자란', category: 'spelling', reason: "기본형이 '모자라다'이므로 '모자란'이 올바릅니다.", severity: 'error' },
  { pattern: /담배를 피다/g, replacement: '담배를 피우다', category: 'spelling', reason: "'피다'는 자동사, '피우다'는 타동사입니다. 목적어가 있으므로 '피우다'를 씁니다.", severity: 'error' },

  // 1-2. 외래어 표기
  { pattern: /컨텐츠/g, replacement: '콘텐츠', category: 'spelling', reason: "영어 'con-'은 '콘'으로 표기합니다 (국립국어원 외래어 표기법).", severity: 'error' },
  { pattern: /메세지/g, replacement: '메시지', category: 'spelling', reason: "영어 [sɪdʒ]는 '시'에 가깝습니다 (외래어 표기법).", severity: 'error' },
  { pattern: /악세사리/g, replacement: '액세서리', category: 'spelling', reason: "일본어식 발음 영향을 배제한 표준 표기입니다.", severity: 'error' },
  { pattern: /시물레이션/g, replacement: '시뮬레이션', category: 'spelling', reason: "영어 'si-mu-'는 '시뮬'이 표준입니다.", severity: 'error' },

  // 1-3. 띄어쓰기
  { pattern: /첫번째/g, replacement: '첫 번째', category: 'spelling', reason: "관형사 + 의존명사는 띄어 씁니다.", severity: 'error' },
  { pattern: /두번째/g, replacement: '두 번째', category: 'spelling', reason: "관형사 + 의존명사는 띄어 씁니다.", severity: 'error' },
  { pattern: /세번째/g, replacement: '세 번째', category: 'spelling', reason: "관형사 + 의존명사는 띄어 씁니다.", severity: 'error' },
  { pattern: /다음주/g, replacement: '다음 주', category: 'spelling', reason: "'다음'과 '주'는 별개의 단어입니다.", severity: 'error' },
  { pattern: /다음달/g, replacement: '다음 달', category: 'spelling', reason: "'다음'과 '달'은 별개의 단어입니다.", severity: 'error' },
  { pattern: /이틀만에/g, replacement: '이틀 만에', category: 'spelling', reason: "시간 경과의 의존명사 '만'은 띄어 씁니다.", severity: 'error' },
  { pattern: /(\d+일)만에/g, replacement: '$1 만에', category: 'spelling', reason: "시간 경과의 의존명사 '만'은 띄어 씁니다.", severity: 'error' },

  // 1-4. 유사어 혼동
  { pattern: /입맛이 땡/g, replacement: '입맛이 당', category: 'spelling', reason: "'당기다'가 표준어입니다. '땡기다'는 비표준입니다.", severity: 'error' },

  // ============================================================
  // 2. 표현/문체 (expression)
  // ============================================================

  // 2-1. 번역체 표현
  { pattern: /에 있어서?\b/g, replacement: '', category: 'expression', reason: "번역체 표현입니다. 삭제하거나 적절한 조사로 대체하세요. (영어 'in ~ing' / 일본어 '~において' 직역)", severity: 'warning', noAutoReplace: true },
  { pattern: /으?로부터 /g, replacement: '에게서 ', category: 'expression', reason: "'~로부터'는 영어 'from'의 직역입니다. '~에게서'가 자연스럽습니다.", severity: 'warning' },
  { pattern: /에 대하여/g, replacement: '을', category: 'expression', reason: "'~에 대하여'는 영어 'about'의 직역입니다. 조사로 대체하세요.", severity: 'warning', noAutoReplace: true },
  { pattern: /에 대한 /g, replacement: '', category: 'expression', reason: "'~에 대한'은 번역체입니다. 조사 '의' 또는 직접 연결로 대체하세요.", severity: 'warning', noAutoReplace: true },
  { pattern: /에 의해 /g, replacement: '', category: 'expression', reason: "'~에 의해'는 영어 수동태 직역입니다. 능동문으로 전환하세요.", severity: 'warning', noAutoReplace: true },
  { pattern: /의 경우[,\s]/g, replacement: '', category: 'expression', reason: "'~의 경우'는 영어 'in the case of' 직역입니다. '~은/는'으로 대체하세요.", severity: 'warning', noAutoReplace: true },

  // 2-2. 이중 피동
  { pattern: /잊혀지/g, replacement: '잊히', category: 'expression', reason: "이중 피동입니다. '잊다→잊히다'가 올바른 피동형입니다.", severity: 'error' },
  { pattern: /쓰여지/g, replacement: '쓰이', category: 'expression', reason: "이중 피동입니다. '쓰다→쓰이다'가 올바른 피동형입니다.", severity: 'error' },
  { pattern: /작성되어지/g, replacement: '작성되', category: 'expression', reason: "이중 피동입니다. '-되다'에 '-어지다'가 중복되었습니다.", severity: 'error' },
  { pattern: /불리우/g, replacement: '불리', category: 'expression', reason: "이중 피동입니다. '부르다→불리다'가 올바른 형태입니다.", severity: 'error' },
  { pattern: /만들어지/g, replacement: '만들', category: 'expression', reason: "이중 피동입니다. 능동문으로 전환하는 것을 권장합니다.", severity: 'info', noAutoReplace: true },

  // 2-3. 불필요한 사동 '-시키다'
  { pattern: /입금시키/g, replacement: '입금하', category: 'expression', reason: "과도한 사동 표현입니다. '-하다'로 충분합니다.", severity: 'warning' },
  { pattern: /활성화시키/g, replacement: '활성화하', category: 'expression', reason: "과도한 사동 표현입니다. '-하다'로 충분합니다.", severity: 'warning' },
  { pattern: /소개시켜/g, replacement: '소개해', category: 'expression', reason: "과도한 사동 표현입니다. '-하다'로 충분합니다.", severity: 'warning' },
  { pattern: /감소시키/g, replacement: '줄이', category: 'expression', reason: "과도한 사동 표현입니다. '줄이다'가 자연스럽습니다.", severity: 'warning' },
  { pattern: /증가시키/g, replacement: '늘리', category: 'expression', reason: "과도한 사동 표현입니다. '늘리다'가 자연스럽습니다.", severity: 'warning' },
  { pattern: /변화시키/g, replacement: '바꾸', category: 'expression', reason: "과도한 사동 표현입니다. '바꾸다'가 자연스럽습니다.", severity: 'warning' },

  // 2-4. 중복 표현
  { pattern: /과반수 이상/g, replacement: '과반수', category: 'expression', reason: "'과반수'가 이미 '절반을 넘는 수'를 뜻하므로 '이상'은 중복입니다.", severity: 'warning' },
  { pattern: /옥상 위에서/g, replacement: '옥상에서', category: 'expression', reason: "'옥상'이 이미 건물 꼭대기를 뜻하므로 '위에서'는 중복입니다.", severity: 'warning' },
  { pattern: /처음 첫/g, replacement: '첫', category: 'expression', reason: "'처음'과 '첫'은 같은 의미이므로 중복입니다.", severity: 'warning' },
  { pattern: /역전앞/g, replacement: '역 앞', category: 'expression', reason: "'역전(驛前)'이 이미 '역 앞'의 뜻이므로 중복입니다.", severity: 'warning' },
  { pattern: /거의 대부분/g, replacement: '대부분', category: 'expression', reason: "'거의'와 '대부분'은 의미가 중복됩니다.", severity: 'warning' },
  { pattern: /모든 사람들/g, replacement: '모든 사람', category: 'expression', reason: "'모든'이 이미 복수를 나타내므로 '들'은 불필요합니다.", severity: 'warning' },

  // 2-5. 진행형 남용 (간단한 패턴)
  { pattern: /하고 있는 중이/g, replacement: '하고 있', category: 'expression', reason: "'~하고 있는 중'은 이중 진행 표현입니다.", severity: 'warning' },

  // ============================================================
  // 3. 정확성/윤리 (ethics)
  // ============================================================

  // 3-1. 차별 표현 — 성차별
  { pattern: /여류 /g, replacement: '', category: 'ethics', reason: "'여류'는 남성형을 기본으로 여성형을 파생시킨 성차별 표현입니다. 성별 구분 없이 직함만 쓰세요.", severity: 'error', noAutoReplace: true },
  { pattern: /여기자/g, replacement: '기자', category: 'ethics', reason: "'여기자'는 '기자는 남자'라는 전제를 내포한 성차별 표현입니다.", severity: 'warning' },
  { pattern: /미망인/g, replacement: '배우자', category: 'ethics', reason: "'미망인(未亡人)'은 '아직 죽지 못한 사람'이라는 뜻으로 차별적 표현입니다.", severity: 'error' },

  // 3-2. 차별 표현 — 장애인
  { pattern: /장애우/g, replacement: '장애인', category: 'ethics', reason: "'장애우'는 비장애인 입장에서 타자화하는 동정적 표현입니다.", severity: 'error' },
  { pattern: /정신지체/g, replacement: '지적장애', category: 'ethics', reason: "2008년 법 개정으로 '지적장애'로 용어가 변경되었습니다.", severity: 'error' },
  { pattern: /눈먼 돈/g, replacement: '주인 없는 돈', category: 'ethics', reason: "시각장애를 비하하는 표현입니다.", severity: 'error' },
  { pattern: /절름발이/g, replacement: '불완전한', category: 'ethics', reason: "지체장애를 비하하는 표현입니다.", severity: 'error' },
  { pattern: /장애를 앓/g, replacement: '장애가 있', category: 'ethics', reason: "장애는 질병이 아닙니다. '앓다' 대신 '있다'를 사용하세요.", severity: 'error' },
  { pattern: /결정 장애/g, replacement: '우유부단', category: 'ethics', reason: "장애를 부정적 비유로 사용하는 표현입니다.", severity: 'warning' },

  // 3-3. 차별 표현 — 이주민/지역
  { pattern: /불법체류자/g, replacement: '미등록 이주민', category: 'ethics', reason: "'불법'이 인간 자체를 규정하는 차별적 표현입니다.", severity: 'error' },

  // 3-4. 선정적/과장 표현
  { pattern: /충격[!！\s,]/g, replacement: '', category: 'ethics', reason: "'충격'은 근거 없는 감정적·선정적 표현입니다. 구체적 사실로 대체하세요.", severity: 'warning', noAutoReplace: true },
  { pattern: /역대급/g, replacement: '', category: 'ethics', reason: "'역대급'은 과장 표현입니다. 구체적 수치로 대체하세요.", severity: 'warning', noAutoReplace: true },
  { pattern: /경악/g, replacement: '', category: 'ethics', reason: "'경악'은 선정적 표현입니다. 객관적 서술로 대체하세요.", severity: 'warning', noAutoReplace: true },

  // 3-5. 모호한 출처
  { pattern: /업계에서는/g, replacement: '', category: 'ethics', reason: "모호한 출처입니다. 구체적 인물명, 직책, 소속을 밝히세요.", severity: 'info', noAutoReplace: true },
  { pattern: /전문가들은/g, replacement: '', category: 'ethics', reason: "모호한 출처입니다. 구체적 전문가의 이름과 소속을 밝히세요.", severity: 'info', noAutoReplace: true },
  { pattern: /관계자에 따르면/g, replacement: '', category: 'ethics', reason: "모호한 출처입니다. 구체적 인물명과 직책을 밝히세요.", severity: 'info', noAutoReplace: true },
];


// ============================================================
// 구조 분석 함수들 (structure)
// ============================================================

function checkStructure(text) {
  const corrections = [];
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  // 첫 문장(리드) 길이 체크
  if (paragraphs.length > 0) {
    const firstParagraph = paragraphs[0].trim();
    const firstSentenceMatch = firstParagraph.match(/^[^.!?。]*[.!?。]/);
    const firstSentence = firstSentenceMatch ? firstSentenceMatch[0] : firstParagraph;
    const cleanSentence = firstSentence.replace(/\s+/g, '');

    if (cleanSentence.length > 60) {
      corrections.push({
        category: 'structure',
        original: firstSentence.substring(0, 50) + '...',
        suggested: '리드를 60자 이내로 줄이세요',
        reason: `리드(첫 문장)가 ${cleanSentence.length}자입니다. 60자 이내가 적정합니다. 핵심만 전달하고 세부 사항은 본문에서 서술하세요.`,
        startIndex: 0,
        endIndex: firstSentence.length,
        severity: 'warning'
      });
    }

    // 질문형 리드 감지
    if (/[?？]/.test(firstSentence) || /나요|습니까|입니까|을까요|ㄹ까요|는가\?/.test(firstSentence)) {
      corrections.push({
        category: 'structure',
        original: firstSentence.substring(0, 50) + (firstSentence.length > 50 ? '...' : ''),
        suggested: '질문형 대신 사실을 직접 전달하는 리드로 바꾸세요',
        reason: '독자는 뉴스를 읽으러 왔지 퀴즈를 풀러 온 것이 아닙니다. 질문형 리드는 지양합니다.',
        startIndex: 0,
        endIndex: firstSentence.length,
        severity: 'warning'
      });
    }
  }

  // 단락 길이 체크 (5문장 초과)
  paragraphs.forEach((para, idx) => {
    const sentences = para.split(/[.!?。]\s*/).filter(s => s.trim().length > 0);
    if (sentences.length > 5) {
      const paraStart = text.indexOf(para);
      corrections.push({
        category: 'structure',
        original: para.substring(0, 50) + '...',
        suggested: '단락을 2~3문장 단위로 나누세요',
        reason: `이 단락이 ${sentences.length}문장으로 너무 깁니다. 신문 기사의 단락은 2~3문장이 적정합니다.`,
        startIndex: paraStart >= 0 ? paraStart : 0,
        endIndex: paraStart >= 0 ? paraStart + para.length : para.length,
        severity: 'warning'
      });
    }
  });

  // '~에 따르면' 호응 체크
  const sentences = text.split(/(?<=[.!?。])\s+/);
  sentences.forEach(sentence => {
    if (/에 따르면/.test(sentence)) {
      if (!/다고\s*(한다|밝혔다|전했다|말했다|설명했다|보도했다|발표했다|알려졌다|전해졌다)/.test(sentence) &&
          !/라고\s*(한다|밝혔다|전했다|말했다|설명했다|보도했다|발표했다)/.test(sentence)) {
        const sIdx = text.indexOf(sentence);
        corrections.push({
          category: 'structure',
          original: sentence.substring(0, 50) + (sentence.length > 50 ? '...' : ''),
          suggested: "문장 끝을 '~다고 한다/밝혔다' 형태로 호응시키세요",
          reason: "'~에 따르면'으로 시작한 문장은 '~다고 한다/밝혔다'로 끝나야 호응이 맞습니다.",
          startIndex: sIdx >= 0 ? sIdx : 0,
          endIndex: sIdx >= 0 ? sIdx + sentence.length : sentence.length,
          severity: 'warning'
        });
      }
    }
  });

  return corrections;
}


// ============================================================
// 메인 분석 함수
// ============================================================

function analyzeArticle(text) {
  if (!text || text.trim().length === 0) {
    return {
      corrections: [],
      stats: { totalIssues: 0, byCategory: { spelling: 0, expression: 0, structure: 0, ethics: 0 }, score: 100 }
    };
  }

  const corrections = [];

  // 규칙 기반 매칭
  rules.forEach(rule => {
    // 매번 lastIndex를 리셋하기 위해 새 정규식 생성
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      const original = match[0];
      let suggested;
      if (rule.noAutoReplace) {
        suggested = '(수정 필요) ' + (rule.replacement || '삭제 또는 대체 권장');
      } else {
        suggested = original.replace(new RegExp(rule.pattern.source, ''), rule.replacement);
      }

      corrections.push({
        category: rule.category,
        original: original,
        suggested: suggested,
        reason: rule.reason,
        startIndex: match.index,
        endIndex: match.index + original.length,
        severity: rule.severity
      });
    }
  });

  // 구조 분석
  const structureCorrections = checkStructure(text);
  corrections.push(...structureCorrections);

  // 위치 기준 정렬
  corrections.sort((a, b) => a.startIndex - b.startIndex);

  // 통계 계산
  const byCategory = { spelling: 0, expression: 0, structure: 0, ethics: 0 };
  corrections.forEach(c => {
    if (byCategory[c.category] !== undefined) {
      byCategory[c.category]++;
    }
  });

  const totalIssues = corrections.length;

  // 점수 계산: 100점에서 감점
  // error: -5점, warning: -3점, info: -1점
  let deductions = 0;
  corrections.forEach(c => {
    if (c.severity === 'error') deductions += 5;
    else if (c.severity === 'warning') deductions += 3;
    else deductions += 1;
  });
  const score = Math.max(0, 100 - deductions);

  return {
    corrections,
    stats: {
      totalIssues,
      byCategory,
      score
    }
  };
}
