import './ChartLoader.css';

function ChartLoader() {
  return (
    <div className="chart-loader">
      <div className="chart-skeleton">
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
        <div className="skeleton-line medium"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
      </div>
      <p className="loader-text">Loading chart data...</p>
    </div>
  );
}

export default ChartLoader;
