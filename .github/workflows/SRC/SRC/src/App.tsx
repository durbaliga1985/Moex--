import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Activity, BarChart2, Loader2, AlertCircle } from 'lucide-react';
import { searchSecurities, getCandles } from './moexService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSecurity, setSelectedSecurity] = useState<any | null>(null);
  const [candles, setCandles] = useState<any[]>([]);
  const [isLoadingCandles, setIsLoadingCandles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchSecurities(searchQuery);
          setSearchResults(results);
        } catch (err) {
          setError('Ошибка при поиске');
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSecurity = async (security: any) => {
    setSelectedSecurity(security);
    setSearchQuery('');
    setSearchResults([]);
    setIsLoadingCandles(true);
    try {
      const till = new Date().toISOString().split('T')[0];
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
      const from = fromDate.toISOString().split('T')[0];
      const data = await getCandles(security.secid, from, till);
      setCandles(data.map((c: any) => ({ date: c.begin.split(' ')[0], price: c.close })));
    } catch (err) {
      setError('Ошибка загрузки данных');
    } finally {
      setIsLoadingCandles(false);
    }
  };

  const calculateStats = () => {
    if (candles.length < 2) return null;
    const latest = candles[candles.length - 1].price;
    const previous = candles[candles.length - 2].price;
    const change = latest - previous;
    const percent = (change / previous) * 100;
    return { latest, change, percent, isPositive: change >= 0 };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-4">
      <header className="flex items-center gap-2 mb-8">
        <Activity className="w-6 h-6 text-blue-500" />
        <h1 className="text-xl font-bold">MOEX Analyzer</h1>
      </header>

      <div className="relative max-w-md mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Поиск акции (SBER, GAZP...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchResults.length > 0 && (
          <div className="absolute z-20 w-full mt-2 bg-[#141414] border border-gray-800 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
            {searchResults.map((s) => (
              <div key={s.secid} className="p-3 hover:bg-gray-800 cursor-pointer" onClick={() => handleSelectSecurity(s)}>
                <div className="font-bold">{s.secid}</div>
                <div className="text-sm text-gray-500">{s.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isLoadingCandles ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
      ) : selectedSecurity && (
        <div className="space-y-4">
          <div className="bg-[#141414] p-6 rounded-2xl border border-gray-800">
            <h2 className="text-2xl font-bold">{selectedSecurity.secid}</h2>
            <p className="text-gray-400 mb-4">{selectedSecurity.name}</p>
            {stats && (
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-mono">{stats.latest.toFixed(2)} ₽</span>
                <span className={`flex items-center ${stats.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {Math.abs(stats.percent).toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          <div className="bg-[#141414] p-4 rounded-2xl border border-gray-800 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={candles}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip contentStyle={{backgroundColor: '#1a1a1a', border: 'none'}} />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
