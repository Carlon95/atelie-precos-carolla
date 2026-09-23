export const categories = ['Brincos', 'Colares', 'Pulseiras', 'Anéis', 'Acessórios de cabelo', 'Outros'];
export const keys = ['purchase', 'freight', 'quantity', 'packaging', 'overhead', 'fixedFee', 'fee', 'tax', 'margin', 'sale'] as const;
export type Values = Record<typeof keys[number], number>;
export type Product = Values & {id:string; name:string; category:string; photo:string|null; updated_at:string; stock:number; stock_min:number};
export const initial = {purchase:0,freight:0,quantity:1,packaging:0,overhead:0,fixedFee:0,fee:0,tax:0,margin:40,sale:0};
export const money = (v:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
export function calculate(v:Values) {
 const cost=v.purchase+v.freight/v.quantity+v.packaging+v.overhead+v.fixedFee;
 const rate=(v.fee+v.tax)/100, denominator=1-rate-v.margin/100;
 const valid=keys.every(k=>Number.isFinite(v[k])&&v[k]>=0)&&Number.isInteger(v.quantity)&&v.quantity>=1&&denominator>0;
 const suggested=valid?Math.max(0,Math.ceil((cost/denominator-1e-9)*100)/100):0;
 const price=v.sale>0?v.sale:suggested, fees=price*rate, profit=price-cost-fees;
 return {cost,valid,suggested,price,fees,profit,actualMargin:price>0?100*profit/price:0,minimum:valid?Math.ceil(cost/(1-rate)*100)/100:0};
}
