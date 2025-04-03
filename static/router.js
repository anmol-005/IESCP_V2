import LandingPage from "./components/LandingPage.js"
import LoginComponent from "./components/LoginComponent.js"
import RegisterComponent from "./components/RegisterComponent.js"
import InfluencerDashboard from "./components/influencer/InfluencerDashboard.js"
import InfluencerProfile from "./components/influencer/InfluencerProfile.js" 
import CompletedAdRequests from "./components/influencer/CompletedAdRequests.js"
import SponsorDashboard from "./components/sponsor/SponsorDashboard.js"
import Profile from './components/sponsor/profile.js';
import ManageCampaigns from './components/sponsor/ManageCampaigns.js';
import ManageAdRequests from './components/sponsor/ManageAdRequests.js';
import CreatePrivateAdRequest from "./components/sponsor/CreatePrivateAdRequest.js"
import CreatePublicAdRequest from "./components/sponsor/CreatePublicAdRequest.js"
import UpdateCampaign from "./components/sponsor/UpdateCampaign.js"
import UpdateAdRequest from "./components/sponsor/UpdateAdRequest.js"
import SearchComponent from "./components/SearchComponent.js"
import view_ad_requests from "./components/influencer/view_ad_requests.js"
import logout from "./components/logout.js"
import AdminDashboard from "./components/admin/AdminDashboard.js"
import AdminAdRequests from "./components/admin/AdminAdRequests.js"
import AdminCampaigns from "./components/admin/AdminCampaigns.js"
import AdminUsers from "./components/admin/AdminUsers.js"

const router = new VueRouter({
  mode: 'history',
  routes: [
      { path: '/', component: LandingPage },
      { path: '/login', component: LoginComponent },
      { path: '/register', component: RegisterComponent },
      { path: '/influencer_dashboard', component: InfluencerDashboard },
      { path: '/influencer_profile', component: InfluencerProfile },
      { path: '/completed_ad_requests', component: CompletedAdRequests },
      { path: '/sponsor_dashboard', component: SponsorDashboard },
      { path: '/admin_dashboard', component: AdminDashboard },
      { path: '/admin_ad_requests', component: AdminAdRequests },
      { path: '/admin_campaigns', component: AdminCampaigns },
      { path: '/admin_users', component: AdminUsers },
      { path: '/sponsor_profile', component: Profile },
      { path: '/manage_campaigns', component: ManageCampaigns },
      { path: '/manage_ad_requests', component: ManageAdRequests },
      { path: '/logout', component: logout },
      { path: '/search', component: SearchComponent },
      {
        path: "/campaigns/:campaignId/ad_requests",
        name: "ViewAdRequests",
        component: view_ad_requests, 
      },
      { path: '/create_public_ad_request', component: CreatePublicAdRequest },
      { path: '/create_private_ad_request', component: CreatePrivateAdRequest },
      {path: "/update_campaign", name: "update_campaign", component: UpdateCampaign, props: true },
      { path: '/update_ad_request', name: 'UpdateAdRequest', component: UpdateAdRequest , props: true}
  ]
});

export default router;

