import { useState, useCallback, useRef } from 'react';
import type { AgentRole, AgentStatus, TaskPayload, AgentMessage, RoutingPlan } from '../types/agent';

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export function useAgentPipeline() {
  const [statuses, setStatuses] = useState<Record<AgentRole, AgentStatus>>({
    coordinator: 'idle', researcher: 'idle', analyst: 'idle', writer: 'idle', reviewer: 'idle'
  });
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [result, setResult] = useState<string>('');
  const [plan, setPlan] = useState<RoutingPlan | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const abortRef = useRef(false);

  const setStatus = useCallback((role: AgentRole, status: AgentStatus) => {
    setStatuses(prev => ({ ...prev, [role]: status }));
  }, []);

  const addMessage = useCallback((msg: Omit<AgentMessage, 'id' | 'time'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: Math.random().toString(36).slice(2, 9),
      time: new Date().toLocaleTimeString()
    }]);
  }, []);

  const run = useCallback(async (task: string) => {
    setIsRunning(true);
    abortRef.current = false;
    setMessages([]);
    setResult('');
    setPlan(null);
    Object.keys(statuses).forEach(k => setStatus(k as AgentRole, 'idle'));

    try {
      setStatus('coordinator', 'working');
      const lower = task.toLowerCase();
      const isTech = lower.includes('технолог') || lower.includes('ии') || lower.includes('нейросет') || lower.includes('ai');
      const isMarket = lower.includes('рынок') || lower.includes('продажи') || lower.includes('бизнес');
      const needsResearch = isTech || isMarket || lower.includes('анализ') || lower.includes('данные');

      const routingPlan: RoutingPlan = {
        agents: needsResearch ? ['researcher', 'analyst', 'writer', 'reviewer'] : ['writer', 'reviewer'],
        reason: needsResearch
          ? `Обнаружена тема, требующая исследования: ${isTech ? 'технологии' : isMarket ? 'рынок' : 'аналитика данных'}`
          : 'Задача носит общий характер. Используется упрощенный пайплайн'
      };
      setPlan(routingPlan);

      addMessage({ from: 'coordinator', to: routingPlan.agents[0], action: 'Маршрутизация', changedFields: [], summary: routingPlan.reason });
      setStatus('coordinator', 'done');

      const payload: TaskPayload = {
        originalTask: task,
        keywords: [],
        collectedData: [],
        analysis: '',
        draft: '',
        finalOutput: ''
      };

      for (const role of routingPlan.agents) {
        if (abortRef.current) break;
        setStatus(role, 'working');

        let changedFields: (keyof TaskPayload)[] = [];
        let summary = '';

        if (role === 'researcher') {
          await sleep(800);
          if (isTech) {
            payload.collectedData = ['Обзор современных подходов к обработке данных', 'Статистика использования открытых инструментов', 'Сводка ключевых публикаций за последний год'];
          } else if (isMarket) {
            payload.collectedData = ['Отчет по динамике основных показателей', 'Сравнение конкурентных решений', 'Сводка текущих тенденций в сегменте'];
          } else {
            payload.collectedData = ['Обзор доступных материалов', 'Структурированные справочные данные', 'Базовые параметры темы'];
          }
          changedFields = ['collectedData'];
          summary = `Собрано ${payload.collectedData.length} источника по теме`;
        }
        else if (role === 'analyst') {
          await sleep(700);
          if (isTech) {
            payload.analysis = 'Наблюдается устойчивое развитие инструментов обработки. Основные факторы: доступность ресурсов и активное сообщество. Рекомендация: внедрение проверенных подходов';
          } else if (isMarket) {
            payload.analysis = 'Отмечен стабильный рост основных показателей. Ключевые факторы: оптимизация процессов и увеличение спроса. Рекомендация: постепенное расширение ресурсов';
          } else {
            payload.analysis = 'Анализ подтверждает актуальность темы. Для точных выводов требуется детализация входных параметров. Рекомендация: сбор дополнительных данных';
          }
          changedFields = ['analysis'];
          summary = 'Обработаны данные, сформулирован подробный вывод';
        }
        else if (role === 'writer') {
          await sleep(600);
          const sentences = payload.analysis.split('.').filter(Boolean);
          const mainTrend = sentences[0]?.trim() || 'Тренд не определен';
          const recommendation = sentences.find(s => s.includes('Рекомендация'))?.replace('Рекомендация: ', '').trim() || 'Следить за развитием темы';

          const sourcesBlock = payload.collectedData.length > 0
            ? `\nИсточники:\n- ${payload.collectedData.join('\n- ')}`
            : '';

          payload.draft = `Аналитическая справка: "${task}"\n\nОсновной вывод: ${mainTrend}\nРекомендация: ${recommendation}${sourcesBlock}\n\nДокумент сформирован автоматически`;
          changedFields = ['draft'];
          summary = 'Сформирован структурированный документ';
        }
        else if (role === 'reviewer') {
          await sleep(500);
          payload.finalOutput = `Задача выполнена. Статус: Утверждено.\n\n${payload.draft}\n\nВалидация: логика согласована, источники верифицированы, формат соответствует стандартам`;
          changedFields = ['finalOutput'];
          summary = 'Финальная проверка пройдена. Результат готов';
        }

        addMessage({
          from: role,
          to: routingPlan.agents[routingPlan.agents.indexOf(role) + 1] || 'user',
          action: 'Обработка',
          changedFields,
          summary
        });

        setStatus(role, 'done');
      }

      setResult(payload.finalOutput || 'Выполнение прервано');
    } catch {
      setResult('Ошибка выполнения пайплайна');
    } finally {
      setIsRunning(false);
    }
  }, [setStatus, addMessage]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setMessages([]);
    setResult('');
    setPlan(null);
    setIsRunning(false);
    Object.keys(statuses).forEach(k => setStatus(k as AgentRole, 'idle'));
  }, [setStatus]);

  return { statuses, messages, result, plan, isRunning, run, reset };
}