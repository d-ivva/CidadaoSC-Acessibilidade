import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Stepper from '../components/Stepper'
import Footer from '../components/Footer'
import InfoBanner from '../components/InfoBanner'
import { CalendarIcon, IdCardIcon, PinIcon } from '../components/Icons'
import { useLanguage } from '../i18n'

const HORARIO_CHIP = 'Seg. a Sex.: 08:00 - 11:30 / 13:00 - 16:30'

const CIDADES = [
  {
    nome: 'Araranguá', postos: 1, endereco: 'Avenida Sete de Setembro, 2909',
    enderecoCompleto: 'Avenida Sete de Setembro, 2909 - Bairro Vila São José - Araranguá - SC',
    horarioChip: HORARIO_CHIP, email: 'sicv.nrara@policiacientifica.sc.gov.br', telefone: '(48) 3529-0111',
  },
  {
    nome: 'Balneário Camboriú', postos: 1, endereco: 'Rua 2900, 100',
    enderecoCompleto: 'Rua 2900, 100 - Centro - Balneário Camboriú - SC',
    horarioChip: HORARIO_CHIP, email: 'sicv.nrbc@policiacientifica.sc.gov.br', telefone: '(47) 3367-0000',
  },
  {
    nome: 'Balneário Rincão', postos: 1, endereco: 'Av. Beira-Mar, 500',
    enderecoCompleto: 'Av. Beira-Mar, 500 - Centro - Balneário Rincão - SC',
    horarioChip: HORARIO_CHIP, email: 'sicv.nrbr@policiacientifica.sc.gov.br', telefone: '(48) 3443-0000',
  },
  {
    nome: 'Blumenau', postos: 1, endereco: 'Rua XV de Novembro, 800',
    enderecoCompleto: 'Rua XV de Novembro, 800 - Centro - Blumenau - SC',
    horarioChip: HORARIO_CHIP, email: 'sicv.nrblu@policiacientifica.sc.gov.br', telefone: '(47) 3326-0000',
  },
  {
    nome: 'Brusque', postos: 1, endereco: 'Rua Cônsul Carlos Renaux, 200',
    enderecoCompleto: 'Rua Cônsul Carlos Renaux, 200 - Centro - Brusque - SC',
    horarioChip: HORARIO_CHIP, email: 'sicv.nrbru@policiacientifica.sc.gov.br', telefone: '(47) 3396-0000',
  },
  {
    nome: 'Caçador', postos: 1, endereco: 'Av. Santa Catarina, 300',
    enderecoCompleto: 'Av. Santa Catarina, 300 - Centro - Caçador - SC',
    horarioChip: HORARIO_CHIP, email: 'sicv.nrcac@policiacientifica.sc.gov.br', telefone: '(49) 3563-0000',
  },
  {
    nome: 'Campos Novos', postos: 1, endereco: 'Rua Expedicionário, 50',
    enderecoCompleto: 'Rua Expedicionário, 50 - Centro - Campos Novos - SC',
    horarioChip: HORARIO_CHIP, email: 'sicv.nrcn@policiacientifica.sc.gov.br', telefone: '(49) 3541-0000',
  },
]

export default function PostoRetirada({ onBack, onNext }) {
  const { t } = useLanguage()
  const [modo, setModo] = useState('cidade')
  const [busca, setBusca] = useState('')
  const [cep, setCep] = useState('')
  const [postoId, setPostoId] = useState(null)

  const cidadeSelecionada = useMemo(() => {
    if (!busca) return null
    return CIDADES.find(
      (c) => c.nome.toLowerCase() === busca.trim().toLowerCase()
    )
  }, [busca])

  const cidadesFiltradas = useMemo(() => {
    if (!busca) return CIDADES
    return CIDADES.filter((c) =>
      c.nome.toLowerCase().includes(busca.trim().toLowerCase())
    )
  }, [busca])

  return (
    <section className="page page-flow">
      <PageHeader
        icon={<CalendarIcon size={24} />}
        title={t('posto.title')}
        stepper={<Stepper total={5} current={1} />}
      />

      <div className="flow-body">
        <InfoBanner>
          {t('posto.info')}
        </InfoBanner>

        <div className="field-group">
          <span className="field-label">{t('posto.searchBy')}</span>
          <div className="radio-row">
            <label className="radio">
              <input
                type="radio"
                name="modo"
                checked={modo === 'cidade'}
                onChange={() => setModo('cidade')}
              />
              <span>{t('posto.city')}</span>
            </label>
            <label className="radio">
              <input
                type="radio"
                name="modo"
                checked={modo === 'cep'}
                onChange={() => setModo('cep')}
              />
              <span>{t('posto.cep')}</span>
            </label>
          </div>
        </div>

        {modo === 'cidade' ? (
          <label className="field">
            <span className="field-label">{t('posto.searchCity')}</span>
            <input
              type="text"
              className="field-input field-input-highlight"
              placeholder={t('posto.searchCityPlaceholder')}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </label>
        ) : (
          <label className="field">
            <span className="field-label">{t('posto.cep')}</span>
            <input
              type="text"
              className="field-input"
              placeholder="00000-000"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              inputMode="numeric"
            />
          </label>
        )}

        {cidadeSelecionada ? (
          <div className="postos">
            <h3 className="postos-title">{t('posto.available')}<span className="required">*</span></h3>
            <button
              type="button"
              className={`posto-card ${postoId === cidadeSelecionada.nome ? 'is-selected' : ''}`}
              onClick={() => setPostoId(cidadeSelecionada.nome)}
            >
              <div className="posto-card-head">
                <span className="posto-icon">
                  <IdCardIcon size={22} />
                </span>
                <strong>PCI - {cidadeSelecionada.nome.toUpperCase()}</strong>
                <span className="posto-radio" aria-hidden />
              </div>
              <div className="posto-card-body">
                <PinIcon size={14} />
                <div>
                  <strong>{cidadeSelecionada.nome}</strong>
                  <div>{cidadeSelecionada.endereco}</div>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="cidades-list">
            <h3 className="cidades-title">{t('posto.allCities')}</h3>
            <ul>
              {cidadesFiltradas.map((c) => (
                <li key={c.nome}>
                  <button
                    type="button"
                    className="cidade-row"
                    onClick={() => setBusca(c.nome)}
                  >
                    <span className="cidade-row-left">
                      <span className="cidade-pin"><PinIcon size={16} /></span>
                      {c.nome}
                    </span>
                    <span className="cidade-row-right">{c.postos} {t('posto.unit')}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Footer
        onBack={onBack}
        onNext={() => onNext?.(cidadeSelecionada)}
        nextDisabled={!postoId}
      />
    </section>
  )
}
