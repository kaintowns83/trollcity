{
  "name": "UserSubscription",
  "type": "object",
  "properties": {
    "subscriber_id": {
      "type": "string",
      "description": "User ID of the subscriber"
    },
    "subscriber_name": {
      "type": "string",
      "description": "Name of subscriber"
    },
    "streamer_id": {
      "type": "string",
      "description": "Streamer being subscribed to"
    },
    "streamer_name": {
      "type": "string",
      "description": "Name of streamer"
    },
    "tier_id": {
      "type": "string",
      "description": "Subscription tier ID"
    },
    "tier_name": {
      "type": "string",
      "description": "Name of the tier"
    },
    "tier_level": {
      "type": "number",
      "description": "Tier level (1-4)"
    },
    "price_paid": {
      "type": "number",
      "description": "Amount paid for subscription"
    },
    "payment_method": {
      "type": "string",
      "enum": [
        "paypal",
        "coins",
        "stripe"
      ],
      "description": "How they paid"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "cancelled",
        "expired"
      ],
      "default": "active",
      "description": "Subscription status"
    },
    "start_date": {
      "type": "string",
      "format": "date-time",
      "description": "When subscription started"
    },
    "end_date": {
      "type": "string",
      "format": "date-time",
      "description": "When subscription expires"
    },
    "auto_renew": {
      "type": "boolean",
      "default": true,
      "description": "Auto-renew monthly"
    },
    "badge_emoji": {
      "type": "string",
      "description": "Subscriber badge emoji"
    }
  },
  "required": [
    "subscriber_id",
    "streamer_id",
    "tier_id",
    "price_paid"
  ]
}