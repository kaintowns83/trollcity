{
  "name": "StreamModerator",
  "type": "object",
  "properties": {
    "stream_id": {
      "type": "string",
      "description": "Stream ID"
    },
    "streamer_id": {
      "type": "string",
      "description": "ID of the stream owner"
    },
    "moderator_id": {
      "type": "string",
      "description": "ID of the moderator user"
    },
    "moderator_name": {
      "type": "string",
      "description": "Name of the moderator"
    },
    "moderator_username": {
      "type": "string",
      "description": "Username of the moderator"
    },
    "can_mute_users": {
      "type": "boolean",
      "default": true,
      "description": "Can mute users for 15 minutes"
    },
    "can_kick_users": {
      "type": "boolean",
      "default": true,
      "description": "Can kick users from chat temporarily"
    },
    "can_ban_users": {
      "type": "boolean",
      "default": false,
      "description": "Can permanently ban users from stream"
    },
    "can_delete_messages": {
      "type": "boolean",
      "default": true,
      "description": "Can delete chat messages"
    },
    "can_pin_messages": {
      "type": "boolean",
      "default": true,
      "description": "Can pin chat messages"
    }
  },
  "required": [
    "stream_id",
    "streamer_id",
    "moderator_id"
  ]
}