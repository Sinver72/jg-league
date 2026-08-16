async function loadAllProfiles() {
    console.log("Fetching all users from local server…");

    const users = await fetch("http://localhost:3000/users").then(r => r.json());
    console.log("Total users found:", users.length);

    const batchSize = 50;     // 50 parallel requests at a time
    const profiles = [];

    for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);

        console.log(`Fetching batch ${i / batchSize + 1} (${batch.length} profiles)…`);

        const batchPromises = batch.map(user => {
            const url = `http://localhost:3000/profile/${user.profile_url}`;
            return fetch(url)
                .then(r => r.json())
                .catch(err => {
                    console.log("Failed to fetch profile for", user.callsign);
                    return null;
                });
        });

        const batchResults = await Promise.all(batchPromises);
        profiles.push(...batchResults.filter(p => p !== null));

        // Small pause to avoid overwhelming Chrome + Jumpgate
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log("All profiles fetched:", profiles.length);
    return profiles;
}

function buildLeague(profiles, field, title) {
    const sorted = profiles
        .filter(p => p[field] !== undefined)
        .sort((a, b) => Number(b[field]) - Number(a[field]))
        .slice(0, 200);

    let html = `<h2>${title}</h2>`;
    html += `<table class="league-table"><thead><tr><th>#</th><th>Callsign</th><th>${title}</th></tr></thead><tbody>`;

    sorted.forEach((p, i) => {
        html += `<tr>
            <td>${i + 1}</td>
            <td>${p.callsign}</td>
            <td>${p[field]}</td>
        </tr>`;
    });

    html += `</tbody></table>`;
    return html;
}
async function buildPage() {
    const container = document.getElementById("league");
    const loading = document.getElementById("loading");

    // Show loading message
    if (loading) {
        loading.textContent = "Fetching profiles… this may take a moment.";
    }

    const profiles = await loadAllProfiles();

    // Remove loading message
    if (loading) {
        loading.remove();
    }

    container.innerHTML =
        buildLeague(profiles, "conflux_kills", "Conflux Kills") +
        buildLeague(profiles, "missions_completed", "Missions Completed") +
        buildLeague(profiles, "pure_mined", "Pure Ore Mined") +
        buildLeague(profiles, "artyfacts_found", "Artifacts Found") +
        buildLeague(profiles, "beacon_captured", "Beacons Captured") +
        buildLeague(profiles, "experience", "Experience") +
        buildLeague(profiles, "credits", "Credits");
}
window.onload = buildPage;