import React, { useEffect, useState } from 'react';
import api from '../api';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import ClientManager from './ClientManager';
import WorkerManager from './WorkerManager';
import AnalyticsTab from './AnalyticsTab';
import ExportButton from './ExportButton';  // ← Already imported

function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, workers: 0, activeTasks: 0 });
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, workersRes, tasksRes] = await Promise.all([
          api.get('clients/'),
          api.get('workers/'),
          api.get('tasks/'),
        ]);

        const activeTasks = tasksRes.data.filter(t => t.status !== 'DONE').length;

        setClients(clientsRes.data);
        setWorkers(workersRes.data);
        setTasks(tasksRes.data);
        setStats({
          clients: clientsRes.data.length,
          workers: workersRes.data.length,
          activeTasks,
        });
      } catch (err) {
        console.error(err);
        alert('Error loading data. Are you logged in?');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshData = () => {
    const fetch = async () => {
      const [c, w, t] = await Promise.all([
        api.get('clients/'),
        api.get('workers/'),
        api.get('tasks/'),
      ]);
      setClients(c.data);
      setWorkers(w.data);
      setTasks(t.data);
      setStats({
        clients: c.data.length,
        workers: w.data.length,
        activeTasks: t.data.filter(task => task.status !== 'DONE').length,
      });
    };
    fetch();
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await api.patch(`tasks/${taskId}/`, { status: newStatus });

      const oldTask = tasks.find(t => t.id === taskId);
      const wasActive = oldTask?.status !== 'DONE';
      const isNowActive = newStatus !== 'DONE';

      setTasks(prevTasks =>
        prevTasks.map(t => (t.id === taskId ? response.data : t))
      );

      if (wasActive && !isNowActive) {
        setStats(prev => ({ ...prev, activeTasks: prev.activeTasks - 1 }));
      } else if (!wasActive && isNowActive) {
        setStats(prev => ({ ...prev, activeTasks: prev.activeTasks + 1 }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update task status. Try again.');
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleEditSuccess = (updatedTask) => {
    setTasks(prevTasks =>
      prevTasks.map(t => (t.id === updatedTask.id ? updatedTask : t))
    );

    const oldTask = tasks.find(t => t.id === updatedTask.id);
    const wasActive = oldTask?.status !== 'DONE';
    const isNowActive = updatedTask.status !== 'DONE';

    if (wasActive && !isNowActive) {
      setStats(prev => ({ ...prev, activeTasks: prev.activeTasks - 1 }));
    } else if (!wasActive && isNowActive) {
      setStats(prev => ({ ...prev, activeTasks: prev.activeTasks + 1 }));
    }

    setShowEditModal(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;

    try {
      await api.delete(`tasks/${deletingTask.id}/`);

      setTasks(prev => prev.filter(t => t.id !== deletingTask.id));

      if (deletingTask.status !== 'DONE') {
        setStats(prev => ({ ...prev, activeTasks: prev.activeTasks - 1 }));
      }

      setDeletingTask(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert('Failed to delete task. Try again.');
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading your command center...</div>;

  const filteredTasks = tasks.filter(task =>
    searchQuery === '' ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.client?.name && task.client.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (task.assigned_worker?.name && task.assigned_worker.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header with Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ margin: 0, color: '#1976d2', fontSize: '32px' }}>OSV Founder Command Center</h1>
        <input
          type="text"
          placeholder="Search tasks, clients, workers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '14px 20px',
            width: '400px',
            maxWidth: '100%',
            borderRadius: '12px',
            border: '2px solid #ddd',
            fontSize: '16px',
            outline: 'none',
            transition: 'border 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#1976d2'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
      </div>

      {/* Tabs + Export Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '40px',
        borderBottom: '3px solid #eee',
        paddingBottom: '10px'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('tasks')}
            style={{
              padding: '14px 28px',
              fontSize: '18px',
              fontWeight: '600',
              background: activeTab === 'tasks' ? '#1976d2' : 'transparent',
              color: activeTab === 'tasks' ? 'white' : '#1976d2',
              border: 'none',
              borderRadius: '12px 12px 0 0',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            style={{
              padding: '14px 28px',
              fontSize: '18px',
              fontWeight: '600',
              background: activeTab === 'clients' ? '#1976d2' : 'transparent',
              color: activeTab === 'clients' ? 'white' : '#1976d2',
              border: 'none',
              borderRadius: '12px 12px 0 0',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Clients ({stats.clients})
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            style={{
              padding: '14px 28px',
              fontSize: '18px',
              fontWeight: '600',
              background: activeTab === 'workers' ? '#1976d2' : 'transparent',
              color: activeTab === 'workers' ? 'white' : '#1976d2',
              border: 'none',
              borderRadius: '12px 12px 0 0',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Workers ({stats.workers})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '14px 28px',
              fontSize: '18px',
              fontWeight: '600',
              background: activeTab === 'analytics' ? '#1976d2' : 'transparent',
              color: activeTab === 'analytics' ? 'white' : '#1976d2',
              border: 'none',
              borderRadius: '12px 12px 0 0',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Analytics
          </button>
        </div>

        {/* Export Button - appears only on data tabs */}
        {(activeTab === 'tasks' || activeTab === 'clients' || activeTab === 'workers') && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'tasks' && (
              <ExportButton
                data={filteredTasks.map(t => ({
                  id: t.id,
                  description: t.description,
                  status: t.status,
                  client: t.client?.name || '',
                  assigned_worker: t.assigned_worker?.name || '',
                  due_date: t.due_date || '',
                  created_at: t.created_at || '',
                  updated_at: t.updated_at || ''
                }))}
                filename="OSV_Tasks.csv"
                label="Export Tasks"
              />
            )}
            {activeTab === 'clients' && (
              <ExportButton
                data={clients.map(c => ({
                  id: c.id,
                  name: c.name,
                  contact_email: c.contact_email || '',
                  phone: c.phone || '',
                  notes: c.notes || '',
                  created_at: c.created_at || ''
                }))}
                filename="OSV_Clients.csv"
                label="Export Clients"
              />
            )}
            {activeTab === 'workers' && (
              <ExportButton
                data={workers.map(w => ({
                  id: w.id,
                  name: w.name,
                  skills: w.skills || '',
                  availability: w.availability || '',
                  contact_email: w.contact_email || '',
                  created_at: w.created_at || ''
                }))}
                filename="OSV_Workers.csv"
                label="Export Workers"
              />
            )}
          </div>
        )}
      </div>

      {/* Summary Cards - Only on Tasks Tab */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <div style={{ padding: '25px', background: '#e3f2fd', borderRadius: '12px', flex: 1, minWidth: '200px' }}>
            <h3>Clients</h3>
            <p style={{ fontSize: '2.5em', margin: '10px 0', fontWeight: 'bold' }}>{stats.clients}</p>
          </div>
          <div style={{ padding: '25px', background: '#e8f5e8', borderRadius: '12px', flex: 1, minWidth: '200px' }}>
            <h3>Workers</h3>
            <p style={{ fontSize: '2.5em', margin: '10px 0', fontWeight: 'bold' }}>{stats.workers}</p>
          </div>
          <div style={{ padding: '25px', background: '#fff3e0', borderRadius: '12px', flex: 1, minWidth: '200px' }}>
            <h3>Active Tasks</h3>
            <p style={{ fontSize: '2.5em', margin: '10px 0', fontWeight: 'bold' }}>{stats.activeTasks}</p>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'tasks' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Recent Tasks</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '12px 24px',
                background: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              + Create New Task
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
            <thead style={{ background: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '15px', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '15px' }}>Status</th>
                <th style={{ padding: '15px' }}>Client</th>
                <th style={{ padding: '15px' }}>Assigned To</th>
                <th style={{ padding: '15px' }}>Due Date</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    {searchQuery ? 'No tasks match your search.' : 'No tasks yet. Create your first one!'}
                  </td>
                </tr>
              ) : (
                filteredTasks.slice(0, 20).map(task => (
                  <tr
                    key={task.id}
                    onClick={() => openEditModal(task)}
                    style={{
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f8ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <td style={{ padding: '15px', verticalAlign: 'middle' }}>{task.description}</td>

                    <td style={{ padding: '15px', verticalAlign: 'middle' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
                          <button
                            key={status}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTaskStatus(task.id, status);
                            }}
                            disabled={task.status === status}
                            style={{
                              padding: '8px 14px',
                              border: 'none',
                              borderRadius: '20px',
                              fontSize: '13px',
                              fontWeight: '500',
                              cursor: task.status === status ? 'default' : 'pointer',
                              background: task.status === status
                                ? (status === 'DONE' ? '#4caf50' : status === 'IN_PROGRESS' ? '#ff9800' : '#2196f3')
                                : '#f5f5f5',
                              color: task.status === status ? 'white' : '#444',
                              opacity: task.status === status ? 1 : 0.85,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {status === 'TODO' ? 'To Do' : status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                          </button>
                        ))}
                      </div>
                    </td>

                    <td style={{ padding: '15px', verticalAlign: 'middle' }}>{task.client?.name || '-'}</td>
                    <td style={{ padding: '15px', verticalAlign: 'middle' }}>{task.assigned_worker?.name || '-'}</td>
                    <td style={{ padding: '15px', verticalAlign: 'middle' }}>{task.due_date || '-'}</td>

                    <td style={{ padding: '15px', verticalAlign: 'middle', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setDeletingTask(task)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          fontSize: '20px',
                          cursor: 'pointer',
                          color: '#d32f2f',
                          padding: '8px',
                          borderRadius: '50%',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffebee'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'clients' && <ClientManager clients={clients} onRefresh={refreshData} searchQuery={searchQuery} />}
      {activeTab === 'workers' && <WorkerManager workers={workers} onRefresh={refreshData} searchQuery={searchQuery} />}
      {activeTab === 'analytics' && <AnalyticsTab tasks={tasks} clients={clients} workers={workers} />}

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal
          clients={clients}
          workers={workers}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newTask) => {
            setTasks([newTask, ...tasks]);
            setStats(prev => ({ ...prev, activeTasks: prev.activeTasks + 1 }));
            setShowCreateModal(false);
          }}
        />
      )}

      {showEditModal && editingTask && (
        <EditTaskModal
          task={editingTask}
          clients={clients}
          workers={workers}
          onClose={() => {
            setShowEditModal(false);
            setEditingTask(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {deletingTask && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '16px',
            width: '500px',
            maxWidth: '90vw',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#d32f2f' }}>Delete Task?</h3>
            <p style={{ margin: '0 0 30px 0', color: '#555', fontSize: '16px' }}>
              Are you sure you want to permanently delete:<br />
              <strong>"{deletingTask.description}"</strong>?
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeletingTask(null)}
                style={{
                  padding: '12px 30px',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                style={{
                  padding: '12px 30px',
                  background: '#d32f2f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;