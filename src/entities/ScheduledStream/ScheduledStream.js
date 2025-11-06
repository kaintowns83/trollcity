{
  "name": "ScheduledStream",
  "type": "object",
  "properties": {
    "streamer_id": {
      "type": "string",
      "description": "Streamer user ID"
    },
    "streamer_name": {
      "type": "string",
      "description": "Streamer name"
    },
    "title": {
      "type": "string",
      "description": "Stream title"
    },
    "description": {
      "type": "string",
      "description": "Stream description"
    },
    "category": {
      "type": "string",
      "enum": [
        "gaming",
        "music",
        "talk",
        "creative",
        "fitness",
        "cooking",
        "trolling",
        "other"
      ],
      "description": "Stream category"
    },
    "scheduled_time": {
      "type": "string",
      "format": "date-time",
      "description": "When stream will start"
    },
    "thumbnail": {
      "type": "string",
      "description": "Scheduled stream thumbnail"
    },
    "status": {
      "type": "string",
      "enum": [
        "scheduled",
        "live",
        "completed",
        "cancelled"
      ],
      "default": "scheduled",
      "description": "Schedule status"
    },
    "notify_followers": {
      "type": "boolean",
      "default": true,
      "description": "Send notification to followers"
    },
    "interested_count": {
      "type": "number",
      "default": 0,
      "description": "Number of users interested"
    },
    "reminded_users": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "User IDs who set reminder"
    }
  },
  "required": [
    "streamer_id",
    "title",
    "scheduled_time"
  ]
}