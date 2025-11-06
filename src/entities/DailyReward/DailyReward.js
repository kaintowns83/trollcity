{
  "name": "DailyReward",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User ID"
    },
    "user_name": {
      "type": "string",
      "description": "User name"
    },
    "day_number": {
      "type": "number",
      "description": "Consecutive day number (1-30)"
    },
    "coins_earned": {
      "type": "number",
      "description": "Coins received"
    },
    "bonus_applied": {
      "type": "boolean",
      "default": false,
      "description": "Whether bonus multiplier was applied"
    },
    "last_claim_date": {
      "type": "string",
      "format": "date",
      "description": "Date of last claim"
    },
    "streak_count": {
      "type": "number",
      "default": 1,
      "description": "Current login streak"
    }
  },
  "required": [
    "user_id",
    "day_number",
    "coins_earned"
  ]
}