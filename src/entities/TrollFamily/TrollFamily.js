{
  "name": "TrollFamily",
  "type": "object",
  "properties": {
    "family_name": {
      "type": "string",
      "description": "Name of the troll family"
    },
    "family_tag": {
      "type": "string",
      "description": "Short tag/abbreviation (e.g., [TF])"
    },
    "founder_id": {
      "type": "string",
      "description": "User ID of the founder"
    },
    "founder_name": {
      "type": "string",
      "description": "Founder's name"
    },
    "leader_id": {
      "type": "string",
      "description": "Current family leader ID"
    },
    "leader_name": {
      "type": "string",
      "description": "Current leader name"
    },
    "description": {
      "type": "string",
      "description": "Family description/bio"
    },
    "family_logo": {
      "type": "string",
      "description": "Family logo/banner URL"
    },
    "family_color": {
      "type": "string",
      "description": "Primary family color"
    },
    "member_count": {
      "type": "number",
      "default": 1,
      "description": "Total members in family"
    },
    "total_family_points": {
      "type": "number",
      "default": 0,
      "description": "Combined troll points from all members"
    },
    "total_family_gifts": {
      "type": "number",
      "default": 0,
      "description": "Total gifts sent by family members"
    },
    "family_level": {
      "type": "number",
      "default": 1,
      "description": "Family level (unlocks perks)"
    },
    "is_recruiting": {
      "type": "boolean",
      "default": true,
      "description": "Whether accepting new members"
    },
    "min_level_requirement": {
      "type": "number",
      "default": 15,
      "description": "Minimum level to join"
    },
    "max_members": {
      "type": "number",
      "default": 50,
      "description": "Maximum family size"
    },
    "family_perks": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Unlocked family perks"
    },
    "is_private": {
      "type": "boolean",
      "default": false,
      "description": "Requires invitation to join"
    }
  },
  "required": [
    "family_name",
    "founder_id"
  ]
}