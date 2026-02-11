let worker = null;

export function getWorker() {
  if (!worker) {
    worker = new Worker("./dbWorker.js", { type: "module" });
    console.log("Database worker initialized");
  }
  return worker;
}

export function terminateWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
    console.log("Database worker terminated");
  }
}
