{
  "name": "Follow",
  "type": "object",
  "properties": {
    "follower_id": {
      "type": "string",
      "description": "User ID of the follower"
    },
    "following_id": {
      "type": "string",
      "description": "User ID being followed"
    },
    "follower_name": {
      "type": "string",
      "description": "Name of the follower"
    },
    "following_name": {
      "type": "string",
      "description": "Name being followed"
    }
  },
  "required": [
    "follower_id",
    "following_id"
  ]
}