from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.analytics_service import analytics_service
from app.services.forecast_service import forecast_service
router=APIRouter(prefix="/analytics",tags=["analytics"])
@router.get("/overview")
def overview(db:Session=Depends(get_db)):
    k,c,i,r=analytics_service.sales_overview(db); return {"kpis":[x.model_dump() for x in k],"chart_spec":c.model_dump(),"insights":i,"recommendations":r}
@router.post("/forecast")
def forecast(values:list[float],horizon:int=3): return forecast_service.moving_average(values,horizon)
