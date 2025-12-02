import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? '/app';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('Login failed', error);
      if (error.status === 422 && error.data?.errors) {
        setErrors(error.data.errors);
      } else {
        setErrors({ general: ['Ocurrió un error al iniciar sesión.'] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <div className="absolute -top-64 right-[-140px] h-[720px] w-[720px] rounded-full bg-indigo-600/40 blur-3xl" />
        <div className="absolute bottom-[-200px] left-[-120px] h-[680px] w-[680px] rounded-full bg-cyan-500/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center px-6 py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8 text-center lg:text-left">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.5em] text-white/80 backdrop-blur transition hover:border-white/40 hover:text-white md:px-6 md:py-2.5 md:text-sm"
            >
              FLOTA
            </Link>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
                Bienvenido de nuevo.
                <br className="hidden md:block" />
                Dirige tu flota con precisión impecable.
              </h1>
              <p className="text-base leading-relaxed text-white/75 md:max-w-2xl md:text-lg">
                Accede a tableros depurados, mantenimiento orquestado y un inventario que siempre llega antes que tú. FLOTA potencia a los equipos que exigen control absoluto y experiencias impecables sin ruido.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-white/70 sm:flex-row sm:justify-center sm:text-left lg:justify-start">
              <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur md:px-7">
                <span className="block text-lg text-white md:text-xl">Operación sin fricción</span>
                <span className="text-sm text-white/60 md:text-base">Alertas inteligentes y rutas optimizadas en dos latidos.</span>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 backdrop-blur md:px-7">
                <span className="block text-lg text-white md:text-xl">Precisión ejecutiva</span>
                <span className="text-sm text-white/60 md:text-base">Métricas vivas que narran la historia real de tu flota icónica.</span>
              </div>
            </div>
          </div>

          <div className="rounded-[36px] border border-white/15 bg-white/10 p-10 shadow-[0_40px_80px_-50px_rgba(148,163,255,0.45)] backdrop-blur-xl md:p-12">
            <div className="space-y-3 text-center">
              <h2 className="text-3xl font-semibold text-white md:text-4xl">Inicia sesión en FLOTA</h2>
              <p className="text-base text-white/60 md:text-lg">
                Tus credenciales te conectan con la sala de control más refinada de tu operación.
              </p>
            </div>

            {errors.general && (
              <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-4 text-sm text-red-100 md:text-base">
                {errors.general.join(' ')}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-white/80 md:text-base">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className={cn(
                    "bg-white/10 border-white/15 text-white placeholder:text-white/40 focus:bg-white/15 focus-visible:ring-white/40",
                    errors.email && "border-red-500/60 focus-visible:ring-red-400/60"
                  )}
                />
                {errors.email && (
                  <p className="text-xs text-red-300 md:text-sm">{errors.email.join(' ')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-white/80 md:text-base">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className={cn(
                    "bg-white/10 border-white/15 text-white placeholder:text-white/40 focus:bg-white/15 focus-visible:ring-white/40",
                    errors.password && "border-red-500/60 focus-visible:ring-red-400/60"
                  )}
                />
                {errors.password && (
                  <p className="text-xs text-red-300 md:text-sm">{errors.password.join(' ')}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full rounded-full bg-indigo-500/90 px-6 py-3 text-base font-semibold shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 md:px-8 md:py-4 md:text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
              </Button>
            </form>

            <div className="mt-8 space-y-3 text-center text-xs text-white/60 md:text-sm">
              <p>¿No tienes una cuenta? Solicita acceso a tu administrador y mantén tu operación impecable.</p>
              <Link to="/" className="text-white/70 transition hover:text-white">
                Volver al universo FLOTA
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
