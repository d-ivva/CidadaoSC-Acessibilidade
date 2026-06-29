import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import InfoBanner from '../components/InfoBanner'
import CaptchaMock from '../components/CaptchaMock'
import { SearchIcon } from '../components/Icons'
import { useLanguage } from '../i18n'

function formatDate(v) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2')
}

const PROTOCOLOS_VALIDOS = ['0202612542700', '1234567890']

export default function ConsultarPedido({ onBack, onNext }) {
  const { t } = useLanguage()
  const [protocolo, setProtocolo] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [robot, setRobot] = useState(false)
  const [erro, setErro] = useState(false)

  const valid =
    protocolo.trim().length > 0 &&
    nascimento.replace(/\D/g, '').length === 8 &&
    robot

  const handleProsseguir = () => {
    const encontrado = PROTOCOLOS_VALIDOS.includes(protocolo.trim())
    if (!encontrado) {
      setErro(true)
      return
    }
    setErro(false)
    onNext?.({ protocolo, nascimento })
  }

  return (
    <section className="page page-flow">
      <PageHeader
        icon={<SearchIcon size={22} />}
        breadcrumb={t('consulta.breadcrumb')}
        title={t('consulta.title')}
      />

      <div className="flow-body">
        <div className="form-stack form-stack-wide">
          <InfoBanner>
            {t('consulta.info')}
          </InfoBanner>

          <label className="field">
            <span className="field-label">
              {t('consulta.protocolo')}<span className="required">*</span>
            </span>
            <input
              type="text"
              className={`field-input ${erro ? 'field-input-error' : ''}`}
              value={protocolo}
              onChange={(e) => {
                setProtocolo(e.target.value)
                if (erro) setErro(false)
              }}
            />
            {erro && (
              <span className="field-error">{t('consultAg.erro')}</span>
            )}
          </label>

          <label className="field">
            <span className="field-label">
              {t('consulta.nascimento')}<span className="required">*</span>
            </span>
            <input
              type="text"
              className="field-input"
              placeholder="dd/mm/aaaa"
              value={nascimento}
              onChange={(e) => setNascimento(formatDate(e.target.value))}
              inputMode="numeric"
            />
          </label>

          <CaptchaMock checked={robot} onChange={setRobot} />

          {erro && (
            <div className="alert-error">{t('consultAg.erro')}</div>
          )}

          <div className="flow-actions-inline">
            <button type="button" className="btn-back" onClick={onBack}>
              {t('back')}
            </button>
            <button
              type="button"
              className="btn-next"
              onClick={handleProsseguir}
              disabled={!valid}
            >
              {t('next')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
