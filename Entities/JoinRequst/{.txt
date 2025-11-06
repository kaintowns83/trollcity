{
  "name": "JoinRequest",
  "type": "object",
  "properties": {
    "stream_id": {
      "type": "string",
      "description": "Stream ID to join"
    },
    "user_id": {
      "type": "string",
      "description": "User requesting to join"
    },
    "user_name": {
      "type": "string",
      "description": "User name"
    },
    "username": {
      "type": "string",
      "description": "Username"
    },
    "user_avatar": {
      "type": "string",
      "description": "User avatar"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "accepted",
        "rejected"
      ],
      "default": "pending",
      "description": "Request status"
    },
    "requested_position": {
      "type": "number",
      "description": "Preferred box position"
    },
    "message": {
      "type": "string",
      "description": "Optional message to streamer"
    }
  },
  "required": [
    "stream_id",
    "user_id",
    "user_name"
  ]
}