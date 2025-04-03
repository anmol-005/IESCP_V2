export default {
  template: `
    <div class="container">
      <h1>Welcome {{ userName }}</h1>

      <!-- Active Ad Requests -->
      <section>
        <h2>Active Ad Requests</h2>
        <table class="table table-striped" v-if="dashboardData.active_ad_requests.length">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Requirements</th>
              <th>Payment Amount</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Verification</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ad in dashboardData.active_ad_requests" :key="ad.ad_request_id">
              <td>{{ ad.campaign_name }}</td>
              <td>{{ ad.requirements }}</td>
              <td>{{ ad.payment_amount }}</td>
              <td>{{ ad.deadline }}</td>
              <td>{{ ad.status }}</td>
              <td>
                <template v-if="ad.status === 'active' || ad.status === 'finished'">
                  <template v-if="ad.status === 'active' && !ad.verification_link">
                    <!-- Input field to submit verification link -->
                    <input type="text" v-model="verificationLinks[ad.ad_request_id]" placeholder="Enter verification link" />
                    <button @click="submitVerification(ad.ad_request_id)" class="btn btn-primary btn-sm">Submit</button>
                  </template>
                  <template v-else-if="ad.status === 'active' && ad.verification_link">
                    <!-- Link submitted -->
                    <p>Link submitted: {{ ad.verification_link }}</p>
                    <button disabled class="btn btn-secondary btn-sm">Awaiting Completion</button>
                  </template>
                  <template v-else-if="ad.status === 'finished'">
                    <!-- Option to mark complete -->
                    <p>Ad request finished: {{ ad.verification_link }}</p>
                    <button @click="markComplete(ad.ad_request_id)" class="btn btn-success btn-sm">Mark Complete</button>
                  </template>
                </template>

              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>No active ad requests.</p>
      </section>

      <!-- Sent Ad Requests -->
      <section>
        <h2>Sent Ad Requests (Public Campaigns)</h2>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Payment Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ad in dashboardData.sent_ad_requests" :key="ad.ad_request_id">
              <td>{{ ad.campaign_name }}</td>
              <td>{{ ad.payment_amount }}</td>
              <td>{{ ad.status }}</td>
              <td>
                <template v-if="ad.status === 'pending'">
                  <button @click="cancelAdRequest(ad.ad_request_id)" class="btn btn-danger btn-sm">Cancel</button>
                </template>
                <template v-else>
                  <span>{{ ad.status }}</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Received Ad Requests -->
      <section>
        <h2>Received Ad Requests (Private Campaigns)</h2>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Payment Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ad in dashboardData.received_ad_requests" :key="ad.ad_request_id">
              <td>{{ ad.campaign_name }}</td>
              <td>{{ ad.payment_amount }}</td>
              <td>{{ ad.status }}</td>
              <td>
                <template v-if="ad.status === 'pending'">
                  <button @click="acceptAdRequest(ad.ad_request_id)" class="btn btn-success btn-sm">Accept</button>
                  <button @click="rejectAdRequest(ad.ad_request_id)" class="btn btn-danger btn-sm">Reject</button>
                </template>
                <template v-else>
                  <span>{{ ad.status }}</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  `,
  data() {
    return {
      dashboardData: {
        active_ad_requests: [],
        sent_ad_requests: [],
        received_ad_requests: [],
      },
      verificationLinks: {}, // Local state for input fields
      userName: "",
    };
  },
  async created() {
    this.fetchDashboardData();
  },
  methods: {
    async fetchDashboardData() {
      try {
        const response = await fetch("/api/influencer_dashboard");
        const data = await response.json();
        this.dashboardData = data;
        this.userName = data.name;
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    },
    async submitVerification(adRequestId) {
      const link = this.verificationLinks[adRequestId];
      const response = await fetch(`/api/ad_requests/${adRequestId}/submit_verification_link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verification_link: link }),
      });
      if (response.ok) {
        await this.fetchDashboardData();
      }
    },
    async markComplete(adRequestId) {
      await fetch(`/api/ad_requests/${adRequestId}/mark_complete`, { method: "POST" });
      await this.fetchDashboardData();
    },
    async cancelAdRequest(adRequestId) {
      const response = await fetch(`/api/cancel_ad_requests/${adRequestId}`, { method: "POST" });
      if (response.ok) {
        await this.fetchDashboardData();
      }
    },
    async acceptAdRequest(adRequestId) {
      try {
        const response = await fetch(`/api/ad_requests/${adRequestId}/accept`, { method: "POST" });
        if (response.ok) {
          // Remove the request from received_ad_requests
          this.dashboardData.received_ad_requests = this.dashboardData.received_ad_requests.filter(
            ad => ad.ad_request_id !== adRequestId
          );
          await this.fetchDashboardData(); // Optional: Refresh to ensure consistency
        } else {
          console.error("Error accepting ad request:", await response.json());
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
    async rejectAdRequest(adRequestId) {
      try {
        const response = await fetch(`/api/ad_requests/${adRequestId}/reject`, { method: "POST" });
        if (response.ok) {
          // Remove the request from received_ad_requests
          this.dashboardData.received_ad_requests = this.dashboardData.received_ad_requests.filter(
            ad => ad.ad_request_id !== adRequestId
          );
          await this.fetchDashboardData(); // Optional: Refresh to ensure consistency
        } else {
          console.error("Error rejecting ad request:", await response.json());
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
  },
};
