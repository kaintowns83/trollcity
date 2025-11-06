{
  "name": "Achievement",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Achievement name"
    },
    "description": {
      "type": "string",
      "description": "What needs to be done"
    },
    "category": {
      "type": "string",
      "enum": [
        "streaming",
        "viewing",
        "social",
        "spending",
        "earning",
        "special"
      ],
      "description": "Achievement category"
    },
    "icon": {
      "type": "string",
      "description": "Achievement icon emoji"
    },
    "rarity": {
      "type": "string",
      "enum": [
        "common",
        "rare",
        "epic",
        "legendary"
      ],
      "default": "common",
      "description": "Achievement rarity"
    },
    "coins_reward": {
      "type": "number",
      "description": "Coins awarded when unlocked"
    },
    "xp_reward": {
      "type": "number",
      "description": "XP awarded when unlocked"
    },
    "requirement_type": {
      "type": "string",
      "enum": [
        "stream_hours",
        "viewer_count",
        "followers",
        "gifts_sent",
        "gifts_received",
        "likes_given",
        "subscriptions",
        "tips"
      ],
      "description": "Type of requirement"
    },
    "requirement_value": {
      "type": "number",
      "description": "Value needed to unlock"
    },
    "is_hidden": {
      "type": "boolean",
      "default": false,
      "description": "Hidden until discovered"
    }
  },
  "required": [
    "name",
    "description",
    "category",
    "coins_reward"
  ]
}