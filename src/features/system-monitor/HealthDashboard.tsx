import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Cpu,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

interface SystemMetrics {
  rustCoreMb: number;
  dotnetSidecarMb: number;
  sidecarPid: number | null;
  totalSystemRamMb: number;
  usedSystemRamMb: number;
}

interface DotnetHealth {
  status: string;
  engine: string;
  pid: number;
  memoryMb: number;
  sqliteMode: string;
  databasePath: string;
  timestamp: string;
}

export default function HealthDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [dotnetHealth, setDotnetHealth] = useState<DotnetHealth | null>(null);
  const [errorDotnet, setErrorDotnet] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMetrics = async () => {
    try {
      const data = await invoke<SystemMetrics>("get_system_metrics");
      setMetrics(data);
    } catch (err) {
      console.error("Error al invocar get_system_metrics:", err);
    }
  };

  const fetchDotnetHealth = async () => {
    try {
      setErrorDotnet(null);
      const res = await fetch("http://127.0.0.1:5123/api/health");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DotnetHealth = await res.json();
      setDotnetHealth(data);
    } catch (err: unknown) {
      setErrorDotnet(err instanceof Error ? err.message : "Sidecar desconectado");
      setDotnetHealth(null);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchMetrics(), fetchDotnetHealth()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(() => {
      fetchMetrics();
      fetchDotnetHealth();
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const totalAppRam =
    metrics && dotnetHealth
      ? (metrics.rustCoreMb + metrics.dotnetSidecarMb).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-base-100 text-base-content p-6 lg:p-8 flex flex-col justify-between select-none">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* Banner Superior Estilo Aurora */}
        <header className="bg-base-200 rounded-3xl p-6 shadow-sm border border-base-300/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="btn btn-circle btn-ghost bg-base-100 hover:bg-base-300/80 border border-base-300/80 shadow-sm"
              title="Volver al Inicio"
            >
              <ArrowLeft className="w-5 h-5 text-base-content" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-base-content">
                  Micro-POS Healthcheck
                </h1>
                <span className="badge badge-primary font-semibold text-xs rounded-full px-3 py-1">
                  Diagnóstico en Vivo
                </span>
              </div>
              <p className="text-sm opacity-60 mt-0.5">
                Telemetría de Hardware (Target 4GB RAM) y Estado del Sidecar .NET 10
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshAll}
              disabled={loading}
              className="btn btn-primary rounded-2xl px-5 gap-2 shadow-sm shadow-primary/25 hover:shadow-md transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refrescar Diagnóstico</span>
            </button>
          </div>
        </header>

        {/* Métricas Resumen Rápidas */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-base-200 p-5 rounded-3xl border border-base-300/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium opacity-60 block">Rust Core RAM</span>
              <span className="text-2xl font-black font-mono text-base-content">
                {metrics ? `${metrics.rustCoreMb} MB` : "—"}
              </span>
              <span className="text-[11px] text-success font-semibold block mt-0.5">
                ● Proceso Nativo
              </span>
            </div>
            <div className="p-3 bg-success/10 text-success rounded-2xl">
              <Cpu className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-base-200 p-5 rounded-3xl border border-base-300/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium opacity-60 block">.NET 10 Sidecar RAM</span>
              <span className="text-2xl font-black font-mono text-base-content">
                {metrics ? `${metrics.dotnetSidecarMb} MB` : "—"}
              </span>
              <span className="text-[11px] text-info font-semibold block mt-0.5">
                ● Minimal API Kestrel
              </span>
            </div>
            <div className="p-3 bg-info/10 text-info rounded-2xl">
              <Server className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-base-200 p-5 rounded-3xl border border-base-300/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium opacity-60 block">Carga Total POS</span>
              <span className="text-2xl font-black font-mono text-primary">
                {totalAppRam ? `${totalAppRam} MB` : "—"}
              </span>
              <span className="text-[11px] text-primary font-semibold block mt-0.5">
                Target: &lt; 180 MB
              </span>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Zap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-base-200 p-5 rounded-3xl border border-base-300/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium opacity-60 block">Modo Base de Datos</span>
              <span className="text-2xl font-black font-mono text-warning">
                {dotnetHealth?.sqliteMode ?? "WAL"}
              </span>
              <span className="text-[11px] opacity-60 block mt-0.5">
                PRAGMA SQLite
              </span>
            </div>
            <div className="p-3 bg-warning/10 text-warning rounded-2xl">
              <Database className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Tarjetas Principales Detalladas */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panel Rust / Hardware */}
          <div className="bg-base-200 rounded-3xl p-6 border border-base-300/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-base-300/60">
                <div className="flex items-center gap-2.5 font-bold text-lg text-base-content">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span>Orquestador Nativo (Tauri v2 + Rust)</span>
                </div>
                <span className="badge badge-success badge-sm font-semibold rounded-full px-2.5">
                  Activo
                </span>
              </div>

              {metrics ? (
                <div className="space-y-4 mt-5">
                  <div className="p-4 bg-base-100 rounded-2xl border border-base-300/60 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 opacity-70">
                        <HardDrive className="w-4 h-4" /> Memoria RAM Total del Sistema
                      </span>
                      <span className="font-mono font-bold">
                        {metrics.usedSystemRamMb} MB / {metrics.totalSystemRamMb} MB
                      </span>
                    </div>
                    <div className="w-full bg-base-300/80 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            (metrics.usedSystemRamMb / (metrics.totalSystemRamMb || 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3.5 bg-base-100 rounded-2xl border border-base-300/60">
                      <span className="text-xs opacity-60 block">PID Rust Core:</span>
                      <span className="font-mono font-bold text-base mt-1 block">
                        {window.crypto ? "Nativo" : "—"}
                      </span>
                    </div>
                    <div className="p-3.5 bg-base-100 rounded-2xl border border-base-300/60">
                      <span className="text-xs opacity-60 block">PID Sidecar C#:</span>
                      <span className="font-mono font-bold text-base mt-1 text-primary block">
                        {metrics.sidecarPid ?? "Sin registrar"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex justify-center">
                  <span className="loading loading-spinner text-primary"></span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-base-300/60 text-xs opacity-50 flex items-center justify-between">
              <span>Crate sysinfo v0.40</span>
              <span>Monitoreo en tiempo real</span>
            </div>
          </div>

          {/* Panel Backend .NET 10 */}
          <div className="bg-base-200 rounded-3xl p-6 border border-base-300/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-base-300/60">
                <div className="flex items-center gap-2.5 font-bold text-lg text-base-content">
                  <div className="p-2 bg-secondary/10 text-secondary rounded-xl">
                    <Server className="w-5 h-5" />
                  </div>
                  <span>Backend Sidecar (.NET 10 Minimal API)</span>
                </div>
                {dotnetHealth ? (
                  <span className="badge badge-success gap-1 badge-sm font-semibold rounded-full px-2.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> En línea
                  </span>
                ) : (
                  <span className="badge badge-error badge-sm font-semibold rounded-full px-2.5">
                    {errorDotnet ?? "Desconectado"}
                  </span>
                )}
              </div>

              {dotnetHealth ? (
                <div className="space-y-3 mt-5 text-sm">
                  <div className="flex justify-between items-center p-3 bg-base-100 rounded-2xl border border-base-300/60">
                    <span className="opacity-70 text-xs">Framework:</span>
                    <span className="font-mono font-bold text-xs">{dotnetHealth.engine}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-base-100 rounded-2xl border border-base-300/60">
                    <span className="opacity-70 text-xs">Memoria WorkingSet (C#):</span>
                    <span className="font-mono font-bold text-xs text-info">
                      {dotnetHealth.memoryMb} MB
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-base-100 rounded-2xl border border-base-300/60">
                    <span className="opacity-70 text-xs">Modo Concurrencia SQLite:</span>
                    <span className="badge badge-warning font-mono font-bold text-xs rounded-full px-3">
                      {dotnetHealth.sqliteMode}
                    </span>
                  </div>
                  <div className="p-3 bg-base-100 rounded-2xl border border-base-300/60">
                    <span className="text-[11px] opacity-60 block font-semibold mb-0.5">
                      Ruta del Archivo SQLite:
                    </span>
                    <span
                      className="font-mono text-xs opacity-80 block truncate"
                      title={dotnetHealth.databasePath}
                    >
                      {dotnetHealth.databasePath}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Activity className="w-8 h-8 text-primary opacity-40 mx-auto mb-2 animate-pulse" />
                  <p className="text-xs opacity-70">
                    Conectando con Kestrel en <code className="text-xs">http://127.0.0.1:5123</code>...
                  </p>
                  {errorDotnet && <p className="text-xs text-error mt-2">{errorDotnet}</p>}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-base-300/60 text-xs opacity-50 flex items-center justify-between">
              <span>Kestrel Loopback (127.0.0.1:5123)</span>
              <span>Entity Framework Core 10</span>
            </div>
          </div>
        </section>
      </div>

      <footer className="max-w-6xl w-full mx-auto border-t border-base-300/80 pt-4 mt-8 flex flex-col sm:flex-row items-center justify-between text-xs opacity-50 gap-2">
        <span>Tauri v2 • Rust Core • React 19 • .NET 10 Minimal API</span>
        <span>Micro-POS Architecture • Modo WAL Activo • Zero Process Leaks</span>
      </footer>
    </div>
  );
}

