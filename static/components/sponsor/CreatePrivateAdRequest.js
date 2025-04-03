export default {
  name: "CreatePrivateAdRequest",
  data() {
    return {
      campaignId: null,
      influencerId: null,
      requirements: "",
      paymentAmount: 0,
      privateCampaigns: [], // Stores private campaigns (active) by the user
      influencers: [], // Stores the list of influencers
      errorMessage: "",
      successMessage: "",
    };
  },
  created() {
    // Fetch campaigns and influencers when the component is created
    this.fetchPrivateCampaigns();
    this.fetchInfluencers();
  },
  methods: {
    // Fetch active private campaigns for the logged-in user
    async fetchPrivateCampaigns() {
      try {
        const response = await fetch("/api/private_campaigns");
        if (!response.ok) {
          throw new Error("Failed to fetch private campaigns.");
        }
        const data = await response.json();
        this.privateCampaigns = data.campaigns || [];
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    // Fetch all influencers
    async fetchInfluencers() {
      try {
        const response = await fetch("/api/influencers");
        if (!response.ok) {
          throw new Error("Failed to fetch influencers.");
        }
        const data = await response.json();
        this.influencers = data.influencers || [];
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    // Submit private ad request
    async submitRequest() {
      try {
        const response = await fetch("/api/private_ad_requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            campaign_id: this.campaignId,
            influencer_id: this.influencerId,
            requirements: this.requirements,
            payment_amount: this.paymentAmount,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to create private ad request.");
        }
        const data = await response.json();
        this.successMessage = "Private ad request created successfully!";
        this.errorMessage = ""; // Clear any previous errors
      } catch (error) {
        this.successMessage = ""; // Clear any previous success messages
        this.errorMessage = error.message;
      }
    },
  },
  template: `
    <div class="container">
      <h2>Create Private Ad Request</h2>
      <form @submit.prevent="submitRequest">
        <div class="form-group">
          <label for="campaignId">Select Campaign (Active Private Campaigns Only)</label>
          <select v-model="campaignId" id="campaignId" class="form-control" required>
            <option value="" disabled>Select a campaign</option>
            <option v-for="campaign in privateCampaigns" :key="campaign.id" :value="campaign.id">
              {{ campaign.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="influencerId">Select Influencer</label>
          <select v-model="influencerId" id="influencerId" class="form-control" required>
            <option value="" disabled>Select an influencer</option>
            <option v-for="influencer in influencers" :key="influencer.id" :value="influencer.id">
              {{ influencer.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="requirements">Requirements</label>
          <textarea v-model="requirements" id="requirements" class="form-control" required></textarea>
        </div>
        
        <div class="form-group">
          <label for="paymentAmount">Payment Amount</label>
          <input v-model="paymentAmount" type="number" id="paymentAmount" class="form-control" required />
        </div>
        
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
      
      <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
    </div>
  `,
};
