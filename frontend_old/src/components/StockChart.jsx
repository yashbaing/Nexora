import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StockChart({ symbol }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Generate mock chart data
    const chartData = Array.from({ length: 30 }, (_, i) => ({
      time: `${i}:00`,
      price: 100 + Math.sin(i / 5) * 20 + Math.random() * 10,
    }));
    setData(chartData);
  }, [symbol]);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            dot={false}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default StockChart;
