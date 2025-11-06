{
  "name": "UserEntranceEffect",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User ID who owns the effect"
    },
    "user_name": {
      "type": "string",
      "description": "User name"
    },
    "effect_id": {
      "type": "string",
      "description": "Entrance effect ID"
    },
    "effect_name": {
      "type": "string",
      "description": "Effect name"
    },
    "animation_type": {
      "type": "string",
      "description": "Animation type"
    },
    "is_active": {
      "type": "boolean",
      "default": false,
      "description": "Whether this effect is currently active"
    },
    "purchased_price": {
      "type": "number",
      "description": "Price paid for the effect"
    }
  },
  "required": [
    "user_id",
    "effect_id",
    "effect_name"
  ]
}