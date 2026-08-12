import React, { useEffect, useState, useRef } from 'react';
import { subscribeToLogs, logToConsole } from '../services/mockApi';
import { Terminal, Shield, Trash2, ArrowDown, Play } from 'lucide-react';

const ConsoleLog = () => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [autoscroll, setAutoscroll] = useState(true);
  const consoleEndRef = useRef(null);

  useEffect(() => {
    // Initial welcome logs to introduce the console
    logToConsole('CLIENT-AUTH', 'Security activity monitor initialized. Waiting for actions...', 'info');

    const unsubscribe = subscribeToLogs((newLog) => {
      setLogs((prev) => [...prev, newLog]);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (autoscroll && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoscroll]);

  const clearLogs = () => {
    setLogs([]);
    logToConsole('SYSTEM', 'Log history cleared.', 'warning');
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'axios') return log.source.startsWith('AXIOS');
    if (filter === 'server') return log.source === 'SERVER';
    if (filter === 'client') return log.source === 'CLIENT-AUTH';
    return true;
  });

  const getLogColorClass = (type) => {
    switch (type) {
      case 'success': return 'log-success'; // Green
      case 'warning': return 'log-warning'; // Gold/Orange
      case 'error': return 'log-error';     // Red
      case 'debug': return 'log-debug';     // Purple/Pink
      default: return 'log-info';           // Blue/Cyan
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-title">
          <Terminal size={18} className="terminal-icon" />
          <span>Security & Interceptor Activity Log</span>
        </div>
        <div className="terminal-controls">
          <button 
            onClick={() => setAutoscroll(!autoscroll)} 
            className={`terminal-btn ${autoscroll ? 'active' : ''}`}
            title="Toggle Auto Scroll"
          >
            <ArrowDown size={14} />
            <span>Scroll Lock</span>
          </button>
          <button onClick={clearLogs} className="terminal-btn delete" title="Clear Console">
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="terminal-filters">
        <button onClick={() => setFilter('all')} className={`filter-btn ${filter === 'all' ? 'active' : ''}`}>All Logs</button>
        <button onClick={() => setFilter('axios')} className={`filter-btn ${filter === 'axios' ? 'active' : ''}`}>Axios Interceptors</button>
        <button onClick={() => setFilter('server')} className={`filter-btn ${filter === 'server' ? 'active' : ''}`}>Mock Server</button>
        <button onClick={() => setFilter('client')} className={`filter-btn ${filter === 'client' ? 'active' : ''}`}>Auth State</button>
      </div>

      <div className="terminal-body">
        {filteredLogs.length === 0 ? (
          <div className="terminal-empty">
            <Shield size={24} className="shield-pulse" />
            <p>No activity logged yet. Try logging in, refreshing, or triggering posts CRUD operations.</p>
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div key={index} className={`log-line ${getLogColorClass(log.type)}`}>
              <span className="log-time">[{log.timestamp}]</span>
              <span className="log-source">[{log.source}]</span>
              <span className="log-msg">{log.message}</span>
            </div>
          ))
        )}
        <div ref={consoleEndRef} />
      </div>
      <div className="terminal-footer">
        <div className="status-dot-pulse"></div>
        <span>Interactive Network Pipeline Simulation active</span>
      </div>
    </div>
  );
};

export default ConsoleLog;
