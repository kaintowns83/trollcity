{
  "name": "PlatformRevenue",
  "type": "object",
  "properties": {
    "transaction_type": {
      "type": "string",
      "enum": [
        "coin_purchase",
        "payout_fee",
        "subscription_fee",
        "tip_fee",
        "refund"
      ],
      "description": "Type of revenue transaction"
    },
    "amount_usd": {
      "type": "number",
      "description": "Revenue amount in USD"
    },
    "amount_coins": {
      "type": "number",
      "description": "Coins involved in transaction"
    },
    "fee_percentage": {
      "type": "number",
      "description": "Fee percentage taken (e.g., 15 for 15%)"
    },
    "user_id": {
      "type": "string",
      "description": "User involved in transaction"
    },
    "user_name": {
      "type": "string",
      "description": "User name"
    },
    "related_transaction_id": {
      "type": "string",
      "description": "Related payout, purchase, or subscription ID"
    },
    "payment_method": {
      "type": "string",
      "description": "Payment method used"
    },
    "description": {
      "type": "string",
      "description": "Revenue description"
    },
    "status": {
      "type": "string",
      "enum": [
        "completed",
        "pending",
        "failed"
      ],
      "default": "completed",
      "description": "Transaction status"
    }
  },
  "required": [
    "transaction_type",
    "amount_usd"
  ]
}