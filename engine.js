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
  { pattern: /그럴려고/g, replacement: "그러려고", category: "spelling", reason: "'엉뚱한 ㄹ 첨가'는 잘못. '그러려고'가 올바른 표기.", severity: "error" }, // [harness]
  { pattern: /그림예요/g, replacement: "그림이에요", category: "spelling", reason: "받침이 있는 체언 뒤에서는 '이에요'를 원형대로 쓴다.", severity: "error" }, // [harness]
  { pattern: /깨끗하는/g, replacement: "깨끗한", category: "spelling", reason: "'깨끗하다'는 형용사이므로 관형사형은 '-(으)ㄴ'.", severity: "error" }, // [harness]
  { pattern: /머무려면/g, replacement: "머물려면", category: "spelling", reason: "'머물-'의 받침 'ㄹ'이 유지되어 '머물려면(머무르려면)'이 옳다.", severity: "error" }, // [harness]
  { pattern: /서비스률/g, replacement: "서비스율", category: "spelling", reason: "두음법칙 예외(율) 규정은 외래어에도 적용된다.", severity: "error" }, // [harness]
  { pattern: /있는거야/g, replacement: "있는 거야", category: "spelling", reason: "의존명사 '거(것)'은 앞말과 띄어 쓴다.", severity: "error" }, // [harness]
  { pattern: /자연스런/g, replacement: "자연스러운", category: "spelling", reason: "ㅂ 불규칙 용언은 모음 어미 앞에서 'ㅂ'이 '우'로 바뀐다. '자연스럽+은 → 자연스러운'.", severity: "error" }, // [harness]
  { pattern: /잡을려면/g, replacement: "잡으려면", category: "spelling", reason: "'엉뚱한 ㄹ 첨가' 오류. '잡으려면'이 옳다.", severity: "error" }, // [harness]
  { pattern: /친구에요/g, replacement: "친구예요", category: "spelling", reason: "모음으로 끝나는 체언 뒤에는 '이에요 → 예요'로 축약.", severity: "error" }, // [harness]
  { pattern: /풀릴거야/g, replacement: "풀릴 거야", category: "spelling", reason: "의존명사 '거(것)'은 앞말과 띄어 쓴다. 'ㄹ 거야'는 전망·추측·믿음 표현.", severity: "error" }, // [harness]
  { pattern: /거에요/g, replacement: "거예요", category: "spelling", reason: "'것이에요 > 거이에요 > 거예요'. 모음 뒤 '이에요 → 예요'.", severity: "error" }, // [harness]
  { pattern: /것예요/g, replacement: "거예요", category: "spelling", reason: "'것' 뒤는 '것예요'로 쓰지 않고 '거예요'로 쓴다.", severity: "error" }, // [harness]
  { pattern: /미려면/g, replacement: "밀려면", category: "spelling", reason: "어간 '밀-'의 'ㄹ' 탈락 금지. '밀려면'이 옳다.", severity: "error" }, // [harness]
  { pattern: /줄려면/g, replacement: "주려면", category: "spelling", reason: "'엉뚱한 ㄹ 첨가' 오류. '주려면'이 옳다.", severity: "error" }, // [harness]
  { pattern: /참가률/g, replacement: "참가율", category: "spelling", reason: "모음이나 'ㄴ' 받침 뒤의 한자음 '률'은 '율'로 적는다. 참가율·회전율·운율.", severity: "error" }, // [harness]
  { pattern: /책니까/g, replacement: "책이니까", category: "spelling", reason: "받침 있는 체언 뒤에서는 서술격조사 '이'를 생략할 수 없다.", severity: "error" }, // [harness]
  { pattern: /할려면/g, replacement: "하려면", category: "spelling", reason: "'엉뚱한 ㄹ 첨가' 오류. '하려면'이 옳다.", severity: "error" }, // [harness]
  { pattern: /회전률/g, replacement: "회전율", category: "spelling", reason: "모음 받침 뒤의 '률'은 '율'로 적는다.", severity: "error" }, // [harness]
  { pattern: /나렬/g, replacement: "나열", category: "spelling", reason: "모음 받침 뒤의 '렬'은 '열'로 적는다. 나열·분열·진열.", severity: "error" }, // [harness]
  { pattern: /되서/g, replacement: "돼서", category: "spelling", reason: "'되+어서'의 준말은 '돼서'.", severity: "error" }, // [harness]
  { pattern: /분렬/g, replacement: "분열", category: "spelling", reason: "'ㄴ' 받침 뒤의 '렬'은 '열'로 적는다.", severity: "error" }, // [harness]
  { pattern: /운률/g, replacement: "운율", category: "spelling", reason: "'ㄴ' 받침 뒤의 '률'은 '율'로 적는다.", severity: "error" }, // [harness]
  { pattern: /진렬/g, replacement: "진열", category: "spelling", reason: "'ㄴ' 받침 뒤의 '렬'은 '열'로 적는다.", severity: "error" }, // [harness]
  { pattern: /(?<![A-Za-z])([A-Z])씨/g, replacement: '$1 씨', category: 'spelling', reason: '익명 등장인물을 나타내는 알파벳(예: A씨)과 호칭어 "씨"는 띄어 써야 합니다. 한글맞춤법: 성·호에 덧붙는 호칭어는 띄어 쓴다.', severity: 'error' }, // [harness]
  { pattern: /(?<![가-힣])(박|이|김|최|정|조|강|윤|장|임|한|오|서|신|권|황|안|송|전|홍|유|고|문|손|양|배|백|허|남|심|노|하|곽|성|차|주|우|구|나)씨(는|가|를|의|와|도|에|에게|로부터)/g, replacement: '$1 씨$2', category: 'spelling', reason: '한 글자 성씨 뒤의 호칭어 "씨"는 띄어 써야 합니다. 한글맞춤법: 성·호에 덧붙는 호칭어는 띄어 쓴다.', severity: 'error' }, // [harness]
  { pattern: /사진설명/g, replacement: '사진 설명', category: 'spelling', reason: '표준국어대사전·우리말샘에서 합성어로 인정하지 않는 표현입니다. 띄어 써야 합니다.', severity: 'error' }, // [harness]
  { pattern: /기념촬영/g, replacement: '기념 촬영', category: 'spelling', reason: '표준국어대사전·우리말샘에서 합성어로 인정하지 않는 표현입니다. 띄어 써야 합니다.', severity: 'error' }, // [harness]
  { pattern: /현지시(각|간)/g, replacement: '현지 시각', category: 'spelling', reason: '"현지 시각"은 띄어 써야 하며, "시간"은 구간(선), "시각"은 점을 뜻하므로 특정 시점을 가리킬 때는 "시각"이 바른 표현입니다.', severity: 'error' }, // [harness]
  { pattern: /한국시(각|간)/g, replacement: '한국 시각', category: 'spelling', reason: '"한국 시각"은 띄어 써야 하며, 특정 시점을 가리킬 때는 "시간" 대신 "시각"이 바른 표현입니다.', severity: 'error' }, // [harness]
  { pattern: /사이버\s*렉카/g, replacement: '사이버 레커', category: 'spelling', reason: '외래어 표기법에 따라 "사이버 레커"가 바른 표기입니다(견인차 wrecker). 중앙일보 등 주요 매체의 외래어 심의 결과를 따릅니다.', severity: 'error' }, // [harness]

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
  { pattern: /기술적 조치를 취하지 않으면/g, replacement: "기술적으로 조치하지 않으면", category: "expression", reason: "명사형 직역투. 부사형+동사로.", severity: "warning" }, // [harness]
  { pattern: /깊이 있는 공부를 하기 위해/g, replacement: "깊이 있게 공부하려고", category: "expression", reason: "명사형 직역투. 부사형+동사로 간결히.", severity: "warning" }, // [harness]
  { pattern: /별다른 반응을 보이지 않고/g, replacement: "별달리 반응하지 않고", category: "expression", reason: "명사형 직역투. 부사형+동사로.", severity: "warning" }, // [harness]
  { pattern: /광범위한 조사를 진행했다/g, replacement: "광범위하게 조사했다", category: "expression", reason: "명사형+'하다' 직역투. 부사형+동사로 바꾼다.", severity: "warning" }, // [harness]
  { pattern: /예상 밖의 압승을 거뒀다/g, replacement: "예상 밖으로 압승했다", category: "expression", reason: "명사형 직역투. 동사로 직접 표현.", severity: "warning" }, // [harness]
  { pattern: /과학적인 분석을 했는데/g, replacement: "과학적으로 분석했는데", category: "expression", reason: "'분석을 하다'형 직역투. 부사형+동사로.", severity: "warning" }, // [harness]
  { pattern: /급증한 것으로 알려졌다/g, replacement: "급증했다고 알려졌다", category: "expression", reason: "'것으로' 남용. 인용은 '-다고'로 간결히.", severity: "warning" }, // [harness]
  { pattern: /기자는 기사로서 말한다/g, replacement: "기자는 기사로써 말한다", category: "expression", reason: "'로서'는 자격·신분, '로써'는 수단·도구·재료. 기사는 수단이므로 '로써'.", severity: "warning" }, // [harness]
  { pattern: /듣는 데 어려움이 있다/g, replacement: "듣기가 어렵다", category: "expression", reason: "명사화된 직역투. 서술어로 간결히.", severity: "warning" }, // [harness]
  { pattern: /범인인 것으로 드러났다/g, replacement: "범인으로 드러났다", category: "expression", reason: "'것으로' 남용.", severity: "warning" }, // [harness]
  { pattern: /기존에 20세 이상만/g, replacement: "이전에 20세 이상만", category: "expression", reason: "'기존'은 시간 부사로 부적합. '이전·종래'로.", severity: "warning" }, // [harness]
  { pattern: /내릴지 모르기 때문에/g, replacement: "내릴지 몰라(서)", category: "expression", reason: "'-기 때문에'는 연결어미 '-아(어)서'로 간결히.", severity: "warning" }, // [harness]
  { pattern: /약 한 달 남짓 뒤에/g, replacement: "한 달 남짓 뒤에", category: "expression", reason: "'약'과 '남짓'이 모두 대략을 뜻해 겹말.", severity: "warning" }, // [harness]
  { pattern: /일본에게 연패를 당한/g, replacement: "일본에 연패를 당한", category: "expression", reason: "무정물(국가·기관)에는 조사 '에'를 쓴다. '에게'는 유정물(사람·동물)에만.", severity: "warning" }, // [harness]
  { pattern: /좋은 것으로 유명하다/g, replacement: "좋기로 유명하다", category: "expression", reason: "'것으로' 남용. '-기로'로 간결히.", severity: "warning" }, // [harness]
  { pattern: /감독에 책임을 물어/g, replacement: "감독에게 책임을 물어", category: "expression", reason: "유정물(사람)에는 조사 '에게'를 쓴다.", severity: "warning" }, // [harness]
  { pattern: /같은 기간과 대비해/g, replacement: "같은 기간보다", category: "expression", reason: "'-와 대비해'는 조사 '보다'로 간결하게 바꿀 수 있다.", severity: "warning" }, // [harness]
  { pattern: /결정을 뒤집기 위한/g, replacement: "결정을 뒤집을", category: "expression", reason: "'~기 위한'의 남용. 관형사형으로 간결히.", severity: "warning" }, // [harness]
  { pattern: /고전을 면치 못하다/g, replacement: "고전하다", category: "expression", reason: "판에 박힌 상투어. 동사로 간결히.", severity: "warning" }, // [harness]
  { pattern: /기존 밤 12시에서/g, replacement: "종전 밤 12시에서", category: "expression", reason: "'기존(旣存)'은 상태. 시간적 앞뒤를 나타낼 때는 '종전(從前)'.", severity: "warning" }, // [harness]
  { pattern: /만약 이길 경우에는/g, replacement: "이기면", category: "expression", reason: "'만약 ~할 경우에는'은 연결어미 '-면'으로 간결히. '만약'도 불필요.", severity: "warning" }, // [harness]
  { pattern: /즐거운 주말 되세요/g, replacement: "주말 즐겁게 보내세요", category: "expression", reason: "'have a nice weekend' 직역투. '주말이 되다'는 비문.", severity: "error" }, // [harness]
  { pattern: /친구가 전화가 왔어/g, replacement: "친구한테 전화가 왔어", category: "expression", reason: "주어·서술어 호응 오류. 주체는 '전화'이므로 '친구한테'가 와야 한다.", severity: "warning" }, // [harness]
  { pattern: /큰 비중을 차지하다/g, replacement: "비중이 크다", category: "expression", reason: "판에 박힌 상투어. 서술어로 간결히.", severity: "warning" }, // [harness]
  { pattern: /100여 건 이상/g, replacement: "100여 건", category: "expression", reason: "'여'와 '이상'이 모두 '그보다 더 많음'을 뜻해 겹말.", severity: "warning" }, // [harness]
  { pattern: /2배 이상 줄어들/g, replacement: "절반 이하로 줄어들", category: "expression", reason: "'배'는 증가 수치. 감소에는 '분의 몇' 또는 '이하'로 표현.", severity: "warning" }, // [harness]
  { pattern: /언덕 위에 오르다/g, replacement: "언덕에 오르다", category: "expression", reason: "'오르다'에 이미 '위'의 방향성이 담겨 있어 겹말.", severity: "warning" }, // [harness]
  { pattern: /전화 협의를 갖다/g, replacement: "전화로 협의하다", category: "expression", reason: "'have a talk'식 직역투. 동사로 직접 표현.", severity: "warning" }, // [harness]
  { pattern: /20억원의 예산/g, replacement: "예산 20억원", category: "expression", reason: "'수량+의+명사' 어순을 뒤집어 '명사 수량' 어순으로.", severity: "warning" }, // [harness]
  { pattern: /나의 살던 고향/g, replacement: "내가 살던 고향", category: "expression", reason: "일본식 '의' 남용. 주격 '내가'로 바꾼다.", severity: "warning" }, // [harness]
  { pattern: /노력을 기울이다/g, replacement: "노력하다", category: "expression", reason: "판에 박힌 상투어. 동사로 간결히.", severity: "warning" }, // [harness]
  { pattern: /다섯 명의 사람/g, replacement: "다섯 사람", category: "expression", reason: "'수량명사+의'는 일본식·영어식 표현.", severity: "warning" }, // [harness]
  { pattern: /실패로 돌아가다/g, replacement: "실패하다", category: "expression", reason: "판에 박힌 상투어. 동사로 간결히.", severity: "warning" }, // [harness]
  { pattern: /우려를 나타내다/g, replacement: "우려하다", category: "expression", reason: "판에 박힌 상투어. 동사로 간결히.", severity: "warning" }, // [harness]
  { pattern: /우리말이지 않다/g, replacement: "우리말이 아니다", category: "expression", reason: "체언의 부정은 '-이 아니다'.", severity: "warning" }, // [harness]
  { pattern: /진심이지 않은가/g, replacement: "진심이 아닌가", category: "expression", reason: "체언의 부정은 '-이 아니다'로, '-지 않다'는 용언 부정에만 쓴다.", severity: "warning" }, // [harness]
  { pattern: /책을 사기 위해/g, replacement: "책을 사려고", category: "expression", reason: "'~기 위해'의 남용. 어미 '-려고'로 간결히.", severity: "warning" }, // [harness]
  { pattern: /4대의 자동차/g, replacement: "자동차 4대", category: "expression", reason: "'수량+의+명사' 어순 오류. '자동차 4대'로.", severity: "warning" }, // [harness]
  { pattern: /기술을 활용해/g, replacement: "기술로", category: "expression", reason: "'-을 활용해'는 조사 '로'로 간결하게 바꿀 수 있다.", severity: "warning" }, // [harness]
  { pattern: /다시 돌아오다/g, replacement: "돌아오다", category: "expression", reason: "'돌아오다'에 이미 '다시'의 뜻이 들어 있어 겹말.", severity: "warning" }, // [harness]
  { pattern: /매년 여름마다/g, replacement: "해마다 여름에", category: "expression", reason: "'매년'과 '마다'가 모두 반복을 나타내는 겹말.", severity: "warning" }, // [harness]
  { pattern: /분노의 여성들/g, replacement: "분노한 여성들", category: "expression", reason: "'의'의 남용. 관형사형 어미로 자연스럽게.", severity: "warning" }, // [harness]
  { pattern: /성공을 거두다/g, replacement: "성공하다", category: "expression", reason: "판에 박힌 상투어. 동사로 간결히.", severity: "warning" }, // [harness]
  { pattern: /세 명의 학생/g, replacement: "세 학생", category: "expression", reason: "'수량명사+의'는 일본식·영어식 표현. '세 학생' 또는 '학생 세 명'.", severity: "warning" }, // [harness]
  { pattern: /악수를 나누다/g, replacement: "악수하다", category: "expression", reason: "판에 박힌 상투어. 동사로 간결히.", severity: "warning" }, // [harness]
  { pattern: /전망을 내놓다/g, replacement: "전망하다", category: "expression", reason: "판에 박힌 상투어. 동사로 간결히.", severity: "warning" }, // [harness]
  { pattern: /침묵을 지키다/g, replacement: "침묵하다", category: "expression", reason: "판에 박힌 상투어. 동사로 간결히.", severity: "warning" }, // [harness]
  { pattern: /휴식을 취하다/g, replacement: "쉬다", category: "expression", reason: "판에 박힌 상투어. 우리말 동사로.", severity: "warning" }, // [harness]
  { pattern: /과반에 육박/g, replacement: "절반에 육박", category: "expression", reason: "'과반'은 '반을 넘김'이므로 '육박'과 함께 쓰면 모순·겹말.", severity: "warning" }, // [harness]
  { pattern: /과반을 넘다/g, replacement: "절반을 넘다", category: "expression", reason: "'과반(過半)'에 이미 '넘다'의 뜻이 있어 겹말.", severity: "warning" }, // [harness]
  { pattern: /눈으로 목격/g, replacement: "목격", category: "expression", reason: "'목격(目擊)'의 '목'이 '눈'을 뜻하므로 '눈으로'는 겹말.", severity: "warning" }, // [harness]
  { pattern: /두 개 업체/g, replacement: "두 업체", category: "expression", reason: "단위명사 '개'는 불필요. '두 업체/업체 두 곳'.", severity: "warning" }, // [harness]
  { pattern: /몇 배 줄다/g, replacement: "몇 분의 몇으로 줄다", category: "expression", reason: "'배'는 증가에만 쓴다. 감소에는 '분의'를 써야 한다.", severity: "warning" }, // [harness]
  { pattern: /사전에 보면/g, replacement: "사전을 보면", category: "expression", reason: "서술어 '보면'에 호응하는 조사는 '을/를'이어야 한다.", severity: "warning" }, // [harness]
  { pattern: /선거의 방식/g, replacement: "선거 방식", category: "expression", reason: "불필요한 관형격조사 '의' 생략.", severity: "warning" }, // [harness]
  { pattern: /실내 체육관/g, replacement: "체육관", category: "expression", reason: "'체육관(館)'의 '관'이 이미 실내를 뜻하므로 '실내'는 겹말.", severity: "warning" }, // [harness]
  { pattern: /이들 3명을/g, replacement: "이 세 사람을", category: "expression", reason: "'이들'이 이미 복수이고 '3명'과 겹친다. '이 세 사람을'로.", severity: "warning" }, // [harness]
  { pattern: /젊은 세대들/g, replacement: "젊은 세대", category: "expression", reason: "'세대'가 이미 복수 의미. '들' 남용.", severity: "warning" }, // [harness]
  { pattern: /내용적으로/g, replacement: "내용이", category: "expression", reason: "'-적으로'의 남용.", severity: "warning" }, // [harness]
  { pattern: /도착되었다/g, replacement: "도착하였다", category: "expression", reason: "'도착하다'는 자동사이므로 '도착되다'는 불필요한 피동.", severity: "warning" }, // [harness]
  { pattern: /무력화되면/g, replacement: "무력해지면", category: "expression", reason: "'-화되다'는 불필요. '무력해지다'로 충분.", severity: "warning" }, // [harness]
  { pattern: /미리 예견/g, replacement: "예견", category: "expression", reason: "'예견(豫見)'의 '예'가 '미리'를 뜻하므로 '미리'는 겹말.", severity: "warning" }, // [harness]
  { pattern: /사전 예약/g, replacement: "예약", category: "expression", reason: "'예약(豫約)'의 '예'가 이미 '미리'를 뜻하므로 '사전'은 겹말.", severity: "warning" }, // [harness]
  { pattern: /서로 상생/g, replacement: "상생", category: "expression", reason: "'상생(相生)'의 '상'이 '서로'를 뜻하므로 '서로'는 겹말.", severity: "warning" }, // [harness]
  { pattern: /세분화해서/g, replacement: "세분해서", category: "expression", reason: "'세분'만으로 뜻이 통하므로 불필요한 '-화'.", severity: "warning" }, // [harness]
  { pattern: /수십여 건/g, replacement: "수십 건", category: "expression", reason: "'수십'과 '여'가 모두 개략 수량을 뜻해 겹말.", severity: "warning" }, // [harness]
  { pattern: /시기적으로/g, replacement: "시기상", category: "expression", reason: "'-적으로'의 남용. '시기상'·'시기가'로 고쳐 쓴다.", severity: "warning" }, // [harness]
  { pattern: /아는 지인/g, replacement: "지인", category: "expression", reason: "'지인(知人)'의 '지'가 '아는'을 뜻하므로 '아는'은 겹말.", severity: "warning" }, // [harness]
  { pattern: /젊은 층들/g, replacement: "젊은 층", category: "expression", reason: "'층'이 이미 복수 의미를 가지므로 '들' 남용.", severity: "warning" }, // [harness]
  { pattern: /주도적으로/g, replacement: "주도해서", category: "expression", reason: "'-적으로'의 남용. 원 동사로 풀어 쓴다.", severity: "warning" }, // [harness]
  { pattern: /진위 여부/g, replacement: "진위", category: "expression", reason: "'진위(眞僞)'가 이미 '참과 거짓의 여부'를 뜻하므로 '여부'는 겹말.", severity: "warning" }, // [harness]
  { pattern: /최소 이상/g, replacement: "최소", category: "expression", reason: "'최소'와 '이상'은 의미가 중복되는 겹말.", severity: "warning" }, // [harness]
  { pattern: /가속화할/g, replacement: "가속할", category: "expression", reason: "'가속'만으로 뜻이 통하므로 불필요한 '-화'.", severity: "warning" }, // [harness]
  { pattern: /고목나무/g, replacement: "고목", category: "expression", reason: "'고목(古木)'에 '나무'를 덧붙이는 것은 겹말.", severity: "warning" }, // [harness]
  { pattern: /시위대들/g, replacement: "시위대", category: "expression", reason: "'대'가 집단을 뜻하므로 '들' 남용.", severity: "warning" }, // [harness]
  { pattern: /여러분들/g, replacement: "여러분", category: "expression", reason: "'여러분'이 이미 복수이므로 '들' 남용.", severity: "warning" }, // [harness]
  { pattern: /취재진들/g, replacement: "취재진", category: "expression", reason: "'진'이 집단을 뜻하므로 '들' 남용.", severity: "warning" }, // [harness]
  { pattern: /가급적/g, replacement: "되도록", category: "expression", reason: "'-적'의 남용. '되도록'으로 풀어 쓴다.", severity: "warning" }, // [harness]
  { pattern: /발명된/g, replacement: "발명한", category: "expression", reason: "'~에 의해서 발명된'은 영어 수동태의 직역. 능동으로 바꾼다.", severity: "warning" }, // [harness]
  { pattern: /생신일/g, replacement: "생신", category: "expression", reason: "'생신'에 '일'을 덧붙이는 것은 겹말.", severity: "warning" }, // [harness]
  { pattern: /우리들/g, replacement: "우리", category: "expression", reason: "'우리'가 이미 복수이므로 '들' 남용.", severity: "warning" }, // [harness]
  { pattern: /전단지/g, replacement: "전단", category: "expression", reason: "'전단(傳單)'에 '지(紙)'를 더한 '전단지'는 겹말.", severity: "warning" }, // [harness]
  { pattern: /초가집/g, replacement: "초가", category: "expression", reason: "'초가(草家)'에 '집'을 덧붙이는 것은 겹말.", severity: "warning" }, // [harness]
  { pattern: /탄신일/g, replacement: "탄신", category: "expression", reason: "'탄신(誕辰)'에 '일'을 덧붙인 '탄신일'은 겹말.", severity: "warning" }, // [harness]
  { pattern: /학부형/g, replacement: "학부모", category: "expression", reason: "'학부형(學父兄)'은 남성 중심 표현. 성 중립적 '학부모'를 쓴다.", severity: "warning" }, // [harness]
  { pattern: /피해를\s*입은/g, replacement: '피해를 본', category: 'expression', reason: '"피해(被害)" 자체가 이미 "해를 입음"을 뜻하므로 "피해를 입다"는 의미 중복입니다. "피해를 보다/받다"로 쓰는 것이 바릅니다. [한국언론연구원 신문기사의 문체]', severity: 'warning' }, // [harness]
  { pattern: /보이고\s*있다/g, replacement: '보인다', category: 'expression', reason: '과도한 진행형 표현입니다. 상태·성질을 나타낼 때는 "보이다"로 충분하며 굳이 "-고 있다"를 덧붙일 필요가 없습니다.', severity: 'warning', noAutoReplace: true }, // [harness]

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

  // ============================================================
  // 4. 법원 맞춤법 자료집 (제2전정판) 기반 규칙
  // ============================================================

  // 4-1. 맞춤법 (PART 3)
  { pattern: /가리치/g, replacement: '가르치', category: 'spelling', reason: "'가르치다'가 올바른 표기입니다. '가리키다'(지시)와 구별하세요.", severity: 'error' },
  { pattern: /가르키/g, replacement: '가리키', category: 'spelling', reason: "'가리키다'(지시)가 올바른 표기입니다. '가르치다'(교육)와 구별하세요.", severity: 'error' },
  { pattern: /더우기/g, replacement: '더욱이', category: 'spelling', reason: "어근의 원형을 밝혀 적습니다. '더욱이'가 올바른 표기입니다.", severity: 'error' },
  { pattern: /보건데/g, replacement: '보건대', category: 'spelling', reason: "'-건대'가 올바른 어미입니다. '-건데'는 잘못된 표기입니다.", severity: 'error' },
  { pattern: /삼가해/g, replacement: '삼가', category: 'spelling', reason: "'삼가다'는 '삼가해'로 활용하지 않습니다. '삼가'가 올바른 표현입니다.", severity: 'error' },
  { pattern: /오랜동안/g, replacement: '오랫동안', category: 'spelling', reason: "'오랫동안'은 합성명사입니다. '오랜동안'은 잘못된 표기입니다.", severity: 'error' },
  { pattern: /오랜 동안/g, replacement: '오랫동안', category: 'spelling', reason: "'오랫동안'은 합성명사입니다. 띄어 쓰지 않습니다.", severity: 'error' },
  { pattern: /오래 전부터/g, replacement: '오래전부터', category: 'spelling', reason: "'오래전'은 하나의 단어이므로 붙여 씁니다.", severity: 'error' },
  { pattern: /옳지 않는/g, replacement: '옳지 않은', category: 'spelling', reason: "'않다'는 형용사이므로 관형사형은 '-은'입니다.", severity: 'error' },
  { pattern: /맞지 않는/g, replacement: '맞지 않은', category: 'spelling', reason: "'않다'는 형용사이므로 관형사형은 '-은'입니다.", severity: 'error' },
  { pattern: /문제되/g, replacement: '문제 되', category: 'spelling', reason: "'문제'와 '되다'는 띄어 씁니다.", severity: 'error' },
  { pattern: /도움되/g, replacement: '도움 되', category: 'spelling', reason: "'도움'과 '되다'는 띄어 씁니다.", severity: 'error' },
  { pattern: /기간 동안/g, replacement: '기간', category: 'expression', reason: "'기간'에 이미 '동안'의 의미가 포함되어 중복입니다.", severity: 'warning' },

  // 4-2. 이중 피동 (PART 4)
  { pattern: /보여지/g, replacement: '보이', category: 'expression', reason: "이중 피동입니다. '보다→보이다'가 올바른 피동형입니다.", severity: 'warning' },
  { pattern: /뽑혀진/g, replacement: '뽑힌', category: 'expression', reason: "이중 피동입니다. '뽑다→뽑히다'가 올바른 피동형입니다.", severity: 'warning' },
  { pattern: /뚫려진/g, replacement: '뚫린', category: 'expression', reason: "이중 피동입니다. '뚫다→뚫리다'가 올바른 피동형입니다.", severity: 'warning' },
  { pattern: /담겨진/g, replacement: '담긴', category: 'expression', reason: "이중 피동입니다. '담다→담기다'가 올바른 피동형입니다.", severity: 'warning' },
  { pattern: /읽혀진/g, replacement: '읽힌', category: 'expression', reason: "이중 피동입니다. '읽다→읽히다'가 올바른 피동형입니다.", severity: 'warning' },
  { pattern: /찢겨진/g, replacement: '찢긴', category: 'expression', reason: "이중 피동입니다. '찢다→찢기다'가 올바른 피동형입니다.", severity: 'warning' },

  // 4-3. 불필요한 -시키다 (PART 4)
  { pattern: /촉진시키/g, replacement: '촉진하', category: 'expression', reason: "불필요한 사동입니다. '촉진하다'에 이미 사동 의미가 포함되어 있습니다.", severity: 'warning' },
  { pattern: /선동시키/g, replacement: '선동하', category: 'expression', reason: "불필요한 사동입니다. '선동하다'로 충분합니다.", severity: 'warning' },
  { pattern: /손상시키/g, replacement: '손상하', category: 'expression', reason: "불필요한 사동입니다. '손상하다'로 충분합니다.", severity: 'warning' },
  { pattern: /훼손시키/g, replacement: '훼손하', category: 'expression', reason: "불필요한 사동입니다. '훼손하다'로 충분합니다.", severity: 'warning' },
  { pattern: /구속시키/g, replacement: '구속하', category: 'expression', reason: "불필요한 사동입니다. '-시키다'는 불필요합니다.", severity: 'warning' },
  { pattern: /보관시키/g, replacement: '보관하', category: 'expression', reason: "불필요한 사동입니다. '-시키다'는 불필요합니다.", severity: 'warning' },
  { pattern: /금지시키/g, replacement: '금지하', category: 'expression', reason: "불필요한 사동입니다. '-시키다'는 불필요합니다.", severity: 'warning' },
  { pattern: /실현시키/g, replacement: '실현하', category: 'expression', reason: "불필요한 사동입니다. '-시키다'는 불필요합니다.", severity: 'warning' },
  { pattern: /연결시키/g, replacement: '연결하', category: 'expression', reason: "불필요한 사동입니다. '-시키다'는 불필요합니다.", severity: 'warning' },

  // 4-4. 번역 투 표현 (PART 4)
  { pattern: /에 위치한/g, replacement: '에 있는', category: 'expression', reason: "'~에 위치한'은 번역 투입니다. '~에 있는'이 자연스럽습니다.", severity: 'warning' },
  { pattern: /으로 하여금/g, replacement: '에게', category: 'expression', reason: "'~(으)로 하여금'은 번역 투입니다. '-에게'로 간결하게 쓰세요.", severity: 'warning' },
  { pattern: /로 하여금/g, replacement: '에게', category: 'expression', reason: "'~로 하여금'은 번역 투입니다. '-에게'로 간결하게 쓰세요.", severity: 'warning' },
  { pattern: /을 필요로 하는/g, replacement: '이 필요한', category: 'expression', reason: "일본어 직역 번역 투입니다. '-이 필요한'이 자연스럽습니다.", severity: 'warning' },
  { pattern: /를 필요로 하는/g, replacement: '이 필요한', category: 'expression', reason: "일본어 직역 번역 투입니다. '-이 필요한'이 자연스럽습니다.", severity: 'warning' },
  { pattern: /를 요하/g, replacement: '이 필요하', category: 'expression', reason: "일본어 직역 번역 투입니다. '-이 필요하다'가 자연스럽습니다.", severity: 'warning' },
  { pattern: /음에도 불구하고/g, replacement: '는데도', category: 'expression', reason: "'불구하고' 없이 '-는데도'로 쓰는 것이 간결합니다.", severity: 'warning' },

  // 4-5. 외래어 표기 — 법원 맞춤법 자료집 (PART 5)
  { pattern: /알콜/g, replacement: '알코올', category: 'spelling', reason: "alcohol의 표준 표기는 '알코올'입니다.", severity: 'error' },
  { pattern: /앰불란스/g, replacement: '앰뷸런스', category: 'spelling', reason: "ambulance의 표준 표기는 '앰뷸런스'입니다.", severity: 'error' },
  { pattern: /밧데리/g, replacement: '배터리', category: 'spelling', reason: "battery의 표준 표기는 '배터리'입니다.", severity: 'error' },
  { pattern: /비스켓/g, replacement: '비스킷', category: 'spelling', reason: "biscuit의 표준 표기는 '비스킷'입니다.", severity: 'error' },
  { pattern: /브라인드/g, replacement: '블라인드', category: 'spelling', reason: "blind의 표준 표기는 '블라인드'입니다.", severity: 'error' },
  { pattern: /블럭/g, replacement: '블록', category: 'spelling', reason: "block의 표준 표기는 '블록'입니다.", severity: 'error' },
  { pattern: /본네트/g, replacement: '보닛', category: 'spelling', reason: "bonnet의 표준 표기는 '보닛'입니다.", severity: 'error' },
  { pattern: /브릿지/g, replacement: '브리지', category: 'spelling', reason: "bridge의 표준 표기는 '브리지'입니다.", severity: 'error' },
  { pattern: /부페/g, replacement: '뷔페', category: 'spelling', reason: "buffet의 표준 표기는 '뷔페'입니다.", severity: 'error' },
  { pattern: /비지니스/g, replacement: '비즈니스', category: 'spelling', reason: "business의 표준 표기는 '비즈니스'입니다.", severity: 'error' },
  { pattern: /카페트/g, replacement: '카펫', category: 'spelling', reason: "carpet의 표준 표기는 '카펫'입니다.", severity: 'error' },
  { pattern: /가디건/g, replacement: '카디건', category: 'spelling', reason: "cardigan의 표준 표기는 '카디건'입니다.", severity: 'error' },
  { pattern: /세멘트/g, replacement: '시멘트', category: 'spelling', reason: "cement의 표준 표기는 '시멘트'입니다.", severity: 'error' },
  { pattern: /센치미터/g, replacement: '센티미터', category: 'spelling', reason: "centimeter의 표준 표기는 '센티미터'입니다.", severity: 'error' },
  { pattern: /카톨릭/g, replacement: '가톨릭', category: 'spelling', reason: "Catholic의 표준 표기는 '가톨릭'입니다.", severity: 'error' },
  { pattern: /쵸코렛/g, replacement: '초콜릿', category: 'spelling', reason: "chocolate의 표준 표기는 '초콜릿'입니다.", severity: 'error' },
  { pattern: /커피샵/g, replacement: '커피숍', category: 'spelling', reason: "coffee shop의 표준 표기는 '커피숍'입니다.", severity: 'error' },
  { pattern: /칼라/g, replacement: '컬러', category: 'spelling', reason: "color의 표준 표기는 '컬러'입니다.", severity: 'error' },
  { pattern: /콜렉션/g, replacement: '컬렉션', category: 'spelling', reason: "collection의 표준 표기는 '컬렉션'입니다.", severity: 'error' },
  { pattern: /컨서트/g, replacement: '콘서트', category: 'spelling', reason: "concert의 표준 표기는 '콘서트'입니다.", severity: 'error' },
  { pattern: /콩크리트/g, replacement: '콘크리트', category: 'spelling', reason: "concrete의 표준 표기는 '콘크리트'입니다.", severity: 'error' },
  { pattern: /콘디션/g, replacement: '컨디션', category: 'spelling', reason: "condition의 표준 표기는 '컨디션'입니다.", severity: 'error' },
  { pattern: /콘테이너/g, replacement: '컨테이너', category: 'spelling', reason: "container의 표준 표기는 '컨테이너'입니다.", severity: 'error' },
  { pattern: /콘트롤/g, replacement: '컨트롤', category: 'spelling', reason: "control의 표준 표기는 '컨트롤'입니다.", severity: 'error' },
  { pattern: /커텐/g, replacement: '커튼', category: 'spelling', reason: "curtain의 표준 표기는 '커튼'입니다.", severity: 'error' },
  { pattern: /데이타/g, replacement: '데이터', category: 'spelling', reason: "data의 표준 표기는 '데이터'입니다.", severity: 'error' },
  { pattern: /데뷰/g, replacement: '데뷔', category: 'spelling', reason: "debut의 표준 표기는 '데뷔'입니다.", severity: 'error' },
  { pattern: /디지탈/g, replacement: '디지털', category: 'spelling', reason: "digital의 표준 표기는 '디지털'입니다.", severity: 'error' },
  { pattern: /도우넛/g, replacement: '도넛', category: 'spelling', reason: "doughnut의 표준 표기는 '도넛'입니다.", severity: 'error' },
  { pattern: /앵콜/g, replacement: '앙코르', category: 'spelling', reason: "encore의 표준 표기는 '앙코르'입니다.", severity: 'error' },
  { pattern: /화이팅/g, replacement: '파이팅', category: 'spelling', reason: "fighting의 표준 표기는 '파이팅'입니다.", severity: 'error' },
  { pattern: /후레시/g, replacement: '플래시', category: 'spelling', reason: "flash의 표준 표기는 '플래시'입니다.", severity: 'error' },
  { pattern: /후라이팬/g, replacement: '프라이팬', category: 'spelling', reason: "frypan의 표준 표기는 '프라이팬'입니다.", severity: 'error' },
  { pattern: /할리웃/g, replacement: '할리우드', category: 'spelling', reason: "Hollywood의 표준 표기는 '할리우드'입니다.", severity: 'error' },
  { pattern: /유모어/g, replacement: '유머', category: 'spelling', reason: "humor의 표준 표기는 '유머'입니다.", severity: 'error' },
  { pattern: /쟈켓/g, replacement: '재킷', category: 'spelling', reason: "jacket의 표준 표기는 '재킷'입니다.", severity: 'error' },
  { pattern: /자캣/g, replacement: '재킷', category: 'spelling', reason: "jacket의 표준 표기는 '재킷'입니다.", severity: 'error' },
  { pattern: /쥬니어/g, replacement: '주니어', category: 'spelling', reason: "junior의 표준 표기는 '주니어'입니다.", severity: 'error' },
  { pattern: /케찹/g, replacement: '케첩', category: 'spelling', reason: "ketchup의 표준 표기는 '케첩'입니다.", severity: 'error' },
  { pattern: /라스베가스/g, replacement: '라스베이거스', category: 'spelling', reason: "Las Vegas의 표준 표기는 '라스베이거스'입니다.", severity: 'error' },
  { pattern: /레이져/g, replacement: '레이저', category: 'spelling', reason: "laser의 표준 표기는 '레이저'입니다.", severity: 'error' },
  { pattern: /레져/g, replacement: '레저', category: 'spelling', reason: "leisure의 표준 표기는 '레저'입니다.", severity: 'error' },
  { pattern: /로긴/g, replacement: '로그인', category: 'spelling', reason: "log-in의 표준 표기는 '로그인'입니다.", severity: 'error' },
  { pattern: /맛사지/g, replacement: '마사지', category: 'spelling', reason: "massage의 표준 표기는 '마사지'입니다.", severity: 'error' },
  { pattern: /매니아/g, replacement: '마니아', category: 'spelling', reason: "mania의 표준 표기는 '마니아'입니다.", severity: 'error' },
  { pattern: /메뉴얼/g, replacement: '매뉴얼', category: 'spelling', reason: "manual의 표준 표기는 '매뉴얼'입니다.", severity: 'error' },
  { pattern: /나이론/g, replacement: '나일론', category: 'spelling', reason: "nylon의 표준 표기는 '나일론'입니다.", severity: 'error' },
  { pattern: /넌센스/g, replacement: '난센스', category: 'spelling', reason: "nonsense의 표준 표기는 '난센스'입니다.", severity: 'error' },
  { pattern: /네트웍/g, replacement: '네트워크', category: 'spelling', reason: "network의 표준 표기는 '네트워크'입니다.", severity: 'error' },
  { pattern: /팜플렛/g, replacement: '팸플릿', category: 'spelling', reason: "pamphlet의 표준 표기는 '팸플릿'입니다.", severity: 'error' },
  { pattern: /판넬/g, replacement: '패널', category: 'spelling', reason: "panel의 표준 표기는 '패널'입니다.", severity: 'error' },
  { pattern: /로보트/g, replacement: '로봇', category: 'spelling', reason: "robot의 표준 표기는 '로봇'입니다.", severity: 'error' },
  { pattern: /로타리/g, replacement: '로터리', category: 'spelling', reason: "rotary의 표준 표기는 '로터리'입니다.", severity: 'error' },
  { pattern: /로얄/g, replacement: '로열', category: 'spelling', reason: "royal의 표준 표기는 '로열'입니다.", severity: 'error' },
  { pattern: /샌달/g, replacement: '샌들', category: 'spelling', reason: "sandal의 표준 표기는 '샌들'입니다.", severity: 'error' },
  { pattern: /싸이렌/g, replacement: '사이렌', category: 'spelling', reason: "siren의 표준 표기는 '사이렌'입니다.", severity: 'error' },
  { pattern: /씽크대/g, replacement: '싱크대', category: 'spelling', reason: "sink의 표준 표기는 '싱크대'입니다.", severity: 'error' },
  { pattern: /스켓치/g, replacement: '스케치', category: 'spelling', reason: "sketch의 표준 표기는 '스케치'입니다.", severity: 'error' },
  { pattern: /쇼파/g, replacement: '소파', category: 'spelling', reason: "sofa의 표준 표기는 '소파'입니다.", severity: 'error' },
  { pattern: /스탭/g, replacement: '스태프', category: 'spelling', reason: "staff의 표준 표기는 '스태프'입니다.", severity: 'error' },
  { pattern: /스티로폴/g, replacement: '스티로폼', category: 'spelling', reason: "styrofoam의 표준 표기는 '스티로폼'입니다.", severity: 'error' },
  { pattern: /심볼/g, replacement: '심벌', category: 'spelling', reason: "symbol의 표준 표기는 '심벌'입니다.", severity: 'error' },
  { pattern: /탈렌트/g, replacement: '탤런트', category: 'spelling', reason: "talent의 표준 표기는 '탤런트'입니다.", severity: 'error' },
  { pattern: /테입/g, replacement: '테이프', category: 'spelling', reason: "tape의 표준 표기는 '테이프'입니다.", severity: 'error' },
  { pattern: /텔레비젼/g, replacement: '텔레비전', category: 'spelling', reason: "television의 표준 표기는 '텔레비전'입니다.", severity: 'error' },
  { pattern: /터미날/g, replacement: '터미널', category: 'spelling', reason: "terminal의 표준 표기는 '터미널'입니다.", severity: 'error' },
  { pattern: /벤쳐/g, replacement: '벤처', category: 'spelling', reason: "venture의 표준 표기는 '벤처'입니다.", severity: 'error' },
  { pattern: /렉카/g, replacement: '레커', category: 'spelling', reason: "wrecker의 표준 표기는 '레커'입니다.", severity: 'error' },
  { pattern: /워크샵/g, replacement: '워크숍', category: 'spelling', reason: "workshop의 표준 표기는 '워크숍'입니다.", severity: 'error' },
  { pattern: /에어콘/g, replacement: '에어컨', category: 'spelling', reason: "air conditioner의 표준 표기는 '에어컨'입니다.", severity: 'error' },
  { pattern: /까페/g, replacement: '카페', category: 'spelling', reason: "cafe의 표준 표기는 '카페'입니다.", severity: 'error' },
  { pattern: /센타/g, replacement: '센터', category: 'spelling', reason: "center의 표준 표기는 '센터'입니다.", severity: 'error' },
  { pattern: /버턴/g, replacement: '버튼', category: 'spelling', reason: "button의 표준 표기는 '버튼'입니다.", severity: 'error' },
  { pattern: /불도우저/g, replacement: '불도저', category: 'spelling', reason: "bulldozer의 표준 표기는 '불도저'입니다.", severity: 'error' },
  { pattern: /수퍼마켓/g, replacement: '슈퍼마켓', category: 'spelling', reason: "supermarket의 표준 표기는 '슈퍼마켓'입니다.", severity: 'error' },
  { pattern: /렌트카/g, replacement: '렌터카', category: 'spelling', reason: "rent-a-car의 표준 표기는 '렌터카'입니다.", severity: 'error' },
  { pattern: /비데오/g, replacement: '비디오', category: 'spelling', reason: "video의 표준 표기는 '비디오'입니다.", severity: 'error' },
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
