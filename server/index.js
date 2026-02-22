import { config } from "dotenv";
config();

import app from "./src/server.js";

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
