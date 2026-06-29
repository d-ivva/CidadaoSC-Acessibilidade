import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'
import InfoBanner from '../components/InfoBanner'
import { SearchIcon, CheckCircleIcon } from '../components/Icons'
import { useLanguage } from '../i18n'

const PROTOCOLO = '0202612550377'

export default function CancelarAgendamento({ email = 'seu e-mail', onBack, onNext }) {
  const { t } = useLanguage()
  const [step, setStep] = useState('confirm') // confirm | codigo | validado
  const [code, setCode] = useState('')
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (seconds <= 0) return
    const id = setInterval(() => setSeconds((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [seconds])

  const Header = () => (
    <PageHeader
      icon={<SearchIcon size={22} />}
      breadcrumb={t('cancelAg.breadcrumb')}
      title={t('cancelAg.title')}
    />
  )

  if (step === 'validado') {
    return (
      <section className="page page-flow">
        <Header />
        <div className="flow-body">
          <div className="validado-box">
            <CheckCircleIcon size={56} />
            <div>
              <strong>{t('cancelAg.validated')}</strong>
              <span>{t('cancelAg.canProceed')}</span>
            </div>
          </div>
          <Footer onBack={() => setStep('codigo')} onNext={onNext} />
        </div>
      </section>
    )
  }

  if (step === 'codigo') {
    return (
      <section className="page page-flow">
        <Header />
        <div className="flow-body">
          <InfoBanner tone="blue">
            {t('cancelAg.codeInfo')}
          </InfoBanner>

          <label className="field">
            <span className="field-label">
              {t('cancelAg.codeLabel')}<span className="required">*</span>
            </span>
            <input
              type="text"
              className="field-input"
              placeholder={t('cancelAg.codePlaceholder')}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>

          <button
            type="button"
            className="btn-blue btn-block"
            onClick={() => setStep('validado')}
            disabled={code.trim().length === 0}
          >
            {t('cancelAg.verify')}
          </button>

          <p className="resend-label">{t('cancelAg.resendNote')}</p>
          <button
            type="button"
            className="btn-outline-block"
            disabled={seconds > 0}
            onClick={() => setSeconds(60)}
          >
            {seconds > 0 ? `${t('cancelAg.resend')} (${seconds}s)` : t('cancelAg.resend')}
          </button>

          <Footer onBack={() => setStep('confirm')} nextDisabled />
        </div>
      </section>
    )
  }

  return (
    <section className="page page-flow">
      <Header />
      <div className="flow-body">
        <div className="cancel-confirm">
          <h2>{t('cancelAg.question')} #{PROTOCOLO}?</h2>
          <p>
            {t('cancelAg.validateIdentity')}
          </p>
          <div className="email-box">
            <span>{t('cancelAg.emailSentTo')}</span>
            <strong>{email}</strong>
          </div>
          <div className="cancel-confirm-actions">
            <button type="button" className="btn-back" onClick={onBack}>
              {t('back')}
            </button>
            <button type="button" className="btn-blue" onClick={() => setStep('codigo')}>
              {t('cancelAg.confirmSend')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
