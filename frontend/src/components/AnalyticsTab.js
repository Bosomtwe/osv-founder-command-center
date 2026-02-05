import React, { useState, useEffect } from 'react';
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

// Added default empty arrays to prevent "undefined" map errors
function AnalyticsTab({ tasks = [], clients = [], workers = [] }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    labels: last30Days.map(d => {
      const date = new Date(d);
      return isMobile 
        ? `${date.getDate()}/${date.getMonth() + 1}`
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
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

  // 2. Tasks by status
  const statusCounts = {
    TODO: tasks.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    DONE: tasks.filter(t => t.status === 'DONE').length,
    BLOCKED: tasks.filter(t => t.status === 'BLOCKED').length,
  };

  const pieData = {
    labels: ['To Do', 'In Progress', 'Done', 'Blocked'],
    datasets: [
      {
        data: [statusCounts.TODO, statusCounts.IN_PROGRESS, statusCounts.DONE, statusCounts.BLOCKED],
        backgroundColor: ['#2196f3', '#ff9800', '#4caf50', '#f44336'],
        hoverOffset: 10,
        borderWidth: 1,
        borderColor: '#fff',
      },
    ],
  };

  // 3. Worker workload - Safely handle map
  const workerTasks = workers.map(worker => ({
    name: worker.name,
    count: tasks.filter(t => t.assigned_worker?.id === worker.id).length,
  })).sort((a, b) => b.count - a.count).slice(0, 5); // Limit to top 5 for mobile

  const barWorkerData = {
    labels: workerTasks.map(w => w.name.length > 15 ? w.name.substring(0, 12) + '...' : w.name),
    datasets: [
      {
        label: 'Tasks Assigned',
        data: workerTasks.map(w => w.count),
        backgroundColor: '#1976d2',
        borderRadius: 4,
      },
    ],
  };

  // 4. Client activity - Safely handle map
  const clientTasks = clients.map(client => ({
    name: client.name,
    count: tasks.filter(t => t.client?.id === client.id).length,
  })).sort((a, b) => b.count - a.count).slice(0, 5); // Limit to top 5 for mobile

  const barClientData = {
    labels: clientTasks.map(c => c.name.length > 15 ? c.name.substring(0, 12) + '...' : c.name),
    datasets: [
      {
        label: 'Tasks',
        data: clientTasks.map(c => c.count),
        backgroundColor: '#9c27b0',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { 
        position: isMobile ? 'bottom' : 'top',
        labels: {
          font: {
            size: isMobile ? 11 : 12
          },
          padding: isMobile ? 10 : 20
        }
      },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: {
          size: isMobile ? 12 : 13
        },
        bodyFont: {
          size: isMobile ? 11 : 12
        },
        padding: isMobile ? 8 : 12
      }
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          font: {
            size: isMobile ? 10 : 11
          },
          maxRotation: isMobile ? 45 : 0
        }
      },
      y: {
        ticks: {
          font: {
            size: isMobile ? 10 : 11
          }
        },
        beginAtZero: true
      }
    }
  };

  // Use a responsive CSS grid
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '16px' : '20px',
    marginBottom: '20px'
  };

  const cardStyle = {
    background: 'white',
    padding: isMobile ? '16px' : '20px',
    borderRadius: '12px',
    border: '1px solid #efefef',
    height: isMobile ? '300px' : '350px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  };

  const headerStyle = {
    fontSize: isMobile ? '14px' : '14px',
    marginBottom: isMobile ? '12px' : '15px',
    color: '#666',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  return (
    <div>
      {/* Summary Cards for Mobile */}
      {isMobile && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
              {tasks.length}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Total Tasks
            </div>
          </div>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
              {statusCounts.DONE}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Completed
            </div>
          </div>
        </div>
      )}

      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={headerStyle}>
            <span>📈</span>
            COMPLETED (30D)
          </div>
          <div style={{ height: isMobile ? '200px' : '250px' }}>
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        <div style={cardStyle}>
          <div style={headerStyle}>
            <span>📊</span>
            STATUS DISTRIBUTION
          </div>
          <div style={{ height: isMobile ? '200px' : '250px' }}>
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>

        <div style={cardStyle}>
          <div style={headerStyle}>
            <span>👷</span>
            WORKER WORKLOAD
          </div>
          <div style={{ height: isMobile ? '200px' : '250px' }}>
            <Bar data={barWorkerData} options={chartOptions} />
          </div>
        </div>

        <div style={cardStyle}>
          <div style={headerStyle}>
            <span>👥</span>
            CLIENT ACTIVITY
          </div>
          <div style={{ height: isMobile ? '200px' : '250px' }}>
            <Bar data={barClientData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Additional Stats for Desktop */}
      {!isMobile && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginTop: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1976d2' }}>
              {tasks.length}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              Total Tasks
            </div>
          </div>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4caf50' }}>
              {statusCounts.DONE}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              Completed
            </div>
          </div>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800' }}>
              {statusCounts.IN_PROGRESS}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              In Progress
            </div>
          </div>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2196f3' }}>
              {statusCounts.TODO}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
              To Do
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsTab;