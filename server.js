import express from "express";
const app = express();
const port = 3000;

const exports = [];

function exportsCleanUp(exportId) {
  setTimeout(() => {
    delete exports[exportId];
  }, 60000);
}

app.get("/api/export", (req, res) => {
  const exportId = crypto.randomUUID();

  exports[exportId] = { status: "processing" };

  setTimeout(() => {
    exports[exportId] = {
      status: "done",
    };
    exportsCleanUp(exportId);
  }, 45000);

  res.json({ exportId });
});

app.get("/api/export/status/:id", async (req, res) => {
  const exportId = req.params.id;
  const timeout = 30000;
  const start = Date.now();

  const checkStatus = () => {
    const job = exports[exportId];

    if (!job) {
      return res.status(404).json({ error: "Not found" });
    }

    if (job.status === "done") {
      return res.json(job);
    }

    if (Date.now() - start > timeout) {
      return res.json({ status: "processing" });
    }

    setTimeout(checkStatus, 1000);
  };

  checkStatus();
});
