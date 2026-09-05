'use client';

import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  max-width: 400px;
  width: calc(100% - 40px);

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    width: auto;
  }
`;

const NotificationItem = styled(motion.div)<{ $type: NotificationType }>`
  background: ${(props) => {
    switch (props.$type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  }};
  color: #ffffff;
  padding: 14px 18px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  pointer-events: auto;
  font-size: 14px;
  line-height: 1.5;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  font-size: 20px;
  flex-shrink: 0;
`;

const Message = styled.div`
  flex: 1;
  word-wrap: break-word;
`;

// Global notification state
let notifications: Notification[] = [];
let listeners: Array<(notifications: Notification[]) => void> = [];

const notify = (message: string, type: NotificationType = 'info', duration: number = 3000) => {
  const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const notification: Notification = { id, message, type };
  
  notifications = [...notifications, notification];
  listeners.forEach(listener => listener(notifications));
  
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }
  
  return id;
};

const removeNotification = (id: string) => {
  notifications = notifications.filter(n => n.id !== id);
  listeners.forEach(listener => listener(notifications));
};

// Export functions
export const showNotification = {
  success: (message: string, duration?: number) => notify(message, 'success', duration),
  error: (message: string, duration?: number) => notify(message, 'error', duration),
  info: (message: string, duration?: number) => notify(message, 'info', duration),
  warning: (message: string, duration?: number) => notify(message, 'warning', duration),
};

export default function NotificationProvider() {
  const [notificationsState, setNotificationsState] = React.useState<Notification[]>([]);

  React.useEffect(() => {
    const listener = (newNotifications: Notification[]) => {
      setNotificationsState(newNotifications);
    };
    
    listeners.push(listener);
    setNotificationsState(notifications);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle />;
      case 'error':
        return <FaTimesCircle />;
      case 'warning':
        return <FaExclamationTriangle />;
      case 'info':
        return <FaInfoCircle />;
    }
  };

  return (
    <NotificationContainer>
      <AnimatePresence>
        {notificationsState.map((notification) => (
          <NotificationItem
            key={notification.id}
            $type={notification.type}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={() => removeNotification(notification.id)}
            style={{ cursor: 'pointer' }}
          >
            <IconWrapper>{getIcon(notification.type)}</IconWrapper>
            <Message>{notification.message}</Message>
          </NotificationItem>
        ))}
      </AnimatePresence>
    </NotificationContainer>
  );
}


