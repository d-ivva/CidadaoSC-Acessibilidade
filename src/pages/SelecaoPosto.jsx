import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Stepper from '../components/Stepper'
import Footer from '../components/Footer'
import InfoBanner from '../components/InfoBanner'
import CaptchaMock from '../components/CaptchaMock'
import { TargetIcon, IdCardIcon, PinIcon } from '../components/Icons'
import { useLanguage } from '../i18n'

const HORARIO_PADRAO = 'Seg. a Sex.: 08:15 - 12:00 / 13:15 - 17:00'

const CIDADES = [
  {
    nome: 'Araranguá', postos: 1,
    endereco: 'Avenida Sete de Setembro, 2909',
    enderecoCompleto: 'Avenida Sete de Setembro, 2909, Centro, Araranguá, SC -',
    email: 'nrara@policiacientifica.sc.gov.br', telefone: '4835240000', horario: HORARIO_PADRAO,
  },
  {
    nome: 'Balneário Camboriú', postos: 1,
    endereco: 'Rua 2900, 100',
    enderecoCompleto: 'Rua 2900, 100, Centro, Balneário Camboriú, SC -',
    email: 'nrbc@policiacientifica.sc.gov.br', telefone: '4733670000', horario: HORARIO_PADRAO,
  },
  {
    nome: 'Blumenau', postos: 1,
    endereco: 'Rua XV de Novembro, 800',
    enderecoCompleto: 'Rua XV de Novembro, 800, Centro, Blumenau, SC -',
    email: 'nrblu@policiacientifica.sc.gov.br', telefone: '4733260000', horario: HORARIO_PADRAO,
  },
  {
    nome: 'Brusque', postos: 1,
    endereco: 'Rua Cônsul Carlos Renaux, 200',
    enderecoCompleto: 'Rua Cônsul Carlos Renaux, 200, Centro, Brusque, SC -',
    email: 'nrbru@policiacientifica.sc.gov.br', telefone: '4733960000', horario: HORARIO_PADRAO,
  },
  {
    nome: 'Criciúma', postos: 1,
    endereco: 'Av. Centenário, 1200',
    enderecoCompleto: 'Av. Centenário, 1200, Centro, Criciúma, SC -',
    email: 'nrcri@policiacientifica.sc.gov.br', telefone: '4834330000', horario: HORARIO_PADRAO,
  },
  {
    nome: 'Sombrio', postos: 1,
    endereco: 'Rua Teodoro Rodrigues de Oliveira, 658',
    enderecoCompleto: 'Rua Teodoro Rodrigues de Oliveira, 658, Centro, Sombrio, SC -',
    email: 'nrsmb@policiacientifica.sc.gov.br', telefone: '4835290371', horario: HORARIO_PADRAO,
  },
]

export default function SelecaoPosto({ onBack, onNext }) {
  const { t } = useLanguage()
  const [modo, setModo] = useState('cidade')
  const [busca, setBusca] = useState('')
  const [cep, setCep] = useState('')
  const [selecionado, setSelecionado] = useState(null)
  const [robot, setRobot] = useState(false)

  // Resultado por cidade (match exato) ou por CEP (8 dígitos => Sombrio, como no original).
  const posto = useMemo(() => {
    if (modo === 'cep') {
      return cep.replace(/\D/g, '').length === 8
        ? CIDADES.find((c) => c.nome === 'Sombrio')
        : null
    }
    if (!busca) return null
    return CIDADES.find((c) => c.nome.toLowerCase() === busca.trim().toLowerCase())
  }, [modo, cep, busca])

  const cidadesFiltradas = useMemo(() => {
    if (!busca) return CIDADES
    return CIDADES.filter((c) =>
      c.nome.toLowerCase().includes(busca.trim().toLowerCase())
    )
  }, [busca])

  return (
    <section className="page page-flow">
      <PageHeader
        icon={<TargetIcon size={22} />}
        breadcrumb={t('selPosto.breadcrumb')}
        title={t('selPosto.title')}
        stepper={<Stepper total={5} current={1} />}
      />

      <div className="flow-body">
        <InfoBanner>
          {t('selPosto.info')}
        </InfoBanner>

        <div className="field-group">
          <span className="field-label">{t('selPosto.searchBy')}</span>
          <div className="radio-row">
            <label className="radio">
              <input
                type="radio"
                name="modo-ag"
                checked={modo === 'cidade'}
                onChange={() => { setModo('cidade'); setSelecionado(null) }}
              />
              <span>{t('selPosto.city')}</span>
            </label>
            <label className="radio">
              <input
                type="radio"
                name="modo-ag"
                checked={modo === 'cep'}
                onChange={() => { setModo('cep'); setSelecionado(null) }}
              />
              <span>{t('selPosto.cep')}</span>
            </label>
          </div>
        </div>

        {modo === 'cidade' ? (
          <label className="field">
            <span className="field-label">{t('selPosto.searchCity')}</span>
            <input
              type="text"
              className="field-input field-input-highlight"
              placeholder={t('selPosto.searchCityPlaceholder')}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </label>
        ) : (
          <label className="field">
            <span className="field-label">{t('selPosto.searchCep')}</span>
            <input
              type="text"
              className="field-input field-input-highlight"
              placeholder="00000-000"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              inputMode="numeric"
            />
          </label>
        )}

        {posto ? (
          <div className="postos">
            <h3 className="postos-title">{t('selPosto.available')}<span className="required">*</span></h3>
            <button
              type="button"
              className={`posto-card ${selecionado?.nome === posto.nome ? 'is-selected' : ''}`}
              onClick={() => setSelecionado(posto)}
            >
              <div className="posto-card-head">
                <span className="posto-icon"><IdCardIcon size={22} /></span>
                <strong>PCI - {posto.nome.toUpperCase()}</strong>
                <span className="posto-radio" aria-hidden />
              </div>
              <div className="posto-card-body">
                <PinIcon size={14} />
                <div>
                  <strong>{posto.nome}</strong>
                  <div>{posto.endereco}</div>
                </div>
              </div>
            </button>
          </div>
        ) : modo === 'cidade' ? (
          <div className="cidades-list">
            <h3 className="cidades-title">{t('selPosto.allCities')}</h3>
            <ul>
              {cidadesFiltradas.map((c) => (
                <li key={c.nome}>
                  <button type="button" className="cidade-row" onClick={() => setBusca(c.nome)}>
                    <span className="cidade-row-left">
                      <span className="cidade-pin"><PinIcon size={16} /></span>
                      {c.nome}
                    </span>
                    <span className="cidade-row-right">{c.postos} {t('selPosto.unit')}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="footer-captcha">
          <CaptchaMock checked={robot} onChange={setRobot} />
        </div>
      </div>

      <Footer
        onBack={onBack}
        onNext={() => onNext?.(selecionado)}
        nextDisabled={!selecionado || !robot}
      />
    </section>
  )
}
