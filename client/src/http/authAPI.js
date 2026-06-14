import {$authHost, $host} from "./index";
import { jwtDecode } from "jwt-decode";


export const registration = async (email, password, username) => {
    if (!username) username = null;
    const { data } = await $host.post('api/auth/register', {email, password, username});
    localStorage.setItem('email', data.email);
    return data;
};


export const logIn = async (login, password) => {
    const { data } = await $host.post('api/auth/login', {login, password});
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token);
};


export const confirm_email = async (confirmation_code) => {
    const email = localStorage.getItem('email');
    const { data } = await $host.post('api/auth/verify', {email, confirmation_code});
    localStorage.setItem('token', data.token);
    return jwtDecode(data.token);
} 


export const check = async () => {
    try{
        const { data } = await $authHost.post('api/auth/check');
        localStorage.setItem('token', data.token);
        return jwtDecode(data.token);
    }
    catch(err){
        return null;
    }
}
