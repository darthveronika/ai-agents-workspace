import { useState, useCallback } from 'react';
import type { AgentRole, AgentStatus, LogEntry } from '../types/agent';

const AGENTS: AgentRole[] = ['coordinator', 'researcher', 'analyst', 'writer', 'reviewer'];
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export function useAgentPipeline() {
  const [statuses, setStatuses] = useState<Record<AgentRole, AgentStatus>>({
    coordinator: 'idle', researcher: 'idle', analyst: 'idle', writer: 'idle', reviewer: 'idle'
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const addLog = useCallback((agent: AgentRole, message: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).slice(2, 9),
      agent,
      message,
      time: new Date().toLocaleTimeString()
    }]);
  }, []);

  const setStatus = useCallback((role: AgentRole, status: AgentStatus) => {
    setStatuses(prev => ({ ...prev, [role]: status }));
  }, []);

  const run = useCallback(async (task: string) => {
    setIsRunning(true);
    setLogs([]);
    setResult('');
    AGENTS.forEach(a => setStatus(a, 'idle'));

    try {
      setStatus('coordinator', 'working');
      addLog('coordinator', `Принял задачу: "${task}"`);
      await sleep(600);
      addLog('coordinator', 'Разбил на этапы, передаю сбор данных');
      setStatus('coordinator', 'done');

      setStatus('researcher', 'working');
      addLog('researcher', 'Собираю информацию по теме...');
      await sleep(1000);
      const resData = 'Найдено 3 релевантных источника';
      addLog('researcher', resData);
      setStatus('researcher', 'done');

      setStatus('analyst', 'working');
      addLog('analyst', 'Обрабатываю собранные данные...');
      await sleep(800);
      const anaData = 'Выявлены ключевые закономерности';
      addLog('analyst', anaData);
      setStatus('analyst', 'done');

      setStatus('writer', 'working');
      addLog('writer', 'Формирую структурированный ответ...');
      await sleep(700);
      const writData = 'Черновик готов';
      addLog('writer', writData);
      setStatus('writer', 'done');

      setStatus('reviewer', 'working');
      addLog('reviewer', 'Проверяю полноту и корректность...');
      await sleep(500);
      addLog('reviewer', 'Все проверки пройдены. Утверждаю.');
      setStatus('reviewer', 'done');

      setResult(` Задача выполнена.\n\n Данные: ${resData}\n Анализ: ${anaData}\n Итог: ${writData}`);
    } catch {
      setResult(' Произошла ошибка при выполнении.');
    } finally {
      setIsRunning(false);
    }
  }, [addLog, setStatus]);

  const reset = useCallback(() => {
    setLogs([]);
    setResult('');
    setIsRunning(false);
    AGENTS.forEach(a => setStatus(a, 'idle'));
  }, [setStatus]);

  return { statuses, logs, result, isRunning, run, reset };
}