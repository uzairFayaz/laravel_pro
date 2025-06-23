import axios from "axios";
import Cookies from "js-cookie"

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Same domain as Laravel
  withCredentials:true,
});

export default api;