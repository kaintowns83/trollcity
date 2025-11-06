{
  "name": "Payout",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User ID requesting payout"
    },
    "user_name": {
      "type": "string",
      "description": "Name of user"
    },
    "user_email": {
      "type": "string",
      "description": "Email of user"
    },
    "coin_amount": {
      "type": "number",
      "description": "Amount of coins to cash out"
    },
    "usd_amount": {
      "type": "number",
      "description": "USD amount before fee"
    },
    "fee_amount": {
      "type": "number",
      "description": "15% platform fee"
    },
    "payout_amount": {
      "type": "number",
      "description": "Final payout amount (after fee)"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "processing",
        "completed",
        "rejected"
      ],
      "default": "pending",
      "description": "Payout status"
    },
    "payment_method": {
      "type": "string",
      "description": "Payment method (PayPal, Bank Transfer, etc)"
    },
    "payment_details": {
      "type": "string",
      "description": "Payment account details"
    },
    "notes": {
      "type": "string",
      "description": "Additional notes"
    }
  },
  "required": [
    "user_id",
    "coin_amount",
    "usd_amount",
    "fee_amount",
    "payout_amount"
  ]
}