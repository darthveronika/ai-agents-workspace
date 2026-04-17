import { useState } from 'react';
import { useAgentPipeline } from './hooks/useAgentPipeline';
import type { AgentRole } from './types/agent';import './index.css';

const META: Record<AgentRole, { name: string }> = {
  coordinator: { name: 'Координатор' },
  researcher:  { name: 'Исследователь' },
  analyst:     { name: 'Аналитик' },
  writer:      { name: 'Формировщик' },
  reviewer:    { name: 'Валидатор' }
};

export default function App() {
  const [input, setInput] = useState('');
  const { statuses, logs, result, isRunning, run, reset } = useAgentPipeline();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isRunning) return;
    run(input.trim());
  };

  return (
    <div className="container">
      <header className="header">
        <h1>AI Agents Workspace</h1>
        <p>Демонстрация совместной работы агентов</p>
      </header>

      <form onSubmit={handleSubmit} className="form">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Введите задачу для агентов..."
          disabled={isRunning}
        />
        <button type="submit" disabled={!input.trim() || isRunning}>
          {isRunning ? 'Выполняется...' : 'Запустить'}
        </button>
      </form>

      <div className="agents">
        {(Object.keys(META) as AgentRole[]).map(role => (
          <div key={role} className={`agent ${statuses[role]}`}>
            <div className="indicator" />
            <div className="role-name">{META[role].name}</div>
            <span className={`badge badge-${statuses[role]}`}>
              {statuses[role] === 'idle' ? 'Ожидает' : statuses[role] === 'working' ? 'В процессе' : 'Завершён'}
            </span>
          </div>
        ))}
      </div>

      <div className="panels">
        <div className="panel">
          <h3>Лог действий</h3>
          <div className="logs">
            {logs.length === 0 && <div className="empty">Здесь появится ход выполнения...</div>}
            {logs.map(log => (
              <div key={log.id} className="log">
                <span className="log-agent">[{log.agent}]</span>
                <span className="log-time">{log.time}</span>
                <div>{log.message}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Результат</h3>
          {result ? (
            <>
              <div className="result-box">{result}</div>
              <button className="reset-btn" onClick={reset}>Сбросить</button>
            </>
          ) : (
            <div className="empty">Результат появится после завершения</div>
          )}
        </div>
      </div>
    </div>
  );
}