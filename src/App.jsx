import { useState } from 'react'
import './App.css'
import AccessibilityBar from './components/AccessibilityBar'
import VLibrasWidget from './components/VLibrasWidget'
import { IdCardIcon, SearchIcon, CalendarIcon } from './components/Icons'
import EmissaoCPF from './pages/EmissaoCPF'
import PostoRetirada from './pages/PostoRetirada'
import AutenticacaoContato from './pages/AutenticacaoContato'
import AutenticacaoCodigo from './pages/AutenticacaoCodigo'
import RecuperarCPF from './pages/RecuperarCPF'
import ResultadoConsulta from './pages/ResultadoConsulta'
import SelecaoPosto from './pages/SelecaoPosto'
import DataHora from './pages/DataHora'
import ResumoAgendamento from './pages/ResumoAgendamento'
import AutenticacaoAgendamento from './pages/AutenticacaoAgendamento'
import ConsultarAgendamento from './pages/ConsultarAgendamento'
import ConsultarPedido from './pages/ConsultarPedido'
import TipoEmissao from './pages/TipoEmissao'
import Confirmacao from './pages/Confirmacao'
import SolicitacaoFinalizada from './pages/SolicitacaoFinalizada'
import CancelarEmissao from './pages/CancelarEmissao'
import SolicitacaoCancelada from './pages/SolicitacaoCancelada'
import AgendamentoConfirmado from './pages/AgendamentoConfirmado'
import CancelarAgendamento from './pages/CancelarAgendamento'
import { useLanguage } from './i18n'

const TABS = { CIN: 'cin', AGENDAMENTO: 'agendamento' }
const VIEWS = {
  HOME: 'home',
  CPF: 'cpf',
  RECUPERAR_CPF: 'recuperar-cpf',
  RESULTADO: 'resultado',
  POSTO: 'posto',
  CONTATO: 'contato',
  CODIGO: 'codigo',
  TIPO_EMISSAO: 'tipo-emissao',
  CONFIRMACAO: 'confirmacao',
  FINALIZADA: 'finalizada',
  CANCELAR_EMISSAO: 'cancelar-emissao',
  CANCELADA: 'cancelada',
  CONSULTA_PEDIDO: 'consulta-pedido',
  // Agendamento presencial — novo agendamento
  AG_POSTO: 'ag-posto',
  AG_DATA: 'ag-data',
  AG_RESUMO: 'ag-resumo',
  AG_AUTH: 'ag-auth',
  AG_CONFIRMADO: 'ag-confirmado',
  AG_CANCELAR: 'ag-cancelar',
  AG_CANCELADA: 'ag-cancelada',
  // Agendamento presencial — consultar
  AG_CONSULTAR: 'ag-consultar',
}

function Header({ activeTab, onChangeTab, onHome }) {
  const { t } = useLanguage()
  return (
    <header className="site-header">
      <button
        type="button"
        className="header-logos"
        onClick={onHome}
        aria-label={t('header.home')}
        title={t('header.homeTitle')}
      >
        <img src="/images/logo_gov.png" alt={t('logo.gov')} className="logo-gov" />
        <img src="/images/logomarca-pci.png" alt={t('logo.pci')} className="logo-pci" />
      </button>

      <nav className="site-nav">
        <button
          type="button"
          className={`nav-tab ${activeTab === TABS.CIN ? 'is-active' : ''}`}
          onClick={() => onChangeTab(TABS.CIN)}
        >
          {t('nav.cin')}
        </button>

        <button
          type="button"
          className={`nav-tab ${activeTab === TABS.AGENDAMENTO ? 'is-active' : ''}`}
          onClick={() => onChangeTab(TABS.AGENDAMENTO)}
        >
          {t('nav.agendamento')}
        </button>

        <img src="/images/griaule.svg" alt="Griaule" className="nav-brand" />
      </nav>
    </header>
  )
}

function ActionCard({ icon, title, description, onClick }) {
  return (
    <button type="button" className="action-card" onClick={onClick}>
      <div className="action-card-header">
        <span className="action-card-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      <p>{description}</p>
    </button>
  )
}

function Modal({ title, children, onClose }) {
  const { t } = useLanguage()
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal">
        <h2 id="modal-title">{title}</h2>
        <div role="note" className="modal-body">{children}</div>
        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  )
}

function EmissaoHome({ onStart }) {
  const { t } = useLanguage()
  const [declarado, setDeclarado] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const handleAction = (action) => {
    if (!declarado) {
      setModalOpen(true)
      return
    }
    onStart?.(action)
  }

  return (
    <section className="page">
      <h1>{t('emissao.title')}</h1>
      <p dangerouslySetInnerHTML={{ __html: t('emissao.p1') }} />
      <p dangerouslySetInnerHTML={{ __html: t('emissao.p2') }} />

      <label className="checkbox">
        <input
          type="checkbox"
          checked={declarado}
          onChange={(e) => setDeclarado(e.target.checked)}
        />
        <span>{t('emissao.checkbox')}<span className="required">*</span></span>
      </label>

      <div className="card-grid">
        <ActionCard
          icon={<IdCardIcon />}
          title={t('emissao.card.title')}
          description={t('emissao.card.desc')}
          onClick={() => handleAction('emissao')}
        />
        <ActionCard
          icon={<SearchIcon />}
          title={t('emissao.consultar.title')}
          description={t('emissao.consultar.desc')}
          onClick={() => handleAction('consultar')}
        />
      </div>

      {modalOpen && (
        <Modal title={t('emissao.modal.title')} onClose={() => setModalOpen(false)}>
          {t('emissao.modal.body')}
        </Modal>
      )}
    </section>
  )
}

function AgendamentoPage({ onNovoAgendamento, onConsultar }) {
  const { t } = useLanguage()
  return (
    <section className="page">
      <h1>{t('ag.title')}</h1>

      <div className="card-grid">
        <ActionCard
          icon={<CalendarIcon />}
          title={t('ag.novo.title')}
          description={t('ag.novo.desc')}
          onClick={onNovoAgendamento}
        />
        <ActionCard
          icon={<SearchIcon />}
          title={t('ag.consultar.title')}
          description={t('ag.consultar.desc')}
          onClick={onConsultar}
        />
      </div>
    </section>
  )
}

function App() {
  const { lang } = useLanguage()
  const [activeTab, setActiveTab] = useState(TABS.CIN)
  const [view, setView] = useState(VIEWS.HOME)
  const [agData, setAgData] = useState({ posto: null, requerente: null })
  const [emData, setEmData] = useState({ cpf: '', posto: null, email: '', telefone: '' })

  const goHome = () => {
    setActiveTab(TABS.CIN)
    setView(VIEWS.HOME)
  }

  const handleStart = (action) => {
    if (action === 'emissao') setView(VIEWS.CPF)
    if (action === 'consultar') setView(VIEWS.CONSULTA_PEDIDO)
  }

  const renderView = () => {
    if (activeTab === TABS.AGENDAMENTO) {
      switch (view) {
        case VIEWS.AG_POSTO:
          return (
            <SelecaoPosto
              onBack={() => setView(VIEWS.HOME)}
              onNext={(posto) => {
                setAgData((d) => ({ ...d, posto }))
                setView(VIEWS.AG_DATA)
              }}
            />
          )
        case VIEWS.AG_DATA:
          return (
            <DataHora
              onBack={() => setView(VIEWS.AG_POSTO)}
              onNext={({ principal }) => {
                setAgData((d) => ({ ...d, requerente: principal }))
                setView(VIEWS.AG_RESUMO)
              }}
            />
          )
        case VIEWS.AG_RESUMO:
          return (
            <ResumoAgendamento
              posto={agData.posto}
              requerente={agData.requerente}
              onBack={() => setView(VIEWS.AG_DATA)}
              onNext={() => setView(VIEWS.AG_AUTH)}
              onEditAgendamento={() => setView(VIEWS.AG_DATA)}
              onEditPosto={() => setView(VIEWS.AG_POSTO)}
            />
          )
        case VIEWS.AG_AUTH:
          return (
            <AutenticacaoAgendamento
              onBack={() => setView(VIEWS.AG_RESUMO)}
              onNext={() => setView(VIEWS.AG_CONFIRMADO)}
            />
          )
        case VIEWS.AG_CONFIRMADO:
          return (
            <AgendamentoConfirmado
              posto={agData.posto}
              requerente={agData.requerente}
              onHome={goHome}
              onCancelar={() => setView(VIEWS.AG_CANCELAR)}
            />
          )
        case VIEWS.AG_CANCELAR:
          return (
            <CancelarAgendamento
              email={agData.requerente?.email || 'seu e-mail'}
              onBack={() => setView(VIEWS.AG_CONFIRMADO)}
              onNext={() => setView(VIEWS.AG_CANCELADA)}
            />
          )
        case VIEWS.AG_CANCELADA:
          return (
            <SolicitacaoCancelada
              onNovoAgendamento={() => setView(VIEWS.AG_POSTO)}
              onEmissao={() => {
                setActiveTab(TABS.CIN)
                setView(VIEWS.CPF)
              }}
            />
          )
        case VIEWS.AG_CONSULTAR:
          return (
            <ConsultarAgendamento
              onBack={() => setView(VIEWS.HOME)}
              onNext={() => setView(VIEWS.HOME)}
            />
          )
        default:
          return (
            <AgendamentoPage
              onNovoAgendamento={() => setView(VIEWS.AG_POSTO)}
              onConsultar={() => setView(VIEWS.AG_CONSULTAR)}
            />
          )
      }
    }

    switch (view) {
      case VIEWS.CPF:
        return (
          <EmissaoCPF
            onBack={goHome}
            onNext={({ cpf }) => {
              setEmData((d) => ({ ...d, cpf }))
              setView(VIEWS.POSTO)
            }}
            onForgotCPF={() => setView(VIEWS.RECUPERAR_CPF)}
          />
        )
      case VIEWS.RECUPERAR_CPF:
        return (
          <RecuperarCPF
            onBack={() => setView(VIEWS.CPF)}
            onNext={() => setView(VIEWS.RESULTADO)}
          />
        )
      case VIEWS.RESULTADO:
        return (
          <ResultadoConsulta
            onBack={() => setView(VIEWS.CPF)}
            onAgendamento={() => setActiveTab(TABS.AGENDAMENTO)}
          />
        )
      case VIEWS.POSTO:
        return (
          <PostoRetirada
            onBack={() => setView(VIEWS.CPF)}
            onNext={(posto) => {
              setEmData((d) => ({ ...d, posto }))
              setView(VIEWS.CONTATO)
            }}
          />
        )
      case VIEWS.CONTATO:
        return (
          <AutenticacaoContato
            onBack={() => setView(VIEWS.POSTO)}
            onNext={({ email, phone }) => {
              setEmData((d) => ({ ...d, email, telefone: phone }))
              setView(VIEWS.CODIGO)
            }}
          />
        )
      case VIEWS.CODIGO:
        return (
          <AutenticacaoCodigo
            onBack={() => setView(VIEWS.CONTATO)}
            onNext={() => setView(VIEWS.TIPO_EMISSAO)}
          />
        )
      case VIEWS.TIPO_EMISSAO:
        return (
          <TipoEmissao
            onBack={() => setView(VIEWS.CODIGO)}
            onNext={() => setView(VIEWS.CONFIRMACAO)}
          />
        )
      case VIEWS.CONFIRMACAO:
        return (
          <Confirmacao
            requerente={{ cpf: emData.cpf, email: emData.email, telefone: emData.telefone }}
            posto={emData.posto}
            onBack={() => setView(VIEWS.TIPO_EMISSAO)}
            onNext={() => setView(VIEWS.FINALIZADA)}
          />
        )
      case VIEWS.FINALIZADA:
        return (
          <SolicitacaoFinalizada
            onHome={goHome}
            onCancelar={() => setView(VIEWS.CANCELAR_EMISSAO)}
            onAgendamento={() => {
              setActiveTab(TABS.AGENDAMENTO)
              setView(VIEWS.AG_POSTO)
            }}
          />
        )
      case VIEWS.CANCELAR_EMISSAO:
        return (
          <CancelarEmissao
            onBack={() => setView(VIEWS.FINALIZADA)}
            onNext={() => setView(VIEWS.CANCELADA)}
          />
        )
      case VIEWS.CANCELADA:
        return (
          <SolicitacaoCancelada
            onNovoAgendamento={() => {
              setActiveTab(TABS.AGENDAMENTO)
              setView(VIEWS.AG_POSTO)
            }}
            onEmissao={() => setView(VIEWS.CPF)}
          />
        )
      case VIEWS.CONSULTA_PEDIDO:
        return (
          <ConsultarPedido
            onBack={goHome}
            onNext={() => {
              // placeholder para próxima etapa de consulta de pedido (mocked to home for now)
              goHome()
            }}
          />
        )
      default:
        return <EmissaoHome onStart={handleStart} />
    }
  }

  return (
    <>
      <AccessibilityBar />
      <div className="app">
        <Header
          activeTab={activeTab}
          onChangeTab={(t) => {
            setActiveTab(t)
            setView(VIEWS.HOME)
          }}
          onHome={goHome}
        />
        <main className="main">{renderView()}</main>
      </div>
      {lang === 'pt-BR' && <VLibrasWidget />}
    </>
  )
}

export default App
