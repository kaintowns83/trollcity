{
  "name": "Stream",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Stream title"
    },
    "streamer_name": {
      "type": "string",
      "description": "Name of the streamer"
    },
    "streamer_id": {
      "type": "string",
      "description": "User ID of the streamer"
    },
    "streamer_avatar": {
      "type": "string",
      "description": "Streamer avatar URL"
    },
    "streamer_follower_count": {
      "type": "number",
      "description": "Streamer follower count"
    },
    "streamer_created_date": {
      "type": "string",
      "format": "date-time",
      "description": "Streamer account creation date (for OG badge)"
    },
    "thumbnail": {
      "type": "string",
      "description": "Stream thumbnail URL"
    },
    "viewer_count": {
      "type": "number",
      "default": 0,
      "description": "Current number of viewers"
    },
    "total_gifts": {
      "type": "number",
      "default": 0,
      "description": "Total gifts received in coins"
    },
    "likes": {
      "type": "number",
      "default": 0,
      "description": "Total likes received"
    },
    "troll_points": {
      "type": "number",
      "default": 0,
      "description": "Points for featured page spotlight (10 points per gift)"
    },
    "category": {
      "type": "string",
      "enum": [
        "gaming",
        "music",
        "talk",
        "creative",
        "fitness",
        "cooking",
        "trolling",
        "other"
      ],
      "default": "other",
      "description": "Stream category"
    },
    "status": {
      "type": "string",
      "enum": [
        "live",
        "ended",
        "deleted"
      ],
      "default": "live",
      "description": "Stream status"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Stream tags"
    },
    "stream_mode": {
      "type": "string",
      "enum": [
        "solo",
        "multi"
      ],
      "default": "solo",
      "description": "Solo full screen or multi-troll live"
    },
    "max_participants": {
      "type": "number",
      "enum": [
        1,
        2,
        4,
        6,
        8,
        10,
        12,
        14
      ],
      "default": 1,
      "description": "Maximum number of participants in the beam"
    },
    "secured_boxes": {
      "type": "boolean",
      "default": false,
      "description": "Whether boxes are secured (invite-only) or open (public requests)"
    },
    "last_heartbeat": {
      "type": "string",
      "format": "date-time",
      "description": "Last heartbeat timestamp from streamer"
    },
    "streaming_backend": {
      "type": "string",
      "enum": [
        "livekit",
        "ivs",
        "webrtc"
      ],
      "default": "livekit",
      "description": "Which streaming backend is being used"
    },
    "livekit_room_name": {
      "type": "string",
      "description": "LiveKit room name (usually stream ID)"
    },
    "ivs_stage_arn": {
      "type": "string",
      "description": "Amazon IVS Stage ARN for real-time streaming"
    },
    "ivs_stage_name": {
      "type": "string",
      "description": "Amazon IVS Stage name"
    },
    "ivs_host_token": {
      "type": "string",
      "description": "Host participant token for IVS Stage"
    },
    "webrtc_offer": {
      "type": "string",
      "description": "WebRTC offer SDP (temporary solution)"
    }
  },
  "required": [
    "title",
    "streamer_name",
    "streamer_id"
  ]
}