{
  "name": "StreamGift",
  "type": "object",
  "properties": {
    "stream_id": {
      "type": "string",
      "description": "Stream ID"
    },
    "gift_id": {
      "type": "string",
      "description": "Gift ID"
    },
    "sender_id": {
      "type": "string",
      "description": "User ID of sender"
    },
    "sender_name": {
      "type": "string",
      "description": "Name of sender"
    },
    "gift_name": {
      "type": "string",
      "description": "Gift name"
    },
    "gift_emoji": {
      "type": "string",
      "description": "Gift emoji"
    },
    "coin_value": {
      "type": "number",
      "description": "Coins spent"
    }
  },
  "required": [
    "stream_id",
    "gift_id",
    "sender_id",
    "sender_name"
  ]
}