export default {
  template: `
    <div class="container py-4">
      <h1 class="text-center mb-4">{{ campaignDetails.name }}</h1>
      <p><strong>Description:</strong> {{ campaignDetails.description }}</p>
      <p><strong>Budget:</strong> {{ campaignDetails.budget }}</p>
      <p><strong>Deadline:</strong> {{ campaignDetails.end_date }}</p>

      <h3 class="mt-4">Ad Requests</h3>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Status</th>
            <th>Requirements</th>
            <th>Payment Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="adRequest in adRequests" :key="adRequest.ad_request_id">
            <td>{{ adRequest.status }}</td>
            <td>{{ adRequest.requirements }}</td>
            <td>{{ adRequest.payment_amount }}</td>
            <td>
              <button
                :disabled="hasRequested || adRequest.status !== 'created'"
                @click="sendAdRequest(adRequest)"
                class="btn btn-primary btn-sm"
              >
                Send Ad Request
              </button>
              <span v-if="hasRequested" class="text-danger">You cannot send a new request.</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  data() {
    return {
      campaignDetails: {}, // Stores campaign details
      adRequests: [], // Stores all ad requests for the campaign
      hasRequested: false, // Tracks whether the influencer has already sent a request for this campaign
    };
  },
  async created() {
    const campaignId = this.$route.params.campaignId; // Campaign ID from route params
    await this.fetchCampaignDetails(campaignId);
    await this.fetchAdRequests(campaignId);
  },
  methods: {
    async fetchCampaignDetails(campaignId) {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`);
        if (response.ok) {
          const data = await response.json();
          this.campaignDetails = data;
        } else {
          console.error("Error fetching campaign details:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching campaign details:", error);
      }
    },
    async fetchAdRequests(campaignId) {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/ad_requests`);
        if (response.ok) {
          const data = await response.json();
          // Deduplicate ad requests
          this.adRequests = data.ad_requests.filter(
            (value, index, self) =>
              index === self.findIndex((t) => t.ad_request_id === value.ad_request_id)
          );
          this.hasRequested = data.has_requested; // Backend indicates if influencer already made a request
        } else {
          console.error("Error fetching ad requests:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching ad requests:", error);
      }
    }
    ,
    async sendAdRequest(adRequest) {
      // Prevent sending request if already done
      if (this.hasRequested) {
        alert("You have already sent a request for this campaign.");
        return;
      }

      const campaignId = this.$route.params.campaignId;
      try {
        const response = await fetch("/api/view_and_send_ad_request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaign_id: campaignId,
            requirements: adRequest.requirements,
            payment_amount: adRequest.payment_amount,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          alert(data.message); // Show success message
          this.hasRequested = true; // Prevent further requests
          await this.fetchAdRequests(campaignId); // Refresh ad requests
        } else {
          console.error("Error sending ad request:", response.statusText);
        }
      } catch (error) {
        console.error("Error sending ad request:", error);
      }
    },
  },
};
