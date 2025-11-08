import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SHARE_SHELF_URL ?? "https://localhost:3000",
});

export default instance;
