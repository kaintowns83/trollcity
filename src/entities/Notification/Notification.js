{
  "name": "Notification",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "Recipient user ID"
    },
    "type": {
      "type": "string",
      "enum": [
        "stream_live",
        "new_follower",
        "gift_received",
        "tip_received",
        "subscription",
        "achievement",
        "level_up",
        "scheduled_stream",
        "daily_reward"
      ],
      "description": "Notification type"
    },
    "title": {
      "type": "string",
      "description": "Notification title"
    },
    "message": {
      "type": "string",
      "description": "Notification message"
    },
    "icon": {
      "type": "string",
      "description": "Notification icon"
    },
    "link_url": {
      "type": "string",
      "description": "URL to navigate to"
    },
    "is_read": {
      "type": "boolean",
      "default": false,
      "description": "Whether notification was read"
    },
    "related_user_id": {
      "type": "string",
      "description": "Related user (follower, gifter, etc)"
    },
    "related_user_name": {
      "type": "string",
      "description": "Related user name"
    },
    "related_stream_id": {
      "type": "string",
      "description": "Related stream ID"
    }
  },
  "required": [
    "user_id",
    "type",
    "title",
    "message"
  ]
}