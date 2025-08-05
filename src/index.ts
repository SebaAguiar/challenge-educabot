import express from "express";
import cors from "cors";
import { getMetrics } from "./handlers/metrics";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.get("/metrics", getMetrics);

app.get("/", (_req, res) => {
  res.send("Metrics server is up and running. Use the /metrics endpoint.");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app };
