{
  "name": "PostGift",
  "type": "object",
  "properties": {
    "post_id": {
      "type": "string",
      "description": "Post ID"
    },
    "gift_id": {
      "type": "string",
      "description": "Gift ID"
    },
    "sender_id": {
      "type": "string",
      "description": "Sender user ID"
    },
    "sender_name": {
      "type": "string",
      "description": "Sender name"
    },
    "receiver_id": {
      "type": "string",
      "description": "Post owner user ID"
    },
    "receiver_name": {
      "type": "string",
      "description": "Post owner name"
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
    },
    "is_purchased_coins": {
      "type": "boolean",
      "default": false,
      "description": "Whether gift was sent with purchased (real value) coins"
    }
  },
  "required": [
    "post_id",
    "gift_id",
    "sender_id",
    "receiver_id"
  ]
}