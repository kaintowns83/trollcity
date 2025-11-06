{
  "name": "UserPost",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User ID who created the post"
    },
    "user_name": {
      "type": "string",
      "description": "Name of user"
    },
    "username": {
      "type": "string",
      "description": "Username"
    },
    "user_avatar": {
      "type": "string",
      "description": "User avatar"
    },
    "post_type": {
      "type": "string",
      "enum": [
        "text",
        "image",
        "video"
      ],
      "default": "text",
      "description": "Type of post"
    },
    "content": {
      "type": "string",
      "description": "Text content of post"
    },
    "media_url": {
      "type": "string",
      "description": "URL of image or video"
    },
    "media_thumbnail": {
      "type": "string",
      "description": "Thumbnail for video posts"
    },
    "likes_count": {
      "type": "number",
      "default": 0,
      "description": "Number of likes"
    },
    "comments_count": {
      "type": "number",
      "default": 0,
      "description": "Number of comments"
    },
    "shares_count": {
      "type": "number",
      "default": 0,
      "description": "Number of shares"
    },
    "total_gifts": {
      "type": "number",
      "default": 0,
      "description": "Total coins received as gifts"
    },
    "is_pinned": {
      "type": "boolean",
      "default": false,
      "description": "Whether post is pinned to profile"
    }
  },
  "required": [
    "user_id",
    "user_name",
    "post_type"
  ]
}