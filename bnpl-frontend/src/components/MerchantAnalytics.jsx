import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../api/analytics';
import './MerchantAnalytics.css';
import TotalRevenueChart   from './TotalRevenueChart';
import OverduePlansChart   from './OverduePlansChart';
import SuccessRateChart    from './SuccessRateChart';

export default function MerchantAnalytics() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(() => setData({ error: 'Failed to load analytics' }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading analytics…</p>;
  if (data?.error) return <p className="text-red-600">{data.error}</p>;

  const totalPlans = data.total_plans ?? 0;

  return (
    <div className="analytics-grid">
      <div className="stat-card">
        <h4>Total Revenue</h4>
        <TotalRevenueChart totalRevenue={data.total_revenue} />
      </div>
      <div className="stat-card">
        <h4>Overdue Plans</h4>
        <OverduePlansChart
          overduePlans={data.overdue_plans}
          totalPlans={totalPlans}
        />
      </div>
      <div className="stat-card">
        <h4>Success Rate</h4>
        <SuccessRateChart successRate={data.success_rate} />
      </div>
    </div>
  );
}
