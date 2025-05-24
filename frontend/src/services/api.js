import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/pollingmachine",
  headers: {
    "Content-Type": "application/json",
  },
});

const api_auth = axios.create({
  baseURL: "http://localhost:3020/auth",
});

export { api, api_auth };
