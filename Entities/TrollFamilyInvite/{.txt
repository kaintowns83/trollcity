{
  "name": "TrollFamilyInvite",
  "type": "object",
  "properties": {
    "family_id": {
      "type": "string",
      "description": "Family ID"
    },
    "family_name": {
      "type": "string",
      "description": "Family name"
    },
    "inviter_id": {
      "type": "string",
      "description": "Who sent the invite"
    },
    "inviter_name": {
      "type": "string",
      "description": "Inviter name"
    },
    "invitee_id": {
      "type": "string",
      "description": "User being invited"
    },
    "invitee_name": {
      "type": "string",
      "description": "Invitee name"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "accepted",
        "rejected",
        "expired"
      ],
      "default": "pending",
      "description": "Invite status"
    },
    "message": {
      "type": "string",
      "description": "Optional invite message"
    },
    "expires_at": {
      "type": "string",
      "format": "date-time",
      "description": "When invite expires"
    }
  },
  "required": [
    "family_id",
    "inviter_id",
    "invitee_id"
  ]
}