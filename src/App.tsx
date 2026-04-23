import { useState } from 'react';
import { useAgentPipeline } from './hooks/useAgentPipeline';
import type { AgentRole } from './types/agent';
import './index.css';

const META: Record<AgentRole, { name: string }> = {
  coordinator: { name: 'Координатор' },
  researcher:  { name: 'Исследователь' },
  analyst:     { name: 'Аналитик' },
  writer:      { name: 'Формировщик' },
  reviewer:    { name: 'Валидатор' }
};

export default function App() {
  const [input, setInput] = useState('');
  const { statuses, messages, result, plan, isRunning, run, reset } = useAgentPipeline();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isRunning) return;
    run(input.trim());
  };

  return (
    <div className="container">
      <header className="header">
        <h1>AI Agents Workspace</h1>
        <p>Демонстрация маршрутизации и передачи контекста между агентами</p>
      </header>

      <form onSubmit={handleSubmit} className="form">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Пример: 'Проанализируй продажи за квартал' или 'Напиши статью про ИИ'"
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

      {plan && (
        <div className="panel panel-plan">
          <h3>Маршрутизация Координатора</h3>
          <p><strong>Активные агенты:</strong> {plan.agents.map(a => META[a].name).join(' → ')}</p>
          <p><strong>Обоснование:</strong> {plan.reason}</p>
        </div>
      )}

      <div className="panels">
        <div className="panel">
          <h3>Поток данных</h3>
          <div className="flow-log">
            {messages.length === 0 && <div className="empty">Здесь появится ход выполнения...</div>}
            {messages.map(msg => (
              <div key={msg.id} className="flow-item">
                <div className="flow-header">
                  <span className="flow-from">{META[msg.from].name}</span>
                  <span className="flow-arrow">→</span>
                  <span className="flow-to">{msg.to === 'user' ? 'Клиент' : META[msg.to].name}</span>
                  <span className="flow-time">{msg.time}</span>
                </div>
                <div className="flow-body">
                  <div className="flow-action">{msg.action}: {msg.summary}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Итоговый результат</h3>
          {result ? (
            <>
              <div className="result-box">{result}</div>
              <button className="reset-btn" onClick={reset}>Сбросить и начать заново</button>
            </>
          ) : (
            <div className="empty">Результат появится после валидации</div>
          )}
        </div>
      </div>
    </div>
  );
}