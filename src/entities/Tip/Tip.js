{
  "name": "Tip",
  "type": "object",
  "properties": {
    "tipper_id": {
      "type": "string",
      "description": "User ID of person sending tip"
    },
    "tipper_name": {
      "type": "string",
      "description": "Name of tipper"
    },
    "streamer_id": {
      "type": "string",
      "description": "Streamer receiving tip"
    },
    "streamer_name": {
      "type": "string",
      "description": "Name of streamer"
    },
    "amount_usd": {
      "type": "number",
      "description": "Tip amount in USD"
    },
    "amount_coins": {
      "type": "number",
      "description": "Tip amount in coins"
    },
    "payment_method": {
      "type": "string",
      "enum": [
        "paypal",
        "coins",
        "stripe"
      ],
      "description": "Payment method used"
    },
    "message": {
      "type": "string",
      "description": "Optional message with tip"
    },
    "is_anonymous": {
      "type": "boolean",
      "default": false,
      "description": "Whether tip is anonymous"
    },
    "stream_id": {
      "type": "string",
      "description": "Stream where tip was sent (if during stream)"
    },
    "transaction_id": {
      "type": "string",
      "description": "PayPal or payment processor transaction ID"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "completed",
        "failed",
        "refunded"
      ],
      "default": "completed",
      "description": "Transaction status"
    }
  },
  "required": [
    "tipper_id",
    "streamer_id"
  ]
}