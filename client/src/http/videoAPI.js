import { $authHost, $host } from "./index";


export const upload_video = async (formData) => {
    const { data } = await $authHost.post('api/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
        }
      },
    });
    return data;
};


export const get_videos = async () => {
  const { data } = await $host.get('api/videos/');
  return data;
}


export const get_channel_videos = async (channel_id) => {
  const { data } = await $host.get(`api/videos/?channel_id=${channel_id}`);
  return data;
}


export const get_video_detail = async (id) => {
  const { data } = await $authHost.get(`api/videos/${id}`);
  return data;
}
