import { lazy, Suspense } from 'react';
import ChartLoader from '@components/common/ChartLoader';

// Lazy load Recharts components
const LazyLineChart = lazy(() => 
  import('recharts').then(module => ({ default: module.LineChart }))
);
const LazyBarChart = lazy(() => 
  import('recharts').then(module => ({ default: module.BarChart }))
);
const LazyLine = lazy(() => 
  import('recharts').then(module => ({ default: module.Line }))
);
const LazyBar = lazy(() => 
  import('recharts').then(module => ({ default: module.Bar }))
);
const LazyXAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.XAxis }))
);
const LazyYAxis = lazy(() => 
  import('recharts').then(module => ({ default: module.YAxis }))
);
const LazyCartesianGrid = lazy(() => 
  import('recharts').then(module => ({ default: module.CartesianGrid }))
);
const LazyTooltip = lazy(() => 
  import('recharts').then(module => ({ default: module.Tooltip }))
);
const LazyLegend = lazy(() => 
  import('recharts').then(module => ({ default: module.Legend }))
);
const LazyResponsiveContainer = lazy(() => 
  import('recharts').then(module => ({ default: module.ResponsiveContainer }))
);

// Blood Pressure Chart
export function BloodPressureChart({ data }) {
  return (
    <Suspense fallback={<ChartLoader />}>
      <LazyResponsiveContainer width="100%" height={300}>
        <LazyLineChart data={data}>
          <LazyCartesianGrid strokeDasharray="3 3" />
          <LazyXAxis dataKey="date" />
          <LazyYAxis />
          <LazyTooltip />
          <LazyLegend />
          <LazyLine type="monotone" dataKey="BP Systolic" stroke="#ef4444" strokeWidth={2} />
          <LazyLine type="monotone" dataKey="BP Diastolic" stroke="#3b82f6" strokeWidth={2} />
        </LazyLineChart>
      </LazyResponsiveContainer>
    </Suspense>
  );
}

// Heart Rate Chart
export function HeartRateChart({ data }) {
  return (
    <Suspense fallback={<ChartLoader />}>
      <LazyResponsiveContainer width="100%" height={300}>
        <LazyLineChart data={data}>
          <LazyCartesianGrid strokeDasharray="3 3" />
          <LazyXAxis dataKey="date" />
          <LazyYAxis />
          <LazyTooltip />
          <LazyLegend />
          <LazyLine type="monotone" dataKey="Heart Rate" stroke="#ec4899" strokeWidth={2} />
        </LazyLineChart>
      </LazyResponsiveContainer>
    </Suspense>
  );
}

// Blood Sugar Chart
export function BloodSugarChart({ data }) {
  return (
    <Suspense fallback={<ChartLoader />}>
      <LazyResponsiveContainer width="100%" height={300}>
        <LazyBarChart data={data}>
          <LazyCartesianGrid strokeDasharray="3 3" />
          <LazyXAxis dataKey="date" />
          <LazyYAxis />
          <LazyTooltip />
          <LazyLegend />
          <LazyBar dataKey="Blood Sugar" fill="#8b5cf6" />
        </LazyBarChart>
      </LazyResponsiveContainer>
    </Suspense>
  );
}

// Weight Chart
export function WeightChart({ data }) {
  return (
    <Suspense fallback={<ChartLoader />}>
      <LazyResponsiveContainer width="100%" height={300}>
        <LazyLineChart data={data}>
          <LazyCartesianGrid strokeDasharray="3 3" />
          <LazyXAxis dataKey="date" />
          <LazyYAxis />
          <LazyTooltip />
          <LazyLegend />
          <LazyLine type="monotone" dataKey="Weight" stroke="#f59e0b" strokeWidth={2} />
        </LazyLineChart>
      </LazyResponsiveContainer>
    </Suspense>
  );
}
