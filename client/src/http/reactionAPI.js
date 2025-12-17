import { $authHost } from "./index";


export const send_like = async (video_id) => {
    const {data} = await $authHost.post(`api/reactions/like?video_id=${video_id}`);
    return data;
};


export const send_dislike = async (video_id) => {
    const {data} = await $authHost.post(`api/reactions/dislike?video_id=${video_id}`);
    return data;
}
