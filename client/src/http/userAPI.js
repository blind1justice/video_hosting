import { $authHost, $host } from "./index";

export const get_me = async () => {
    const {data} = await $authHost.get('api/users/me/');
    return data;
}

export const get_user = async (id) => {
    const {data} = await $host.get(`api/users/${id}/`);
    return data;
}
