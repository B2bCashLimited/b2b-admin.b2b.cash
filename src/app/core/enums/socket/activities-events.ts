export const enum ActivitiesEvents {

  /**
   * Subscribe moderator(user) to get not moderated activities
   */
  NotModeratedActivitiesSubscribe = 'moderator_activity_subscribe',

  /**
   * Unsubscribe moderator(user) from getting not moderated activities
   */
  NotModeratedActivitiesUnsubscribe = 'moderator_activity_unsubscribe',

  /**
   * key in subscribed web-socket to get data
   */
  NotModeratedActivities = 'not_moderated_activities',
}
