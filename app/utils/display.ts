export const formatMoney = (money: number) => money.toLocaleString("ja-JP", { style: "currency", currency: "JPY" }).replace("￥", "¥ ")
