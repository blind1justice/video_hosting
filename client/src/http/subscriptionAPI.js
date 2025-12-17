import { $authHost } from "./index";


export const subscribe = async (channel_id) => {
    const {data} = await $authHost.post(`api/subscriptions?channel_id=${channel_id}`);
    return data;
};


export const unsubscribe = async (channel_id) => {
    const {data} = await $authHost.delete(`api/subscriptions?channel_id=${channel_id}`);
    return data;
}
