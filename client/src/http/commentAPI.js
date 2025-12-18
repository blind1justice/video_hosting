import { $authHost, $host } from "./index";


export const left_comment_on_video = async (content, video_id) => {
    const {data} = await $authHost.post('api/comments', {content, video_id});
    return data;
} 

export const left_comment_on_comment = async (content, parent_id) => {
    const {data} = await $authHost.post('api/comments', {content, parent_id});
    return data;
} 

export const delete_comment = async (comment_id) => {
    const {data} = await $authHost.delete(`api/comments/${comment_id}`);
    return data;
}

export const edit_comment = async (comment_id, content) => {
    const {data} = await $authHost.patch(`api/comments/${comment_id}`, {content});
    return data;
}

export const get_all_comments_for_video = async (video_id) => {
    const {data} = await $authHost.get(`api/comments?video_id=${video_id}`);
    return data;
}

export const get_all_comments_for_comment = async (comment_id) => {
    const {data} = await $authHost.get(`api/comments?comment_id=${comment_id}`);
    return data;
}
