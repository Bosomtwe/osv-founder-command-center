import React, { useState, useEffect } from 'react';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import api from '../api';

function CreateTaskModal({ clients, workers, onClose, onSuccess }) {
  const [clientId, setClientId] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // FIXED: Use proper Block[] format instead of plain string
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "What needs to be done?",
            styles: {}
          }
        ]
      }
    ]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const content = editor.document;

    // Prevent completely empty submissions
    const hasContent = content.some(block => 
      block.content?.some(c => c.text?.trim())
    );
    if (!hasContent) {
      setError('Please add a description');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('tasks/', {
        description: content,                    // Send JSON array directly
        client_id: clientId || null,
        assigned_worker_id: workerId || null,
        due_date: dueDate || null,
        status: 'TODO',
      });

      onSuccess(response.data);
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task. Try again.');
      console.error('Create task error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: isMobile ? '20px 16px' : '0',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'white',
        padding: isMobile ? '24px 20px' : '30px',
        borderRadius: '12px',
        width: isMobile ? '100%' : 'min(500px, 90vw)',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        marginTop: isMobile ? '20px' : '0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: isMobile ? '20px' : '24px',
            color: '#333'
          }}>
            Create New Task
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              fontSize: isMobile ? '15px' : '14px'
            }}>
              Description *
            </label>
            <div style={{
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              minHeight: isMobile ? '120px' : '140px',
              background: '#fff',
              overflow: 'hidden'
            }}>
              <BlockNoteView editor={editor} />
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
            gap: isMobile ? '16px' : '20px', 
            marginBottom: '24px' 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                fontSize: isMobile ? '15px' : '14px'
              }}>
                Client
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: isMobile ? '14px' : '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #d1d5db',
                  fontSize: isMobile ? '16px' : '14px',
                  backgroundColor: '#fafafa'
                }}
              >
                <option value="">None</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: 'bold',
                fontSize: isMobile ? '15px' : '14px'
              }}>
                Assign To
              </label>
              <select
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: isMobile ? '14px' : '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #d1d5db',
                  fontSize: isMobile ? '16px' : '14px',
                  backgroundColor: '#fafafa'
                }}
              >
                <option value="">Unassigned</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>{worker.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              fontSize: isMobile ? '15px' : '14px'
            }}>
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ 
                width: '100%', 
                padding: isMobile ? '14px' : '12px', 
                borderRadius: '8px', 
                border: '1px solid #d1d5db',
                fontSize: isMobile ? '16px' : '14px',
                backgroundColor: '#fafafa'
              }}
            />
          </div>

          {error && (
            <p style={{ 
              color: '#ef4444', 
              margin: '0 0 20px', 
              textAlign: 'center',
              fontSize: isMobile ? '15px' : '14px',
              padding: '12px',
              background: '#fef2f2',
              borderRadius: '6px'
            }}>
              {error}
            </p>
          )}

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: isMobile ? '14px 20px' : '12px 24px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: isMobile ? '15px' : '14px',
                fontWeight: '500',
                minWidth: isMobile ? '100px' : 'auto'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: isMobile ? '14px 20px' : '12px 24px',
                background: loading ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: isMobile ? '15px' : '14px',
                fontWeight: '500',
                minWidth: isMobile ? '120px' : 'auto'
              }}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;