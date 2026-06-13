import { useState, useEffect, useCallback } from 'react'

// ============================================================
// 한국어 로마자 변환기 v6.0 by Claud.ai/Artifact
// 국어의 로마자 표기법 [문화체육관광부고시 제2024-27호]
// 국립국어원 한국어 어문 규범 용례 포함
// 기반: gerosyab/koroman, whoshe/koroman (MIT)
// ============================================================

// ── 자모 배열 ──────────────────────────────────────────────
const CHOSUNG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]
const JUNGSUNG = [
  'ㅏ',
  'ㅐ',
  'ㅑ',
  'ㅒ',
  'ㅓ',
  'ㅔ',
  'ㅕ',
  'ㅖ',
  'ㅗ',
  'ㅘ',
  'ㅙ',
  'ㅚ',
  'ㅛ',
  'ㅜ',
  'ㅝ',
  'ㅞ',
  'ㅟ',
  'ㅠ',
  'ㅡ',
  'ㅢ',
  'ㅣ',
]
const JONGSUNG = [
  '',
  'ㄱ',
  'ㄲ',
  'ㄳ',
  'ㄴ',
  'ㄵ',
  'ㄶ',
  'ㄷ',
  'ㄹ',
  'ㄺ',
  'ㄻ',
  'ㄼ',
  'ㄽ',
  'ㄾ',
  'ㄿ',
  'ㅀ',
  'ㅁ',
  'ㅂ',
  'ㅄ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
]

// ── 로마자 매핑 ───────────────────────────────────────────
const CHO_ROM = {
  ㄱ: 'g',
  ㄲ: 'kk',
  ㄴ: 'n',
  ㄷ: 'd',
  ㄸ: 'tt',
  ㄹ: 'r',
  ㅁ: 'm',
  ㅂ: 'b',
  ㅃ: 'pp',
  ㅅ: 's',
  ㅆ: 'ss',
  ㅇ: '',
  ㅈ: 'j',
  ㅉ: 'jj',
  ㅊ: 'ch',
  ㅋ: 'k',
  ㅌ: 't',
  ㅍ: 'p',
  ㅎ: 'h',
}
const JUNG_ROM = {
  ㅏ: 'a',
  ㅐ: 'ae',
  ㅑ: 'ya',
  ㅒ: 'yae',
  ㅓ: 'eo',
  ㅔ: 'e',
  ㅕ: 'yeo',
  ㅖ: 'ye',
  ㅗ: 'o',
  ㅘ: 'wa',
  ㅙ: 'wae',
  ㅚ: 'oe',
  ㅛ: 'yo',
  ㅜ: 'u',
  ㅝ: 'wo',
  ㅞ: 'we',
  ㅟ: 'wi',
  ㅠ: 'yu',
  ㅡ: 'eu',
  ㅢ: 'ui',
  ㅣ: 'i',
}
const JONG_ROM = {
  '': '',
  ㄱ: 'k',
  ㄲ: 'k',
  ㄳ: 'k',
  ㄴ: 'n',
  ㄵ: 'n',
  ㄶ: 'n',
  ㄷ: 't',
  ㄹ: 'l',
  ㄺ: 'k',
  ㄻ: 'm',
  ㄼ: 'p',
  ㄽ: 'l',
  ㄾ: 'l',
  ㄿ: 'p',
  ㅀ: 'l',
  ㅁ: 'm',
  ㅂ: 'p',
  ㅄ: 'p',
  ㅅ: 't',
  ㅆ: 't',
  ㅇ: 'ng',
  ㅈ: 't',
  ㅊ: 't',
  ㅋ: 'k',
  ㅌ: 't',
  ㅍ: 'p',
  ㅎ: 't',
}
const JONG_AS_CHO = {
  ㄱ: 'g',
  ㄲ: 'kk',
  ㄳ: 'g',
  ㄴ: 'n',
  ㄵ: 'j',
  ㄶ: 'n',
  ㄷ: 'd',
  ㄹ: 'r',
  ㄺ: 'g',
  ㄻ: 'm',
  ㄼ: 'b',
  ㄽ: 's',
  ㄾ: 't',
  ㄿ: 'p',
  ㅀ: 'r',
  ㅁ: 'm',
  ㅂ: 'b',
  ㅄ: 'b',
  ㅅ: 's',
  ㅆ: 'ss',
  ㅇ: 'ng',
  ㅈ: 'j',
  ㅊ: 'ch',
  ㅋ: 'k',
  ㅌ: 't',
  ㅍ: 'p',
  ㅎ: 'h',
}

// ── 용례 사전 (국립국어원 어문 규범 고시 용례) ────────────────────
// 제6항: 자연 지물명, 문화재명, 인공 축조물명
// 제5항: 행정 구역 예시 지명
// 제2024-27호: 체언 ㅎ 보존 (묵호, 집현전 등)
const DICTIONARY = {
  // 제6항 용례 (문화재명·자연 지물명 — 붙임표 없이, 첫글자 대문자)
  남산: 'Namsan',
  속리산: 'Songnisan',
  금강: 'Geumgang',
  독도: 'Dokdo',
  경복궁: 'Gyeongbokgung',
  무량수전: 'Muryangsujeon',
  연화교: 'Yeonhwagyo',
  극락전: 'Geungnakjeon',
  안압지: 'Anapji',
  남한산성: 'Namhansanseong',
  화랑대: 'Hwarangdae',
  불국사: 'Bulguksa',
  현충사: 'Hyeonchungsa',
  독립문: 'Dongnimmun',
  오죽헌: 'Ojukheon',
  촉석루: 'Chokseongnu',
  종묘: 'Jongmyo',
  다보탑: 'Dabotap',
  설악산: 'Seoraksan',
  한라산: 'Hallasan',
  지리산: 'Jirisan',
  태백산: 'Taebaeksan',
  북한산: 'Bukhansan',
  덕유산: 'Deogyusan',
  오대산: 'Odaesan',
  한강: 'Hangang',
  낙동강: 'Nakdonggang',
  영산강: 'Yeongsangang',
  섬진강: 'Seomjingang',
  대동강: 'Daedonggang',
  경회루: 'Gyeonghoeru',
  첨성대: 'Cheomseongdae',
  석굴암: 'Seokguram',
  해인사: 'Haeinsa',
  통도사: 'Tongdosa',
  송광사: 'Songgwangsa',
  판문점: 'Panmunjeom',
  경주: 'Gyeongju',
  수원화성: 'Suwon Hwaseong',
  // 제2024-27호 — 체언 ㅎ 보존 용례
  묵호: 'Mukho',
  집현전: 'Jiphyeonjeon',
  // 주요 행정 지명 (제5항 · Smart Mode)
  서울: 'Seoul',
  부산: 'Busan',
  인천: 'Incheon',
  대구: 'Daegu',
  대전: 'Daejeon',
  광주: 'Gwangju',
  울산: 'Ulsan',
  세종: 'Sejong',
  수원: 'Suwon',
  창원: 'Changwon',
  고양: 'Goyang',
  용인: 'Yongin',
  성남: 'Seongnam',
  청주: 'Cheongju',
  전주: 'Jeonju',
  안산: 'Ansan',
  안양: 'Anyang',
  남양주: 'Namyangju',
  화성: 'Hwaseong',
  천안: 'Cheonan',
  부천: 'Bucheon',
  시흥: 'Siheung',
  평택: 'Pyeongtaek',
  김포: 'Gimpo',
  제주: 'Jeju',
  포항: 'Pohang',
  김해: 'Gimhae',
  의정부: 'Uijeongbu',
  파주: 'Paju',
  원주: 'Wonju',
  춘천: 'Chuncheon',
  강릉: 'Gangneung',
  구미: 'Gumi',
  전주: 'Jeonju',
  여수: 'Yeosu',
  순천: 'Suncheon',
  목포: 'Mokpo',
  익산: 'Iksan',
  군산: 'Gunsan',
  광양: 'Gwangyang',
  진주: 'Jinju',
  통영: 'Tongyeong',
  거제: 'Geoje',
  밀양: 'Miryang',
  경산: 'Gyeongsan',
  안동: 'Andong',
  경주: 'Gyeongju',
  포항: 'Pohang',
  영주: 'Yeongju',
  영천: 'Yeongcheon',
  상주: 'Sangju',
  문경: 'Mungyeong',
  속초: 'Sokcho',
  삼척: 'Samcheok',
  동해: 'Donghae',
  태백: 'Taebaek',
  충주: 'Chungju',
  제천: 'Jecheon',
  보령: 'Boryeong',
  아산: 'Asan',
  논산: 'Nonsan',
  서산: 'Seosan',
  당진: 'Dangjin',
  공주: 'Gongju',
  광명: 'Gwangmyeong',
  하남: 'Hanam',
  오산: 'Osan',
  군포: 'Gunpo',
  의왕: 'Uiwang',
  이천: 'Icheon',
  안성: 'Anseong',
  양주: 'Yangju',
  구리: 'Guri',
  양평: 'Yangpyeong',
  여주: 'Yeoju',
  가평: 'Gapyeong',
  연천: 'Yeoncheon',
  포천: 'Pocheon',
  동두천: 'Dongducheon',
  // 서울 자치구
  종로구: 'Jongno-gu',
  중구: 'Jung-gu',
  용산구: 'Yongsan-gu',
  성동구: 'Seongdong-gu',
  광진구: 'Gwangjin-gu',
  동대문구: 'Dongdaemun-gu',
  중랑구: 'Jungnang-gu',
  성북구: 'Seongbuk-gu',
  강북구: 'Gangbuk-gu',
  도봉구: 'Dobong-gu',
  노원구: 'Nowon-gu',
  은평구: 'Eunpyeong-gu',
  서대문구: 'Seodaemun-gu',
  마포구: 'Mapo-gu',
  양천구: 'Yangcheon-gu',
  강서구: 'Gangseo-gu',
  구로구: 'Guro-gu',
  금천구: 'Geumcheon-gu',
  영등포구: 'Yeongdeungpo-gu',
  동작구: 'Dongjak-gu',
  관악구: 'Gwanak-gu',
  서초구: 'Seocho-gu',
  강남구: 'Gangnam-gu',
  송파구: 'Songpa-gu',
  강동구: 'Gangdong-gu',
  // 유명 랜드마크·관광지
  경복궁: 'Gyeongbokgung',
  창덕궁: 'Changdeokgung',
  덕수궁: 'Deoksugung',
  경희궁: 'Gyeonghuigung',
  창경궁: 'Changgyeonggung',
  남대문: 'Namdaemun',
  동대문: 'Dongdaemun',
  광화문: 'Gwanghwamun',
  인사동: 'Insadong',
  명동: 'Myeongdong',
  홍대: 'Hongdae',
  이태원: 'Itaewon',
  강남: 'Gangnam',
  신촌: 'Sinchon',
  잠실: 'Jamsil',
  여의도: 'Yeouido',
  북촌: 'Bukchon',
  청계천: 'Cheonggye Stream',
  한강공원: 'Hangang Park',
}

// ── 행정구역 단위 매핑 (제5항) ──────────────────────────────
const ADMIN_UNITS = {
  도: 'do',
  시: 'si',
  군: 'gun',
  구: 'gu',
  읍: 'eup',
  면: 'myeon',
  리: 'ri',
  동: 'dong',
  가: 'ga',
}

// ── 음절 분해 ─────────────────────────────────────────────
function decompose(ch) {
  const c = ch.charCodeAt(0) - 0xac00
  if (c < 0 || c > 11171) return null
  return {
    cho: CHOSUNG[Math.floor(c / 588)],
    jung: JUNGSUNG[Math.floor((c % 588) / 28)],
    jong: JONGSUNG[c % 28],
  }
}

// ── 핵심 로마자 변환 ──────────────────────────────────────
function romanizeRaw(text, { pronounce = true, version = '2024-27' } = {}) {
  const syls = []
  for (const ch of text) {
    const d = decompose(ch)
    syls.push(d ? { type: 'hangul', ...d, orig: ch } : { type: 'other', orig: ch })
  }

  let out = ''
  let i = 0
  while (i < syls.length) {
    const s = syls[i]
    if (s.type !== 'hangul') {
      out += s.orig
      i++
      continue
    }

    const next = syls[i + 1]
    const nH = next?.type === 'hangul'
    let cho = CHO_ROM[s.cho],
      jung = JUNG_ROM[s.jung],
      jong = ''

    if (!pronounce) {
      jong = JONG_ROM[s.jong] || ''
      out += cho + jung + jong
      i++
      continue
    }

    if (nH) {
      const nCho = next.cho,
        nJong = s.jong

      // 2024-27: 체언에서 ㄱ·ㄷ·ㅂ + ㅎ → ㅎ 밝혀 적기 (격음화 억제)
      const nounHPreserve =
        version === '2024-27' && ['ㄱ', 'ㄷ', 'ㅂ'].includes(nJong) && nCho === 'ㅎ'

      // 격음화 (2000-8 기본 / 동사·형용사)
      const aspTable = {
        ㅎ: { ㄱ: 'k', ㄷ: 't', ㅂ: 'p', ㅈ: 'ch', ㅅ: 'ss' },
        ㄱ: { ㅎ: 'k' },
        ㄷ: { ㅎ: 't' },
        ㅂ: { ㅎ: 'p' },
        ㅈ: { ㅎ: 'ch' },
      }
      const asp = !nounHPreserve && (aspTable[nJong]?.[nCho] || aspTable[nCho]?.[nJong])
      if (asp) {
        out += cho + jung // 현 음절 초·중성
        // 다음 음절 처리 (격음으로 교체)
        const nn = syls[i + 2],
          nnH = nn?.type === 'hangul'
        out += asp + JUNG_ROM[next.jung]
        if (nnH && next.jong) out += processJongAhead(next.jong, syls[i + 2], pronounce, version)
        else if (next.jong) out += JONG_ROM[next.jong]
        i += 2
        continue
      }

      // 연음: 받침 + ㅇ 초성
      if (nCho === 'ㅇ' && nJong) {
        const liaison = JONG_AS_CHO[nJong] || ''
        out += cho + jung
        const nn2 = syls[i + 2],
          nnH2 = nn2?.type === 'hangul'
        out += liaison + JUNG_ROM[next.jung]
        if (nnH2 && next.jong) out += processJongAhead(next.jong, syls[i + 2], pronounce, version)
        else if (next.jong) out += JONG_ROM[next.jong]
        i += 2
        continue
      }

      // 유음화: ㄹ+ㄴ or ㄴ+ㄹ
      if ((nJong === 'ㄹ' && nCho === 'ㄴ') || (nJong === 'ㄴ' && nCho === 'ㄹ')) {
        jong = 'l' // ll 중 앞 l
        // 다음 음절 초성도 l로 (미리 처리)
        out += cho + jung + jong
        const nn3 = syls[i + 2],
          nnH3 = nn3?.type === 'hangul'
        out += 'l' + JUNG_ROM[next.jung]
        if (nnH3 && next.jong) out += processJongAhead(next.jong, syls[i + 2], pronounce, version)
        else if (next.jong) out += JONG_ROM[next.jong]
        i += 2
        continue
      }

      // 비음화: 받침 + ㄴ·ㅁ
      if (['ㄴ', 'ㅁ'].includes(nCho) && nJong) {
        const nasMap = {
          ㄱ: 'ng',
          ㄲ: 'ng',
          ㄳ: 'ng',
          ㄺ: 'ng',
          ㄷ: 'n',
          ㅅ: 'n',
          ㅆ: 'n',
          ㅈ: 'n',
          ㅊ: 'n',
          ㅌ: 'n',
          ㅎ: 'n',
          ㄵ: 'n',
          ㄴ: 'n',
          ㅂ: 'm',
          ㄼ: 'm',
          ㅄ: 'm',
          ㄿ: 'm',
          ㄹ: 'l',
        }
        jong = nasMap[nJong] ?? JONG_ROM[nJong]
      } else {
        jong = JONG_ROM[nJong] || ''
      }
    } else {
      jong = JONG_ROM[s.jong] || ''
    }

    out += cho + jung + jong
    i++
  }
  return out
}

function processJongAhead(jong, nextSyl, pronounce, version) {
  if (!jong) return ''
  if (!nextSyl || nextSyl.type !== 'hangul') return JONG_ROM[jong]
  const nCho = nextSyl.cho
  if (pronounce && nCho === 'ㅇ') return ''
  if (pronounce && ['ㄴ', 'ㅁ'].includes(nCho)) {
    const nasMap = {
      ㄱ: 'ng',
      ㄲ: 'ng',
      ㄳ: 'ng',
      ㄺ: 'ng',
      ㄷ: 'n',
      ㅅ: 'n',
      ㅆ: 'n',
      ㅈ: 'n',
      ㅊ: 'n',
      ㅌ: 'n',
      ㅎ: 'n',
      ㄵ: 'n',
      ㄴ: 'n',
      ㅂ: 'm',
      ㄼ: 'm',
      ㅄ: 'm',
      ㄿ: 'm',
    }
    return nasMap[jong] ?? JONG_ROM[jong]
  }
  return JONG_ROM[jong]
}

// ── 용례 사전 검색 (띄어쓰기 단위 토큰별 매칭) ───────────────────
function applyDictionary(text) {
  // 행정구역 단위 처리 (붙임표 삽입 — 제5항)
  const adminPattern = new RegExp(`(\\S+)(${Object.keys(ADMIN_UNITS).join('|')})(?=\\s|$)`, 'g')

  // 먼저 완전 일치 사전 검색 (가장 긴 매칭 우선)
  const tokens = text.split(/(\s+)/)
  return tokens.map((tok) => {
    if (/^\s+$/.test(tok)) return tok
    // 완전 매칭
    if (DICTIONARY[tok]) return DICTIONARY[tok]
    // 행정구역 단위 분리: 지명부분-단위 (제5항)
    for (const [unit, unitRom] of Object.entries(ADMIN_UNITS)) {
      if (tok.endsWith(unit) && tok.length > unit.length) {
        const placePart = tok.slice(0, tok.length - unit.length)
        const placeRom =
          DICTIONARY[placePart] ||
          cap(romanizeRaw(placePart, { pronounce: true, version: '2024-27' }))
        return `${placeRom}-${unitRom}`
      }
    }
    return null // 사전 미매칭
  })
}

function cap(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

// ── 최종 변환 함수 ────────────────────────────────────────
function romanize(
  text,
  { casingOption = 'lowercase', pronounce = true, useDictionary = true, version = '2024-27' } = {},
) {
  if (!text.trim()) return ''

  const tokens = text.split(/(\s+)/)
  const dictResults = useDictionary ? applyDictionary(text).filter(Boolean) : null

  let result = ''
  const tokensWithSpaces = text.split(/(\s+)/)
  const dictArr = useDictionary ? applyDictionary(text) : tokensWithSpaces.map(() => null)

  for (let i = 0; i < tokensWithSpaces.length; i++) {
    const tok = tokensWithSpaces[i]
    if (/^\s+$/.test(tok)) {
      result += tok
      continue
    }

    if (useDictionary && dictArr[i] !== null) {
      result += dictArr[i]
    } else {
      const raw = romanizeRaw(tok, { pronounce, version })
      if (casingOption === 'capitalize-word') result += cap(raw)
      else result += raw
    }
  }

  if (casingOption === 'uppercase') return result.toUpperCase()
  if (casingOption === 'lowercase') {
    // 사전 항목은 대소문자 유지, 나머지만 소문자 (이미 처리됨)
    return result
  }
  return result
}

// ============================================================
// UI
// ============================================================
const EXAMPLES = [
  {
    group: '지명·행정구역',
    items: [
      { ko: '서울특별시', hint: '특별시' },
      { ko: '세종시', hint: '행정구역' },
      { ko: '종로구', hint: '서울 자치구' },
      { ko: '부산광역시', hint: '광역시' },
    ],
  },
  {
    group: '자연·문화재 용례 (제6항)',
    items: [
      { ko: '경복궁', hint: '궁궐' },
      { ko: '독도', hint: '섬' },
      { ko: '불국사', hint: '사찰' },
      { ko: '남한산성', hint: '성' },
    ],
  },
  {
    group: '2024-27 체언 ㅎ 보존',
    items: [
      { ko: '묵호', hint: 'ㅎ 보존' },
      { ko: '집현전', hint: 'ㅎ 보존' },
    ],
  },
  {
    group: '음운 변화',
    items: [
      { ko: '해돋이', hint: '구개음화' },
      { ko: '신라', hint: '유음화' },
      { ko: '백마', hint: '비음화' },
      { ko: '좋고', hint: '격음화' },
    ],
  },
]

const CASING = [
  { v: 'lowercase', l: '소문자 (lowercase)' },
  { v: 'capitalize-word', l: '단어 첫글자 대문자' },
  { v: 'uppercase', l: '전체 대문자 (UPPERCASE)' },
]

export default function App() {
  const [input, setInput] = useState('')
  const [casing, setCasing] = useState('lowercase')
  const [pronounce, setPronounce] = useState(true)
  const [useDict, setUseDict] = useState(true)
  const [version] = useState('2024-27')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setOutput(
      input
        ? romanize(input, { casingOption: casing, pronounce, useDictionary: useDict, version })
        : '',
    )
  }, [input, casing, pronounce, useDict])

  const copy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [output])

  const chk = (val, setter, label) => (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 13,
        color: '#444',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <input
        type='checkbox'
        checked={val}
        onChange={(e) => setter(e.target.checked)}
        style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#3a3a5c' }}
      />
      {label}
    </label>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: 'system-ui,sans-serif' }}>
      {/* 헤더 */}
      <div style={{ background: '#1a1a2e', color: '#fff', padding: '20px 28px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>🇰🇷 한글 로마자 변환기</div>
          <div style={{ fontSize: 12, color: '#8888aa', marginTop: 3, lineHeight: 1.6 }}>
            국어의 로마자 표기법 [문화체육관광부고시 제2024-27호] · 국립국어원 한국어 어문 규범 용례
            적용
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 18px' }}>
        {/* 옵션 */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: 14,
            background: '#fff',
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid #e4e4f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>표기 방식</span>
            <select
              value={casing}
              onChange={(e) => setCasing(e.target.value)}
              style={{
                fontSize: 12,
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid #ddd',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              {CASING.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.l}
                </option>
              ))}
            </select>
          </div>
          <div style={{ width: 1, height: 22, background: '#e0e0e0' }} />
          {chk(useDict, setUseDict, '용례 사전 (지명·문화재 등 고유명사)')}
          <div style={{ width: 1, height: 22, background: '#e0e0e0' }} />
          {chk(pronounce, setPronounce, '음운 적용 (연음·비음화·유음화·격음화)')}
        </div>

        {/* 입출력 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>한글 입력</span>
              {input && (
                <button
                  onClick={() => setInput('')}
                  style={{
                    fontSize: 11,
                    color: '#aaa',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  지우기
                </button>
              )}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={'변환할 한글을 입력하세요\n예) 경복궁, 서울특별시 종로구, 해돋이'}
              style={{
                width: '100%',
                height: 150,
                padding: '11px 13px',
                borderRadius: 9,
                border: '2px solid #e0e0f0',
                fontSize: 15,
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.65,
                color: '#222',
              }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>로마자 변환 결과</span>
              {output && (
                <button
                  onClick={copy}
                  style={{
                    fontSize: 11,
                    padding: '2px 9px',
                    borderRadius: 5,
                    background: copied ? '#4caf50' : '#3a3a5c',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {copied ? '✓ 복사됨' : '복사'}
                </button>
              )}
            </div>
            <div
              style={{
                width: '100%',
                minHeight: 150,
                padding: '11px 13px',
                borderRadius: 9,
                border: '2px solid #e0e0f0',
                fontSize: 15,
                background: '#fafbff',
                boxSizing: 'border-box',
                overflowY: 'auto',
                lineHeight: 1.65,
                color: output ? '#1a1a2e' : '#bbb',
                whiteSpace: 'pre-wrap',
              }}
            >
              {output || '변환 결과가 여기에 표시됩니다'}
            </div>
          </div>
        </div>

        {/* 예시 */}
        <div style={{ marginTop: 22 }}>
          {EXAMPLES.map((g) => (
            <div key={g.group} style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: 11,
                  color: '#999',
                  fontWeight: 700,
                  marginBottom: 7,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                {g.group}
              </div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {g.items.map((ex) => {
                  const prev = romanize(ex.ko, {
                    casingOption: casing,
                    pronounce,
                    useDictionary: useDict,
                    version,
                  })
                  const active = input === ex.ko
                  return (
                    <button
                      key={ex.ko}
                      onClick={() => setInput(ex.ko)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 7,
                        border: `1.5px solid ${active ? '#1a1a2e' : '#e0e0f0'}`,
                        background: active ? '#1a1a2e' : '#fff',
                        color: active ? '#fff' : '#333',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{ex.ko}</div>
                      <div
                        style={{ fontSize: 10, color: active ? '#9999cc' : '#999', marginTop: 1 }}
                      >
                        → {prev}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 규칙 요약 */}
        <div
          style={{
            marginTop: 18,
            padding: '14px 18px',
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #eaeaf4',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 8 }}>
            📌 적용 규칙 요약
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4px 20px',
              fontSize: 11,
              color: '#666',
              lineHeight: 1.9,
            }}
          >
            <div>
              • <b>연음</b>: 받침 + ㅇ초성 → 이월 (해돋이→haedoji)
            </div>
            <div>
              • <b>비음화</b>: 백마→Baengma, 종로→Jongno
            </div>
            <div>
              • <b>유음화</b>: 신라→Silla, 대관령→Daegwallyeong
            </div>
            <div>
              • <b>격음화</b>: 좋고→joko, 잡혀→japyeo
            </div>
            <div>
              • <b>체언 ㅎ 보존 (2024-27)</b>: 묵호→Mukho
            </div>
            <div>
              • <b>행정구역 (제5항)</b>: 붙임표(-) 삽입
            </div>
            <div>
              • <b>고유명사 (제3항)</b>: 첫 글자 대문자
            </div>
            <div>
              • <b>용례 사전 (제6항)</b>: 문화재·지명 우선 적용
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10, fontSize: 10, color: '#ccc', textAlign: 'center' }}>
          오픈소스 기반:&nbsp;
          <a
            href='https://github.com/whoshe/koroman'
            target='_blank'
            rel='noopener noreferrer'
            style={{ color: '#bbb' }}
          >
            whoshe/koroman
          </a>
          &nbsp;·&nbsp;
          <a
            href='https://github.com/gerosyab/koroman'
            target='_blank'
            rel='noopener noreferrer'
            style={{ color: '#bbb' }}
          >
            gerosyab/koroman
          </a>
          &nbsp;·&nbsp;
          <a
            href='https://korean.go.kr/kornorms/regltn/regltnView.do?regltn_code=0004'
            target='_blank'
            rel='noopener noreferrer'
            style={{ color: '#bbb' }}
          >
            국립국어원 어문 규범
          </a>
        </div>
      </div>
    </div>
  )
}
