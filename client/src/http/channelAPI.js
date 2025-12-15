import { $authHost, $host } from "./index";


export const create_channel = async (description, country, language) => {
    const {data} = await $authHost.post('/api/channels/my-channel', {description, country, language});
    return data;
};


export const update_channel = async (description, country, language) => {
    const {data} = await $authHost.patch('/api/channels/my-channel', {description, country, language});
    return data;
};


export const delete_channel = async () => {
    const {data} = await $authHost.delete('/api/channels/my-channel');
    return data;
};

