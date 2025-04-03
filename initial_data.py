from extensions import db 
from models import Role, User, UserRoles, Campaign, AdRequest
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

def create_initial_data(user_datastore):
    if user_datastore is None:
        raise ValueError("user_datastore is not initialized")
        
    # Add roles if not present
    roles = ["admin", "sponsor", "influencer"]
    descriptions = {
        "admin": "Admin role",
        "sponsor": "Sponsor role",
        "influencer": "Influencer role"
    }
    for role in roles:
        if not Role.query.filter_by(name=role).first():
            user_datastore.create_role(name=role, description=descriptions[role])
    db.session.commit()
    
    # Create users and assign roles
    user_data = [
        {
            "email": "admin@example.com",
            "password": generate_password_hash("adminpassword123"),
            "role": "admin",
            "additional_fields": {"active": True}
        },
        {
            "email": "sponsor@example.com",
            "password": generate_password_hash("password123"),
            "role": "sponsor",
            "additional_fields": {
                "company_name": "Nike",
                "industry": "Sportswear",
                "budget": 1000000,
                "active": True,
                "status":"pending"
            }
        },
        {
            "email": "influencer@example.com",
            "password": generate_password_hash("password123"),
            "role": "influencer",
            "additional_fields": {
                "name": "John Doe",
                "category": "Fitness",
                "niche": "Health & Wellness",
                "reach": 500000,
                "active": True,
                "status": "approved"
            }
        }
    ]
    
    for user_info in user_data:
        if not User.query.filter_by(email=user_info["email"]).first():
            user = user_datastore.create_user(
                email=user_info["email"],
                password=user_info["password"],
                **user_info["additional_fields"]
            )
            db.session.add(user)
            role = Role.query.filter_by(name=user_info["role"]).first()
            if role:
                user_role = UserRoles(user_id=user.id, role_id=role.id)
                db.session.add(user_role)
    
    db.session.commit()

    # Update last_visited for all users
    default_date = datetime.utcnow() - timedelta(days=30)
    User.query.filter(User.last_visited.is_(None)).update(
        {"last_visited": default_date}, synchronize_session=False
    )
    db.session.commit()

    # Create 2 public and 2 private campaigns for the sponsor
    sponsor = User.query.join(User.roles).filter(Role.name == "sponsor").first()
    if sponsor:
        campaign_data = [
            {
                "name": "Nike Fitness Challenge",
                "description": "A campaign to promote Nike fitness products.",
                "start_date": datetime.strptime("2024-11-15", "%Y-%m-%d").date(),
                "end_date": datetime.strptime("2024-12-15", "%Y-%m-%d").date(),
                "budget": 500000,
                "visibility": "public",
                "goals": "Increase brand awareness and engagement",
                "niche": "Sportswear",
                "sponsor_id": sponsor.id
            },
            {
                "name": "Nike Winter Campaign",
                "description": "Promoting winter sports apparel.",
                "start_date": datetime.strptime("2024-12-01", "%Y-%m-%d").date(),
                "end_date": datetime.strptime("2025-01-01", "%Y-%m-%d").date(),
                "budget": 700000,
                "visibility": "public",
                "goals": "Increase sales for winter collection",
                "niche": "Sportswear",
                "sponsor_id": sponsor.id
            },
            {
                "name": "Exclusive Training Promo",
                "description": "Targeted training gear promo.",
                "start_date": datetime.strptime("2024-11-20", "%Y-%m-%d").date(),
                "end_date": datetime.strptime("2024-12-20", "%Y-%m-%d").date(),
                "budget": 300000,
                "visibility": "private",
                "goals": "Boost influencer-specific sales",
                "niche": "Fitness",
                "sponsor_id": sponsor.id
            },
            {
                "name": "VIP Sneaker Launch",
                "description": "Private event for new sneaker line.",
                "start_date": datetime.strptime("2024-12-05", "%Y-%m-%d").date(),
                "end_date": datetime.strptime("2024-12-25", "%Y-%m-%d").date(),
                "budget": 800000,
                "visibility": "private",
                "goals": "Promote premium product line",
                "niche": "Footwear",
                "sponsor_id": sponsor.id
            }
        ]
        for campaign_info in campaign_data:
            if not Campaign.query.filter_by(
                name=campaign_info["name"], sponsor_id=campaign_info["sponsor_id"]
            ).first():
                campaign = Campaign(**campaign_info)
                db.session.add(campaign)
        db.session.commit()

    # Create ad requests based on campaign visibility
    # Create ad requests based on campaign visibility
    influencer = User.query.join(User.roles).filter(Role.name == "influencer").first()

    if influencer:
        campaigns = Campaign.query.all()
        for campaign in campaigns:
            # Check if an ad request already exists for this campaign
            existing_ad_request = AdRequest.query.filter_by(campaign_id=campaign.id).first()

            if existing_ad_request:
                print(f"Ad request already exists for campaign ID {campaign.id}. Skipping...")
                continue

            if campaign.visibility == "public":
                ad_request = AdRequest(
                    campaign_id=campaign.id,
                    influencer_id=None,  # No influencer assigned for public campaigns
                    requirements="Create a post about the campaign.",
                    payment_amount=5000,
                    status="created"
                )
            else:  # For private campaigns
                ad_request = AdRequest(
                    campaign_id=campaign.id,
                    influencer_id=influencer.id,  # Assign the influencer
                    requirements="Exclusive post with specific details.",
                    payment_amount=10000,
                    status="pending"  # Set status as pending
                )
            
            db.session.add(ad_request)

        db.session.commit()
    print("Ad requests created successfully.")


    print("Data generation script completed.")
