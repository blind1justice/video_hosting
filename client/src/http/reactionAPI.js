import { $authHost } from "./index";


export const send_like_on_video = async (video_id) => {
    const {data} = await $authHost.post(`api/reactions/like?video_id=${video_id}`);
    return data;
};


export const send_dislike_on_video = async (video_id) => {
    const {data} = await $authHost.post(`api/reactions/dislike?video_id=${video_id}`);
    return data;
}


export const send_like_on_comment = async (comment_id) => {
    const {data} = await $authHost.post(`api/reactions/like?comment_id=${comment_id}`);
    return data;
};


export const send_dislike_on_comment = async (comment_id) => {
    const {data} = await $authHost.post(`api/reactions/dislike?comment_id=${comment_id}`);
    return data;
};

