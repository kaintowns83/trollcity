{
  "name": "DirectMessage",
  "type": "object",
  "properties": {
    "conversation_id": {
      "type": "string",
      "description": "Conversation ID"
    },
    "sender_id": {
      "type": "string",
      "description": "Sender user ID"
    },
    "sender_name": {
      "type": "string",
      "description": "Sender name"
    },
    "sender_username": {
      "type": "string",
      "description": "Sender username"
    },
    "sender_avatar": {
      "type": "string",
      "description": "Sender avatar"
    },
    "receiver_id": {
      "type": "string",
      "description": "Receiver user ID"
    },
    "receiver_name": {
      "type": "string",
      "description": "Receiver name"
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
    "read_at": {
      "type": "string",
      "format": "date-time",
      "description": "When message was read"
    }
  },
  "required": [
    "conversation_id",
    "sender_id",
    "receiver_id",
    "message"
  ]
}