{
  "name": "SubscriptionTier",
  "type": "object",
  "properties": {
    "streamer_id": {
      "type": "string",
      "description": "Streamer who created this tier"
    },
    "streamer_name": {
      "type": "string",
      "description": "Name of the streamer"
    },
    "tier_name": {
      "type": "string",
      "description": "Name of the tier (e.g., Bronze, Silver, Gold)"
    },
    "tier_level": {
      "type": "number",
      "enum": [
        1,
        2,
        3,
        4
      ],
      "description": "Tier level (1=basic, 4=premium)"
    },
    "price_usd": {
      "type": "number",
      "description": "Monthly price in USD"
    },
    "price_coins": {
      "type": "number",
      "description": "Alternative: pay with coins"
    },
    "perks": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of perks for this tier"
    },
    "badge_emoji": {
      "type": "string",
      "description": "Emoji badge shown next to subscriber names"
    },
 