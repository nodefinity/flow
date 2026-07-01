import type { LandingCopy } from '../i18n/landing'
import { defaultLanguage, landingCopy, Language, supportedLanguages } from '../i18n/landing'

const storageKey = 'flow:landing-language'
const chineseRegions = new Set(['CN', 'HK', 'MO', 'SG', 'TW'])
const chineseTimeZones = new Set([
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Macau',
  'Asia/Singapore',
  'Asia/Taipei',
])

type AttributeName = 'alt' | 'aria-label' | 'placeholder'

const translatedAttributes: AttributeName[] = [
  'alt',
  'aria-label',
  'placeholder',
]

const translatedDatasetAttributes = [
  ['data-i18n-message-unavailable', 'messageUnavailable'],
  ['data-i18n-message-pending', 'messagePending'],
  ['data-i18n-message-success', 'messageSuccess'],
  ['data-i18n-message-error', 'messageError'],
] as const

const supportedLanguageSet = new Set<Language>(supportedLanguages)

const initialLanguage = detectLanguage()
applyLanguage(initialLanguage, { persist: Boolean(getQueryLanguage()) })
bindLanguageSwitcher()

function bindLanguageSwitcher() {
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element))
      return

    const option = event.target.closest('[data-language-option]')

    if (!(option instanceof HTMLElement))
      return

    const language = normalizeLanguage(option.dataset.languageOption)

    if (!language)
      return

    applyLanguage(language, {
      persist: true,
      updateUrl: true,
    })
  })
}

function detectLanguage(): Language {
  const queryLanguage = getQueryLanguage()

  if (queryLanguage)
    return queryLanguage

  const storedLanguage = readStoredLanguage()

  if (storedLanguage)
    return storedLanguage

  const locales = [
    ...(navigator.languages ?? []),
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().locale,
  ].filter(Boolean)

  if (locales.some(locale => locale.toLowerCase().startsWith('zh')))
    return Language.Chinese

  if (locales.some(locale => chineseRegions.has(getRegion(locale))))
    return Language.Chinese

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  if (chineseTimeZones.has(timeZone))
    return Language.Chinese

  if (locales.some(locale => locale.toLowerCase().startsWith('en')))
    return Language.English

  return defaultLanguage
}

function getQueryLanguage() {
  const params = new URLSearchParams(window.location.search)
  return normalizeLanguage(params.get('lang'))
}

function readStoredLanguage() {
  try {
    return normalizeLanguage(window.localStorage.getItem(storageKey))
  }
  catch {
    return null
  }
}

function normalizeLanguage(value: string | null | undefined): Language | null {
  if (!value)
    return null

  const normalized = value.trim().toLowerCase()

  if (normalized === Language.Chinese || normalized === 'cn' || normalized.startsWith('zh'))
    return Language.Chinese

  if (normalized === Language.English || normalized.startsWith('en'))
    return Language.English

  return supportedLanguageSet.has(normalized as Language)
    ? normalized as Language
    : null
}

function getRegion(locale: string) {
  const parts = locale.split(/[-_]/).filter(Boolean)

  for (const part of parts) {
    if (/^[a-z]{2}$/i.test(part) && part.toLowerCase() !== parts[0]?.toLowerCase())
      return part.toUpperCase()
  }

  return ''
}

function applyLanguage(language: Language, options: { persist?: boolean, updateUrl?: boolean } = {}) {
  const copy = landingCopy[language]

  document.documentElement.lang = copy.meta.htmlLang
  document.documentElement.dataset.locale = language
  document.title = copy.meta.title
  setMetaContent('meta[name="description"]', copy.meta.description)
  setMetaContent('meta[property="og:title"]', copy.meta.title)
  setMetaContent('meta[property="og:description"]', copy.meta.description)

  translateText(copy)
  translateAttributes(copy)
  translateDataset(copy)
  updateSwitcher(language)
  updateWaitlistStatus()

  if (options.persist)
    persistLanguage(language)

  if (options.updateUrl)
    updateUrlLanguage(language)

  document.dispatchEvent(new CustomEvent('flow:language-change', {
    detail: { language },
  }))
}

function translateText(copy: LandingCopy) {
  const elements = document.querySelectorAll<HTMLElement>('[data-i18n]')

  for (const element of elements) {
    const value = readCopyValue(copy, element.dataset.i18n)

    if (typeof value === 'string')
      element.textContent = value
  }
}

function translateAttributes(copy: LandingCopy) {
  for (const attribute of translatedAttributes) {
    const dataAttribute = `i18n${toDatasetSuffix(attribute)}`
    const elements = document.querySelectorAll<HTMLElement>(`[data-i18n-${attribute}]`)

    for (const element of elements) {
      const value = readCopyValue(copy, element.dataset[dataAttribute])

      if (typeof value === 'string')
        element.setAttribute(attribute, value)
    }
  }
}

function translateDataset(copy: LandingCopy) {
  for (const [attribute, datasetKey] of translatedDatasetAttributes) {
    const elements = document.querySelectorAll<HTMLElement>(`[${attribute}]`)

    for (const element of elements) {
      const value = readCopyValue(copy, element.getAttribute(attribute))

      if (typeof value === 'string')
        element.dataset[datasetKey] = value
    }
  }
}

function updateSwitcher(language: Language) {
  const options = document.querySelectorAll<HTMLElement>('[data-language-option]')

  for (const option of options) {
    const isActive = normalizeLanguage(option.dataset.languageOption) === language
    option.classList.toggle('is-active', isActive)
    option.setAttribute('aria-pressed', String(isActive))
  }
}

function updateWaitlistStatus() {
  const forms = document.querySelectorAll<HTMLElement>('[data-waitlist-form]')

  for (const form of forms) {
    const state = form.dataset.waitlistState
    const status = form.querySelector('[data-waitlist-status]')

    if (!state || !(status instanceof HTMLElement))
      continue

    const messageKey = `message${state.charAt(0).toUpperCase()}${state.slice(1)}`
    const message = form.dataset[messageKey]

    if (message)
      status.textContent = message
  }
}

function setMetaContent(selector: string, value: string) {
  const meta = document.querySelector<HTMLMetaElement>(selector)

  if (meta)
    meta.content = value
}

function persistLanguage(language: Language) {
  try {
    window.localStorage.setItem(storageKey, language)
  }
  catch {
    // Some privacy modes block localStorage. The current page still switches language.
  }
}

function updateUrlLanguage(language: Language) {
  const url = new URL(window.location.href)
  url.searchParams.set('lang', language)
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}

function readCopyValue(copy: LandingCopy, path: string | null | undefined): unknown {
  if (!path)
    return undefined

  return path.split('.').reduce<unknown>((value, key) => {
    if (value == null)
      return undefined

    if (Array.isArray(value)) {
      const index = Number(key)
      return Number.isInteger(index) ? value[index] : undefined
    }

    if (typeof value === 'object' && key in value)
      return (value as Record<string, unknown>)[key]

    return undefined
  }, copy)
}

function toDatasetSuffix(attribute: AttributeName) {
  return attribute
    .split('-')
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('')
}
