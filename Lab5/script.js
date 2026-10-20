const data = [
	{ name: "Joel Embiid", team: "Philadelphia 76ers (PHI)", points: 33, rebounds: 10.8, assists: 5.7 },
	{ name: "Jalen Brunson", team: "New York Knicks (NYK)", points: 32.4, rebounds: 3.3, assists: 7.5 },
	{ name: "Shai Gilgeous-Alexander", team: "Oklahoma City Thunder (OKC)", points: 30.2, rebounds: 7.2, assists: 6.4 },
	{ name: "Tyrese Maxey", team: "Philadelphia 76ers (PHI)", points: 29.8, rebounds: 5.2, assists: 6.8 },
	{ name: "Donovan Mitchell", team: "Cleveland Cavaliers (CAVS)", points: 29.6, rebounds: 5.4, assists: 4.7 },
	{ name: "Luka Doncic", team: "Dallas Mavericks (DAL)", points: 28.9, rebounds: 9.5, assists: 8.1 },
	{ name: "Nikola Jokic", team: "Denver Nuggets (DEN)", points: 28.7, rebounds: 13.4, assists: 8.7 },
	{ name: "Anthony Davis", team: "Los Angeles Lakers (LAL)", points: 27.8, rebounds: 15.6, assists: 4 },
	{ name: "LeBron James", team: "Los Angeles Lakers (LAL)", points: 27.8, rebounds: 6.8, assists: 8.8 },
	{ name: "Anthony Edwards", team: "Minnesota Timberwolves (MIN)", points: 27.6, rebounds: 7, assists: 6.5 },
	{ name: "Devin Booker", team: "Phoenix Suns (PHX)", points: 27.5, rebounds: 3.3, assists: 6 },
	{ name: "Paolo Banchero", team: "Orlando Magic (ORL)", points: 27, rebounds: 8.6, assists: 4 },
	{ name: "Kevin Durant", team: "Phoenix Suns (PHX)", points: 26.8, rebounds: 6.5, assists: 3.3 },
	{ name: "Jayson Tatum", team: "Boston Celtics (BOS)", points: 25, rebounds: 9.7, assists: 6.3 },
	{ name: "Khris Middleton", team: "Milwaukee Bucks (MIL)", points: 24.7, rebounds: 9.2, assists: 4.7 },
	{ name: "Jaylen Brown", team: "Boston Celtics (BOS)", points: 23.9, rebounds: 5.9, assists: 3.3 },
	{ name: "Bam Adebayo", team: "Miami Heat (MIA)", points: 22.6, rebounds: 9.4, assists: 3.8 },
	{ name: "Kyrie Irving", team: "Dallas Mavericks (DAL)", points: 22.1, rebounds: 3.7, assists: 5.1 },
	{ name: "Pascal Siakam", team: "Indiana Pacers (IND)", points: 21.6, rebounds: 7.5, assists: 3.8 },
	{ name: "James Harden", team: "Los Angeles Clippers (LAC)", points: 21.2, rebounds: 4.5, assists: 8 }
];

const searchInput = document.querySelector("#search");
const teamFilter = document.querySelector("#team-filter");
const playerRows = document.querySelector("#player-rows");
const resultCount = document.querySelector("#result-count");
const darkModeToggle = document.querySelector("#dark-mode-toggle");
const headers = document.querySelectorAll("th[data-sort]");

let sortKey = "points";
let sortDirection = "descending";

function populateTeams() {
	[...new Set(data.map((player) => player.team))].sort().forEach((team) => {
		const option = document.createElement("option");
		option.value = team;
		option.textContent = team;
		teamFilter.append(option);
	});
}

function getVisiblePlayers() {
	const searchTerm = searchInput.value.trim().toLowerCase();
	const selectedTeam = teamFilter.value;

	return data
		.filter((player) => {
			const matchesSearch = `${player.name} ${player.team}`.toLowerCase().includes(searchTerm);
			return matchesSearch && (selectedTeam === "all" || player.team === selectedTeam);
		})
		.sort((firstPlayer, secondPlayer) => {
			const firstValue = firstPlayer[sortKey];
			const secondValue = secondPlayer[sortKey];
			const comparison = typeof firstValue === "number"
				? firstValue - secondValue
				: firstValue.localeCompare(secondValue);
			return sortDirection === "ascending" ? comparison : -comparison;
		});
}

function renderTable() {
	const visiblePlayers = getVisiblePlayers();
	playerRows.replaceChildren();

	visiblePlayers.forEach((player) => {
		const row = document.createElement("tr");
		["name", "team", "points", "rebounds", "assists"].forEach((key) => {
			const cell = document.createElement("td");
			cell.textContent = player[key];
			row.append(cell);
		});
		playerRows.append(row);
	});

	resultCount.textContent = `${visiblePlayers.length} of ${data.length} players`;
}

function sortTable(event) {
	const newKey = event.currentTarget.dataset.sort;
	if (sortKey === newKey) {
		sortDirection = sortDirection === "ascending" ? "descending" : "ascending";
	} else {
		sortKey = newKey;
		sortDirection = newKey === "name" || newKey === "team" ? "ascending" : "descending";
	}
	renderTable();
}

searchInput.addEventListener("input", renderTable);
teamFilter.addEventListener("change", renderTable);
darkModeToggle.addEventListener("click", () => {
	document.body.classList.toggle("dark-mode");
	darkModeToggle.textContent = document.body.classList.contains("dark-mode") ? "Light mode" : "Dark mode";
});
headers.forEach((header) => header.addEventListener("click", sortTable));
playerRows.addEventListener("mouseover", (event) => {
	const row = event.target.closest("tr");
	if (row) row.classList.add("is-highlighted");
});
playerRows.addEventListener("mouseout", (event) => {
	const row = event.target.closest("tr");
	if (row) row.classList.remove("is-highlighted");
});

populateTeams();
renderTable();
