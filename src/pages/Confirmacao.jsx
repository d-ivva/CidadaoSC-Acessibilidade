import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import Stepper from '../components/Stepper'
import Footer from '../components/Footer'
import { CalendarIcon, ClockIcon } from '../components/Icons'
import { useLanguage } from '../i18n'

function Linha({ label, value }) {
  return (
    <div className="conf-linha">
      <span className="conf-label">{label}</span>
      <span className="conf-value">{value}</span>
    </div>
  )
}

export default function Confirmacao({ requerente, posto, onBack, onNext }) {
  const { t } = useLanguage()
  const [acordo, setAcordo] = useState(false)
  const r = requerente || {}
  const p = posto || {}

  return (
    <section className="page page-flow">
      <PageHeader
        icon={<CalendarIcon size={24} />}
        breadcrumb={t('conf.breadcrumb')}
        title={t('conf.title')}
        stepper={<Stepper total={5} current={4} />}
      />

      <div className="flow-body flow-body-wide">
        <div className="conf-wrap">
          <div className="conf-card">
            <div className="conf-card-head"><h3>{t('conf.requerente')}</h3></div>
            <Linha label={t('cpf.label')} value={r.cpf || t('conf.notInformed')} />
            <Linha label={t('conf.telefone')} value={r.telefone} />
            <Linha label={t('conf.email')} value={r.email} />
          </div>

          <div className="conf-card">
            <div className="conf-card-head"><h3>{t('conf.local')}</h3></div>
            <Linha label={t('conf.postoRetirada')} value={`PCI - ${(p.nome || '').toUpperCase()}`} />
            <Linha label={t('conf.endereco')} value={p.enderecoCompleto || p.endereco} />
            <div className="conf-linha">
              <span className="conf-label">{t('conf.horario')}</span>
              <span className="conf-value">{t('conf.weekdays')}</span>
              <span className="chip chip-muted"><ClockIcon size={14} />{p.horarioChip}</span>
            </div>
            <Linha label={t('conf.email')} value={p.email} />
            <Linha label={t('conf.telefoneField')} value={p.telefone} />
          </div>
        </div>

        <label className="checkbox conf-checkbox">
          <input type="checkbox" checked={acordo} onChange={(e) => setAcordo(e.target.checked)} />
          <span>{t('conf.agree')}<span className="required">*</span></span>
        </label>
      </div>

      <Footer onBack={onBack} onNext={onNext} nextDisabled={!acordo} />
    </section>
  )
}
