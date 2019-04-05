import axios from 'axios';
export const api = axios.create({ baseURL: process.enve.YALCS_API_URL });
