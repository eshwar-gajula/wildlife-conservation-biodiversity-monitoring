import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backend = path.join(root, "backend");
const frontend = path.join(root, "frontend");

if (!existsSync(path.join(backend, "node_modules")) || !existsSync(path.join(frontend, "node_modules"))) {
  console.error("Dependencies are missing. Run `npm run setup` from the project folder first.");
  process.exit(1);
}

console.log("Starting the local MongoDB service...");
const dockerCommand = process.platform === "win32" ? "docker.exe" : "docker";
const compose = spawnSync(dockerCommand, ["compose", "up", "-d", "mongo"], {
  cwd: root,
  stdio: "inherit",
});

if (compose.error || compose.status !== 0) {
  console.error("MongoDB did not start. Start Docker Desktop, then run `npm run dev` again.");
  process.exit(compose.status ?? 1);
}

console.log("Starting the API and web app. Press Ctrl+C to stop both.");
const api = spawn(process.execPath, ["--watch", "index.js"], {
  cwd: backend,
  stdio: "inherit",
  env: process.env,
});
const web = spawn(process.execPath, [path.join(frontend, "node_modules", "vite", "bin", "vite.js"), "--host", "127.0.0.1", "--strictPort"], {
  cwd: frontend,
  stdio: "inherit",
  env: process.env,
});

const children = [api, web];
let stopping = false;

function stopChildren(signal = "SIGTERM") {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill(signal);
  }
}

process.on("SIGINT", () => stopChildren("SIGINT"));
process.on("SIGTERM", () => stopChildren("SIGTERM"));

for (const child of children) {
  child.on("error", (error) => {
    console.error(`Could not start a development process: ${error.message}`);
    stopChildren();
    process.exitCode = 1;
  });
  child.on("exit", (code) => {
    if (!stopping && code !== 0) {
      process.exitCode = code ?? 1;
      stopChildren();
    }
  });
}
