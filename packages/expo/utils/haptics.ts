import * as Haptics from 'expo-haptics'

export const haptics = {
  selection: () => Haptics.selectionAsync(),
  notificationSuccess: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  notificationWarning: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  notificationError: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  impactLight: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  impactMedium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  impactHeavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
}
