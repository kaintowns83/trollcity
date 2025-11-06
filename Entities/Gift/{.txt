{
  "name": "Gift",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Gift name"
    },
    "emoji": {
      "type": "string",
      "description": "Gift emoji representation"
    },
    "coin_value": {
      "type": "number",
      "description": "Cost in coins"
    },
    "color": {
      "type": "string",
      "description": "Gift color theme"
    },
    "effect_type": {
      "type": "string",
      "enum": [
        "sparkle",
        "fire",
        "confetti",
        "hearts",
        "explosion",
        "rainbow",
        "stars",
        "lightning",
        "snow",
        "bubbles"
      ],
      "default": "sparkle",
      "description": "Visual effect when gift is sent"
    }
  },
  "required": [
    "name",
    "emoji",
    "coin_value"
  ]
}