// frontend/src/components/admin/StatsCard.jsx
function StatsCard({ title, value, change, icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
          {change && (
            <p className="text-xs mt-1">
              <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
                {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
              </span> vs ayer
            </p>
          )}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}