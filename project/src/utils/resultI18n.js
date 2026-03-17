export const RESULT_MODES = {
  queryPhonological: '查音位',
  queryMiddleChinese: '查中古'
}

const RESULT_TERM_KEYS = {
  聲母: 'result.terms.features.initial',
  韻母: 'result.terms.features.final',
  聲調: 'result.terms.features.tone',
  攝: 'result.terms.fields.she',
  韻: 'result.terms.fields.rime',
  呼: 'result.terms.fields.opening',
  等: 'result.terms.fields.grade',
  入: 'result.terms.fields.entering',
  調: 'result.terms.fields.toneCategory',
  部位: 'result.terms.fields.place',
  方式: 'result.terms.fields.manner',
  清濁: 'result.terms.fields.voicing',
  系: 'result.terms.fields.series',
  組: 'result.terms.fields.group',
  母: 'result.terms.fields.initialClass'
}

export function getResultModeId(modeRaw) {
  if (modeRaw === RESULT_MODES.queryPhonological) return 'phonological'
  if (modeRaw === RESULT_MODES.queryMiddleChinese) return 'character'
  return 'unknown'
}

export function translateResultTerm(t, term) {
  const key = RESULT_TERM_KEYS[term]
  return key ? t(key) : term
}

export function translateResultTerms(t, terms, separator = ' · ') {
  const translated = (terms || [])
    .filter(Boolean)
    .map(term => translateResultTerm(t, term))

  return translated.length > 0 ? translated.join(separator) : t('result.terms.none')
}
