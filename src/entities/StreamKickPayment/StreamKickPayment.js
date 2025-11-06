{
  "name": "StreamKickPayment",
  "type": "object",
  "properties": {
    "stream_id": {
      "type": "string",
      "description": "Stream ID"
    },
    "user_id": {
      "type": "string",
      "description": "User ID who was kicked"
    },
    "user_name": {
      "type": "string",
      "description": "User name"
    },
    "kicked_by": {
      "type": "string",
      "description": "Moderator who kicked them"
    },
    "kick_reason": {
      "type": "string",
      "description": "Reason for kick"
    },
    "payment_amount": {
      "type": "number",
      "default": 5,
      "description": "Payment to regain access ($5)"
    },
    "payment_status": {
      "type": "string",
      "enum": [
        "pending",
        "paid",
        "expired"
      ],
      "default": "pending",
      "description": "Payment status"
    },
    "square_order_id": {
      "type": "string",
      "description": "Square payment order ID"
    },
    "access_granted": {
      "type": "boolean",
      "default": false,
      "description": "Whether access was granted after payment"
    },
    "payment_date": {
      "type": "string",
      "format": "date-time",
      "description": "When payment was made"
    },
    "expires_at": {
      "type": "string",
      "format": "date-time",
      "description": "When this kick payment expires"
    }
  },
  "required": [
    "stream_id",
    "user_id",
    "kicked_by"
  ]
}