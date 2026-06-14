import { $authHost } from "./index";


export const get_all_notifications = async () => {
    const {data} = await $authHost.get(`api/notifications/read`);
    return data;
}

export const mark_all_as_read = async () => {
    const {data} = await $authHost.patch(`api/notifications/mark-as-read/all`);
    return data;
}

export const mark_as_read = async (id) => {
    const {data} = await $authHost.patch(`api/notifications/mark-as-read/${id}`);
    return data;
}
