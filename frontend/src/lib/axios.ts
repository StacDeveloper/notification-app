import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL!,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // clear user and redirect to login
            window.location.href = "/login"
        }
        return Promise.reject(error)
    }
)

export default api