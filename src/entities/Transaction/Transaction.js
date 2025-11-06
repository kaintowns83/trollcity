{
  "name": "Transaction",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User involved in transaction"
    },
    "user_name": {
      "type": "string",
      "description": "User name"
    },
    "transaction_type": {
      "type": "string",
      "enum": [
        "subscription",
        "tip",
        "gift",
        "coin_purchase",
        "payout",
        "refund"
      ],
      "description": "Type of transaction"
    },
    "amount_usd": {
      "type": "number",
      "description": "Amount in USD"
    },
    "amount_coins": {
      "type": "number",
      "description": "Amount in coins"
    },
    "direction": {
      "type": "string",
      "enum": [
        "incoming",
        "outgoing"
      ],
      "description": "Money in or out"
    },
    "related_user_id": {
      "type": "string",
      "description": "Other party in transaction (streamer/subscriber)"
    },
    "related_user_name": {
      "type": "string",
      "description": "Name of other party"
    },
    "payment_method": {
      "type": "string",
      "description": "Payment method used"
    },
    "reference_id": {
      "type": "string",
      "description": "Reference to subscription/tip/etc ID"
    },
    "description": {
      "type": "string",
      "description": "Transaction description"
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
    "user_id",
    "transaction_type",
    "direction"
  ]
}