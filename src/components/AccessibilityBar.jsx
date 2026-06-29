import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n'
import './AccessibilityBar.css'

const STORAGE_KEY = 'a11y-settings'
const FONT_MIN = 12
const FONT_MAX = 28
const FONT_STEP = 2

const DEFAULTS = {
  fontPx: 16,
  theme: 'normal', // normal | dark | blue | sepia | contrast
  images: 'show', // show | hide | gray
  line: 'normal', // normal | media | max
  letter: 'normal', // normal | media | max
  font: 'arial', // arial | dyslexic
  media: 'on', // on | off
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return { ...DEFAULTS }
}

/* ====================================================================
   Leitor de tela por foco/hover — descreve apenas o elemento atual
   ==================================================================== */

// Elementos que valem a pena anunciar (resolvemos o hover/foco até o mais próximo).
const READ_SELECTOR =
  'button, a, [role="button"], [role="dialog"], [role="note"], [role="status"], [role="alert"], input, select, textarea, label, img, h1, h2, h3, h4, h5, p, li, summary, .info-banner, .field-label, .field-hint, .resumo-label, .resumo-value, .chip, .posto-card-name, .posto-card-address, .page-header-breadcrumb'

function resolveReadable(target) {
  if (!(target instanceof Element)) return null
  return target.closest(READ_SELECTOR)
}

function roleWord(el, t) {
  const tag = el.tagName.toLowerCase()
  const role = el.getAttribute('role')
  if (tag === 'button' || role === 'button') return t('role.button')
  if (tag === 'a') return t('role.link')
  if (tag === 'img' || role === 'img') return t('role.image')
  if (tag === 'select') return t('role.select')
  if (tag === 'textarea') return t('role.textarea')
  if (tag === 'input') {
    const tp = (el.getAttribute('type') || 'text').toLowerCase()
    if (tp === 'checkbox') return t('role.checkbox')
    if (tp === 'radio') return t('role.radio')
    return t('role.textfield')
  }
  if (/^h[1-4]$/.test(tag)) return t('role.heading')
  return ''
}

// Nome acessível: aria-label > aria-labelledby > alt > label do campo > placeholder > title > texto.
function accessibleName(el) {
  const aria = el.getAttribute('aria-label')
  if (aria && aria.trim()) return aria.trim()

  const labelledby = el.getAttribute('aria-labelledby')
  if (labelledby) {
    const txt = labelledby
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent || '')
      .join(' ')
      .trim()
    if (txt) return txt
  }

  const tag = el.tagName.toLowerCase()

  if (tag === 'img') return (el.getAttribute('alt') || '').trim()

  if (tag === 'input' || tag === 'select' || tag === 'textarea') {
    let label = ''
    if (el.id) {
      const l = document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
      if (l) label = l.textContent.trim()
    }
    if (!label) {
      const wrap = el.closest('label')
      if (wrap) label = wrap.textContent.trim()
    }
    if (!label) label = (el.getAttribute('placeholder') || '').trim()
    return label
  }

  const title = el.getAttribute('title')
  if (title && title.trim()) return title.trim()

  // innerText respeita limites de bloco (evita juntar "TítuloDescrição").
  return (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim()
}

// Estado extra (marcada/ativada) para componentes interativos.
function stateSuffix(el, t) {
  const tag = el.tagName.toLowerCase()
  if (tag === 'input') {
    const tp = (el.getAttribute('type') || '').toLowerCase()
    if (tp === 'checkbox') return el.checked ? t('state.checked') : t('state.unchecked')
    if (tp === 'radio') return el.checked ? t('state.selected') : t('state.unselected')
  }
  const pressed = el.getAttribute('aria-pressed')
  if (pressed === 'true') return t('state.pressed')
  const expanded = el.getAttribute('aria-expanded')
  if (expanded === 'true') return t('state.expanded')
  if (expanded === 'false') return t('state.collapsed')
  if (el.disabled) return t('state.disabled')
  return ''
}

function describeElement(el, t) {
  const name = accessibleName(el)
  if (!name) return ''
  const role = roleWord(el, t)
  const prefix = role ? `${role}, ` : ''
  return `${prefix}${name}${stateSuffix(el, t)}`.slice(0, 400)
}

function speakText(text, langCode) {
  if (!window.speechSynthesis || !text) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = langCode || 'pt-BR'
  window.speechSynthesis.cancel() // evita leituras sobrepostas/duplicadas
  window.speechSynthesis.speak(u)
}

/* ---------- ícones inline (decorativos, aria-hidden) ---------- */
const I = {
  font: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 6h7l-.3 2H9v9H7V8H4.7L5 6Zm9 4h6l-.25 1.6H18V18h-1.6v-6.4H14.3L14 10Z" /></svg>,
  palette: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 0 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1 .8-1.5 1.7-1.5H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7Zm-5 9a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm2.5-4A1.3 1.3 0 1 1 9.5 5.4 1.3 1.3 0 0 1 9.5 8Zm5 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm3 3.5a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Z" /></svg>,
  image: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" d="M4 5h16v14H4z" /><circle cx="9" cy="10" r="1.5" fill="currentColor" /><path fill="none" stroke="currentColor" strokeWidth="2" d="m5 17 4-4 3 3 3-3 4 4" /></svg>,
  tts: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4Z" /><path fill="none" stroke="currentColor" strokeWidth="1.8" d="M16 9a4 4 0 0 1 0 6" /></svg>,
  gear: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 4 2-1.5-2-3.5-2.4 1a6.6 6.6 0 0 0-1.4-.8L15.8 4H12.2l-.4 2.4a6.6 6.6 0 0 0-1.4.8L8 6.2 6 9.7 8 11.2a6.7 6.7 0 0 0 0 1.6L6 14.3l2 3.5 2.4-1c.4.3 1 .6 1.4.8l.4 2.4h3.6l.4-2.4c.5-.2 1-.5 1.4-.8l2.4 1 2-3.5-2-1.5a6.7 6.7 0 0 0 0-1.6Z" /></svg>,
  eye: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" fill="currentColor" /></svg>,
  eyeOff: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" d="M4 4l16 16M9.5 9.6A2.5 2.5 0 0 0 12 14.5M6 6.6C3.6 8 2 12 2 12s3.5 6 10 6c1.7 0 3.2-.4 4.5-1M9.5 5.2A9.7 9.7 0 0 1 12 6c6.5 0 10 6 10 6a16 16 0 0 1-2.4 3" /></svg>,
  contrast: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path fill="currentColor" d="M12 3a9 9 0 0 1 0 18V3Z" /></svg>,
  volume: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4Z" /><path fill="none" stroke="currentColor" strokeWidth="1.8" d="M16 8a5 5 0 0 1 0 8M18.5 5.5a8 8 0 0 1 0 13" /></svg>,
  volumeOff: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4Z" /><path fill="none" stroke="currentColor" strokeWidth="2" d="m16 9 5 6M21 9l-5 6" /></svg>,
  chevronDown: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>,
  power: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 3v9M7.5 6.5a7 7 0 1 0 9 0" /></svg>,
  minimize: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5 4 5 4 10M15 5h5v5M9 19H4v-5M15 19h5v-5" /></svg>,
  reset: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 9a8 8 0 1 1-1 4" /><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5" /></svg>,
  chevronUp: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="m6 15 6-6 6 6" /></svg>,
  lineHeight: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M5 4v16m-2.5-2.5L5 20l2.5-2.5M7.5 6.5 5 4 2.5 6.5M11 6h10M11 12h10M11 18h10" /></svg>,
  letterSpacing: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M3 20V8m18 12V8M7 16l3-8 3 8m-5-3h4" /></svg>,
  fontStyle: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 18 10 6h2l4 12h-2l-1-3H9l-1 3H6Zm3.5-5h3L11 8.5 9.5 13Z" /><path fill="none" stroke="currentColor" strokeWidth="1.6" d="M17 16h3" /></svg>,
  media: <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2" d="M3 5h18v12H3z" /><path fill="currentColor" d="M10 9v4l4-2-4-2Z" /></svg>,
  globe: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path fill="none" stroke="currentColor" strokeWidth="1.5" d="M3 12h18M12 3c-2.5 3-3 6-3 9s.5 6 3 9c2.5-3 3-6 3-9s-.5-6-3-9Z" /></svg>,
}

const LANGS = [
  { id: 'pt-BR', label: 'PT', full: 'Português' },
  { id: 'en', label: 'EN', full: 'English' },
  { id: 'es', label: 'ES', full: 'Español' },
]

function SegButton({ active, onClick, children, label }) {
  return (
    <button
      type="button"
      className={`a11y-seg ${active ? 'is-active' : ''}`}
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default function AccessibilityBar() {
  const { t, lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const [advanced, setAdvanced] = useState(true)
  const [readerOn, setReaderOn] = useState(false)
  const [settings, setSettings] = useState(loadSettings)
  const launcherRef = useRef(null)
  const panelRef = useRef(null)
  const lastReadRef = useRef(null)
  const hoverTimerRef = useRef(null)

  const langCode = t('lang.code')

  const set = (patch) => setSettings((s) => ({ ...s, ...patch }))

  // Aplica as preferências ao documento + persiste.
  useEffect(() => {
    const html = document.documentElement
    const { fontPx, theme, images, line, letter, font, media } = settings

    html.classList.remove('a11y-theme-dark', 'a11y-theme-blue', 'a11y-theme-sepia', 'a11y-theme-contrast')
    if (theme !== 'normal') html.classList.add(`a11y-theme-${theme}`)

    html.classList.remove('a11y-line-media', 'a11y-line-max')
    if (line !== 'normal') html.classList.add(`a11y-line-${line}`)

    html.classList.remove('a11y-letter-media', 'a11y-letter-max')
    if (letter !== 'normal') html.classList.add(`a11y-letter-${letter}`)

    html.classList.toggle('a11y-font-dyslexic', font === 'dyslexic')

    html.classList.remove('a11y-img-hide', 'a11y-img-gray')
    if (images === 'hide') html.classList.add('a11y-img-hide')
    if (images === 'gray') html.classList.add('a11y-img-gray')

    html.classList.toggle('a11y-media-off', media === 'off')

    const app = document.querySelector('.app')
    if (app) app.style.zoom = fontPx === 16 ? '' : String(fontPx / 16)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* ignore */
    }
  }, [settings])

  // Marca o documento quando o painel está aberto (empurra o conteúdo).
  useEffect(() => {
    document.documentElement.classList.toggle('a11y-panel-open', open)
  }, [open])

  // Leitor de tela: anuncia APENAS o elemento sob foco/hover (não a página toda).
  useEffect(() => {
    if (!readerOn) {
      window.speechSynthesis?.cancel()
      lastReadRef.current = null
      return
    }

    const announce = (target) => {
      const el = resolveReadable(target)
      if (!el || el === lastReadRef.current) return
      const text = describeElement(el, t)
      if (!text) return
      lastReadRef.current = el
      speakText(text, langCode)
    }

    const onFocusIn = (e) => announce(e.target)
    const onOver = (e) => {
      clearTimeout(hoverTimerRef.current)
      const target = e.target
      hoverTimerRef.current = setTimeout(() => announce(target), 120)
    }

    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('mouseover', onOver)
    speakText(t('a11y.readerActivated'), langCode)

    return () => {
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('mouseover', onOver)
      clearTimeout(hoverTimerRef.current)
      window.speechSynthesis?.cancel()
    }
  }, [readerOn, t, langCode])

  // Para a leitura ao desmontar.
  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  const openPanel = () => setOpen(true)
  const closePanel = () => {
    setOpen(false)
    launcherRef.current?.focus()
  }

  const changeFont = (dir) => {
    setSettings((s) => {
      const next = Math.min(FONT_MAX, Math.max(FONT_MIN, s.fontPx + dir * FONT_STEP))
      return { ...s, fontPx: next }
    })
  }

  const reset = () => {
    setReaderOn(false)
    setSettings({ ...DEFAULTS })
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') closePanel()
  }

  if (!open) {
    return (
      <button
        type="button"
        ref={launcherRef}
        className="a11y-launcher"
        onClick={openPanel}
        aria-label={t('a11y.open')}
        title={t('a11y.openTitle')}
      >
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="currentColor" />
          <circle cx="12" cy="5.6" r="1.7" fill="#fff" />
          <path fill="#fff" d="M4.8 8.6c2.3.9 4.5 1.3 7.2 1.3s4.9-.4 7.2-1.3l.5 1.7c-1.8.7-3.6 1.1-5.5 1.3l.7 7.8-1.8.2-.8-6.7-.8 6.7-1.8-.2.7-7.8c-1.9-.2-3.7-.6-5.5-1.3l.5-1.7Z" />
        </svg>
      </button>
    )
  }

  const themes = [
    { id: 'normal', label: t('a11y.themeNormal') },
    { id: 'dark', label: t('a11y.themeDark') },
    { id: 'blue', label: t('a11y.themeBlue') },
    { id: 'sepia', label: t('a11y.themeSepia') },
    { id: 'contrast', label: t('a11y.themeContrast') },
  ]

  return (
    <section
      className="a11y-bar"
      role="region"
      aria-label={t('a11y.region')}
      ref={panelRef}
      onKeyDown={onKeyDown}
    >
      <div className="a11y-row a11y-row-top">
        {/* IDIOMA */}
        <div className="a11y-group" role="group" aria-label={t('a11y.langGroup')}>
          <span className="a11y-title">
            <span className="a11y-title-icon">{I.globe}</span>
            {t('a11y.language')}
          </span>
          <div className="a11y-controls">
            {LANGS.map((l) => (
              <SegButton
                key={l.id}
                active={lang === l.id}
                onClick={() => setLang(l.id)}
                label={l.full}
              >
                {l.label}
              </SegButton>
            ))}
          </div>
        </div>

        {/* TAMANHO DA FONTE */}
        <div className="a11y-group" role="group" aria-label={t('a11y.fontSize')}>
          <span className="a11y-title">
            <span className="a11y-title-icon">{I.font}</span>
            {t('a11y.fontSize')} {settings.fontPx}px
          </span>
          <div className="a11y-controls">
            <button
              type="button"
              className="a11y-btn"
              onClick={() => changeFont(-1)}
              disabled={settings.fontPx <= FONT_MIN}
              aria-label={t('a11y.fontDecrease')}
            >
              <span aria-hidden="true">−</span>
            </button>
            <button
              type="button"
              className="a11y-btn"
              onClick={() => changeFont(1)}
              disabled={settings.fontPx >= FONT_MAX}
              aria-label={t('a11y.fontIncrease')}
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>
        </div>

        {/* TEMA */}
        <div className="a11y-group" role="group" aria-label={t('a11y.themeGroup')}>
          <span className="a11y-title">
            <span className="a11y-title-icon">{I.palette}</span>{t('a11y.theme')}
          </span>
          <div className="a11y-controls">
            {themes.map((th) => (
              <button
                key={th.id}
                type="button"
                className={`a11y-theme a11y-theme-sw-${th.id} ${settings.theme === th.id ? 'is-active' : ''}`}
                aria-pressed={settings.theme === th.id}
                aria-label={th.label}
                title={th.label}
                onClick={() => set({ theme: th.id })}
              >
                A
              </button>
            ))}
          </div>
        </div>

        {/* IMAGENS */}
        <div className="a11y-group" role="group" aria-label={t('a11y.imagesGroup')}>
          <span className="a11y-title">
            <span className="a11y-title-icon">{I.image}</span>{t('a11y.images')}
          </span>
          <div className="a11y-controls">
            <SegButton active={settings.images === 'show'} onClick={() => set({ images: 'show' })} label={t('a11y.imagesShow')}>
              {I.eye}
            </SegButton>
            <SegButton active={settings.images === 'hide'} onClick={() => set({ images: 'hide' })} label={t('a11y.imagesHide')}>
              {I.eyeOff}
            </SegButton>
            <SegButton active={settings.images === 'gray'} onClick={() => set({ images: 'gray' })} label={t('a11y.imagesGray')}>
              {I.contrast}
            </SegButton>
          </div>
        </div>

        {/* TTS / LEITOR DE TELA */}
        <div className="a11y-group" role="group" aria-label={t('a11y.readerGroup')}>
          <span className="a11y-title">
            <span className="a11y-title-icon">{I.tts}</span>{t('a11y.reader')}
          </span>
          <div className="a11y-controls">
            <SegButton active={readerOn} onClick={() => setReaderOn(true)} label={t('a11y.readerOn')}>
              {I.volume}
            </SegButton>
            <SegButton active={!readerOn} onClick={() => setReaderOn(false)} label={t('a11y.readerOff')}>
              {I.volumeOff}
            </SegButton>
          </div>
        </div>

        {/* CONFIGURAÇÕES */}
        <div className="a11y-group" role="group" aria-label={t('a11y.settingsGroup')}>
          <span className="a11y-title">
            <span className="a11y-title-icon">{I.gear}</span>{t('a11y.settings')}
          </span>
          <div className="a11y-controls">
            <button
              type="button"
              className="a11y-action"
              aria-expanded={advanced}
              aria-label={advanced ? t('a11y.collapse') : t('a11y.expand')}
              onClick={() => setAdvanced((a) => !a)}
            >
              <span className="a11y-action-icon" aria-hidden="true">
                <span className={`a11y-chev ${advanced ? 'is-up' : ''}`}>{I.chevronDown}</span>
              </span>
              {advanced ? t('a11y.lessOptions') : t('a11y.moreOptions')}
            </button>
            <button type="button" className="a11y-action" aria-label={t('a11y.reset')} onClick={reset}>
              <span className="a11y-action-icon" aria-hidden="true">{I.reset}</span>
              {t('a11y.resetBtn')}
            </button>
            <button type="button" className="a11y-action" aria-label={t('a11y.closePanel')} onClick={closePanel}>
              <span className="a11y-action-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" d="M6 6l12 12M18 6 6 18" /></svg>
              </span>
              {t('a11y.closePanelBtn')}
            </button>
          </div>
        </div>
      </div>

      {advanced && (
        <div className="a11y-row a11y-row-advanced">
          {/* ALTURA DA LINHA */}
          <div className="a11y-group" role="group" aria-label={t('a11y.lineHeight')}>
            <span className="a11y-title">
              <span className="a11y-title-icon">{I.lineHeight}</span>{t('a11y.lineHeight')}
            </span>
            <div className="a11y-controls">
              <SegButton active={settings.line === 'normal'} onClick={() => set({ line: 'normal' })} label={t('a11y.lineNormal')}>{t('a11y.normal')}</SegButton>
              <SegButton active={settings.line === 'media'} onClick={() => set({ line: 'media' })} label={t('a11y.lineMedium')}>{t('a11y.medium')}</SegButton>
              <SegButton active={settings.line === 'max'} onClick={() => set({ line: 'max' })} label={t('a11y.lineMax')}>{t('a11y.max')}</SegButton>
            </div>
          </div>

          {/* ESPAÇAMENTO ENTRE LETRAS */}
          <div className="a11y-group" role="group" aria-label={t('a11y.letterSpacing')}>
            <span className="a11y-title">
              <span className="a11y-title-icon">{I.letterSpacing}</span>{t('a11y.letterSpacing')}
            </span>
            <div className="a11y-controls">
              <SegButton active={settings.letter === 'normal'} onClick={() => set({ letter: 'normal' })} label={t('a11y.letterNormal')}>{t('a11y.normal')}</SegButton>
              <SegButton active={settings.letter === 'media'} onClick={() => set({ letter: 'media' })} label={t('a11y.letterMedium')}>{t('a11y.medium')}</SegButton>
              <SegButton active={settings.letter === 'max'} onClick={() => set({ letter: 'max' })} label={t('a11y.letterMax')}>{t('a11y.max')}</SegButton>
            </div>
          </div>

          {/* ESTILO DE FONTE */}
          <div className="a11y-group" role="group" aria-label={t('a11y.fontStyle')}>
            <span className="a11y-title">
              <span className="a11y-title-icon">{I.fontStyle}</span>{t('a11y.fontStyle')}
            </span>
            <div className="a11y-controls">
              <SegButton active={settings.font === 'arial'} onClick={() => set({ font: 'arial' })} label={t('a11y.fontArial')}>Arial</SegButton>
              <SegButton active={settings.font === 'dyslexic'} onClick={() => set({ font: 'dyslexic' })} label={t('a11y.fontDyslexic')}>
                <span className="a11y-dys">OpenDyslexic</span>
              </SegButton>
            </div>
          </div>

          {/* MÍDIAS EXTERNAS */}
          <div className="a11y-group" role="group" aria-label={t('a11y.mediaExt')}>
            <span className="a11y-title">
              <span className="a11y-title-icon">{I.media}</span>{t('a11y.mediaExt')}
            </span>
            <div className="a11y-controls">
              <SegButton active={settings.media === 'on'} onClick={() => set({ media: 'on' })} label={t('a11y.mediaOn')}>{t('a11y.enabled')}</SegButton>
              <SegButton active={settings.media === 'off'} onClick={() => set({ media: 'off' })} label={t('a11y.mediaOff')}>{t('a11y.disabled')}</SegButton>
            </div>
          </div>


        </div>
      )}
    </section>
  )
}
