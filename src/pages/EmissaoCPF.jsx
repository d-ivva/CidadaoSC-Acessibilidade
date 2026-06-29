import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import CaptchaMock from '../components/CaptchaMock'
import { IdCardIcon } from '../components/Icons'
import { useLanguage } from '../i18n'

function formatCPF(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export default function EmissaoCPF({ onBack, onNext, onForgotCPF }) {
  const { t } = useLanguage()
  const [cpf, setCpf] = useState('')
  const [robot, setRobot] = useState(false)

  const valid = cpf.replace(/\D/g, '').length === 11 && robot

  return (
    <section className="page page-flow">
      <PageHeader
        icon={<IdCardIcon size={24} />}
        breadcrumb={t('cpf.breadcrumb')}
        title={t('cpf.title')}
      />

      <div className="flow-body">
        <div className="form-stack">
          <label className="field">
            <span className="field-label">{t('cpf.label')}<span className="required">*</span></span>
            <input
              type="text"
              className="field-input"
              placeholder={t('cpf.placeholder')}
              value={cpf}
              onChange={(e) => setCpf(formatCPF(e.target.value))}
              inputMode="numeric"
            />
          </label>

          <CaptchaMock checked={robot} onChange={setRobot} />

          <div className="flow-actions-inline">
            <button type="button" className="btn-back" onClick={onBack}>
              {t('back')}
            </button>
            <button
              type="button"
              className="btn-next"
              onClick={() => onNext?.({ cpf })}
              disabled={!valid}
            >
              {t('next')}
            </button>
          </div>

          <button type="button" className="btn-forgot-cpf" onClick={onForgotCPF}>
            {t('cpf.forgot')}
          </button>
        </div>
      </div>
    </section>
  )
}
