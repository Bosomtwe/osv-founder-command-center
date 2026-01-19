import React from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function AnalyticsTab({ tasks, clients, workers }) {
  // 1. Tasks completed over time (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const completedByDay = last30Days.map(date => {
    return tasks.filter(t => t.status === 'DONE' && t.updated_at?.startsWith(date)).length;
  });

  const lineData = {
    labels: last30Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Tasks Completed',
        data: completedByDay,
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // 2. Tasks by status (pie)
  const statusCounts = {
    TODO: tasks.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    DONE: tasks.filter(t => t.status === 'DONE').length,
  };

  const pieData = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [
      {
        data: [statusCounts.TODO, statusCounts.IN_PROGRESS, statusCounts.DONE],
        backgroundColor: ['#2196f3', '#ff9800', '#4caf50'],
        hoverOffset: 10,
      },
    ],
  };

  // 3. Worker workload
  const workerTasks = workers.map(worker => ({
    name: worker.name,
    count: tasks.filter(t => t.assigned_worker?.id === worker.id).length,
  })).sort((a, b) => b.count - a.count);

  const barWorkerData = {
    labels: workerTasks.map(w => w.name),
    datasets: [
      {
        label: 'Tasks Assigned',
        data: workerTasks.map(w => w.count),
        backgroundColor: '#1976d2',
      },
    ],
  };

  // 4. Client activity
  const clientTasks = clients.map(client => ({
    name: client.name,
    count: tasks.filter(t => t.client?.id === client.id).length,
  })).sort((a, b) => b.count - a.count);

  const barClientData = {
    labels: clientTasks.map(c => c.name),
    datasets: [
      {
        label: 'Tasks',
        data: clientTasks.map(c => c.count),
        backgroundColor: '#9c27b0',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, font: { size: 18 } },
    },
    maintainAspectRatio: false,
  };

  return (
    <div>
      <h2 style={{ marginBottom: '30px' }}>Analytics Overview</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
        {/* Tasks Completed Over Time */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', height: '400px' }}>
          <h3 style={{ margin: '0 0 20px 0' }}>Tasks Completed (Last 30 Days)</h3>
          <Line data={lineData} options={{ ...chartOptions, title: { display: false } }} height={350} />
        </div>

        {/* Status Distribution */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', height: '400px' }}>
          <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Task Status Distribution</h3>
          <Pie data={pieData} options={{ ...chartOptions, title: { display: false } }} height={350} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Worker Workload */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', height: '400px' }}>
          <h3 style={{ margin: '0 0 20px 0' }}>Worker Workload</h3>
          <Bar data={barWorkerData} options={{ ...chartOptions, title: { display: false } }} height={350} />
        </div>

        {/* Client Activity */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', height: '400px' }}>
          <h3 style={{ margin: '0 0 20px 0' }}>Client Activity</h3>
          <Bar data={barClientData} options={{ ...chartOptions, title: { display: false } }} height={350} />
        </div>
      </div>
    </div>
  );
}

export default AnalyticsTab;