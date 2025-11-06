{
  "name": "ModerationAction",
  "type": "object",
  "properties": {
    "moderator_id": {
      "type": "string",
      "description": "ID of the moderator (Troll Officer or Admin)"
    },
    "moderator_name": {
      "type": "string",
      "description": "Name of the moderator"
    },
    "target_user_id": {
      "type": "string",
      "description": "ID of the user being moderated"
    },
    "target_username": {
      "type": "string",
      "description": "Username of the user being moderated"
    },
    "action_type": {
      "type": "string",
      "enum": [
        "mute",
        "block_chat",
        "ban",
        "unban",
        "unmute",
        "stream_ended",
        "stream_deleted",
        "stream_reported"
      ],
      "description": "Type of moderation action"
    },
    "duration_minutes": {
      "type": "number",
      "description": "Duration in minutes (for mutes)"
    },
    "reason": {
      "type": "string",
      "description": "Reason for the action"
    },
    "stream_id": {
      "type": "string",
      "description": "Stream where action occurred"
    }
  },
  "required": [
    "moderator_id",
    "target_user_id",
    "action_type"
  ]
}