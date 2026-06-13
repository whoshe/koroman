import { useState, useEffect, useCallback } from 'react'

// ============================================================
// 🇰🇷 한글 로마자 변환기 v10.0 by Claud.ai/Artifact
// 국어의 로마자 표기법 [문화체육관광부고시 제2024-27호] · 국립국어원 어문 규범 용례 적용
// 소스코드: gerosyab/koroman, whoshe/koroman (MIT)
// 데모 사용해보기 https://claude.ai/public/artifacts/e1b35c4c-958c-4bbf-96ee-edcc726a607e
// 참고자료: 국어의 로마자 표기법 [문화체육관광부고시 제2024-27호], 국립국어원 한국어 어문 규범 용례 포함
// ============================================================

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

// 초성 로마자 (모음 앞)
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
// 모음 로마자 (제2장 제1항)
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
// 받침 대표음 (어말·자음 앞)
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
// 연음 시 받침→초성 (겹받침은 뒤 자음)
const JONG_TO_CHO = {
  ㄱ: 'ㄱ',
  ㄲ: 'ㄲ',
  ㄳ: 'ㄱ',
  ㄴ: 'ㄴ',
  ㄵ: 'ㅈ',
  ㄶ: 'ㅎ',
  ㄷ: 'ㄷ',
  ㄹ: 'ㄹ',
  ㄺ: 'ㄱ',
  ㄻ: 'ㅁ',
  ㄼ: 'ㅂ',
  ㄽ: 'ㅅ',
  ㄾ: 'ㅌ',
  ㄿ: 'ㅍ',
  ㅀ: 'ㅎ',
  ㅁ: 'ㅁ',
  ㅂ: 'ㅂ',
  ㅄ: 'ㅅ',
  ㅅ: 'ㅅ',
  ㅆ: 'ㅆ',
  ㅇ: 'ㅇ',
  ㅈ: 'ㅈ',
  ㅊ: 'ㅊ',
  ㅋ: 'ㅋ',
  ㅌ: 'ㅌ',
  ㅍ: 'ㅍ',
  ㅎ: 'ㅎ',
}

// 음절 분해
function decompose(ch) {
  const c = ch.charCodeAt(0) - 0xac00
  if (c < 0 || c > 11171) return null
  return {
    cho: CHOSUNG[Math.floor(c / 588)],
    jung: JUNGSUNG[Math.floor((c % 588) / 28)],
    jong: JONGSUNG[c % 28],
  }
}

// ── 음운 규칙 함수들 ──────────────────────────────────────────

// 구개음화: ㄷ/ㅌ + ㅣ(이중모음 포함) → ㅈ/ㅊ (제3장 제1항 3)
// 적용: 받침 ㄷ/ㅌ이 연음되어 모음 ㅣ/ㅑ/ㅕ/ㅛ/ㅠ 앞에 올 때 (단, ㅣ계열만)
function palatalize(cho, jung) {
  if (jung === 'ㅣ') {
    if (cho === 'ㄷ') return 'j'
    if (cho === 'ㅌ') return 'ch'
  }
  return CHO_ROM[cho]
}

// ㅎ 격음화 (제3장 제1항 4)
// 체언 여부에 따라 다른 처리 필요
// 동사/형용사: ㄱ+ㅎ→k, ㄷ+ㅎ→t, ㅂ+ㅎ→p, ㅈ+ㅎ→ch / ㅎ+ㄱ→k, ㅎ+ㄷ→t, ㅎ+ㅂ→p, ㅎ+ㅈ→ch
// 체언: ㄱ·ㄷ·ㅂ + ㅎ → ㅎ 밝혀 적기 (Mukho, Jiphyeonjeon)
const ASPIRATE = {
  ㄱ: { ㅎ: 'k' },
  ㄷ: { ㅎ: 't' },
  ㅂ: { ㅎ: 'p' },
  ㅈ: { ㅎ: 'ch' },
  ㅎ: { ㄱ: 'k', ㄷ: 't', ㅂ: 'p', ㅈ: 'ch', ㅅ: 'ss' },
}

// 비음화 (제3장 제1항 1)
const NASALIZE = {
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

// 유음화: ㄴ+ㄹ or ㄹ+ㄴ → ll (제3장 제1항 1)
function isLateralization(jong, cho) {
  return (jong === 'ㄹ' && cho === 'ㄴ') || (jong === 'ㄴ' && cho === 'ㄹ')
}

// ── 핵심 변환 ────────────────────────────────────────────────
function romanizeWord(text, pronounce = true) {
  // 음절 배열
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

    if (!pronounce) {
      // 음운 변화 없이 글자 그대로
      out += CHO_ROM[s.cho] + JUNG_ROM[s.jung] + JONG_ROM[s.jong]
      i++
      continue
    }

    const next = syls[i + 1]
    const nH = next?.type === 'hangul'

    const cho = s.cho,
      jung = s.jung,
      jong = s.jong
    const nCho = nH ? next.cho : null
    const nJung = nH ? next.jung : null

    // ── 받침 있는 경우 ──
    if (jong && nH) {
      // 1. 유음화: ㄹ+ㄴ or ㄴ+ㄹ → ll
      if (isLateralization(jong, nCho)) {
        out += CHO_ROM[cho] + JUNG_ROM[jung] + 'l'
        // 다음 음절 초성도 l로 처리해서 skip
        const nn = syls[i + 2],
          nnH = nn?.type === 'hangul'
        out += 'l' + JUNG_ROM[nJung]
        out += resolveJong(next.jong, syls[i + 2], pronounce)
        i += 2
        continue
      }

      // 2. ㅎ 격음화: 받침+ㅎ or ㅎ받침+초성
      // 체언 ㅎ 보존(묵호, 집현전 등)은 사전에서 처리하므로 여기서는 항상 격음화 적용
      const asp = ASPIRATE[jong]?.[nCho] || ASPIRATE[nCho]?.[jong]
      if (asp) {
        out += CHO_ROM[cho] + JUNG_ROM[jung]
        // 격음 후 구개음화: ㄷ+ㅎ→t, t+ㅣ→ch (굳히다→guchida)
        let finalAsp = asp
        if (nJung === 'ㅣ') {
          if (asp === 't') finalAsp = 'ch'
          else if (asp === 'd') finalAsp = 'j'
        }
        out += finalAsp + JUNG_ROM[nJung]
        if (next.jong) {
          out += resolveJong(next.jong, syls[i + 2], pronounce)
        }
        i += 2
        continue
      }

      // 3. 연음: 다음 초성이 ㅇ
      if (nCho === 'ㅇ') {
        const liaisonCho = JONG_TO_CHO[jong] // 받침 → 초성 자음
        out += CHO_ROM[cho] + JUNG_ROM[jung]
        // 구개음화 체크 (연음된 자음 + 모음 ㅣ)
        out += palatalize(liaisonCho, nJung) + JUNG_ROM[nJung]
        // next.jong 처리 후 i+2부터 다음 루프
        if (next.jong) {
          out += resolveJong(next.jong, syls[i + 2], pronounce)
        }
        i += 2
        continue
      }

      // 4. 비음화: 다음 초성이 ㄴ·ㅁ
      if (['ㄴ', 'ㅁ'].includes(nCho)) {
        const nas = NASALIZE[jong]
        if (nas) {
          out += CHO_ROM[cho] + JUNG_ROM[jung] + nas
          i++
          continue
        }
      }

      // 5. 된소리되기 — 표기에 반영하지 않음 (제3장 제1항 붙임)
      // 받침 폐쇄음 + 예사소리 → 그냥 JONG_ROM + CHO_ROM 그대로

      // 기본: 받침 대표음 표기
      out += CHO_ROM[cho] + JUNG_ROM[jung] + JONG_ROM[jong]
      i++
      continue
    }

    // ── 받침 없는 경우 or 어말 ──
    out += CHO_ROM[cho] + JUNG_ROM[jung] + JONG_ROM[jong]
    i++
  }

  return out
}

// 받침 처리 헬퍼 (lookahead 1)
function resolveJong(jong, nextSyl, pronounce) {
  if (!jong) return ''
  if (!pronounce) return JONG_ROM[jong]
  if (!nextSyl || nextSyl.type !== 'hangul') return JONG_ROM[jong]
  const nCho = nextSyl.cho
  // 연음
  if (nCho === 'ㅇ') return '' // 이미 위에서 처리
  // 비음화
  if (['ㄴ', 'ㅁ'].includes(nCho) && NASALIZE[jong]) return NASALIZE[jong]
  return JONG_ROM[jong]
}

// ── 용례 사전 (국립국어원 제6항 + 주요 지명) ──────────────────────
const DICT = {
  // 제6항 고시 용례 (자연지물·문화재·인공축조물)
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
  // 제2장 고시 자음 용례
  구미: 'Gumi',
  영동: 'Yeongdong',
  백암: 'Baegam',
  옥천: 'Okcheon',
  합덕: 'Hapdeok',
  호법: 'Hobeop',
  월곶: 'Wolgot',
  한밭: 'Hanbat',
  구리: 'Guri',
  설악: 'Seorak',
  칠곡: 'Chilgok',
  임실: 'Imsil',
  울릉: 'Ulleung',
  대관령: 'Daegwallyeong',
  // 제3장 제1항 음운변화 용례 (고시 명시)
  백마: 'Baengma',
  신문로: 'Sinmunno',
  종로: 'Jongno',
  왕십리: 'Wangsimni',
  별내: 'Byeollae',
  신라: 'Silla',
  학여울: 'Hangnyeoul',
  알약: 'allyak',
  압구정: 'Apgujeong',
  낙동강: 'Nakdonggang',
  죽변: 'Jukbyeon',
  낙성대: 'Nakseongdae',
  합정: 'Hapjeong',
  팔당: 'Paldang',
  샛별: 'saetbyeol',
  울산: 'Ulsan',
  // 제2항 붙임표 용례
  중앙: 'Jung-ang',
  반구대: 'Ban-gudae',
  세운: 'Se-un',
  해운대: 'Hae-undae',
  // 제3항 고시 지명 용례
  부산: 'Busan',
  세종: 'Sejong',
  // 2024-27 체언 ㅎ 보존
  묵호: 'Mukho',
  집현전: 'Jiphyeonjeon',
  // 주요 행정 지명 (제5항 단위 생략형)
  서울: 'Seoul',
  인천: 'Incheon',
  대구: 'Daegu',
  대전: 'Daejeon',
  광주: 'Gwangju',
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
  설악산: 'Seoraksan',
  한라산: 'Hallasan',
  지리산: 'Jirisan',
  태백산: 'Taebaeksan',
  북한산: 'Bukhansan',
  한강: 'Hangang',
  낙동강: 'Nakdonggang',
  영산강: 'Yeongsangang',
  섬진강: 'Seomjingang',
  // 서울 주요 지명
  광화문: 'Gwanghwamun',
  인사동: 'Insadong',
  명동: 'Myeongdong',
  홍대: 'Hongdae',
  이태원: 'Itaewon',
  강남: 'Gangnam',
  잠실: 'Jamsil',
  여의도: 'Yeouido',
  북촌: 'Bukchon',
  남대문: 'Namdaemun',
  동대문: 'Dongdaemun',
  신촌: 'Sinchon',
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
}

// 행정구역 단위 (제5항)
const ADMIN = {
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

function cap(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

function lookupToken(tok, casing, pronounce) {
  // 1. 완전 일치 사전
  if (DICT[tok]) return DICT[tok]
  // 2. 행정구역 단위 분리 (제5항)
  for (const [unit, unitRom] of Object.entries(ADMIN)) {
    if (tok.endsWith(unit) && tok.length > unit.length) {
      const place = tok.slice(0, tok.length - unit.length)
      const placeRom = DICT[place] || cap(romanizeWord(place, pronounce))
      return `${placeRom}-${unitRom}`
    }
  }
  return null
}

function romanize(
  text,
  { casingOption = 'lowercase', pronounce = true, useDictionary = true } = {},
) {
  if (!text.trim()) return ''
  const tokens = text.split(/(\s+)/)
  return tokens
    .map((tok) => {
      if (/^\s+$/.test(tok)) return tok
      // 사전 우선 검색
      if (useDictionary) {
        const hit = lookupToken(tok, casingOption, pronounce)
        if (hit) return hit
      }
      // 음운 규칙 변환
      const raw = romanizeWord(tok, pronounce)
      if (casingOption === 'capitalize-word') return cap(raw)
      if (casingOption === 'uppercase') return raw.toUpperCase()
      return raw
    })
    .join('')
}

// ================================================================
// UI
// ================================================================
const EXAMPLES = [
  {
    group: '구개음화 (제3장 1항 3)',
    items: [
      { ko: '해돋이', expect: 'haedoji' },
      { ko: '같이', expect: 'gachi' },
      { ko: '굳히다', expect: 'guchida' },
    ],
  },
  {
    group: '격음화 (제3장 1항 4)',
    items: [
      { ko: '좋고', expect: 'joko' },
      { ko: '놓다', expect: 'nota' },
      { ko: '잡혀', expect: 'japyeo' },
      { ko: '낳지', expect: 'nachi' },
    ],
  },
  {
    group: '체언 ㅎ 보존 (2024-27)',
    items: [
      { ko: '묵호', expect: 'Mukho' },
      { ko: '집현전', expect: 'Jiphyeonjeon' },
    ],
  },
  {
    group: '비음화·유음화 (제3장 1항 1)',
    items: [
      { ko: '백마', expect: 'Baengma' },
      { ko: '종로', expect: 'Jongno' },
      { ko: '신라', expect: 'Silla' },
      { ko: '별내', expect: 'Byeollae' },
    ],
  },
  {
    group: '된소리 미반영 (붙임)',
    items: [
      { ko: '압구정', expect: 'Apgujeong' },
      { ko: '낙동강', expect: 'Nakdonggang' },
      { ko: '합정', expect: 'Hapjeong' },
    ],
  },
  {
    group: '지명 용례 (제6항)',
    items: [
      { ko: '경복궁', expect: 'Gyeongbokgung' },
      { ko: '독도', expect: 'Dokdo' },
      { ko: '대관령', expect: 'Daegwallyeong' },
      { ko: '한강', expect: 'Hangang' },
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
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setOutput(
      input ? romanize(input, { casingOption: casing, pronounce, useDictionary: useDict }) : '',
    )
  }, [input, casing, pronounce, useDict])

  const copy = useCallback(async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [output])

  const Chk = ({ val, setter, label }) => (
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
      <div style={{ background: '#1a1a2e', color: '#fff', padding: '18px 28px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 19, fontWeight: 700 }}>🇰🇷 한글 로마자 변환기</div>
          <div style={{ fontSize: 11, color: '#8888aa', marginTop: 3 }}>
            국어의 로마자 표기법 [문화체육관광부고시 제2024-27호] · 국립국어원 어문 규범 용례 적용
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '22px 16px' }}>
        {/* 옵션 바 */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: 14,
            background: '#fff',
            padding: '11px 16px',
            borderRadius: 10,
            border: '1px solid #e4e4f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 12, color: '#666' }}>표기 방식</span>
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
          <div style={{ width: 1, height: 20, background: '#e0e0e0' }} />
          <Chk val={useDict} setter={setUseDict} label='용례 사전 (지명·문화재 등 고유명사)' />
          <div style={{ width: 1, height: 20, background: '#e0e0e0' }} />
          <Chk
            val={pronounce}
            setter={setPronounce}
            label='음운 적용 (연음·비음화·유음화·격음화)'
          />
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
              placeholder={'변환할 한글을 입력하세요\n예) 해돋이, 경복궁, 종로구'}
              style={{
                width: '100%',
                height: 140,
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
                minHeight: 140,
                padding: '11px 13px',
                borderRadius: 9,
                border: '2px solid #e0e0f0',
                fontSize: 15,
                background: '#fafbff',
                boxSizing: 'border-box',
                lineHeight: 1.65,
                color: output ? '#1a1a2e' : '#bbb',
                whiteSpace: 'pre-wrap',
              }}
            >
              {output || '변환 결과가 여기에 표시됩니다'}
            </div>
          </div>
        </div>

        {/* 예시 — 규칙별 그룹 */}
        <div style={{ marginTop: 20 }}>
          {EXAMPLES.map((g) => (
            <div key={g.group} style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  color: '#999',
                  fontWeight: 700,
                  marginBottom: 6,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                {g.group}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {g.items.map((ex) => {
                  const live = romanize(ex.ko, {
                    casingOption: casing,
                    pronounce,
                    useDictionary: useDict,
                  })
                  const ok = live.toLowerCase() === ex.expect.toLowerCase()
                  const active = input === ex.ko
                  return (
                    <button
                      key={ex.ko}
                      onClick={() => setInput(ex.ko)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 7,
                        border: `1.5px solid ${active ? '#1a1a2e' : ok ? '#c8e6c9' : '#ffd6d6'}`,
                        background: active ? '#1a1a2e' : ok ? '#f1faf1' : '#fff8f8',
                        color: active ? '#fff' : '#333',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{ex.ko}</div>
                      <div
                        style={{
                          fontSize: 10,
                          marginTop: 1,
                          color: active ? '#9999cc' : ok ? '#4caf50' : '#e57373',
                        }}
                      >
                        {ok ? '✓' : '✗'} {live || '—'}{' '}
                        <span style={{ color: '#bbb' }}>({ex.expect})</span>
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
            marginTop: 16,
            padding: '13px 18px',
            background: '#fff',
            borderRadius: 10,
            border: '1px solid #eaeaf4',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 7 }}>
            📌 제2024-27호 적용 규칙
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '3px 20px',
              fontSize: 11,
              color: '#666',
              lineHeight: 1.9,
            }}
          >
            <div>
              • <b>구개음화</b>: 해돋이→haedoji, 같이→gachi
            </div>
            <div>
              • <b>격음화</b>: 좋고→joko, 잡혀→japyeo
            </div>
            <div>
              • <b>체언 ㅎ 보존</b>: 묵호→Mukho (2024-27)
            </div>
            <div>
              • <b>비음화</b>: 백마→Baengma, 종로→Jongno
            </div>
            <div>
              • <b>유음화</b>: 신라→Silla, 별내→Byeollae
            </div>
            <div>
              • <b>된소리 미반영</b>: 압구정→Apgujeong
            </div>
            <div>
              • <b>행정구역 붙임표</b>: 종로구→Jongno-gu (제5항)
            </div>
            <div>
              • <b>자연지물·문화재</b>: 붙임표 없이 (제6항)
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10, fontSize: 10, color: '#ccc', textAlign: 'center' }}>
          <a
            href='https://github.com/whoshe/koroman'
            target='_blank'
            rel='noopener noreferrer'
            style={{ color: '#bbb' }}
          >
            whoshe/koroman
          </a>
          {' · '}
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
