{
  "name": "Conversation",
  "type": "object",
  "properties": {
    "participant1_id": {
      "type": "string",
      "description": "First participant user ID"
    },
    "participant1_name": {
      "type": "string",
      "description": "First participant name"
    },
    "participant1_username": {
      "type": "string",
      "description": "First participant username"
    },
    "participant1_avatar": {
      "type": "string",
      "description": "First participant avatar"
    },
    "participant1_created_date": {
      "type": "string",
      "format": "date-time",
      "description": "First participant account creation date"
    },
    "participant2_id": {
      "type": "string",
      "description": "Second participant user ID"
    },
    "participant2_name": {
      "type": "string",
      "description": "Second participant name"
    },
    "participant2_username": {
      "type": "string",
      "description": "Second participant username"
    },
    "participant2_avatar": {
      "type": "string",
      "description": "Second participant avatar"
    },
    "participant2_created_date": {
      "type": "string",
      "format": "date-time",
      "description": "Second participant account creation date"
    },
    "last_message": {
      "type": "string",
      "description": "Preview of last message"
    },
    "last_message_time": {
      "type": "string",
      "format": "date-time",
      "description": "When last message was sent"
    },
    "unread_count_p1": {
      "type": "number",
      "default": 0,
      "description": "Unread messages for participant 1"
    },
    "unread_count_p2": {
      "type": "number",
      "default": 0,
      "description": "Unread messages for participant 2"
    }
  },
  "required": [
    "participant1_id",
    "participant2_id"
  ]
}