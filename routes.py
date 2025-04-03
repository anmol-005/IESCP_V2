from functools import cache
from flask import jsonify, render_template,  request
from extensions import db 
from models import User, Campaign , AdRequest , Role , UserRoles
import re
from werkzeug.security import generate_password_hash , check_password_hash
from flask_security import login_required , logout_user , current_user
from flask_security import login_user , roles_required
from datetime import datetime , date 
from sqlalchemy.exc import IntegrityError
from celery.result import AsyncResult

def format_date(date):
    return date.strftime('%Y-%m-%d') if date else None

EMAIL_REGEX = r'^[a-z0-9]+[\._]?[a-z0-9]+[@]\w+[.]\w+$'

def create_routes(app):
    cache=app.cache

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/api/register', methods=['POST'])
    def register():
        data = request.get_json()

        # Validate required fields
        if not data.get('email') or not data.get('password') or not data.get('role'):
            return jsonify({"error": "Email, password, and role are required fields"}), 400

        email = data['email']
        password = data['password']
        role_name = data['role']

        # Validate email format
        if not re.match(EMAIL_REGEX, email):
            return jsonify({"error": "Invalid email format"}), 400

        # Validate role
        if role_name not in ['influencer', 'sponsor']:
            return jsonify({"error": "Role must be either 'influencer' or 'sponsor'"}), 400

        # Check if email is already registered
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email is already registered"}), 400

        # Fetch the role object
        role = Role.query.filter_by(name=role_name).first()
        if not role:
            return jsonify({"error": f"Role '{role_name}' does not exist"}), 400

        # Hash password
        hashed_password = generate_password_hash(password)

        # Create user based on role
        if role_name == 'influencer':
            name = data.get('name')
            category = data.get('category')
            niche = data.get('niche')
            reach = data.get('reach')

            if not name or not category or not niche or not reach:
                return jsonify({"error": "Name, category, niche, and reach are required for influencers"}), 400

            new_user = User(
                email=email,
                password=hashed_password,
                name=name,
                category=category,
                niche=niche,
                reach=reach,
                status="approved"
            )
        elif role_name == 'sponsor':
            company_name = data.get('company_name')
            industry = data.get('industry')
            budget = data.get('budget')
            

            if not company_name or not industry or not budget:
                return jsonify({"error": "Company name, industry, and budget are required for sponsors"}), 400

            new_user = User(
                email=email,
                password=hashed_password,
                company_name=company_name,
                industry=industry,
                budget=budget,
                status="pending"
            )

        # Assign role to user
        new_user.roles.append(role)

        # Add user to database
        try:
            db.session.add(new_user)
            db.session.commit()
            if new_user.status == "pending":
                return jsonify({"message": "Account created successfully. Your account is under consideration, please wait for approval."}), 201
            else:
                return jsonify({"message": "Account created successfully!"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500



    # @app.route('/api/login', methods=['POST'])
    # def login():
    #     data = request.get_json()
    #     if not data:
    #         return jsonify({'error': 'No JSON data received'}), 400

    #     email = data.get('email')
    #     password = data.get('password')
        
    #     if not email or not password:
    #         return jsonify({'error': 'Email and password are required'}), 400

    #     # Fetch the user from the database
    #     user = User.query.filter_by(email=email).first()

    #     if user and check_password_hash(user.password, password):

    #         if user.status == "pending":
    #             return jsonify({"message": "Your account is under consideration. Please wait for approval."}), 403
    #         # Log the user in
    #         login_user(user)  # Establishes a session for the user

    #         user.last_visited = datetime.utcnow()
    #         db.session.commit()

    #         print(f"User logged in: {current_user.is_authenticated}")
    #         print(f"Current User ID: {current_user.id if current_user.is_authenticated else 'No user'}")
    #         print(f"User's Role: {user.roles[0].name if user.roles else 'No role assigned'}")


    #         # Fetch the user's role and determine the redirect URL
    #         role = user.roles[0].name if user.roles else None
    #         if role == 'sponsor':
    #             return jsonify({'role': 'sponsor', 'redirect': '/sponsor_dashboard'})
    #         elif role == 'influencer':
    #             return jsonify({'role': 'influencer', 'redirect': '/influencer_dashboard'})
    #         else:
    #             return jsonify({'error': 'Unknown role'}), 403

    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No JSON data received'}), 400

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        # Fetch the user from the database
        user = User.query.filter_by(email=email).first()

        if user:
            # Check if the account is flagged
            if user.flagged:
                return jsonify({'error': 'Your account has been flagged by the admin.', 'flagged': True}), 403

            # Validate password
            if check_password_hash(user.password, password):
                # Log the user in
                login_user(user)  # Establishes a session for the user

                # Update last visited timestamp
                user.last_visited = datetime.utcnow()
                db.session.commit()

                # Determine the user's role and provide appropriate redirect
                role = user.roles[0].name if user.roles else None
                if role == 'sponsor':
                    return jsonify({'role': 'sponsor', 'redirect': '/sponsor_dashboard'}), 200
                elif role == 'influencer':
                    return jsonify({'role': 'influencer', 'redirect': '/influencer_dashboard'}), 200
                else:
                    return jsonify({'error': 'Unknown role'}), 403

        # Return error if credentials are invalid
        return jsonify({'error': 'Invalid credentials'}), 401


    
    @app.route('/api/user', methods=['GET'])
    @cache.cached(timeout=60)
    @login_required
    def get_user_info():
        try:
            if current_user.roles:
                role_name = current_user.roles[0].name  # Assuming a single role per user
            else:
                return jsonify({"error": "User has no role assigned"}), 400
            
            user_info = {
                "id": current_user.id,
                "role": role_name,
                "status": current_user.status,
                "name": current_user.name if role_name == "influencer" else current_user.company_name,
                "flagged": current_user.flagged
            }
            return jsonify(user_info)
        except Exception as e:
            return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

    @app.route('/api/get_user_data', methods=['GET'])
    def get_user_data():
        # Check if user is authenticated
        if not current_user.is_authenticated:
            return jsonify({
                "isLoggedIn": False,
                "role": None,
                "name": None
            }), 200
            
        # Check the role of the current user
        if 'sponsor' in [role.name for role in current_user.roles]:
            # Return data for sponsor
            return jsonify({
                "id": current_user.id,
                "isLoggedIn": True,
                "role": "sponsor",
                "name": current_user.name,  # Assuming `name` is a field in your user model
                "additional_data": {
                    # Add any sponsor-specific data you want to include
                }
            }), 200

        elif 'influencer' in [role.name for role in current_user.roles]:
            # Return data for influencer
            return jsonify({
                "isLoggedIn": True,
                "role": "influencer",
                "name": current_user.name,
                "additional_data": {
                    # Add any influencer-specific data you want to include
                }
            }), 200
        
        elif 'admin' in [role.name for role in current_user.roles]:
            return jsonify({
                "isLoggedIn": True,
                "role": "admin",
                "name": current_user.name,
                "additional_data": {
                }
            }), 200

        else:
            # If the user has a role that is neither sponsor nor influencer
            return jsonify({"error": "Unauthorized role"}), 403
        
    @app.route('/api/admin_login', methods=['POST'])
    def admin_login():
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password, password):
            return jsonify({"error": "Invalid email or password"}), 401
        
        if "admin" not in [role.name for role in user.roles]:
            return jsonify({"error": "Unauthorized: Use the regular login"}), 403

        login_user(user)  # Assuming Flask-Security handles session login
        return jsonify({
                "isLoggedIn": True,
                "role": "admin",
                "name": current_user.name,
                "additional_data": {
                    # Include admin-specific data if required
                }
            }), 200
    
    @app.route('/api/sponsor/accept_ad_requests/<int:ad_request_id>', methods=['POST'])
    @login_required
    def accept_ad_request(ad_request_id):
        user_role = current_user.get_role()  # Get the role using the helper method
        print("Current User Role:", user_role)

        if user_role != 'sponsor':
            return jsonify({"error": "Unauthorized"}), 403

        ad_request = AdRequest.query.filter_by(id=ad_request_id, status='pending').first()
        if not ad_request:
            return jsonify({"error": "Ad request not found or already processed"}), 404

        ad_request.status = "active"
        db.session.commit()
        return jsonify({"message": "Ad request accepted successfully"}), 200


    @app.route('/api/sponsor/reject_ad_requests/<int:ad_request_id>', methods=['POST'])
    @login_required
    def sponsor_reject_ad_request(ad_request_id):
        user_role = current_user.get_role()
        if user_role != 'sponsor':
            return jsonify({"error": "Unauthorized"}), 403

        ad_request = AdRequest.query.filter_by(id=ad_request_id, status='pending').first()
        if not ad_request:
            return jsonify({"error": "Ad request not found or already processed"}), 404

        ad_request.status = 'rejected'
        db.session.commit()
        return jsonify({"success": True})


    @app.route('/api/influencer_dashboard', methods=['GET'])
    @roles_required('influencer')
    # @cache.cached(timeout=10)
    def influencer_dashboard():
        user_id = current_user.id

        # Fetch active ad requests
        active_ad_requests = db.session.query(AdRequest, Campaign).join(Campaign).filter(
            AdRequest.influencer_id == user_id,
            AdRequest.status.in_(['active', 'finished'])
        ).all()

        # Fetch sent ad requests (public campaigns)
        sent_ad_requests = db.session.query(AdRequest, Campaign).join(Campaign).filter(
            AdRequest.influencer_id == user_id,
            AdRequest.status == 'pending',
            Campaign.visibility == 'public'
        ).all()

        # Fetch received ad requests (private campaigns)
        received_ad_requests = db.session.query(AdRequest, Campaign).join(Campaign).filter(
            AdRequest.influencer_id == user_id,
            Campaign.visibility == 'private'
        ).all()

        return jsonify({
            "active_ad_requests": [
                {
                    "campaign_name": campaign.name,
                    "requirements": ad_request.requirements,
                    "payment_amount": ad_request.payment_amount,
                    "deadline": campaign.end_date,
                    "status": ad_request.status,
                    "verification_link": ad_request.verification_link,
                    "ad_request_id": ad_request.id
                }
                for ad_request, campaign in active_ad_requests
            ],
            "sent_ad_requests": [
                {
                    "campaign_name": campaign.name,
                    "payment_amount": ad_request.payment_amount,
                    "status": ad_request.status,
                    "ad_request_id": ad_request.id
                }
                for ad_request, campaign in sent_ad_requests
            ],
            "received_ad_requests": [
                {
                    "campaign_name": campaign.name,
                    "payment_amount": ad_request.payment_amount,
                    "status": ad_request.status,
                    "ad_request_id": ad_request.id
                }
                for ad_request, campaign in received_ad_requests
            ]
        })
    
    @app.route('/api/influencer_profile', methods=['GET', 'POST'])
    @login_required
    @cache.cached(timeout=10, unless=lambda: request.method == 'POST')  # Cache GET only
    def influencer_profile():
        if not any(role.name == 'influencer' for role in current_user.roles):
            return jsonify({"error": "Unauthorized"}), 403

        if request.method == 'GET':
            return jsonify({
                "name": current_user.name,
                "email": current_user.email,
                "category": current_user.category,
                "niche": current_user.niche,
                "Reach": current_user.reach,
            })

        # Handle POST (update profile)
        data = request.json
        errors = []

        # Update fields if provided
        if 'name' in data:
            current_user.name = data['name']
        if 'email' in data:
            current_user.email = data['email']
        if 'category' in data:
            current_user.category = data['category']
        if 'niche' in data:
            current_user.niche = data['niche']
        if 'reach' in data:
            current_user.profile_picture = data['reach']
        
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            errors.append(str(e))

        if errors:
            return jsonify({"error": "Failed to update profile", "details": errors}), 500

        return jsonify({"message": "Profile updated successfully"})


    @app.route('/api/completed_ad_requests', methods=['GET'])
    @login_required
    @cache.cached(timeout=10)
    def completed_ad_requests():
        if not any(role.name == 'influencer' for role in current_user.roles):
            return jsonify({"error": "Unauthorized"}), 403

        ad_requests = AdRequest.query.filter_by(influencer_id=current_user.id, status='completed').all()
        completed_requests = [
            {
                "id": ad_request.id,
                "campaign_name": ad_request.campaign.name,
                "payment_amount": ad_request.payment_amount
            } for ad_request in ad_requests
        ]

        return jsonify(completed_requests)


    
    @app.route('/api/ad_requests/<int:ad_request_id>/submit_verification_link', methods=['POST'])
    @login_required
    def submit_verification_link(ad_request_id):
        # Check if the user has the 'influencer' role
        if not any(role.name == 'influencer' for role in current_user.roles):
            return jsonify({"error": "Unauthorized"}), 403

        ad_request = AdRequest.query.filter_by(id=ad_request_id, influencer_id=current_user.id).first()
        if not ad_request:
            return jsonify({"error": "Ad request not found"}), 404

        data = request.get_json()
        verification_link = data.get('verification_link')

        if not verification_link:
            return jsonify({"error": "Verification link is required"}), 400

        ad_request.verification_link = verification_link
        ad_request.status = "finished"
        db.session.commit()

        return jsonify({"message": "Verification link submitted successfully"})



    @app.route('/api/ad_requests/<int:ad_request_id>/mark_complete', methods=['POST'])
    @login_required
    def mark_complete(ad_request_id):
        if not any(role.name == 'influencer' for role in current_user.roles):
            return jsonify({"error": "Unauthorized"}), 403

        ad_request = AdRequest.query.filter_by(id=ad_request_id, influencer_id=current_user.id).first()
        if not ad_request:
            return jsonify({"error": "Ad request not found"}), 404

        if not ad_request.verification_link:
            return jsonify({"error": "Verification link is required before marking complete"}), 400

        ad_request.status = 'completed'
        db.session.commit()

        return jsonify({"message": "Ad request marked as complete"})


    @app.route('/api/cancel_ad_requests/<int:ad_request_id>', methods=['POST'])
    @login_required
    def cancel_ad_request(ad_request_id):
        
        if not any(role.name == 'influencer' for role in current_user.roles):
            return jsonify({"error": "Unauthorized"}), 403

        ad_request = AdRequest.query.filter_by(id=ad_request_id, influencer_id=current_user.id, status='pending').first()
        if not ad_request:
            return jsonify({"error": "Ad request not found or cannot be canceled"}), 404

        db.session.delete(ad_request)
        db.session.commit()

        return jsonify({"message": "Ad request canceled successfully"})


    @app.route('/api/ad_requests/<int:ad_request_id>/accept', methods=['POST'])
    # @login_required
    def inf_accept_ad_request(ad_request_id):
        # if current_user.roles != 'influencer':
        #     return jsonify({"error": "Unauthorized"}), 403

        ad_request = AdRequest.query.filter_by(id=ad_request_id, influencer_id=current_user.id, status='pending').first()
        if not ad_request:
            return jsonify({"error": "Ad request not found or cannot be accepted"}), 404

        ad_request.status = 'active'
        db.session.commit()

        return jsonify({"message": "Ad request accepted successfully"})


    @app.route('/api/ad_requests/<int:ad_request_id>/reject', methods=['POST'])
    @login_required
    def inf_reject_ad_request(ad_request_id):
        if current_user.roles != 'influencer':
            return jsonify({"error": "Unauthorized"}), 403

        ad_request = AdRequest.query.filter_by(id=ad_request_id, influencer_id=current_user.id, status='pending').first()
        if not ad_request:
            return jsonify({"error": "Ad request not found or cannot be rejected"}), 404

        ad_request.status = 'rejected'
        db.session.commit()

        return jsonify({"message": "Ad request rejected successfully"})


    # Logout route
    @app.route('/api/logout', methods=['GET','POST'])
    @login_required
    def logout():
        logout_user() 
        return jsonify({"message": "Logged out successfully"}), 200
    
    @app.route('/api/sponsor_profile', methods=['GET', 'POST'])
    @login_required
    @cache.cached(timeout=10, unless=lambda: request.method == 'POST')  # Cache only GET requests
    def sponsor_profile():
        if not any(role.name == 'sponsor' for role in current_user.roles):
            return jsonify({"error": "Unauthorized"}), 403

        if request.method == 'GET':
            # Return the sponsor profile details
            return jsonify({
                "company_name": current_user.company_name,
                "industry": current_user.industry,
                "budget": current_user.budget,
            })

        # Handle profile updates via POST
        data = request.json
        errors = []

        # Update profile fields if provided
        if 'company_name' in data:
            current_user.company_name = data['company_name']
        if 'industry' in data:
            current_user.industry = data['industry']
        if 'budget' in data:
            try:
                current_user.budget = float(data['budget'])
            except ValueError:
                errors.append("Invalid budget format. It must be a number.")

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            errors.append(str(e))

        if errors:
            return jsonify({"error": "Failed to update profile", "details": errors}), 500

        return jsonify({"message": "Profile updated successfully"})


    @app.route('/api/manage_ad_requests')
    @login_required
    @cache.cached(timeout=10)
    def manage_ad_requests():
        user = current_user
        ad_requests = AdRequest.query.join(Campaign).filter(Campaign.sponsor_id == user.id).all()
        return jsonify([{"Campaign id": ar.campaign_id, "influencer_name": ar.influencer.name, "status": ar.status} for ar in ad_requests])
    
    @app.route('/api/sponsor/active_campaigns', methods=['GET'])
    @login_required
    @cache.cached(timeout=10)
    def get_active_campaigns():
        sponsor_id = current_user.id
        campaigns = Campaign.query.filter_by(sponsor_id=sponsor_id).all()
        response = [
            {
                "id": campaign.id,
                "name": campaign.name,
                "description": campaign.description,
                "visibility": campaign.visibility,
                "start_date": campaign.start_date,
                "end_date": campaign.end_date,
                "budget": campaign.budget,
            }
            for campaign in campaigns
        ]
        return jsonify(response)
    
    @app.route('/api/sponsor/received_ad_requests', methods=['GET'])
    @login_required
    @cache.cached(timeout=5)
    def get_received_ad_requests():
        sponsor_id = current_user.id
        ad_requests = (
            db.session.query(AdRequest, Campaign, User)
            .join(Campaign, Campaign.id == AdRequest.campaign_id)
            .join(User, User.id == AdRequest.influencer_id)
            .filter(Campaign.sponsor_id == sponsor_id, Campaign.visibility == "public", AdRequest.status=="pending")
            .all()
        )
        response = [
            {
                "ad_request_id": ad_request.id,
                "campaign_name": campaign.name,
                "influencer_name": user.name,
                "requirements": ad_request.requirements,
                "payment_amount": ad_request.payment_amount,
                "status": ad_request.status,
            }
            for ad_request, campaign, user in ad_requests
        ]
        return jsonify(response)
    
    @app.route('/api/sponsor/sent_ad_requests', methods=['GET'])
    @login_required
    @cache.cached(timeout=10)
    def get_sent_ad_requests():
        sponsor_id = current_user.id
        ad_requests = (
            db.session.query(AdRequest, Campaign, User)
            .join(Campaign, Campaign.id == AdRequest.campaign_id)
            .join(User, User.id == AdRequest.influencer_id)
            .filter(Campaign.sponsor_id == sponsor_id, Campaign.visibility == "private")
            .all()
        )
        response = [
            {
                "ad_request_id": ad_request.id,
                "campaign_name": campaign.name,
                "influencer_name": user.name,
                "payment_amount": ad_request.payment_amount,
                "status": ad_request.status,
            }
            for ad_request, campaign, user in ad_requests
        ]
        return jsonify(response)
    
    @app.route('/api/create_campaigns', methods=['POST'])
    def create_campaign():
        data = request.get_json()

        # Validate required fields
        required_fields = ["name", "description", "start_date", "end_date", "budget", "visibility", "goals", "niche"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400

        # Ensure sponsor_id is set from the current user
        sponsor_id = current_user.id if current_user.is_authenticated else None
        if not sponsor_id:
            return jsonify({"error": "Sponsor is not logged in"}), 403

        # Convert dates from string to datetime
        try:
            start_date = datetime.strptime(data["start_date"], "%Y-%m-%d")
            end_date = datetime.strptime(data["end_date"], "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

        # Create and save the campaign
        new_campaign = Campaign(
            name=data["name"],
            description=data["description"],
            start_date=start_date,
            end_date=end_date,
            budget=data["budget"],
            visibility=data["visibility"],
            goals=data["goals"],
            niche=data["niche"],
            sponsor_id=sponsor_id,
            flagged=False  # Default value
        )

        try:
            db.session.add(new_campaign)
            db.session.commit()
            return jsonify({"message": "Campaign created successfully"}), 201
        except IntegrityError as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
    
    @app.route('/api/campaigns', methods=['GET', 'POST'])
    def manage_campaigns():
        # Filter campaigns by sponsor_id matching the current_user's id
        active_campaigns = Campaign.query.filter(
            Campaign.sponsor_id == current_user.id,
            Campaign.end_date >= datetime.utcnow()
        ).all()
        
        previous_campaigns = Campaign.query.filter(
            Campaign.sponsor_id == current_user.id,
            Campaign.end_date < datetime.utcnow()
        ).all()
        
        active_campaigns_data = [
            {
                "id": campaign.id,
                "name": campaign.name,
                "start_date": campaign.start_date.strftime("%Y-%m-%d"),
                "end_date": campaign.end_date.strftime("%Y-%m-%d"),
                "visibility": campaign.visibility,
                "budget": campaign.budget,
                "niche": campaign.niche,
                "goals": campaign.goals
            }
            for campaign in active_campaigns
        ]

        previous_campaigns_data = [
            {
                "id": campaign.id,
                "name": campaign.name,
                "start_date": campaign.start_date.strftime("%Y-%m-%d"),
                "end_date": campaign.end_date.strftime("%Y-%m-%d"),
                "visibility": campaign.visibility,
                "budget": campaign.budget,
                "niche": campaign.niche,
                "goals": campaign.goals
            }
            for campaign in previous_campaigns
        ]

        return jsonify({
            "active_campaigns": active_campaigns_data,
            "previous_campaigns": previous_campaigns_data
        })
    
    @app.route('/api/delete_campaign', methods=['POST'])
    def delete_campaign():
        data = request.get_json()
        campaign_id = data.get('campaign_id')
        if not campaign_id:
            return jsonify({"error": "Campaign ID is required"}), 400
        
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return jsonify({"error": "Campaign not found"}), 404
        
        db.session.delete(campaign)
        db.session.commit()
        
        return jsonify({"message": "Campaign deleted successfully"}), 200
    
    @app.route('/api/ad_requests', methods=['GET'])
    @cache.cached(timeout=10)
    def get_ad_requests():
        if not current_user.is_authenticated:
            return jsonify({"error": "Unauthorized"}), 401

        sponsor_id = current_user.id

        # Fetch ad requests and campaigns
        created_ad_requests = (
            db.session.query(AdRequest, Campaign)
            .join(Campaign, Campaign.id == AdRequest.campaign_id)
            .filter(Campaign.sponsor_id == sponsor_id, AdRequest.status == "created")
            .all()
        )

        ad_requests = (
            db.session.query(AdRequest, Campaign, User)
            .join(Campaign, Campaign.id == AdRequest.campaign_id)
            .join(User, User.id == AdRequest.influencer_id)
            .filter(Campaign.sponsor_id == sponsor_id,
        AdRequest.status.in_(["active", "pending"])  )
            .all()
        )

        completed_ad_requests = (
            db.session.query(AdRequest, Campaign, User)
            .join(Campaign, Campaign.id == AdRequest.campaign_id)
            .join(User, User.id == AdRequest.influencer_id)
            .filter(Campaign.sponsor_id == sponsor_id, AdRequest.status == "completed")
            .all()
        )

        expired_ad_requests = (
        db.session.query(AdRequest, Campaign, User)
        .join(Campaign, AdRequest.campaign_id == Campaign.id)
        .join(User, AdRequest.influencer_id == User.id)
        .filter(Campaign.end_date < date.today())
        .all()
)

        # Serialize the results
        def serialize_ad_requests(data, extra_fields=None):
            return [
                {
                    "ad_request_id": ad_request.id,
                    "campaign_name": campaign.name,
                    "requirements": ad_request.requirements,
                    "status": ad_request.status,
                    "payment_amount": ad_request.payment_amount,
                    "influencer_name": getattr(user, "name", None) if user else None,
                    "verification_link": ad_request.verification_link,
                    **(extra_fields or {}),
                }
                for ad_request, campaign, *rest in data
                for user in (rest if len(rest) > 0 else [None])
            ]

        return jsonify(
            {
                "created_ad_requests": serialize_ad_requests(created_ad_requests),
                "ad_requests": serialize_ad_requests(ad_requests),
                "completed_ad_requests": serialize_ad_requests(completed_ad_requests),
                "expired_ad_requests": serialize_ad_requests(expired_ad_requests),
            }
        )
    
    @app.route('/api/public_ad_requests', methods=['POST'])
    @login_required
    def create_public_ad_request():
        data = request.get_json()
        campaign_id = data.get('campaign_id')
        requirements = data.get('requirements')
        payment_amount = data.get('payment_amount')

        campaign = Campaign.query.filter_by(id=campaign_id, visibility='public').first()
        if not campaign:
            return jsonify({"error": "Invalid public campaign ID"}), 400

        ad_request = AdRequest(
            campaign_id=campaign_id,
            requirements=requirements,
            payment_amount=payment_amount,
            status="created",
            influencer_id=None
        )
        db.session.add(ad_request)
        db.session.commit()

        return jsonify({"message": "Public ad request created successfully!"}), 201
    
    @app.route('/api/private_ad_requests', methods=['POST'])
    @login_required
    def create_private_ad_request():
        data = request.get_json()
        campaign_id = data.get('campaign_id')
        influencer_id = data.get('influencer_id')
        requirements = data.get('requirements')
        payment_amount = data.get('payment_amount')

        campaign = Campaign.query.filter_by(id=campaign_id, visibility='private').first()
        if not campaign:
            return jsonify({"error": "Invalid private campaign ID"}), 400

        ad_request = AdRequest(
            campaign_id=campaign_id,
            influencer_id=influencer_id,
            requirements=requirements,
            payment_amount=payment_amount,
            status="pending"
        )
        db.session.add(ad_request)
        db.session.commit()

        return jsonify({"message": "Private ad request created successfully!"}), 201
    
    @app.route('/api/public_campaigns', methods=['GET'])
    @login_required
    @cache.cached(timeout=10)
    def get_public_campaigns():
        if not any(role.name == 'sponsor' for role in current_user.roles):
            return jsonify({"error": "Unauthorized"}), 403

        public_campaigns = Campaign.query.filter_by(
            visibility="public",
            sponsor_id=current_user.id,
            flagged=False
        ).filter(Campaign.end_date >= datetime.utcnow()).all()

        campaigns_data = [
            {
                "id": campaign.id,
                "name": campaign.description,
                "start_date": campaign.start_date.strftime('%Y-%m-%d'),
                "end_date": campaign.end_date.strftime('%Y-%m-%d')
            }
            for campaign in public_campaigns
        ]
        return jsonify(campaigns_data)

    @app.route('/api/ad_requests/<int:ad_request_id>', methods=['GET', 'PUT', 'DELETE'])
    @roles_required('sponsor')  # Only allow sponsors to access this route
    def manage_ad_request(ad_request_id):
        # Fetch the ad request
        ad_request = AdRequest.query.get(ad_request_id)
        if not ad_request:
            return jsonify({"error": "AdRequest not found"}), 404

        # Handle GET request (fetch details of a specific ad request)
        if request.method == 'GET':
            campaign = Campaign.query.get(ad_request.campaign_id)
            return jsonify({
                "ad_request_id": ad_request.id,
                "campaign_name": campaign.name if campaign else None,
                "requirements": ad_request.requirements,
                "status": ad_request.status,
                "payment_amount": ad_request.payment_amount,
                "verification_link": ad_request.verification_link,
            })

        # Handle PUT request (update an ad request)
        elif request.method == 'PUT':
            data = request.json
            ad_request.requirements = data.get('requirements', ad_request.requirements)
            ad_request.status = data.get('status', ad_request.status)
            ad_request.payment_amount = data.get('payment_amount', ad_request.payment_amount)
            db.session.commit()
            return jsonify({"message": "AdRequest updated successfully"})

        # Handle DELETE request (delete an ad request)
        elif request.method == 'DELETE':
            db.session.delete(ad_request)
            db.session.commit()
            return jsonify({"message": "AdRequest deleted"})
        return jsonify({"error": "Invalid request method"}), 405
    

    @app.route('/api/campaigns/<int:campaign_id>', methods=['GET', 'PUT', 'DELETE'])
    # @roles_required('sponsor')  # Only allow sponsors to access this route
    # @login_required
    def manage_campaign(campaign_id):
        # Fetch the campaign from the database
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return jsonify({"error": "Campaign not found"}), 404

        # Handle GET request (fetch details of a specific campaign)
        if request.method == 'GET':
            return jsonify({
                "campaign_id": campaign.id,
                "name": campaign.name,
                "description": campaign.description,
                "start_date": format_date(campaign.start_date),
                "end_date": format_date(campaign.end_date),
                "budget": campaign.budget,
                "visibility": campaign.visibility,
                "goals": campaign.goals,
                "niche": campaign.niche,
                "flagged": campaign.flagged,
            })

        # Handle PUT request (update an existing campaign)
        elif request.method == 'PUT':
            data = request.json
            # Update the campaign fields if the corresponding data is provided
            try:
                campaign.name = data.get("name", campaign.name)
                campaign.description = data.get("description", campaign.description)
                if data.get("start_date"):
                    campaign.start_date = datetime.strptime(data["start_date"], '%Y-%m-%d')
                if data.get("end_date"):
                    campaign.end_date = datetime.strptime(data["end_date"], '%Y-%m-%d')
                campaign.budget = data.get("budget", campaign.budget)
                campaign.visibility = data.get("visibility", campaign.visibility)
                campaign.goals = data.get("goals", campaign.goals)
                campaign.niche = data.get("niche", campaign.niche)

                db.session.commit()  # Database operation that might fail
                return jsonify({"message": "Campaign updated successfully"})

            except Exception as e:
                db.session.rollback()  # Rollback in case of any error
                return jsonify({"error": str(e)}), 500

        # Handle DELETE request (delete a campaign)
        elif request.method == 'DELETE':
            try:
                # Fetch associated ad requests
                ad_requests = AdRequest.query.filter_by(campaign_id=campaign.id).all()
                
                # Check for active ad requests
                active_ad_requests = [ad for ad in ad_requests if ad.status == 'active']
                if active_ad_requests:
                    return jsonify({"error": "Cannot delete campaign with active ad requests."}), 400

                # Delete associated ad requests
                for ad in ad_requests:
                    db.session.delete(ad)

                # Delete the campaign
                db.session.delete(campaign)
                db.session.commit()

                return jsonify({"message": "Campaign and associated ad requests deleted successfully."})

            except Exception as e:
                db.session.rollback()
                return jsonify({"error": str(e)}), 500

        return jsonify({"error": "Invalid request method"}), 405
    
    @app.route('/api/private_campaigns', methods=['GET'])
    @roles_required('sponsor')  # Only sponsors can access this route
    @login_required
    @cache.cached(timeout=10)
    def get_private_campaigns():
        try:
            campaigns = Campaign.query.filter_by(
                visibility='private', 
                flagged=False, 
                sponsor_id=current_user.id
            ).all()

            return jsonify({
                "campaigns": [
                    {
                        "id": campaign.id,
                        "name": campaign.name,
                        "start_date": format_date(campaign.start_date),
                        "end_date": format_date(campaign.end_date),
                    } for campaign in campaigns
                ]
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @app.route('/api/influencers', methods=['GET'])
    @roles_required('sponsor')  # Only sponsors can access this route
    @login_required
    @cache.cached(timeout=10)
    def get_influencers():
        try:
            influencers = User.query.join(User.roles).filter(Role.name == "influencer").all()
            return jsonify({
                "influencers": [
                    {
                        "id": influencer.id,
                        "name": influencer.name,
                    } for influencer in influencers
                ]
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
       
        
    @app.route('/export/campaigns', methods=['POST'])
    def export_campaigns():

        from tasks import export_campaigns_to_csv
        """Trigger export of sponsor's campaigns."""
        data = request.get_json()
        
        # Extract sponsor_id from the request
        sponsor_id = data.get('sponsor_id') if data else None
        if not sponsor_id:
            return jsonify({"error": "Missing sponsor_id in the request"}), 400
        
        # Trigger Celery task
        task = export_campaigns_to_csv.delay(sponsor_id)
        
        return jsonify({"message": "Export initiated", "task_id": task.id}), 202


    @app.route('/export/status/<task_id>', methods=['GET'])
    def export_status(task_id):
        """Check the status of the CSV export task."""
        task = AsyncResult(task_id)
        if task.state == 'SUCCESS':
            return jsonify({"status": "completed", "file_path": task.result})
        elif task.state == 'PENDING':
            return jsonify({"status": "pending"}), 202
        elif task.state == 'FAILURE':
            return jsonify({"status": "failed", "error": str(task.info)}), 500
        else:
            return jsonify({"status": task.state}), 200
        
    @app.route('/api/search_influencers', methods=['GET'])
    @login_required  
    @cache.cached(timeout=10)
    def search_influencers():
        name = request.args.get('name')
        niche = request.args.get('niche')
        category = request.args.get('category')
        min_followers = request.args.get('min_followers', type=int, default=0)

        query = User.query.join(UserRoles).join(Role).filter(Role.name == 'influencer')

        if name:
            query = query.filter(User.name==name)
        if niche:
            query = query.filter(User.niche.ilike(f"%{niche}%"))
        if category:
            query = query.filter(User.niche.ilike(f"%{category}%"))
        if min_followers:
            query = query.filter(User.reach >= min_followers)
        
        influencers = query.all()
        result = [
            {
                "name": i.name,
                "niche": i.niche,
                "reach": i.reach,
            }
            for i in influencers
        ]
        return jsonify(result), 200
    
    @app.route('/api/search_campaigns', methods=['GET'])
    @login_required  
    @cache.cached(timeout=10)
    def search_campaigns():
        niche = request.args.get('niche')
        start_date = request.args.get('start_date')  
        end_date = request.args.get('end_date')      
        min_budget = request.args.get('min_budget', type=int, default=0)
        max_budget = request.args.get('max_budget', type=int)

        query = Campaign.query.filter(Campaign.visibility == 'public')

        if niche:
            query = query.filter(Campaign.niche.ilike(f"%{niche}%"))
        if start_date:
            try:
                query = query.filter(Campaign.start_date >= start_date)
            except ValueError:
                return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD"}), 400
        if end_date:
            try:
                query = query.filter(Campaign.end_date <= end_date)
            except ValueError:
                return jsonify({"error": "Invalid end_date format. Use YYYY-MM-DD"}), 400
        if min_budget:
            query = query.filter(Campaign.budget >= min_budget)
        if max_budget:
            query = query.filter(Campaign.budget <= max_budget)

        campaigns = query.all()
        result = []
        for c in campaigns:
            campaign_data = {
                "id": c.id,
                "name": c.name,
                "description": c.description,
                "start_date": c.start_date,
                "end_date": c.end_date,
                "budget": c.budget,
                "niche": c.niche,
            }
            if any(role.name == 'influencer' for role in current_user.roles):
                campaign_data["can_send_request"] = True
            else:
                campaign_data["can_send_request"] = False

            result.append(campaign_data)

        return jsonify(result), 200
    
    @app.route('/api/campaigns/<int:campaign_id>/ad_requests', methods=['GET'])
    @login_required
    @cache.memoize(timeout=10)
    def get_ad_requests_for_campaign(campaign_id):
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            return jsonify({"error": "Campaign not found"}), 404

        ad_requests = AdRequest.query.filter_by(campaign_id=campaign_id).all()
        unique_ad_requests = []
        seen_ad_request_ids = set()
        for ad_request in ad_requests:
            if ad_request.id not in seen_ad_request_ids:
                unique_ad_requests.append(ad_request)
                seen_ad_request_ids.add(ad_request.id)

        # Check if the current user (influencer) has already sent a request
        existing_request = AdRequest.query.filter_by(
            campaign_id=campaign_id,
            influencer_id=current_user.id
        ).first()

        # Construct the response data
        response_data = {
            "ad_requests": [
                {
                    "ad_request_id": ad_request.id,
                    "status": ad_request.status,
                    "requirements": ad_request.requirements,
                    "payment_amount": ad_request.payment_amount,
                }
                for ad_request in unique_ad_requests
            ],
            "has_requested": existing_request.status in ['pending', 'active'] if existing_request else False
        }

        return jsonify(response_data), 200

    
    @app.route('/api/view_and_send_ad_request', methods=['POST'])
    @login_required
    def send_ad_request():
        # Attempt to retrieve the JSON data from the request
        data = request.json
        print("Incoming data:", data)

        # Extract the campaign_id
        campaign_id = data.get("campaign_id")
        if not campaign_id:
            return jsonify({"error": "Campaign ID is required"}), 400

        # Get requirements and payment_amount
        requirements = data.get("requirements")
        payment_amount = data.get("payment_amount")

        if not requirements:
            return jsonify({"error": "Requirements are required"}), 400
        if not payment_amount:
            return jsonify({"error": "Payment amount is required"}), 400

        print(f"Campaign ID: {campaign_id}, Requirements: {requirements}, Payment Amount: {payment_amount}")

        # Check if the user already has a request for this campaign and status is NOT "created"
        existing_request = AdRequest.query.filter_by(
            campaign_id=campaign_id,
            influencer_id=current_user.id
        ).filter(AdRequest.status not in ['created','canceled']).first()

        print(f"Existing request: {existing_request}")

        if existing_request:
            return jsonify({"error": "Ad request already exists for this campaign"}), 400

        # Create and save the new ad request
        ad_request = AdRequest(
            campaign_id=campaign_id,
            influencer_id=current_user.id,
            requirements=requirements,
            payment_amount=payment_amount,
            status="pending",
        )
        db.session.add(ad_request)
        db.session.commit()

        return jsonify({"message": "Ad request sent successfully"}), 201

    @app.route('/api/admin/stats', methods=['GET'])
    @login_required
    @cache.cached(timeout=10)
    def get_admin_stats():
        if not any(role.name == 'admin' for role in current_user.roles):
            return jsonify({"error": "Unauthorized"}), 403

        sponsors_count = User.query.join(User.roles).filter(Role.name == 'sponsor').count()
        influencers_count = User.query.join(User.roles).filter(Role.name == 'influencer').count()

        stats = {
            "users_count": User.query.count()-1,
            "sponsors_count": sponsors_count,
            "influencers_count": influencers_count,
            "campaigns_count": Campaign.query.count(),
            "ad_requests_count": AdRequest.query.count(),
        }

        print(stats)

        return jsonify(stats), 200

    # Get all users
    @app.route('/api/admin/users', methods=['GET'])
    @login_required
    def get_users():
        if not any(role.name == 'admin' for role in current_user.roles):
            return jsonify({"error": "Unauthorized"}), 403

        users = User.query.join(User.roles).filter(Role.name != 'admin').all()
        user_data = []
        for user in users:
            role = user.roles[0].name  # Assuming each user has one role
            user_data.append({
                "id": user.id,
                "name": user.name if role == 'influencer' else user.company_name if role == 'sponsor' else 'admin',
                "email": user.email,
                "role": role,  # Serialize role as string
                "flagged": user.flagged  # Assuming you have a 'flagged' column
            })

        return jsonify({"users": user_data}), 200

    # Flag a user
    @app.route('/api/admin/users/<int:user_id>/flag', methods=['POST'])
    @login_required
    def flag_user(user_id):
        if 'admin' not in [role.name for role in current_user.roles]:
            return jsonify({"error": "Unauthorized access"}), 403

        user = User.query.get_or_404(user_id)
        user.flagged = True
        db.session.commit()
        return jsonify({"message": "User flagged successfully"}), 200


    # Unflag a user
    @app.route('/api/admin/users/<int:user_id>/unflag', methods=['POST'])
    @login_required
    def unflag_user(user_id):
        if 'admin' not in [role.name for role in current_user.roles]:
            return jsonify({"error": "Unauthorized access"}), 403

        user = User.query.get_or_404(user_id)
        user.flagged = False
        db.session.commit()
        return jsonify({"message": "User unflagged successfully"}), 200


    # Delete a user
    @app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
    @login_required
    def delete_user(user_id):
        if 'admin' not in [role.name for role in current_user.roles]:
            return jsonify({"error": "Unauthorized access"}), 403

        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"}), 200


    # Get all campaigns
    @app.route('/api/admin/campaigns', methods=['GET'])
    @login_required
    @cache.cached(timeout=10)
    def get_campaigns():
        if 'admin' not in [role.name for role in current_user.roles]:
            return jsonify({"error": "Unauthorized access"}), 403

        campaigns = Campaign.query.all()
        campaign_data = []
        for campaign in campaigns:
            campaign_data.append({
                "id": campaign.id,
                "name": campaign.name,
                "description": campaign.description,
                "visibility": campaign.visibility,
                "budget": campaign.budget,
                "sponsor": campaign.sponsor.company_name,
                "flagged": campaign.flagged
            })
        return jsonify({"campaigns": campaign_data}), 200


    # Flag a campaign
    @app.route('/api/admin/campaigns/<int:campaign_id>/flag', methods=['POST'])
    @login_required
    def flag_campaign(campaign_id):
        if 'admin' not in [role.name for role in current_user.roles]:
            return jsonify({"error": "Unauthorized access"}), 403

        campaign = Campaign.query.get_or_404(campaign_id)
        campaign.flagged = True
        db.session.commit()
        return jsonify({"message": "Campaign flagged successfully"}), 200


    # Unflag a campaign
    @app.route('/api/admin/campaigns/<int:campaign_id>/unflag', methods=['POST'])
    @login_required
    def unflag_campaign(campaign_id):
        if 'admin' not in [role.name for role in current_user.roles]:
            return jsonify({"error": "Unauthorized access"}), 403

        campaign = Campaign.query.get_or_404(campaign_id)
        campaign.flagged = False
        db.session.commit()
        return jsonify({"message": "Campaign unflagged successfully"}), 200


    # Delete a campaign
    @app.route('/api/admin/campaigns/<int:campaign_id>', methods=['DELETE'])
    @login_required
    def admin_delete_campaign(campaign_id):
        if 'admin' not in [role.name for role in current_user.roles]:
            return jsonify({"error": "Unauthorized access"}), 403

        campaign = Campaign.query.get_or_404(campaign_id)
        db.session.delete(campaign)
        db.session.commit()
        return jsonify({"message": "Campaign deleted successfully"}), 200


    # Get ad requests
    @app.route('/api/admin/ad_requests', methods=['GET'])
    @login_required
    @cache.cached(timeout=10)
    def admin_get_ad_requests():
        if 'admin' not in [role.name for role in current_user.roles]:
            return jsonify({"error": "Unauthorized access"}), 403

        ad_requests = AdRequest.query.all()
        ad_request_data = []
        for ad_request in ad_requests:
            ad_request_data.append({
                "id": ad_request.id,
                "status": ad_request.status,
                "payment_amount": ad_request.payment_amount,
                "campaign_name": ad_request.campaign.name,
                "sponsor_name": ad_request.campaign.sponsor.company_name
            })
        return jsonify({"ad_requests": ad_request_data}), 200


    # Get flagged ad requests
    @app.route('/api/admin/ad_requests/flagged', methods=['GET'])
    @login_required
    @cache.cached(timeout=10)
    def get_flagged_ad_requests():
        if 'admin' not in [role.name for role in current_user.roles]:
            return jsonify({"error": "Unauthorized access"}), 403

        flagged_ad_requests = AdRequest.query.filter_by(flagged=True).all()
        flagged_data = []
        for ad_request in flagged_ad_requests:
            flagged_data.append({
                "id": ad_request.id,
                "status": ad_request.status,
                "payment_amount": ad_request.payment_amount,
                "campaign_name": ad_request.campaign.name,
                "sponsor_name": ad_request.campaign.sponsor.company_name
            })
        return jsonify({"flagged_ad_requests": flagged_data}), 200


    # Flag an ad request
    @app.route('/api/admin/ad_requests/<int:ad_request_id>/flag', methods=['POST'])
    @login_required
    def flag_ad_request(ad_request_id):
        if 'admin' not in [role.name for role in current_user.roles]:
            return jsonify({"error": "Unauthorized access"}), 403

        ad_request = AdRequest.query.get_or_404(ad_request_id)
        ad_request.flagged = True
        db.session.commit()
        return jsonify({"message": "Ad request flagged successfully"}), 200


    # Unflag an ad request
    @app.route('/api/admin/ad_requests/<int:ad_request_id>/unflag', methods=['POST'])
    @login_required
    def unflag_ad_request(ad_request_id):
        if 'admin' not in [role.name for role in current_user.roles]:
            return jsonify({"error": "Unauthorized access"}), 403

        ad_request = AdRequest.query.get_or_404(ad_request_id)
        ad_request.flagged = False
        db.session.commit()
        return jsonify({"message": "Ad request unflagged successfully"}), 200
    
    @app.route('/api/admin/sponsors/pending', methods=['GET'])
    @login_required
    def get_pending_sponsors():
        if 'admin' not in [role.name for role in current_user.roles]:
            return jsonify({"error": "Unauthorized access"}), 403

        sponsors = User.query.join(User.roles).filter(
            Role.name == "sponsor",
            User.status == "pending"
        ).all()

        sponsor_data = [{
            "id": sponsor.id,
            "company_name": sponsor.company_name,
            "email": sponsor.email,
            "industry": sponsor.industry,
            "budget": sponsor.budget,
            "status": sponsor.status
        } for sponsor in sponsors]

        return jsonify({"sponsors": sponsor_data}), 200
    
    @app.route('/api/admin/sponsors/<int:sponsor_id>/approve', methods=['POST'])
    @login_required
    def approve_sponsor(sponsor_id):
        if 'admin' not in [role.name for role in current_user.roles]:
            return jsonify({"error": "Unauthorized access"}), 403

        sponsor = User.query.get_or_404(sponsor_id)
        if sponsor.get_role() != "sponsor" or sponsor.status != "pending":
            return jsonify({"error": "Invalid sponsor or already approved"}), 400

        sponsor.status = "approved"
        db.session.commit()
        return jsonify({"message": "Sponsor approved successfully"}), 200
    
    @app.route('/api/admin/sponsors/<int:sponsor_id>', methods=['DELETE'])
    @login_required
    def delete_sponsor(sponsor_id):
        if 'admin' not in [role.name for role in current_user.roles]:
            return jsonify({"error": "Unauthorized access"}), 403

        sponsor = User.query.get_or_404(sponsor_id)
        if sponsor.get_role() != "sponsor":
            return jsonify({"error": "Invalid sponsor"}), 400

        db.session.delete(sponsor)
        db.session.commit()
        return jsonify({"message": "Sponsor deleted successfully"}), 200



    
    @app.route('/<path:path>')
    def catch_all(path):
        return render_template('index.html')

    @app.route('/api/auth_debug', methods=['GET'])
    def auth_debug():
        """Debug endpoint to verify user authentication status"""
        if current_user.is_authenticated:
            # Get the roles
            roles = [role.name for role in current_user.roles]
            
            return jsonify({
                "authenticated": True,
                "user_id": current_user.id,
                "email": current_user.email,
                "roles": roles,
                "session_info": {
                    "cookie_configured": app.config.get('SESSION_COOKIE_NAME') is not None
                }
            })
        else:
            return jsonify({
                "authenticated": False,
                "message": "User is not authenticated"
            })

    @app.route('/test_navbar')
    def test_navbar():
        """Test page for navbar functionality"""
        return render_template('test_navbar.html')
