use serde::Serialize;
use std::sync::Mutex;
use sysinfo::{Pid, ProcessesToUpdate, System};
use tauri::{AppHandle, Manager, RunEvent, State, WindowEvent};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

/// Estado global seguro entre hilos para almacenar el proceso hijo (Sidecar de C#)
struct SidecarState(Mutex<Option<CommandChild>>);

/// DTO serializable que enviaremos a React con el desglose real de RAM
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SystemMemoryReport {
    rust_core_mb: f64,
    dotnet_sidecar_mb: f64,
    sidecar_pid: Option<u32>,
    total_system_ram_mb: u64,
    used_system_ram_mb: u64,
}

/// Comando invocable desde React: `invoke('get_system_metrics')`
/// Lee directamente del kernel de Windows el consumo de RAM del proceso actual y del Sidecar C#.
#[tauri::command]
fn get_system_metrics(sidecar_state: State<'_, SidecarState>) -> SystemMemoryReport {
    let mut sys = System::new().expect("Failed to initialize system info");
    sys.refresh_memory();

    let current_pid = Pid::from_u32(std::process::id());
    let sidecar_pid_u32 = sidecar_state
        .0
        .lock()
        .ok()
        .and_then(|guard| guard.as_ref().map(|child| child.pid()));

    // Refrescar únicamente los PIDs relevantes en lugar de escanear todos los procesos de Windows (ahorra CPU)
    let mut pids_to_refresh = vec![current_pid];
    if let Some(spid) = sidecar_pid_u32 {
        pids_to_refresh.push(Pid::from_u32(spid));
    }
    sys.refresh_processes(ProcessesToUpdate::Some(&pids_to_refresh), true);

    let bytes_to_mb = |bytes: u64| -> f64 {
        ((bytes as f64 / 1024.0 / 1024.0) * 100.0).round() / 100.0
    };

    let rust_core_mb = sys
        .process(current_pid)
        .map(|p| bytes_to_mb(p.memory()))
        .unwrap_or(0.0);

    let dotnet_sidecar_mb = sidecar_pid_u32
        .and_then(|spid| sys.process(Pid::from_u32(spid)))
        .map(|p| bytes_to_mb(p.memory()))
        .unwrap_or(0.0);

    SystemMemoryReport {
        rust_core_mb,
        dotnet_sidecar_mb,
        sidecar_pid: sidecar_pid_u32,
        total_system_ram_mb: sys.total_memory() / 1024 / 1024,
        used_system_ram_mb: sys.used_memory() / 1024 / 1024,
    }
}

/// Función auxiliar idempotente para terminar el Sidecar de C# limpiamente
fn kill_sidecar(app_handle: &AppHandle) {
    if let Some(state) = app_handle.try_state::<SidecarState>() {
        if let Ok(mut guard) = state.0.lock() {
            if let Some(child) = guard.take() {
                let pid = child.pid();
                match child.kill() {
                    Ok(_) => println!("[Tauri Core] Sidecar .NET 10 (PID: {}) terminado limpiamente.", pid),
                    Err(e) => eprintln!("[Tauri Core] Error al terminar Sidecar (PID: {}): {}", pid, e),
                }
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(SidecarState(Mutex::new(None)))
        .setup(|app| {
            // Iniciar el Sidecar de .NET 10 al arrancar la aplicación
            let sidecar_command = app
                .shell()
                .sidecar("micro-pos-api")
                .expect("No se encontró la configuración del sidecar 'micro-pos-api'");

            match sidecar_command.spawn() {
                Ok((_rx, child)) => {
                    println!(
                        "[Tauri Core] Sidecar .NET 10 iniciado con éxito (PID: {})",
                        child.pid()
                    );
                    let state = app.state::<SidecarState>();
                    *state.0.lock().unwrap() = Some(child);
                }
                Err(err) => {
                    eprintln!("[Tauri Core] Error crítico al iniciar el Sidecar .NET 10: {}", err);
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_system_metrics])
        .build(tauri::generate_context!())
        .expect("Error al construir la aplicación Tauri");

    // Loop de eventos principal: garantizamos matar el proceso hijo tanto al cerrar ventana como al salir
    app.run(|app_handle, event| match event {
        RunEvent::WindowEvent {
            event: WindowEvent::CloseRequested { .. } | WindowEvent::Destroyed,
            ..
        } => {
            kill_sidecar(app_handle);
        }
        RunEvent::Exit => {
            kill_sidecar(app_handle);
        }
        _ => {}
    });
}
