from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.models import Sale
from app.schemas.contracts import KPI,ChartSpec
class AnalyticsService:
    def sales_overview(self,db:Session)->tuple[list[KPI],ChartSpec,list[str],list[str]]:
        rows=db.query(Sale.sale_date,func.sum(Sale.revenue).label("revenue"),func.sum(Sale.cost).label("cost"),func.sum(Sale.orders).label("orders")).group_by(Sale.sale_date).order_by(Sale.sale_date).all()
        data=[{"month":r.sale_date,"revenue":float(r.revenue),"cost":float(r.cost),"orders":int(r.orders)} for r in rows]
        total=sum(x["revenue"] for x in data); cost=sum(x["cost"] for x in data); margin=((total-cost)/total*100) if total else 0
        delta=((data[-1]["revenue"]-data[0]["revenue"])/data[0]["revenue"]*100) if len(data)>1 and data[0]["revenue"] else None
        k=[KPI(key="revenue",label="Revenue",value=round(total,2),unit="USD",delta=delta),KPI(key="gross_margin",label="Gross Margin",value=round(margin,1),unit="%")]
        chart=ChartSpec(type="line",title="Revenue Trend",x_key="month",y_keys=["revenue"],rows=data)
        insights=[f"Total revenue is ${total:,.0f} with gross margin of {margin:.1f}%."]
        rec=["Review performance by region and product before changing targets."]
        return k,chart,insights,rec
analytics_service=AnalyticsService()
