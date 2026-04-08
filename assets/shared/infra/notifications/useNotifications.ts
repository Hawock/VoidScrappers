import { EventTarget } from 'cc';
import { NOTIFICATION_SEVERITIES } from './notifications.enum';


// Создаем глобальную шину событий специально для тостов (замена PrimeVue)
export const NotificationBus = new EventTarget();

export function useNotifications() {
  
  function addNotification(
    content: string,
    severity: NOTIFICATION_SEVERITIES = NOTIFICATION_SEVERITIES.Success
  ) {
    const payload = {
      severity: severity.toLowerCase(),
      summary: getTitleBySeverity(severity),
      detail: content,
      life: 3000,
    };

    // Эмитим событие в шину Кокоса
    NotificationBus.emit('add_toast', payload);

    // Временно дублируем в консоль, чтобы ты видел ошибки API до того, как сделаешь UI
    if (severity === NOTIFICATION_SEVERITIES.Error) {
      console.error(`[ТОСТ: Ошибка] ${content}`);
    } else if (severity === NOTIFICATION_SEVERITIES.Warn) {
      console.warn(`[ТОСТ: Внимание] ${content}`);
    } else {
      console.log(`[ТОСТ: ${payload.summary}] ${content}`);
    }
  }

  function getTitleBySeverity(severity: NOTIFICATION_SEVERITIES) {
    switch (severity) {
      case NOTIFICATION_SEVERITIES.Error: return 'Ошибка';
      case NOTIFICATION_SEVERITIES.Warn: return 'Внимание';
      case NOTIFICATION_SEVERITIES.Info: return 'Инфо';
      default: return 'Успешно';
    }
  }

  // Оставляем заглушки для совместимости с твоим Api.ts
  return {
    addNotification,
    getNotificationsFeed: () => [],
    removeNotification: () => {}
  };
}