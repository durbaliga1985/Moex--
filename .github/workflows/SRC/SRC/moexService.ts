export const searchSecurities = async (query: string) => {
  if (!query) return [];
  const response = await fetch(`https://iss.moex.com/iss/securities.json?q=${encodeURIComponent(query)}&iss.meta=off&securities.columns=secid,shortname,name`);
  const data = await response.json();
  return data.securities.data.map((item: any[]) => ({ secid: item[0], shortname: item[1], name: item[2] }));
};

export const getCandles = async (secid: string, from: string, till: string) => {
  const response = await fetch(`https://iss.moex.com/iss/engines/stock/markets/shares/securities/${secid}/candles.json?iss.meta=off&interval=24&from=${from}&till=${till}`);
  const data = await response.json();
  return data.candles.data.map((item: any[]) => ({ open: item[0], close: item[1], high: item[2], low: item[3], begin: item[6] }));
};
