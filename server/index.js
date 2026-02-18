import { config } from "dotenv";
import app from "./src/server.js";

config();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
