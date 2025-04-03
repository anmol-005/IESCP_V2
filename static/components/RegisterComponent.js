export default {
    template: `
        <div class="container mt-5">
            <h2>User Registration</h2>
            <form @submit.prevent="submitRegistration">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" v-model="email" id="email" class="form-control" placeholder="Enter your email" required>
                </div>
                <div class="form-group mt-3">
                    <label for="password">Password:</label>
                    <input type="password" v-model="password" id="password" class="form-control" placeholder="Enter your password" required>
                </div>
                <div class="form-group mt-3">
                    <label for="role">Role:</label>
                    <select v-model="role" id="role" class="form-control" required>
                        <option value="" disabled>Select your role</option>
                        <option value="influencer">Influencer</option>
                        <option value="sponsor">Sponsor</option>
                    </select>
                </div>
                <div v-if="role === 'influencer'">
                    <div class="form-group mt-3">
                        <label for="name">Name:</label>
                        <input type="text" v-model="name" id="name" class="form-control" placeholder="Enter your name">
                    </div>
                    <div class="form-group mt-3">
                        <label for="category">Category:</label>
                        <input type="text" v-model="category" id="category" class="form-control" placeholder="Enter your category">
                    </div>
                    <div class="form-group mt-3">
                        <label for="niche">Niche:</label>
                        <input type="text" v-model="niche" id="niche" class="form-control" placeholder="Enter your niche">
                    </div>
                    <div class="form-group mt-3">
                        <label for="reach">Reach:</label>
                        <input type="number" v-model="reach" id="reach" class="form-control" placeholder="Enter your reach">
                    </div>
                </div>
                <div v-if="role === 'sponsor'">
                    <div class="form-group mt-3">
                        <label for="company_name">Company Name:</label>
                        <input type="text" v-model="company_name" id="company_name" class="form-control" placeholder="Enter your company name">
                    </div>
                    <div class="form-group mt-3">
                        <label for="industry">Industry:</label>
                        <input type="text" v-model="industry" id="industry" class="form-control" placeholder="Enter your industry">
                    </div>
                    <div class="form-group mt-3">
                        <label for="budget">Budget:</label>
                        <input type="number" v-model="budget" id="budget" class="form-control" placeholder="Enter your budget">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary mt-4">Register</button>
            </form>
        </div>
    `,
    data() {
        return {
            email: '',
            password: '',
            role: '',
            // Influencer-specific fields
            name: '',
            category: '',
            niche: '',
            reach: null,
            // Sponsor-specific fields
            company_name: '',
            industry: '',
            budget: null,
        };
    },
    methods: {
        submitRegistration() {
            const payload = {
                email: this.email,
                password: this.password,
                role: this.role,
            };

            if (this.role === 'influencer') {
                payload.name = this.name;
                payload.category = this.category;
                payload.niche = this.niche;
                payload.reach = this.reach;
            } else if (this.role === 'sponsor') {
                payload.company_name = this.company_name;
                payload.industry = this.industry;
                payload.budget = this.budget;
            }

            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert("User registered successfully!");
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }
};

