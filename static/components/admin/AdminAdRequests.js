export default {
    name: "AdminAdRequests",
    template: `
      <div class="admin-ad-requests">
        <main class="container">
          <h1>Ad Requests</h1>
  
          <!-- Ad Requests Table -->
          <div class="ad-requests-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Payment Amount</th>
                  <th>Campaign Name</th>
                  <th>Sponsor Name</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="adRequest in adRequests" :key="adRequest.id">
                  <td>{{ adRequest.id }}</td>
                  <td>{{ adRequest.status }}</td>
                  <td>{{ adRequest.payment_amount }}</td>
                  <td>{{ adRequest.campaign_name }}</td>
                  <td>{{ adRequest.sponsor_name }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    `,
    data() {
      return {
        adRequests: [],
      };
    },
    methods: {
      async fetchAdRequests() {
        try {
          const response = await fetch("/api/admin/ad_requests");
          const data = await response.json();
  
          if (response.ok) {
            this.adRequests = data.ad_requests || [];
          } else {
            console.error("Error fetching ad requests:", data.error);
          }
        } catch (error) {
          console.error("Error fetching ad requests:", error);
        }
      },
    },
    mounted() {
      this.fetchAdRequests();
    },
  };
  