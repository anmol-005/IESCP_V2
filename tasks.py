import os
from flask import render_template
from flask_mail import Message
from models import get_influencers_with_pending_requests , User, Campaign , AdRequest 
from celery.schedules import crontab
from celery import shared_task
import csv
from flask import request

@shared_task(name="send_daily_reminders")
def send_daily_reminders():
    from app import app, mail
    with app.app_context():
        influencers = get_influencers_with_pending_requests()
        print("Influencers fetched:", influencers)
        for influencer in influencers:
            print(f"Sending email to {influencer.email}")
            msg = Message(
                subject="Daily Reminder: Pending Ad Requests",
                recipients=[influencer.email],
                body=f"""
                Hi {influencer.name},

You have pending ad requests that require your attention on our platform. 
Please log in to accept or check out public ad requests available for you.

Best regards,
Your App Team
                """
                            )
            mail.send(msg)
    print("Task executed successfully.")


@shared_task(name="export_campaigns_to_csv")
def export_campaigns_to_csv(sponsor_id):
    from app import app
    """Export campaigns created by a sponsor to a CSV file."""
    from app import db  
    
    with app.app_context():
        # Query campaigns for the sponsor
        campaigns = Campaign.query.filter_by(sponsor_id=sponsor_id).all()
        
        # Prepare data for CSV
        csv_data = [
            {
                "campaign_id": c.id,
                "description": c.description,
                "start_date": c.start_date,
                "end_date": c.end_date,
                "budget": c.budget,
                "visibility": c.visibility,
                "goals": c.goals,
                "niche": c.niche,
                "flagged": c.flagged,
            }
            for c in campaigns
        ]

        output_dir = os.path.join(app.root_path, "exports")
        os.makedirs(output_dir, exist_ok=True)
        filename = f"sponsor_{sponsor_id}_campaigns.csv"
        file_path = os.path.join(output_dir, filename)

        # Write CSV
        with open(file_path, mode='w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=csv_data[0].keys())
            writer.writeheader()
            writer.writerows(csv_data)

        return filename


@shared_task(name="send_monthly_report")
def send_monthly_report():
    from app import mail , db
    # Fetch all sponsors
    sponsors = User.query.filter(User.roles.any(name="sponsor")).all()

    for sponsor in sponsors:
        # Fetch sponsor-specific campaign data
        campaigns = Campaign.query.filter(Campaign.sponsor_id == sponsor.id).all()
        total_ads = (
            db.session.query(AdRequest)
            .join(Campaign, Campaign.id == AdRequest.campaign_id)
            .filter(Campaign.sponsor_id == sponsor.id, AdRequest.status == "completed")
            .count()
        )
        budget_used = sum(campaign.budget for campaign in campaigns)
        # budget_remaining = sum(campaign.remaining_budget for campaign in campaigns)
        # sales_growth = calculate_sales_growth(sponsor.id)  # Custom function
        
        # Prepare data for the report
        report_data = {
            "sponsor_name": sponsor.name,
            "total_ads": total_ads,
            "budget_used": budget_used,
            # "budget_remaining": budget_remaining,
            "campaigns": campaigns,
        }
        
        # Render the report HTML
        html_report = render_template("monthly_report.html", **report_data)

        # Send the email
        msg = Message(
            subject="Monthly Activity Report",
            recipients=[sponsor.email],
        )
        msg.html = html_report
        mail.send(msg)

from celery_factory import celery_init_app
from app import app
celery_app = celery_init_app(app)

celery_app.conf.beat_schedule = {
    
    "send_daily_reminders": {
        "task": "send_daily_reminders",
        "schedule": crontab(hour=16, minute=49),  
    },
    
    "send_monthly_report": {
        "task": "send_monthly_report",
        "schedule": crontab(day_of_month=24, hour=16, minute=49), 
    },
}

