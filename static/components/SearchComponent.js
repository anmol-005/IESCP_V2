export default {
    template: `
      <div>
        <navbar></navbar>
        <div class="container mt-4">
          <h1>Search</h1>
          <!-- Search Type Selection -->
          <div class="form-group">
            <label for="searchType">Search Type:</label>
            <select v-model="searchType" id="searchType" class="form-control">
              <option value="search_influencers">Influencers</option>
              <option value="search_campaigns">Campaigns</option>
            </select>
          </div>
  
          <!-- Filters Section -->
          <div class="form-group mt-3">
            <div v-if="searchType === 'search_influencers'">
              <label for="name">Name:</label>
              <input v-model="filters.name" id="name" class="form-control" />

              <label for="category">Category:</label>
              <input v-model="filters.category" id="niche" class="form-control" />

              <label for="niche">Niche:</label>
              <input v-model="filters.niche" id="niche" class="form-control" />
  
              <label for="minFollowers" class="mt-2">Min Followers:</label>
              <input v-model.number="filters.min_followers" id="minFollowers" class="form-control" type="number" />
            </div>
  
            <div v-else-if="searchType === 'search_campaigns'">
              <label for="niche">Niche:</label>
              <input v-model="filters.niche" id="niche" class="form-control" placeholder="e.g., tech, fitness" />
  
              <label for="minBudget" class="mt-2">Min Budget:</label>
              <input v-model.number="filters.min_budget" id="minBudget" class="form-control" type="number" />
  
              <label for="maxBudget" class="mt-2">Max Budget:</label>
              <input v-model.number="filters.max_budget" id="maxBudget" class="form-control" type="number" />
  
              <label for="start_date" class="mt-2">Start Date:</label>
              <input v-model="filters.start_date" id="start_date" class="form-control" type="date" />

              <label for="end_date" class="mt-2">End Date:</label>
              <input v-model="filters.end_date" id="end_date" class="form-control" type="date" />

            </div>
          </div>
  
          <!-- Search Button -->
          <button @click="search" class="btn btn-primary mt-3">Search</button>
  
          <!-- Results Section -->
          <div v-if="results.length" class="mt-4">
            <h2>Results:</h2>
            <table v-if="searchType === 'search_influencers'" class="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Niche</th>
                  <th>Reach</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="influencer in results" :key="influencer.id">
                  <td>{{ influencer.name }}</td>
                  <td>{{ influencer.niche }}</td>
                  <td>{{ influencer.reach }}</td>
                </tr>
              </tbody>
            </table>
  
            <table v-else-if="searchType === 'search_campaigns'" class="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Budget</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Niche</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="campaign in results" :key="campaign.id">
                  <td>{{ campaign.name }}</td>
                  <td>{{ campaign.description }}</td>
                  <td>{{ campaign.budget }}</td>
                  <td>{{ campaign.start_date }}</td>
                  <td>{{ campaign.end_date }}</td>
                  <td>{{ campaign.niche }}</td>
                  <td>
                    <button
                        v-if="campaign.can_send_request"
                        @click="viewAdRequests(campaign.id)"
                        class="btn btn-secondary btn-sm">
                        View Ad Requests
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="mt-4">No results found.</p>
        </div>
      </div>
    `,
    data() {
      return {
        searchType: "search_influencers", // Default search type
        filters: {
          niche: "",
          min_followers: 0,
          max_followers: null,
          reach: "",
          min_budget: 0,
          max_budget: null,
          relevance: "",
        },
        results: [],
      };
    },
    methods: {
      search() {
        // Construct query string
        const queryParams = new URLSearchParams(this.filters).toString();
        const url = `/api/${this.searchType}?${queryParams}`;
  
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            this.results = data;
          })
          .catch((error) => {
            console.error("Error searching:", error);
            alert("An error occurred during the search.");
          });
      },
      viewAdRequests(campaignId) {
        // Redirect to a dedicated page or open a modal to show ad requests for this campaign
        this.$router.push(`/campaigns/${campaignId}/ad_requests`);
      },
    },
  };
  