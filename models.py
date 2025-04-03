from extensions import db
from flask_security import UserMixin, RoleMixin
import uuid
from datetime import datetime, timedelta

class UserRoles(db.Model):
    __tablename__ = 'user_roles'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id', ondelete='CASCADE'))

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255))

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)  # Hashed password
    active = db.Column(db.Boolean, default=True)
    flagged = db.Column(db.Boolean, default=False)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))

    # Influencer-specific fields
    name = db.Column(db.String(100))
    category = db.Column(db.String(100))
    niche = db.Column(db.String(100))
    reach = db.Column(db.Integer)

    # Sponsor-specific fields
    company_name = db.Column(db.String(100))
    industry = db.Column(db.String(100))
    budget = db.Column(db.Float)
    status = db.Column(db.String(20), nullable=True, default=None)

    last_visited = db.Column(db.DateTime, nullable=True, default=None)

    # Updated relationship to expect a list of roles
    roles = db.relationship('Role', secondary='user_roles', backref=db.backref('users', lazy='dynamic'))

    def __init__(self, email, password, **kwargs):
        self.email = email
        self.password = password
        self.active = True
        self.flagged = kwargs.get('flagged', False)
        
        # Additional attributes for specific roles
        if 'status' in kwargs:
            self.status = kwargs.get('status')
        if 'name' in kwargs:
            self.name = kwargs.get('name')
        if 'category' in kwargs:
            self.category = kwargs.get('category')
        if 'niche' in kwargs:
            self.niche = kwargs.get('niche')
        if 'reach' in kwargs:
            self.reach = kwargs.get('reach')
        if 'company_name' in kwargs:
            self.company_name = kwargs.get('company_name')
        if 'industry' in kwargs:
            self.industry = kwargs.get('industry')
        if 'budget' in kwargs:
            self.budget = kwargs.get('budget')

    def get_role(self):
        if self.roles:
            return self.roles[0].name  
        return None

class Campaign(db.Model):
    __tablename__ = 'campaigns'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    budget = db.Column(db.Float)
    visibility = db.Column(db.String(50), nullable=False)  # e.g., 'public', 'private'
    goals = db.Column(db.Text)
    sponsor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    niche = db.Column(db.String(50), nullable=False)
    flagged = db.Column(db.Boolean, default=False)

    sponsor = db.relationship('User', backref=db.backref('campaigns', lazy=True))

class AdRequest(db.Model):
    __tablename__ = 'ad_requests'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    influencer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    requirements = db.Column(db.Text)
    payment_amount = db.Column(db.Float)
    status = db.Column(db.String(50), nullable=False, default='pending')  # e.g., 'pending', 'approved', 'rejected'
    verification_link = db.Column(db.String(100), nullable=True)

    campaign = db.relationship('Campaign', backref=db.backref('ad_requests', lazy=True))
    influencer = db.relationship('User', backref=db.backref('ad_requests', lazy=True))

def get_influencers_with_pending_requests():
    yesterday = datetime.now() - timedelta(days=1)

    # Example query for influencers with pending ad requests
    influencers = User.query.filter(
        User.last_visited < yesterday,  # Hasn't visited recently
        User.ad_requests.any(AdRequest.status == 'pending')  # Pending ad requests
    ).all()

    return influencers

