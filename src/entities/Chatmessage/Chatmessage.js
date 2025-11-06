{
  "name": "ChatMessage",
  "type": "object",
  "properties": {
    "stream_id": {
      "type": "string",
      "description": "Stream ID"
    },
    "user_id": {
      "type": "string",
      "description": "User ID"
    },
    "username": {
      "type": "string",
      "description": "Username"
    },
    "message": {
      "type": "string",
      "description": "Chat message"
    },
    "is_pinned": {
      "type": "boolean",
      "default": false,
      "description": "Whether this message is pinned by the streamer"
    },
    "pinned_by": {
      "type": "string",
      "description": "User ID who pinned this message"
    },
    "mentions": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of user IDs mentioned in this message"
    },
    "is_deleted": {
      "type": "boolean",
      "default": false,
      "description": "Whether this message was deleted by moderator"
    },
    "deleted_by": {
      "type": "string",
      "description": "Moderator who deleted this message"
    },
    "user_avatar": {
      "type": "string",
      "description": "User avatar URL"
    },
    "user_level": {
      "type": "number",
      "description": "User level at time of message"
    },
    "user_created_date": {
      "type": "string",
      "format": "date-time",
      "description": "User account creation date (for OG badge)"
    },
    "is_troll_officer": {
      "type": "boolean",
      "default": false,
      "description": "Whether sender is a troll officer"
    },
    "troll_family_tag": {
      "type": "string",
      "description": "Sender's troll family tag"
    },
    "troll_family_name": {
      "type": "string",
      "description": "Sender's troll family name"
    },
    "reactions": {
      "type": "object",
      "description": "Emoji reactions to this message (emoji: count)"
    },
    "reply_to_message_id": {
      "type": "string",
      "description": "ID of message being replied to"
    },
    "reply_to_username": {
      "type": "string",
      "description": "Username of person being replied to"
    },
    "is_gift": {
      "type": "boolean",
      "default": false,
      "description": "Whether this is a gift message"
    },
    "gift_emoji": {
      "type": "string",
      "description": "Gift emoji if this is a gift message"
    },
    "gift_name": {
      "type": "string",
      "description": "Gift name if this is a gift message"
    },
    "gift_coin_value": {
      "type": "number",
      "description": "Gift coin value if this is a gift message"
    }
  },
  "required": [
    "stream_id",
    "user_id",
    "username",
    "message"
  ]
}