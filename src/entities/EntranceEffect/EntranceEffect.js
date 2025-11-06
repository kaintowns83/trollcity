{
  "name": "EntranceEffect",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Effect name"
    },
    "description": {
      "type": "string",
      "description": "Effect description"
    },
    "animation_type": {
      "type": "string",
      "enum": [
        "sparkle",
        "fire",
        "confetti",
        "lightning",
        "rainbow",
        "galaxy",
        "explosion",
        "hearts",
        "stars",
        "neon"
      ],
      "description": "Type of entrance animation"
    },
    "price_usd": {
      "type": "number",
      "description": "Price in USD"
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
      "description": "Effect rarity"
    },
    "preview_url": {
      "type": "string",
      "description": "Preview image/video URL"
    },
    "color_scheme": {
      "type": "string",
      "description": "Color scheme for the effect"
    }
  },
  "required": [
    "name",
    "animation_type",
    "price_usd"
  ]
}