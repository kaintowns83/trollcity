{
  "name": "BestTrollerzBattle",
  "type": "object",
  "properties": {
    "battle_name": {
      "type": "string",
      "description": "Name of the battle"
    },
    "stream1_id": {
      "type": "string",
      "description": "First stream ID"
    },
    "stream1_name": {
      "type": "string",
      "description": "First stream name"
    },
    "stream1_streamer": {
      "type": "string",
      "description": "First streamer name"
    },
    "stream1_thumbnail": {
      "type": "string",
      "description": "First stream thumbnail"
    },
    "stream1_points": {
      "type": "number",
      "default": 0,
      "description": "Troll points for stream 1"
    },
    "stream2_id": {
      "type": "string",
      "description": "Second stream ID (if accepted)"
    },
    "stream2_name": {
      "type": "string",
      "description": "Second stream name"
    },
    "stream2_streamer": {
      "type": "string",
      "description": "Second streamer name"
    },
    "stream2_thumbnail": {
      "type": "string",
      "description": "Second stream thumbnail"
    },
    "stream2_points": {
      "type": "number",
      "default": 0,
      "description": "Troll points for stream 2"
    },
    "status": {
      "type": "string",
      "enum": [
        "waiting",
        "active",
 