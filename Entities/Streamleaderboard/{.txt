{
  "name": "StreamerLeaderboard",
  "type": "object",
  "properties": {
    "streamer_id": {
      "type": "string",
      "description": "Streamer user ID"
    },
    "streamer_name": {
      "type": "string",
      "description": "Streamer name"
    },
    "gifter_id": {
      "type": "string",
      "description": "User ID of the gifter"
    },
    "gifter_name": {
      "type": "string",
      "description": "Name of the gifter"
    },
    "gifter_username": {
      "type": "string",
      "description": "Username of the gifter"
    },
    "gifter_avatar": {
      "type": "string",
      "description": "Avatar URL of the gifter"
    },
    "total_coins_gifted": {
      "type": "number",
      "default": 0,
      "description": "Total coins worth of gifts sent to this streamer"
    },
    "total_gifts_sent": {
      "type": "number",
      "default": 0,
      "description": "Number of gifts sent"
    },
    "rank": {
      "type": "number",
      "description": "Current rank position (1-1000)"
    },
    "last_gift_date": {
      "type": "string",
      "format": "date-time",
      "description": "When they last sent a gift"
    }
  },
  "required": [
    "streamer_id",
    "gifter_id"
  ]
}