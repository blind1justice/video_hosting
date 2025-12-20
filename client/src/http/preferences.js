import { $authHost } from "./index";


export const change_preferences = async (settings) => {
    const {data} = await $authHost.patch('api/user-preferences', settings)
    return data;
}
