document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function createActivityCard(name, activity) {
    const card = document.createElement("div");
    card.className = "activity-card";

    const title = document.createElement("h4");
    title.textContent = name;
    card.appendChild(title);

    const desc = document.createElement("p");
    desc.textContent = activity.description;
    card.appendChild(desc);

    const schedule = document.createElement("p");
    schedule.innerHTML = `<strong>Schedule:</strong> ${activity.schedule}`;
    card.appendChild(schedule);

    const spots = document.createElement("p");
    spots.innerHTML = `<strong>Spots:</strong> ${activity.participants.length} / ${activity.max_participants}`;
    card.appendChild(spots);

    const participantsSection = document.createElement("div");
    participantsSection.className = "participants-section";

    const participantsTitle = document.createElement("h5");
    participantsTitle.textContent = "Participants:";
    participantsSection.appendChild(participantsTitle);

    const participantsList = document.createElement("ul");
    participantsList.className = "participants-list";

    if (activity.participants.length === 0) {
      const empty = document.createElement("li");
      empty.textContent = "No participants yet";
      empty.style.fontStyle = "italic";
      participantsList.appendChild(empty);
    } else {
      activity.participants.forEach((email) => {
        const li = document.createElement("li");
        const span = document.createElement("span");
        span.textContent = email;
        li.appendChild(span);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-participant-btn";
        deleteBtn.title = "Удалить участника";
        deleteBtn.innerHTML = "&#128465;";
        deleteBtn.onclick = async (e) => {
          e.stopPropagation();
          if (confirm(`Удалить участника ${email}?`)) {
            try {
              const response = await fetch(`/activities/${encodeURIComponent(name)}/participants/${encodeURIComponent(email)}`, {
                method: "DELETE",
              });
              const result = await response.json();
              if (response.ok) {
                fetchActivities();
              } else {
                alert(result.detail || "Ошибка при удалении участника");
              }
            } catch (error) {
              alert("Ошибка при удалении участника");
            }
          }
        };
        li.appendChild(deleteBtn);
        participantsList.appendChild(li);
      });
    }

    participantsSection.appendChild(participantsList);
    card.appendChild(participantsSection);

    return card;
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      // Clear activity select options except the first
      while (activitySelect.options.length > 1) {
        activitySelect.remove(1);
      }

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = createActivityCard(name, details);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); 
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
