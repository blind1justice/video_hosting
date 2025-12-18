import { $authHost, $host } from "./index";

export const left_report = async (video_id, reason) => {
    const {data} = await $authHost.post('api/reports', {video_id, reason});
    return data;
}

export const fetch_reports = async() => {
    const {data} = await $authHost.get('api/reports');
    return data;
}

export const mark_report_rejected = async (report_id) => {
    const {data} = await $authHost.patch(`api/reports/${report_id}/reject`);
    return data;
}

export const mark_report_resolved = async (report_id) => {
    const {data} = await $authHost.patch(`api/reports/${report_id}/resolve`);
    return data;
}
