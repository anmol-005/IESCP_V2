export default {
    template: `
      <div>
        <h1>Completed Ad Requests</h1>
        <table v-if="adRequests.length" class="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Campaign Name</th>
              <th>Payment Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="adRequest in adRequests" :key="adRequest.id">
              <td>{{ adRequest.id }}</td>
              <td>{{ adRequest.campaign_name }}</td>
              <td>{{ adRequest.payment_amount }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>No completed ad requests found.</p>
      </div>
    `,
    data() {
      return {
        adRequests: [],
      };
    },
    created() {
      fetch('/api/completed_ad_requests')
        .then((response) => response.json())
        .then((data) => {
          this.adRequests = data;
        })
        .catch((error) => console.error("Error fetching completed ad requests:", error));
    },
  };
  