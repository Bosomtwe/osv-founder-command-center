import React, { useEffect, useState } from 'react';
import api from '../api';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import ClientManager from './ClientManager';
import WorkerManager from './WorkerManager';
import AnalyticsTab from './AnalyticsTab';
import ExportButton from './ExportButton';
import RichTextPreview from './RichTextPreview';

function Dashboard({ user, onLogout }) {
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
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Detect mobile/desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsRes, workersRes, tasksRes] = await Promise.all([
        api.get('clients/'),
        api.get('workers/'),
        api.get('tasks/')
      ]);
      setClients(clientsRes.data);
      setWorkers(workersRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      await api.delete(`tasks/${deletingTask.id}/`);
      setTasks(tasks.filter(t => t.id !== deletingTask.id));
      setDeletingTask(null);
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const filteredTasks = tasks.filter(task => {
    const desc = typeof task.description === 'string' 
      ? task.description 
      : JSON.stringify(task.description);
    const searchLower = searchQuery.toLowerCase();
    
    return (
      desc.toLowerCase().includes(searchLower) ||
      (task.client?.name && task.client.name.toLowerCase().includes(searchLower)) ||
      (task.assigned_worker?.name && task.assigned_worker.name.toLowerCase().includes(searchLower)) ||
      task.status.toLowerCase().includes(searchLower)
    );
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'DONE': return '#4caf50';
      case 'IN_PROGRESS': return '#ff9800';
      case 'BLOCKED': return '#f44336';
      default: return '#2196f3'; // TODO
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch(status) {
      case 'DONE': return 'Done';
      case 'IN_PROGRESS': return 'In Progress';
      case 'BLOCKED': return 'Blocked';
      default: return 'To Do';
    }
  };

  return (
    <div className="notion-layout" style={{ 
      display: 'flex', 
      height: '100vh', 
      background: '#fff',
      overflow: 'hidden'
    }}>
      
      {/* SIDEBAR - Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* SIDEBAR */}
      <aside style={{
        width: isSidebarOpen ? (isMobile ? '280px' : '240px') : '0px',
        backgroundColor: '#f7f6f3',
        borderRight: '1px solid #efefef',
        transition: 'transform 0.3s ease, width 0.3s ease',
        transform: isMobile && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: isMobile ? 'fixed' : 'relative',
        height: '100%',
        zIndex: 2001,
        boxShadow: isMobile && isSidebarOpen ? '4px 0 20px rgba(0,0,0,0.1)' : 'none'
      }}>
        <div style={{ 
          padding: isMobile ? '24px 20px' : '20px', 
          fontWeight: '600', 
          color: '#37352f', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          borderBottom: '1px solid #efefef'
        }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            background: '#1976d2', 
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            OSV
          </div>
          <div>
            <div style={{ fontSize: '16px' }}>OSV Founder</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
              {user?.username || 'User'}
            </div>
          </div>
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(false)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ✕
            </button>
          )}
        </div>
        
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {[
            { id: 'tasks', label: '✅ Tasks', count: tasks.length, icon: '📋' },
            { id: 'clients', label: '👥 Clients', count: clients.length, icon: '👤' },
            { id: 'workers', label: '🛠 Workers', count: workers.length, icon: '👷' },
            { id: 'analytics', label: '📈 Analytics', count: null, icon: '📊' }
          ].map(item => (
            <div 
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if(isMobile) setSidebarOpen(false);
              }}
              style={{
                padding: isMobile ? '14px 12px' : '12px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: isMobile ? '15px' : '14px',
                backgroundColor: activeTab === item.id ? 'rgba(55, 53, 47, 0.08)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '4px',
                transition: 'background 0.2s'
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count !== null && (
                <span style={{ 
                  background: activeTab === item.id ? '#1976d2' : 'rgba(55, 53, 47, 0.1)',
                  color: activeTab === item.id ? 'white' : '#666',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  minWidth: '24px',
                  textAlign: 'center'
                }}>
                  {item.count}
                </span>
              )}
            </div>
          ))}
          
          {/* Logout Button */}
          <div 
            onClick={onLogout}
            style={{
              padding: isMobile ? '14px 12px' : '12px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: isMobile ? '15px' : '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: 'auto',
              color: '#d32f2f',
              borderTop: '1px solid #efefef',
              paddingTop: '20px'
            }}
          >
            <span style={{ fontSize: '18px' }}>🚪</span>
            <span>Logout</span>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ 
        flex: 1, 
        overflowY: 'auto', 
        position: 'relative',
        paddingBottom: isMobile ? '80px' : '0'
      }}>
        
        {/* Top Navbar */}
        <header style={{ 
          height: isMobile ? '56px' : '45px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: isMobile ? '0 16px' : '0 20px', 
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: '#fff',
          zIndex: 90,
          borderBottom: '1px solid #efefef',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: isMobile ? '20px' : '18px',
              padding: isMobile ? '8px' : '4px',
              borderRadius: '6px',
              color: '#666'
            }}
          >
            ☰
          </button>
          
          <div style={{ 
            fontSize: isMobile ? '18px' : '16px', 
            fontWeight: '600', 
            color: '#333',
            textAlign: 'center',
            flex: 1,
            margin: '0 16px'
          }}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </div>
          
          <div style={{ display: 'flex', gap: isMobile ? '8px' : '10px' }}>
            {!isMobile && (
              <ExportButton data={tasks} fileName="tasks_export" label="Export" />
            )}
            <button 
              onClick={() => setShowCreateModal(true)}
              style={{ 
                background: '#1976d2', 
                color: 'white', 
                border: 'none', 
                borderRadius: isMobile ? '8px' : '4px', 
                padding: isMobile ? '8px 16px' : '6px 14px', 
                fontSize: isMobile ? '14px' : '13px', 
                fontWeight: '500', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              {isMobile ? '➕ New' : 'New Task'}
            </button>
          </div>
        </header>

        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: isMobile ? '20px 16px' : '40px 20px' 
        }}>
          {!isMobile && (
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              marginBottom: '20px', 
              color: '#37352f' 
            }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
          )}

          {/* Search Bar */}
          <div style={{ 
            marginBottom: '24px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <input 
              type="text" 
              placeholder="Search tasks, clients, workers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                flex: 1,
                padding: isMobile ? '12px 16px' : '10px 14px', 
                borderRadius: '8px', 
                border: '1px solid #e0e0e0', 
                background: '#f9f9f9', 
                outline: 'none',
                fontSize: isMobile ? '16px' : '14px'
              }}
            />
            {isMobile && (
              <ExportButton 
                data={tasks} 
                fileName="tasks_export" 
                label="📥"
                style={{ padding: '12px' }}
              />
            )}
          </div>

          {loading ? (
             <div style={{ 
               padding: '40px', 
               textAlign: 'center', 
               color: '#666',
               fontSize: isMobile ? '16px' : '14px'
             }}>
               Loading tasks...
             </div>
          ) : (
            <>
              {activeTab === 'tasks' && (
                <div style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  background: '#fff'
                }}>
                  {/* Table Header */}
                  {!isMobile && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 0.5fr',
                      padding: '16px 20px',
                      background: '#f8f9fa',
                      borderBottom: '1px solid #e9ecef',
                      fontWeight: '600',
                      color: '#495057',
                      fontSize: '14px'
                    }}>
                      <div>Description</div>
                      <div>Status</div>
                      <div>Client</div>
                      <div>Assigned To</div>
                      <div>Due Date</div>
                      <div style={{ textAlign: 'center' }}>Actions</div>
                    </div>
                  )}

                  {/* Task List */}
                  {filteredTasks.length === 0 ? (
                    <div style={{
                      padding: '60px 20px',
                      textAlign: 'center',
                      color: '#666',
                      background: '#fff',
                      borderRadius: '12px'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                      <div style={{ fontSize: '18px', marginBottom: '8px' }}>No tasks found</div>
                      <div style={{ color: '#999', marginBottom: '24px' }}>
                        {searchQuery ? 'Try a different search' : 'Create your first task'}
                      </div>
                      <button 
                        onClick={() => setShowCreateModal(true)}
                        style={{
                          padding: '12px 24px',
                          background: '#1976d2',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        + Create Task
                      </button>
                    </div>
                  ) : (
                    filteredTasks.map(task => (
                      <div 
                        key={task.id}
                        style={{
                          display: isMobile ? 'block' : 'grid',
                          gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 0.5fr',
                          padding: isMobile ? '16px' : '16px 20px',
                          borderBottom: '1px solid #efefef',
                          alignItems: 'center',
                          transition: 'background 0.2s',
                          background: '#fff',
                          cursor: 'pointer'
                        }}
                        onClick={() => { setEditingTask(task); setShowEditModal(true); }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f9f9f9'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                      >
                        {/* Description */}
                        <div style={{ 
                          marginBottom: isMobile ? '12px' : '0',
                          minWidth: 0 // For text truncation
                        }}>
                          <div style={{ 
                            fontWeight: '500', 
                            color: '#333',
                            marginBottom: '4px',
                            fontSize: isMobile ? '15px' : '14px'
                          }}>
                            <RichTextPreview content={task.description} />
                          </div>
                          {isMobile && (
                            <div style={{ 
                              display: 'flex', 
                              gap: '8px', 
                              flexWrap: 'wrap',
                              marginTop: '8px'
                            }}>
                              <span style={{
                                padding: '2px 8px',
                                background: getStatusColor(task.status),
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}>
                                {getStatusText(task.status)}
                              </span>
                              {task.client?.name && (
                                <span style={{
                                  padding: '2px 8px',
                                  background: '#e3f2fd',
                                  color: '#1976d2',
                                  borderRadius: '12px',
                                  fontSize: '12px'
                                }}>
                                  👤 {task.client.name}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Status - Hidden on mobile (shown in description) */}
                        {!isMobile && (
                          <div>
                            <span style={{
                              padding: '4px 12px',
                              background: getStatusColor(task.status),
                              color: 'white',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              display: 'inline-block'
                            }}>
                              {getStatusText(task.status)}
                            </span>
                          </div>
                        )}

                        {/* Client */}
                        {!isMobile && (
                          <div style={{ color: '#555', fontSize: '14px' }}>
                            {task.client?.name || '-'}
                          </div>
                        )}

                        {/* Assigned To */}
                        {!isMobile && (
                          <div style={{ color: '#555', fontSize: '14px' }}>
                            {task.assigned_worker?.name || '-'}
                          </div>
                        )}

                        {/* Due Date */}
                        <div style={{ 
                          color: '#555', 
                          fontSize: isMobile ? '13px' : '14px',
                          marginBottom: isMobile ? '12px' : '0'
                        }}>
                          {isMobile && '📅 '}
                          {formatDate(task.due_date)}
                        </div>

                        {/* Actions */}
                        <div style={{ 
                          textAlign: isMobile ? 'right' : 'center',
                          marginTop: isMobile ? '8px' : '0'
                        }}>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setDeletingTask(task); 
                            }}
                            style={{ 
                              color: '#eb5757', 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer',
                              fontSize: isMobile ? '18px' : '16px',
                              padding: '4px 8px',
                              borderRadius: '4px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#ffebee'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                          >
                            {isMobile ? '🗑 Delete' : '🗑'}
                          </button>
                        </div>

                        {/* Mobile: Assigned To */}
                        {isMobile && task.assigned_worker?.name && (
                          <div style={{ 
                            color: '#555', 
                            fontSize: '13px',
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span>👷</span>
                            <span>{task.assigned_worker.name}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Summary Stats */}
              {activeTab === 'tasks' && filteredTasks.length > 0 && !isMobile && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '20px',
                  marginTop: '30px'
                }}>
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1976d2' }}>
                      {tasks.filter(t => t.status === 'TODO').length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                      To Do
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
                      {tasks.filter(t => t.status === 'IN_PROGRESS').length}
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
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4caf50' }}>
                      {tasks.filter(t => t.status === 'DONE').length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                      Done
                    </div>
                  </div>
                  <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f44336' }}>
                      {tasks.filter(t => t.status === 'BLOCKED').length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                      Blocked
                    </div>
                  </div>
                </div>
              )}

              {/* Other Tabs */}
              {activeTab === 'clients' && <ClientManager clients={clients} onRefresh={fetchData} searchQuery={searchQuery} />}
              {activeTab === 'workers' && <WorkerManager workers={workers} onRefresh={fetchData} searchQuery={searchQuery} />}
              {activeTab === 'analytics' && (
                <AnalyticsTab tasks={tasks} clients={clients} workers={workers} />
              )}
            </>
          )}
        </div>
        
        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#fff',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '8px 0',
            zIndex: 1000,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
          }}>
            {[
              { id: 'tasks', icon: '📋', label: 'Tasks' },
              { id: 'clients', icon: '👥', label: 'Clients' },
              { id: 'workers', icon: '🛠', label: 'Workers' },
              { id: 'analytics', icon: '📊', label: 'Analytics' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  flex: 1,
                  color: activeTab === item.id ? '#1976d2' : '#666'
                }}
              >
                <span style={{ fontSize: '20px', marginBottom: '2px' }}>{item.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: '500' }}>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* MODALS */}
      {showCreateModal && (
        <CreateTaskModal 
          clients={clients} 
          workers={workers} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={fetchData} 
        />
      )}
      
      {showEditModal && (
        <EditTaskModal 
          task={editingTask} 
          clients={clients} 
          workers={workers} 
          onClose={() => setShowEditModal(false)} 
          onSuccess={fetchData} 
        />
      )}
      
      {deletingTask && (
        <div className="modal-overlay" style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.4)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 2000,
          padding: isMobile ? '16px' : '0'
        }}>
          <div style={{ 
            background: '#fff', 
            padding: isMobile ? '24px 20px' : '24px', 
            borderRadius: '12px', 
            width: isMobile ? '100%' : '300px', 
            maxWidth: '400px',
            margin: isMobile ? '16px' : '0',
            textAlign: 'center' 
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: isMobile ? '18px' : '16px' }}>
              Delete Task?
            </h3>
            <p style={{ 
              color: '#666', 
              marginBottom: '24px',
              fontSize: isMobile ? '15px' : '14px'
            }}>
              This action cannot be undone.
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: '20px' 
            }}>
              <button 
                onClick={() => setDeletingTask(null)}
                style={{ 
                  flex: 1, 
                  padding: isMobile ? '14px' : '12px', 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  background: 'none',
                  fontSize: isMobile ? '15px' : '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteTask}
                style={{ 
                  flex: 1, 
                  padding: isMobile ? '14px' : '12px', 
                  background: '#eb5757', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '8px',
                  fontSize: isMobile ? '15px' : '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;