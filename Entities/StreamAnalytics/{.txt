{
  "name": "StreamAnalytics",
  "type": "object",
  "properties": {
    "stream_id": {
      "type": "string",
      "description": "Stream ID"
    },
    "streamer_id": {
      "type": "string",
      "description": "Streamer ID"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "Analytics date"
    },
    "total_viewers": {
      "type": "number",
      "default": 0,
      "description": "Total unique viewers"
    },
    "peak_viewers": {
      "type": "number",
      "default": 0,
      "description": "Peak concurrent viewers"
    },
    "average_watch_time": {
      "type": "number",
      "default": 0,
      "description": "Average watch time in minutes"
    },
    "total_gifts": {
      "type": "number",
      "default": 0,
      "description": "Total gifts received"
    },
    "total_tips": {
      "type": "number",
      "default": 0,
      "description": "Total tips in USD"
    },
    "new_followers": {
      "type": "number",
      "default": 0,
      "description": "New followers gained"
    },
    "chat_messages": {
      "type": "number",
      "default": 0,
      "description": "Total chat messages"
    },
    "stream_duration": {
      "type": "number",
      "default": 0,
      "description": "Stream duration in minutes"
    },
    "top_gifters": {
      "type": "array",
      "items": {
        "type": "object"
      },
      "description": "Top gift senders"
    }
  },
  "required": [
    "stream_id",
    "streamer_id",
    "date"
  ]
}