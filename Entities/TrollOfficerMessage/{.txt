{
  "name": "TrollOfficerMessage",
  "type": "object",
  "properties": {
    "sender_id": {
      "type": "string",
      "description": "User ID of sender (admin or troll officer)"
    },
    "sender_name": {
      "type": "string",
      "description": "Name of sender"
    },
    "sender_username": {
      "type": "string",
      "description": "Username of sender"
    },
    "sender_avatar": {
      "type": "string",
      "description": "Avatar of sender"
    },
    "is_admin": {
      "type": "boolean",
      "default": false,
      "description": "Whether sender is admin"
    },
    "message": {
      "type": "string",
      "description": "Message content"
    },
    "message_type": {
      "type": "string",
      "enum": [
        "text",
        "announcement",
        "alert"
      ],
      "default": "text",
      "description": "Type of message"
    },
    "is_pinned": {
      "type": "boolean",
      "default": false,
      "description": "Whether message is pinned"
    }
  },
  "required": [
    "sender_id",
    "sender_name",
    "message"
  ]
}