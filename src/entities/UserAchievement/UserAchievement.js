{
  "name": "UserAchievement",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User ID"
    },
    "user_name": {
      "type": "string",
      "description": "User name"
    },
    "achievement_id": {
      "type": "string",
      "description": "Achievement ID"
    },
    "achievement_name": {
      "type": "string",
      "description": "Achievement name"
    },
    "achievement_icon": {
      "type": "string",
      "description": "Achievement icon"
    },
    "unlocked_date": {
      "type": "string",
      "format": "date-time",
      "description": "When achievement was unlocked"
    },
    "is_equipped": {
      "type": "boolean",
      "default": false,
      "description": "Whether displayed on profile"
    },
    "progress": {
      "type": "number",
      "default": 0,
      "description": "Progress towards achievement"
    }
  },
  "required": [
    "user_id",
    "achievement_id"
  ]
}