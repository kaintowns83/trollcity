{
  "name": "AdminChat",
  "type": "object",
  "properties": {
    "sender_id": {
      "type": "string",
      "description": "User ID of sender"
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
    "recipient_id": {
      "type": "string",
      "description": "User ID of recipient (admin or user)"
    },
    "recipient_name": {
      "type": "string",
      "description": "Name of recipient"
    },
    "message": {
      "type": "string",
      "description": "Message content"
    },
    "is_read": {
      "type": "boolean",
      "default": false,
      "description": "Whether message has been read"
    },
    "read_date": {
      "type": "string",
      "format": "date-time",
      "description": "When message was read"
    },
    "sender_is_subscriber": {
      "type": "boolean",
      "default": false,
      "description": "Whether sender is a subscriber (required to message admin)"
    },
    "conversation_id": {
      "type": "string",
      "description": "Unique conversation ID between two users"
    }
  },
  "required": [
    "sender_id",
    "recipient_id",
    "message"
  ]
}