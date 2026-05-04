import dotenv from "dotenv";
import { server } from "./app.js";
import { connectDB } from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const getValidModel = async () => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
  );
  const data = await res.json();
  console.log(JSON.stringify(data, null));
};

connectDB()
  .then(() => {
    server.listen(process.env.PORT, () => {
      // getValidModel();
      console.log(`Server is running at port localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`mongoDB connection failed !!!, ${error}`);
  });
