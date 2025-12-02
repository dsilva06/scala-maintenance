import { Link, Navigate } from "react-router-dom";
import {
  CalendarCheck,
  BrainCircuit,
  Wallet,
  Upload,
  Wand2,
  ChartLine,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthContext";

const navItems = [
  { label: "Características", href: "#feature-depth" },
  { label: "Precios", href: "#pricing" },
  { label: "Casos", href: "#case-studies" },
  { label: "Preguntas", href: "#faq" },
];

const valueProps = [
  {
    icon: CalendarCheck,
    title: "Programación centralizada",
    copy: "Gestiona órdenes preventivas y correctivas, asigna responsables y controla estados desde un mismo tablero.",
  },
  {
    icon: BrainCircuit,
    title: "Alertas y paneles",
    copy: "Recibe recordatorios por vencimientos, visualiza el kanban de mantenimiento y atiende prioridades con contexto.",
  },
  {
    icon: Wallet,
    title: "Seguimiento operativo",
    copy: "Administra inventario de repuestos, costos de servicios y disponibilidad de vehículos con reportes al día.",
  },
];

const howItWorks = [
  {
    icon: Upload,
    title: "Carga tu flota",
    description:
      "Importa vehículos, conductores y repuestos desde FLOTA o usa las plantillas CSV disponibles.",
  },
  {
    icon: Wand2,
    title: "Organiza procesos",
    description:
      "Configura estados y responsables, publica guías técnicas y activa las alertas del panel de mantenimiento.",
  },
  {
    icon: ChartLine,
    title: "Monitorea y ajusta",
    description:
      "Sigue el kanban de mantenimiento, revisa inventario y genera reportes para decidir qué atender primero.",
  },
];

const featureGrid = [
  {
    title: "Fuente única de verdad del activo",
    bullets: [
      "VIN, horas, kilometraje, garantía y componentes",
      "Fotos, facturas y notas de técnicos",
      "Accesos por rol y trazabilidad completa",
    ],
  },
  {
    title: "Programación inteligente",
    bullets: [
      "Servicios por tiempo, kilómetros u horas",
      "Reprogramaciones automáticas ante retrasos",
      "Sincronización de agenda y recordatorios por WhatsApp",
    ],
  },
  {
    title: "Panel y reportes",
    bullets: [
      "Dashboard con órdenes pendientes y críticas",
      "Reportes de costos y disponibilidad exportables",
      "Historial completo por vehículo y responsable",
    ],
  },
  {
    title: "Ingesta fluida",
    bullets: [
      "Lectura de facturas por email/WhatsApp",
      "Importaciones CSV y API bidireccional",
      "Exportaciones en un clic para contabilidad",
    ],
  },
];

const metrics = [
  { value: "Kanban activo", label: "Seguimiento visual de órdenes" },
  { value: "Alertas configurables", label: "Vencimientos, stock crítico y prioridades" },
  { value: "Panel de reportes", label: "Mantenimiento, repuestos y disponibilidad" },
];

const plans = [
  {
    tier: "Inicial",
    price: "$49/mes",
    cta: "Comenzar gratis",
    audience: "Equipos pequeños",
    features: [
      "Hasta 5 activos",
      "1 usuario",
      "Programación básica y alertas",
      "Reportes estándar",
    ],
    highlighted: false,
  },
  {
    tier: "Crecimiento",
    price: "$199/mes",
    cta: "Prueba gratis 14 días",
    audience: "Flotas en crecimiento",
    features: [
      "Hasta 30 activos",
      "5 usuarios con roles",
      "Tablero kanban de mantenimiento",
      "Módulo de inventario y repuestos",
      "Reportes avanzados",
    ],
    highlighted: true,
  },
  {
    tier: "Empresarial",
    price: "A medida",
    cta: "Hablar con ventas",
    audience: "Flotas grandes y multisede",
    features: [
      "Activos y usuarios ilimitados",
      "Integraciones API y SSO",
      "Workflows personalizados",
      "Soporte dedicado",
    ],
    highlighted: false,
  },
];

const caseStudies = [
  {
    logo: "ALCA",
    quote:
      "“FLOTA nos permitió coordinar órdenes y repuestos en un solo panel. Hoy tenemos visibilidad diaria del estado de cada vehículo.”",
    result: "Uso del tablero kanban y módulo de inventario",
  },
  {
    logo: "Vector Realty",
    quote: "“Organizamos guías técnicas, órdenes y documentos en minutos. El equipo opera con datos confiables.”",
    result: "Documentos y guías centralizados para el equipo",
  },
];

const faqs = [
  {
    question: "¿Necesito instalar algo?",
    answer: "No. FLOTA es una app web segura. Inicias sesión y listo.",
  },
  {
    question: "¿Puedo mantener mis colores y branding?",
    answer: "Sí. Respetamos tu paleta y ofrecemos marca blanca en Enterprise.",
  },
  {
    question: "¿Qué tan rápido es el onboarding?",
    answer: "Importa un CSV y en minutos tendrás tu primer activo operativo.",
  },
  {
    question: "¿FLOTA avisa sobre mantenimientos?",
    answer:
      "Sí. Configura recordatorios, alertas por vencimientos y prioridades desde el tablero.",
  },
];

const footerBlocks = [
  { title: "Producto", items: ["Características", "Precios", "API", "Seguridad"] },
  { title: "Compañía", items: ["Nosotros", "Carreras", "Contacto"] },
  { title: "Recursos", items: ["Documentación", "Centro de ayuda", "Estado"] },
  { title: "Legal", items: ["Privacidad", "Términos", "GDPR"] },
];

export default function Landing() {
  const { status } = useAuth();

  if (status === "authenticated") {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-48 right-[-120px] h-[520px] w-[520px] rounded-full bg-indigo-600/40 blur-3xl" />
        <div className="absolute bottom-[-160px] left-[-120px] h-[480px] w-[520px] rounded-full bg-cyan-500/30 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-[1200px] items-center justify-between px-6 md:px-8">
          <Link to="/" className="text-2xl font-semibold tracking-tight md:text-3xl">
            FLOTA
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/70 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition-colors duration-200 ease-out hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <Button
              asChild
              className="rounded-full px-5 py-2 text-sm font-semibold shadow-[0_12px_32px_-16px_rgba(148,163,255,0.45)] transition-transform duration-200 ease-out hover:-translate-y-0.5"
            >
              <Link to="/login">Comenzar gratis</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section
          id="hero"
          className="border-b border-white/10 bg-gradient-to-b from-slate-950/60 to-slate-950 px-6 py-20 md:px-8 lg:py-24"
        >
          <div className="mx-auto grid w-full max-w-[1200px] gap-12 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/60">
                Plataforma integral de mantenimiento
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
                Mantén menos. Opera más.
              </h1>
              <p className="text-base leading-relaxed text-white/70 md:text-lg">
                FLOTA centraliza activos, ordena mantenimientos, coordina repuestos y mantiene la operación visible para todo el equipo.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full px-8 py-3 text-base font-semibold shadow-[0_16px_40px_-20px_rgba(79,70,229,0.5)] transition-transform duration-200 ease-out hover:-translate-y-0.5"
                >
                  <Link to="/login">Comenzar gratis</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  size="lg"
                  className="rounded-full border-white/20 bg-white/5 px-8 py-3 text-base font-semibold text-white transition-colors duration-200 ease-out hover:bg-white/10"
                >
                  <Link to="#hero-demo">Ver demo de 90 segundos</Link>
                </Button>
              </div>
              <p className="flex items-center gap-2 text-sm text-white/60">
                <span className="text-lg leading-none text-emerald-300">•</span>
                Sin tarjeta de crédito · Configuración en 2 minutos
              </p>
            </div>

            <div
              id="hero-demo"
              className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/80 shadow-[0_32px_80px_-40px_rgba(79,70,229,0.6)] transition-transform duration-200 ease-out hover:-translate-y-1"
            >
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Resumen de flota</span>
                  <span>Hoy</span>
                </div>
                <div className="mt-6 grid gap-4 text-white">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-white">Próximo servicio en 6 días</span>
                      <span className="text-emerald-300">Al día</span>
                    </div>
                    <p className="mt-2 text-xs text-white/60">
                      Unidad 24 · 18,120 km · Aceite y filtro · Asignado a Martínez
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-white">Costo/km ↓ 18%</span>
                      <span className="text-emerald-300">Últimos 90 días</span>
                    </div>
                    <p className="mt-2 text-xs text-white/60">
                      Consolidación de repuestos y programación planificada reducen el gasto.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-white">Disponibilidad 99.2%</span>
                      <span className="text-emerald-300">Toda la flota</span>
                    </div>
                    <p className="mt-2 text-xs text-white/60">
                      3 unidades marcadas para inspección. Repuestos asegurados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-16 w-full max-w-[1200px]">
            <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-xs text-white/60 backdrop-blur">
              <p className="text-sm text-white/70">
                Confiado por equipos de flotas, construcción y gestión patrimonial
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-base font-medium text-white/50 sm:grid-cols-4 sm:gap-6">
                {["ALCA", "Atlas Logistics", "Norte Construcción", "Vector Realty"].map((logo) => (
                  <span key={logo} className="tracking-wide">
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-b border-white/10 px-6 py-20 md:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-[1200px]">
            <div className="grid gap-8 sm:grid-cols-3">
              {valueProps.map(({ icon: Icon, title, copy }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_48px_-40px_rgba(79,70,229,0.6)] transition-transform duration-200 ease-out hover:-translate-y-1"
                >
                  <Icon className="h-8 w-8 text-white/70" />
                  <h3 className="mt-6 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-b border-white/10 px-6 py-20 md:px-8 lg:py-24"
        >
          <div className="mx-auto w-full max-w-[1200px]">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="text-3xl font-semibold text-white md:text-4xl">Cómo funciona FLOTA</h2>
                <p className="mt-3 text-sm text-white/65 md:text-base">
                  Tres pasos para pasar del desorden al tiempo de actividad predecible.
                </p>
              </div>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {howItWorks.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-transform duration-200 ease-out hover:-translate-y-1"
                >
                  <Icon className="h-7 w-7 text-white/70" />
                  <h3 className="mt-6 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="feature-depth"
          className="border-b border-white/10 px-6 py-20 md:px-8 lg:py-24"
        >
          <div className="mx-auto w-full max-w-[1200px]">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-semibold text-white md:text-4xl">
                  Diseñado para operaciones reales
                </h2>
                <p className="mt-3 text-sm text-white/65 md:text-base">
                  FLOTA mantiene alineados a oficina y campo con la misma información.
                </p>
              </div>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {featureGrid.map(({ title, bullets }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-transform duration-200 ease-out hover:-translate-y-1"
                >
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-white/65">
                    {bullets.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="impact"
          className="border-b border-white/10 px-6 py-20 md:px-8 lg:py-24"
        >
          <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-10 rounded-[40px] border border-white/10 bg-gradient-to-r from-indigo-600/40 via-indigo-500/30 to-cyan-500/35 px-8 py-16 text-center shadow-[0_40px_80px_-40px_rgba(79,70,229,0.6)] md:px-16">
            <h2 className="text-3xl font-semibold text-white md:text-4xl">
              Less downtime. More delivery.
            </h2>
            <div className="grid gap-8 text-white/85 sm:grid-cols-3">
              {metrics.map(({ value, label }) => (
                <div key={label} className="space-y-2">
                  <div className="text-3xl font-semibold md:text-4xl">{value}</div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/60">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/60">Resultados observados en clientes tempranos.</p>
          </div>
        </section>

        <section
          id="pricing"
          className="border-b border-white/10 px-6 py-20 md:px-8 lg:py-24"
        >
          <div className="mx-auto w-full max-w-[1200px]">
            <div className="flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
                  Comienza gratis
                </div>
                <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
                  Precios simples y claros
                </h2>
                <p className="mt-3 text-sm text-white/65 md:text-base">
                  Conserva tu identidad. Elige el plan que se ajusta a tu flota.
                </p>
              </div>
              <p className="text-xs text-white/60 md:text-sm">
                Transparente. Cancela cuando quieras. Descuentos anuales disponibles.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {plans.map(
                ({ tier, price, cta, audience, features, highlighted }) => (
                  <div
                    key={tier}
                    className={`rounded-3xl border border-white/10 bg-white/5 p-8 transition-transform duration-200 ease-out hover:-translate-y-1 ${
                      highlighted
                        ? "shadow-[0_32px_80px_-40px_rgba(79,70,229,0.7)]"
                        : "shadow-[0_24px_60px_-48px_rgba(15,23,42,0.8)]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
                      <span>{tier}</span>
                      <span>{audience}</span>
                    </div>
                    <div className="mt-6 text-3xl font-semibold text-white">{price}</div>
                    <ul className="mt-6 space-y-2 text-sm text-white/65">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className={`mt-8 w-full rounded-full px-6 py-3 text-sm font-semibold ${
                        highlighted
                          ? "bg-white text-slate-900 hover:bg-white/90"
                          : "bg-indigo-500/90 text-white hover:bg-indigo-500"
                      }`}
                    >
                      <Link to="/login">{cta}</Link>
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section
          id="case-studies"
          className="border-b border-white/10 px-6 py-20 md:px-8 lg:py-24"
        >
          <div className="mx-auto w-full max-w-[1200px]">
            <div className="flex items-center justify-between gap-6">
              <h2 className="text-3xl font-semibold text-white md:text-4xl">Resultados reales</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {caseStudies.map(({ logo, quote, result }) => (
                <div
                  key={logo}
                  className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-transform duration-200 ease-out hover:-translate-y-1"
                >
                  <span className="text-xs uppercase tracking-[0.4em] text-white/50">{logo}</span>
                  <p className="mt-4 text-base leading-relaxed text-white/80">{quote}</p>
                  <p className="mt-4 text-sm font-medium text-emerald-300">{result}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="border-b border-white/10 px-6 py-20 md:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-[1200px]">
            <div className="flex items-center justify-between gap-6">
              <h2 className="text-3xl font-semibold text-white md:text-4xl">Preguntas frecuentes</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {faqs.map(({ question, answer }) => (
                <div key={question} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-base font-semibold text-white">{question}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 md:px-8 lg:py-24">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6 rounded-[40px] border border-white/10 bg-white/5 px-8 py-14 text-center shadow-[0_32px_80px_-50px_rgba(79,70,229,0.6)] md:px-16">
            <h2 className="text-3xl font-semibold text-white md:text-4xl">Listo cuando tú lo estés.</h2>
            <p className="max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
              Comienza gratis. Ve resultados en días, no en trimestres.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 py-3 text-base font-semibold shadow-[0_16px_40px_-20px_rgba(79,70,229,0.5)] transition-transform duration-200 ease-out hover:-translate-y-0.5"
              >
                <Link to="/login">Comenzar gratis</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                size="lg"
                className="rounded-full border-white/20 bg-white/5 px-8 py-3 text-base font-semibold text-white transition-colors duration-200 ease-out hover:bg-white/10"
              >
                <Link to="/login">Agendar demo en vivo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80 px-6 py-16 md:px-8">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="grid gap-8 md:grid-cols-5">
            <div className="space-y-3">
              <Link to="/" className="text-xl font-semibold tracking-tight text-white">
                FLOTA
              </Link>
              <p className="text-xs text-white/60">Effortless maintenance. Predictable uptime.</p>
            </div>
            {footerBlocks.map(({ title, items }) => (
              <div key={title} className="space-y-3 text-sm text-white/70">
                <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
                  {title}
                </h4>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="transition-colors duration-200 ease-out hover:text-white"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
            <span>© {new Date().getFullYear()} FLOTA. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="transition-colors duration-200 ease-out hover:text-white">
                Privacidad
              </a>
              <a href="#" className="transition-colors duration-200 ease-out hover:text-white">
                Términos
              </a>
              <a href="#" className="transition-colors duration-200 ease-out hover:text-white">
                Accesibilidad
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
