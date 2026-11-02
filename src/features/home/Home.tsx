import { useNavigate } from "react-router-dom";
import { Activity, Sparkles } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-100 text-base-content p-6 flex flex-col items-center justify-center select-none">
      <div className="bg-base-200 rounded-3xl p-8 max-w-md w-full border border-base-300/80 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-base-content">
            Hello World!
          </h1>
          <p className="text-sm opacity-60">
            Micro-POS • Arquitectura Base Inicial
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => navigate("/health")}
            className="btn btn-primary rounded-2xl w-full gap-2 shadow-sm shadow-primary/25 hover:shadow-md transition-all"
          >
            <Activity className="w-4 h-4" />
            <span>Ir al Monitor de Salud y Sidecar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

