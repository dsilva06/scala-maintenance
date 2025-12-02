import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AccessDenied() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center px-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Acceso restringido
        </h1>
        <p className="text-base text-gray-600">
          No tienes permisos para acceder a esta sección de FLOTA. Si crees que
          se trata de un error, contacta a un administrador.
        </p>
      </div>
      <Button asChild>
        <Link to="/app">Volver al panel principal</Link>
      </Button>
    </div>
  );
}
