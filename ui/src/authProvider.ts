import type { AuthProvider } from "@refinedev/core";
import axios from "axios";

export const TOKEN_KEY = "refine-auth";

export const authProvider: AuthProvider = {
    login: async ({ username, email, password }) => {
        if ((username || email) && password) {
            const datum  ={ username: email, password }
            console.log("datum ", datum)
            const { data } = await axios.post(import.meta.env.VITE_API_URL + "/login", datum).catch(err => {
                console.log("aza", err.response.data); 
                return err 
            })
            console.log("data ", data)
            data.token = data.token_type + " " + data.access_token
            if(data) {
                const payload = JSON.stringify(data)
    
                localStorage.setItem(TOKEN_KEY, payload);
                return {
                    success: true,
                    redirectTo: "/",
                };
            }
        }

        return {
            success: false,
            error: {
                name: "LoginError",
                message: "Invalid username or password",
            },
        };
    },
    logout: async () => {
        localStorage.removeItem(TOKEN_KEY);
        return {
            success: true,
            redirectTo: "/login",
        };
    },
    check: async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            return {
                authenticated: true,
            };
        }

        return {
            authenticated: false,
            redirectTo: "/login",
        };
    },
    getPermissions: async () => null,
    getIdentity: async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          const parsedAuth = JSON.parse(token)
    
          const meResponse = await axios.get(
            import.meta.env.VITE_API_URL + "/users/me/" ,  {
                headers: {
                    Authorization: parsedAuth.token_type + " " + parsedAuth.access_token
                }
            }
          )
          const me = meResponse.data

          console.log("me ", me)

          const computed_fullname = me?.username
    
          return {
            ...me,
            name: computed_fullname,
            username: computed_fullname,
            serviceName: me.service?.name,
          };

        }
        return null;
    },
    onError: async (error) => {
        console.error(error);
        return { error };
    },
};
