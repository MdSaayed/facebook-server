const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const { readdirSync } = require("fs"); 
const app = express();
app.use(express.json());
app.use(cors());
app.use(fileUpload({
useTempFiles:true,
}));
const dotenv = require("dotenv");
dotenv.config();

// routes
readdirSync("./routes").map((r) => app.use("/", require("./routes/" + r)));

// database
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Database connected successfully."))
  .catch((error) => console.error("Error connecting to database:", error));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running now on port ${PORT}`);
});
