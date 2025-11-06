{
  "name": "ViewerReward",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "Viewer user ID"
    },
    "stream_id": {
      "type": "string",
      "description": "Stream watched"
    },
    "streamer_id": {
      "type": "string",
      "description": "Streamer ID"
    },
    "watch_duration": {
      "type": "number",
      "description": "Minutes watched"
    },
    "coins_earned": {
      "type": "number",
      "description": "Coins earned for watching"
    },
    "xp_earned": {
      "type": "number",
      "description": "XP earned for watching"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "Date of reward"
    }
  },
  "required": [
    "user_id",
    "stream_id",
    "watch_duration"
  ]
}