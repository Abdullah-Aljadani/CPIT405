const API_URL = "https://api.unsplash.com/search/photos";
const ACCESS_KEY = "LKyBQSzX3Fba7X9ceOttBx_kuY18dJn8pItqQKvKMXs";
const searchForm = document.querySelector("#search-form");
const queryInput = document.querySelector("#query");
const statusMessage = document.querySelector("#status");
const resultCount = document.querySelector("#result-count");
const photoGrid = document.querySelector("#photo-grid");
const emptyMessage = document.querySelector("#empty-message");

function getRequestUrl(query) {
	const params = new URLSearchParams({ query, per_page: "12" });
	return `${API_URL}?${params}`;
}

function requestWithXHR(url, accessKey) {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open("GET", url);
		request.setRequestHeader("Authorization", `Client-ID ${accessKey}`);
		request.responseType = "json";
		request.addEventListener("load", () => {
			if (request.status >= 200 && request.status < 300) {
				resolve(request.response);
			} else {
				reject(new Error(`Unsplash returned HTTP ${request.status}.`));
			}
		});
		request.addEventListener("error", () => reject(new Error("The network request failed.")));
		request.send();
	});
}

function requestWithPromises(url, accessKey) {
	return fetch(url, { headers: { Authorization: `Client-ID ${accessKey}` } })
		.then((response) => {
			if (!response.ok) {
				throw new Error(`Unsplash returned HTTP ${response.status}.`);
			}
			return response.json();
		});
}

async function requestWithAsyncAwait(url, accessKey) {
	const response = await fetch(url, {
		headers: { Authorization: `Client-ID ${accessKey}` }
	});
	if (!response.ok) {
		throw new Error(`Unsplash returned HTTP ${response.status}.`);
	}
	return response.json();
}

function selectedMethod() {
	return document.querySelector("input[name='request-method']:checked").value;
}

function renderPhotos(data) {
	photoGrid.replaceChildren();
	const photos = Array.isArray(data.results) ? data.results : [];
	emptyMessage.hidden = photos.length > 0;
	resultCount.textContent = `${photos.length} photo${photos.length === 1 ? "" : "s"}`;

	photos.forEach((photo) => {
		const card = document.createElement("article");
		card.className = "photo-card";
		card.tabIndex = 0;

		const image = document.createElement("img");
		image.src = photo.urls.small;
		image.alt = photo.alt_description || `Photo by ${photo.user.name}`;
		image.loading = "lazy";

		const caption = document.createElement("p");
		caption.textContent = `Photo by ${photo.user.name}`;

		card.append(image, caption);
		card.addEventListener("mouseenter", () => card.classList.add("is-focused"));
		card.addEventListener("mouseleave", () => card.classList.remove("is-focused"));
		card.addEventListener("focus", () => card.classList.add("is-focused"));
		card.addEventListener("blur", () => card.classList.remove("is-focused"));
		photoGrid.append(card);
	});
}

function searchPhotos(event) {
	event.preventDefault();
	const query = queryInput.value.trim();
	const hasAccessKey = ACCESS_KEY && !ACCESS_KEY.startsWith("REPLACE_WITH_");
	if (!hasAccessKey || !query) {
		statusMessage.textContent = !hasAccessKey
			? "Add your Unsplash Access Key in script.js before searching."
			: "Please enter a search term.";
		return;
	}

	const method = selectedMethod();
	const requestUrl = getRequestUrl(query);
	const request = method === "xhr"
		? requestWithXHR(requestUrl, ACCESS_KEY)
		: method === "promise"
			? requestWithPromises(requestUrl, ACCESS_KEY)
			: requestWithAsyncAwait(requestUrl, ACCESS_KEY);

	const methodName = method === "xhr" ? "XMLHttpRequest" : method === "promise" ? "Fetch Promises" : "Async/Await";
	statusMessage.textContent = `Searching Unsplash with ${methodName}...`;
	resultCount.textContent = "";
	request
		.then((data) => {
			renderPhotos(data);
			statusMessage.textContent = `Showing Unsplash results for “${query}”.`;
		})
		.catch((error) => {
			photoGrid.replaceChildren();
			emptyMessage.hidden = false;
			resultCount.textContent = "";
			statusMessage.textContent = error.message;
		});
}

searchForm.addEventListener("submit", searchPhotos);
document.addEventListener("keydown", (event) => {
	if (event.key === "/" && document.activeElement !== queryInput) {
		event.preventDefault();
		queryInput.focus();
	}
});
