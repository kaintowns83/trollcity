{
  "name": "Referral",
  "type": "object",
  "properties": {
    "referrer_id": {
      "type": "string",
      "description": "User ID who sent the referral"
    },
    "referrer_name": {
      "type": "string",
      "description": "Name of referrer"
    },
    "referrer_username": {
      "type": "string",
      "description": "Username of referrer"
    },
    "referred_id": {
      "type": "string",
      "description": "User ID who was referred"
    },
    "referred_name": {
      "type": "string",
      "description": "Name of referred user"
    },
    "referred_username": {
      "type": "string",
      "description": "Username of referred user"
    },
    "referral_code": {
      "type": "string",
      "description": "Referral code used"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "completed"
      ],
      "default": "pending",
      "description": "Status of referral (completed when referred user reaches level 10)"
    },
    "reward_given": {
      "type": "boolean",
      "default": false,
      "description": "Whether reward has been given to both users"
    },
    "referred_user_level": {
      "type": "number",
      "default": 1,
      "description": "Current level of referred user"
    },
    "reward_amount": {
      "type": "number",
      "default": 2000,
      "description": "Coins rewarded when completed"
    },
    "completed_date": {
      "type": "string",
      "format": "date-time",
      "description": "When referral was completed"
    }
  },
  "required": [
    "referrer_id",
    "referred_id",
    "referral_code"
  ]
}