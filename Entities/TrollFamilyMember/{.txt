{
  "name": "TrollFamilyMember",
  "type": "object",
  "properties": {
    "family_id": {
      "type": "string",
      "description": "Troll Family ID"
    },
    "family_name": {
      "type": "string",
      "description": "Family name"
    },
    "family_tag": {
      "type": "string",
      "description": "Family tag"
    },
    "user_id": {
      "type": "string",
      "description": "Member user ID"
    },
    "user_name": {
      "type": "string",
      "description": "Member name"
    },
    "username": {
      "type": "string",
      "description": "Member username"
    },
    "user_avatar": {
      "type": "string",
      "description": "Member avatar"
    },
    "user_level": {
      "type": "number",
      "description": "Member level when joined"
    },
    "role": {
      "type": "string",
      "enum": [
        "founder",
        "leader",
        "officer",
        "member"
      ],
      "default": "member",
      "description": "Role in family"
    },
    "contribution_points": {
      "type": "number",
      "default": 0,
      "description": "Points contributed to family"
    },
    "contribution_gifts": {
      "type": "number",
      "default": 0,
      "description": "Gifts sent as family member"
    },
    "join_date": {
      "type": "string",
      "format": "date-time",
      "description": "When they joined"
    },
    "is_active": {
      "type": "boolean",
      "default": true,
      "description": "Active member status"
    }
  },
  "required": [
    "family_id",
    "user_id"
  ]
}