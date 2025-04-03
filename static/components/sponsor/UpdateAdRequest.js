export default {
    name: "UpdateAdRequest",
    props: ["adRequestId"],
    data() {
      return {
        adRequest: null,
        errorMessage: "",
        successMessage: "",
      };
    },
    mounted() {
      this.fetchAdRequest();
    },
    methods: {
      async fetchAdRequest() {
        try {
          const response = await fetch(`/api/ad_requests/${this.adRequestId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch ad request details");
          }
          this.adRequest = await response.json();
        } catch (error) {
          this.errorMessage = error.message;
        }
      },
      async updateAdRequest() {
        try {
          const response = await fetch(`/api/ad_requests/${this.adRequestId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(this.adRequest),
          });
  
          if (!response.ok) {
            throw new Error("Failed to update ad request");
          }
  
          this.successMessage = "Ad request updated successfully!";
          this.errorMessage = "";
        } catch (error) {
          this.errorMessage = error.message;
          this.successMessage = "";
        }
      },
    },
    template: `
      <div class="container">
        <h2>Update Ad Request</h2>
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
        <form v-if="adRequest" @submit.prevent="updateAdRequest">
          <div class="form-group">
            <label for="requirements">Requirements</label>
            <textarea v-model="adRequest.requirements" id="requirements" class="form-control" required></textarea>
          </div>
          <div class="form-group">
            <label for="paymentAmount">Payment Amount</label>
            <input v-model="adRequest.payment_amount" type="number" id="paymentAmount" class="form-control" required />
          </div>
          <div class="form-group">
            <label for="status">Status</label>
            <select v-model="adRequest.status" id="status" class="form-control">
              <option value="created">Created</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary mt-3">Update</button>
        </form>
      </div>
    `,
  };
  