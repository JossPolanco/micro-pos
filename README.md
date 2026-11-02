# ⚡ Micro-POS

> **Ultra-lightweight hybrid desktop architecture engineered for local businesses.** Optimized at the OS and runtime level to operate with instant responsiveness even on modest or legacy hardware with **4 GB of RAM** and mechanical hard drives (HDDs).

![Tauri](https://img.shields.io/badge/Tauri_v2-24C8DB?style=for-the-badge&logo=tauri&logoColor=FFFFFF)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![.NET 10](https://img.shields.io/badge/.NET_10-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=for-the-badge&logo=csharp&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite_WAL-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

---

## 🎯 Purpose and Performance Philosophy

Modern desktop apps built with Electron or heavy web wrappers frequently consume between **400 MB and 900 MB of RAM** upon launch, making them unusable on real-world POS machines found across retail shops and small businesses (typically entry-level PCs with 4 GB of RAM, integrated graphics, and older CPUs).

**Micro-POS** solves this constraint by combining three specialized technologies into a single, cohesive desktop installer:

1. **Zero Bundled Chromium (Tauri v2 + WebView2):** Reuses the native Windows OS rendering engine (Microsoft Edge WebView2), minimizing installer size (~15 MB) and keeping frontend idle memory exceptionally low.
2. **Low-Level Native Rust Core:** Enforces strict process lifecycle management (zero orphan processes or zombie background tasks), real-time RAM/CPU kernel telemetry via `sysinfo`, and raw device I/O for thermal receipt printing (ESC/POS).
3. **Enterprise Backend Engine in C# .NET 10 (Self-Contained Sidecar):** A Minimal API compiled into a single self-contained binary (`win-x64 Single-File` with `Workstation GC` and `ReadyToRun`), powering an embedded **SQLite database in WAL mode (`Write-Ahead Logging`)** and zero-allocation Excel streaming (`MiniExcel`).
 

## 🗺️ Scope (MVP) vs. Scalability Roadmap

The architecture is built from day one to scale modularly without rewriting core components:

| Phase | Module | Status | Technical Description |
| :--- | :--- | :---: | :--- |
| **Phase 0** | **Architecture & Sidecar** | ✅ Complete | Rust ↔ .NET 10 ↔ React bridge, SQLite WAL, zero-leak process lifecycle, and Healthcheck. |
| **Phase 1** | **Quick Catalog & Cart** | 🔜 Up Next | Touch-optimized product grid (~15-20 items), rapid search, instant change calculation. |
| **Phase 2** | **Transactional Persistence** | 🔜 Up Next | Atomic order registration in SQLite (`WAL`) via EF Core 10. |
| **Phase 3** | **Shift Cash Cut & Excel** | 🔜 Up Next | Shift reconciliation and native `.xlsx` streaming export via `MiniExcel`. |
| **Phase 4** | **ESC/POS Tickets & RAM Monitor** | 🔜 Up Next | Thermal ticket simulation/printing and live RAM meter on the status bar. |
| **Future** | **Multi-Category Inventory** | 📋 Planned | Stock tracking, inventory alerts, and USB barcode scanner integration. |
| **Future** | **Suppliers & Receivables** | 📋 Planned | Merchandise receiving and accounts payable. |
| **Future** | **Customers & Credit (Tabs)** | 📋 Planned | Local credit accounts, customer balance, and partial payments. |
| **Future** | **Cash Drawer & Invoicing** | 📋 Planned | RJ11 cash drawer pulse triggering and electronic invoicing/receipts. |

---

## 🛠️ Prerequisites

To develop and build **Micro-POS** locally on Windows 10/11 (64-bit), ensure you have:

1. **Node.js** (v20 LTS or v22+) & **pnpm** (`pnpm -v`).
2. **Rust Toolchain** (`rustup`, `cargo`, `rustc` with `x86_64-pc-windows-msvc` target).
3. **C++ Build Tools for Visual Studio** (Desktop development with C++) & **WebView2 Runtime**.
4. **.NET 10 SDK** (`dotnet --version` showing `10.0.100` or higher).

Verify your installed toolchain with:
```powershell
node -v
pnpm -v
cargo -V
rustc -Vv
dotnet --version
```

---

## 🚀 Step-by-Step Setup and Execution

### 1. Install Frontend Dependencies
```powershell
pnpm install
```

### 2. Build the C# .NET 10 Sidecar Binary
Tauri requires the sidecar executable to be published into `src-tauri/binaries/` matching your architecture's **Target Triple** (`-x86_64-pc-windows-msvc.exe`):

You can run our automated build script:
```powershell
pnpm run build:sidecar
```

*(Alternatively, run the manual commands)*:
```powershell
# Create binaries folder
New-Item -ItemType Directory -Force -Path "src-tauri/binaries"

# Publish self-contained single-file binary
dotnet publish src-dotnet/MicroPos.Api/MicroPos.Api.csproj -c Release -o src-dotnet/MicroPos.Api/publish

# Copy with exact Target Triple suffix
Copy-Item "src-dotnet/MicroPos.Api/publish/micro-pos-api.exe" `
          "src-tauri/binaries/micro-pos-api-x86_64-pc-windows-msvc.exe" -Force
```

### 3. Run in Development Mode
Starts the Vite dev server with Hot-Module-Reload, spawns the C# Sidecar in the background, and opens the native Tauri desktop window:
```powershell
pnpm run tauri dev
```

### 4. Build Production Installer (`.msi` / `.exe`)
Generates the fully optimized standalone distribution bundle in `src-tauri/target/release/bundle/`:
```powershell
pnpm run tauri build
```