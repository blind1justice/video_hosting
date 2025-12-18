from typing import Annotated
from fastapi import APIRouter, Depends, Query, HTTPException, status
from api.dependecies import get_current_user, report_service, get_current_moderator
from schemas.user import UserSchemaRead
from schemas.report import ReportSchemaAdd
from services.report_service import ReportService


router = APIRouter(prefix='/api/reports', tags=['Reports'])


@router.post('')
async def left_report(
    report_service: Annotated[ReportService, Depends(report_service)],
    report: ReportSchemaAdd,
    current_user: UserSchemaRead = Depends(get_current_user)
):
    res = await report_service.left_report(current_user.id, report)
    return res


@router.get('')
async def get_reports(
    report_service: Annotated[ReportService, Depends(report_service)],
    current_user: UserSchemaRead = Depends(get_current_moderator)
):
    res = await report_service.get_reports()
    return res


@router.patch('/{report_id}/reject')
async def reject_report(
    report_id: int,
    report_service: Annotated[ReportService, Depends(report_service)],
    current_user: UserSchemaRead = Depends(get_current_moderator)
):
    res = await report_service.mark_rejected(report_id)
    return res

@router.patch('/{report_id}/resolve')
async def reseolve_report(
    report_id: int,
    report_service: Annotated[ReportService, Depends(report_service)],
    current_user: UserSchemaRead = Depends(get_current_moderator)
):
    res = await report_service.mark_resolved(report_id)
    return res
