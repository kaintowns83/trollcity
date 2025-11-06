{
  "name": "ChatBan",
  "type": "object",
  "properties": {
    "stream_id": {
      "type": "string",
      "description": "Stream ID"
    },
    "user_id": {
      "type": "string",
      "description": "Banned user ID"
    },
    "username": {
      "type": "string",
      "description": "Banned username"
    },
    "banned_by": {
      "type": "string",
      "description": "Moderator/streamer who issued the ban"
    },
    "ban_type": {
      "type": "string",
      "enum": [
        "kick",
        "mute",
        "ban"
      ],
      "description": "Type of ban (kick=temporary, mute=can't chat, ban=permanent)"
    },
    "reason": {
      "type": "string",
      "description": "Reason for ban"
    },
    "expires_at": {
      "type": "string",
      "format": "date-time",
      "description": "When the ban expires (null = permanent)"
    }
  },
  "required": [
    "stream_id",
    "user_id",
    "banned_by",
    "ban_type"
  ]
}