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
        const is401 = error?.resposne?.status === 401
        const isAuthCheck = error?.config?.url?.includes("/auth/findMe")
        if (is401 && !isAuthCheck) {
            window.location.href = "/login"
        }
        return Promise.reject(error)
    }
)

export default api