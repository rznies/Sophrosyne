import { Alert } from 'react-native';

// Simple toast using Alert
export function showToast(message: string, duration: number = 2000) {
  Alert.alert('', message, [
    {
      text: 'Dismiss',
      onPress: () => {},
      style: 'default',
    },
  ]);
}

export function showError(title: string, message: string) {
  Alert.alert(title, message, [
    {
      text: 'OK',
      onPress: () => {},
    },
  ]);
}

export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) {
  Alert.alert(title, message, [
    {
      text: 'Cancel',
      onPress: onCancel,
      style: 'cancel',
    },
    {
      text: 'Confirm',
      onPress: onConfirm,
      style: 'default',
    },
  ]);
}
