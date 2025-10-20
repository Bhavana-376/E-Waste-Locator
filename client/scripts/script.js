// Smooth scroll for nav links
document.querySelectorAll('.navbar a').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const section = document.querySelector(this.getAttribute('href'));
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  });
});

// Signup form submission
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = {
      name: this.querySelector('input[placeholder="Name"]').value.trim(),
      email: this.querySelector('input[placeholder="Email"]').value.trim(),
      phone: this.querySelector('input[placeholder="Phone Number"]').value.trim(),
      password: this.querySelector('input[placeholder="Password"]').value.trim(),
      confirmPassword: this.querySelector('input[placeholder="Confirm Password"]').value.trim(),
    };

    if (formData.password !== formData.confirmPassword) {
      return alert("Passwords do not match.");
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Signup successful! Please login.");
        this.reset();
        window.location.hash = '#login';
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      alert("Server error during signup");
    }
  });
}

// Login form submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const credentials = {
      email: this.querySelector('input[placeholder="Email"]').value.trim(),
      password: this.querySelector('input[placeholder="Password"]').value.trim(),
    };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token); // ✅ Set token
          alert("Login successful!");
          window.location.href = '/dashboard.html';
        } else {
          alert("Token missing in response. Cannot continue.");
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert("Server error during login");
    }
  });
}
//dashboard logic
document.addEventListener("DOMContentLoaded", function () {
  // Only run on dashboard.html
  if (window.location.pathname.includes("dashboard.html")) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to view this page.");
      window.location.href = "index.html";
      return;
    }

    // ✅ Fetch user and populate profile dropdown
    fetch("/api/user/dashboard", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        const user = data.user;
        const dropdown = document.getElementById("profileDropdown");

    if (dropdown) {
        dropdown.innerHTML = `
            <div id="profileView">
                <p><strong>Name:</strong> <span id="viewName">${user.name}</span></p>
                <p><strong>Email:</strong> <span id="viewEmail">${user.email}</span></p>
                <p><strong>Phone:</strong> <span id="viewPhone">${user.phone || ''}</span></p>
                <p><strong>Address:</strong> <span id="viewAddress">${user.address || ''}</span></p>
                <button class="edit-btn" onclick="editProfile()">Edit Profile</button>
                <button onclick="logout()" class="logout-btn">Logout</button>
            </div>

            <div id="profileEdit" style="display: none;">
                <p><strong>Name:</strong> <input type="text" id="editName" value="${user.name}" /></p>
                <p><strong>Email:</strong> <input type="email" id="editEmail" value="${user.email}" /></p>
                <p><strong>Phone:</strong> <input type="text" id="editPhone" value="${user.phone || ''}" /></p>
                <p><strong>Address:</strong> <input type="text" id="editAddress" value="${user.address || ''}" /></p>
                <button onclick="saveProfile()" class="save-btn">Save</button>
                <button onclick="cancelEdit()" class="cancel-btn">Cancel</button>
            </div>
        `;
    }

        const creditEl = document.getElementById("creditPoints");
        if (creditEl) creditEl.textContent = user.credits || 0;
      })
      .catch(err => {
        alert("Session expired or invalid token");
        localStorage.removeItem("token");
        window.location.href = "index.html";
      });

    // Save profile
    window.saveProfile = function () {
  const token = localStorage.getItem("token");
  const name = document.getElementById("editName").value;
  const email = document.getElementById("editEmail").value;
  const phone = document.getElementById("editPhone").value;
  const address = document.getElementById("editAddress").value;

  fetch("/api/user/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({ name, email, phone, address })
  })
    .then(res => res.json())
    .then(data => {
      alert("Profile updated successfully!");

      // ✅ Update view mode
      document.getElementById("viewName").textContent = name;
      document.getElementById("viewEmail").textContent = email;
      document.getElementById("viewPhone").textContent = phone;
      document.getElementById("viewAddress").textContent = address;

      // ✅ Switch back to view mode
      document.getElementById("profileEdit").style.display = "none";
      document.getElementById("profileView").style.display = "block";

      // ✅ Optionally close dropdown after save
      document.querySelector(".dropdown-content").style.display = "none";
    })
    .catch(err => {
      console.error("Profile update error:", err);
      alert("Failed to update profile.");
    });
};

    //edit and cancel
    window.editProfile = function () {
        document.getElementById("profileView").style.display = "none";
        document.getElementById("profileEdit").style.display = "block";
    };

    window.cancelEdit = function () {
        document.getElementById("profileView").style.display = "block";
        document.getElementById("profileEdit").style.display = "none";
    };

    // Logout
    window.logout = function () {
      localStorage.removeItem("token");
      window.location.href = "/login.html";
    };

    // Toggle dropdown
    window.toggleDropdown = function () {
      const dropdown = document.getElementById("profileDropdown");
      if (dropdown) {
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
      }
    };

    // Hide dropdown when clicking outside
    document.addEventListener("click", function (event) {
      const icon = document.querySelector(".profile-icon");
      const dropdown = document.getElementById("profileDropdown");

      if (
        dropdown &&
        !dropdown.contains(event.target) &&
        !icon.contains(event.target)
      ) {
        dropdown.style.display = "none";
      }
    });
  }
});

//earn credit
function showCreditForm() {
  document.getElementById("creditFormSection").style.display = "block";
  document.querySelector(".hero").style.display = "none";
}

function cancelCreditForm() {
  document.getElementById("creditFormSection").style.display = "none";
  document.querySelector(".hero").style.display = "block";
}

