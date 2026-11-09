const cookieNames = {
	likes: "lab6_likes",
	dislikes: "lab6_dislikes",
	vote: "lab6_vote",
	comments: "lab6_comments",
	commentSubmitted: "lab6_comment_submitted"
};

const likeButton = document.querySelector("#like-button");
const dislikeButton = document.querySelector("#dislike-button");
const likeCount = document.querySelector("#like-count");
const dislikeCount = document.querySelector("#dislike-count");
const voteStatus = document.querySelector("#vote-status");
const commentForm = document.querySelector("#comment-form");
const commentInput = document.querySelector("#comment-input");
const commentStatus = document.querySelector("#comment-status");
const commentsList = document.querySelector("#comments-list");
const noComments = document.querySelector("#no-comments");
const resetButton = document.querySelector("#reset-button");

function getCookie(name) {
	const prefix = `${name}=`;
	const cookie = document.cookie.split("; ").find((item) => item.startsWith(prefix));
	if (!cookie) {
		return null;
	}

	try {
		return decodeURIComponent(cookie.slice(prefix.length));
	} catch {
		return null;
	}
}

function getStoredValue(name) {
	const cookieValue = getCookie(name);
	if (cookieValue !== null) {
		return cookieValue;
	}

	try {
		return localStorage.getItem(name);
	} catch {
		return null;
	}
}

function setCookie(name, value) {
	document.cookie = `${name}=${encodeURIComponent(value)}; max-age=31536000; path=/; samesite=lax`;

	if (getCookie(name) !== value) {
		try {
			localStorage.setItem(name, value);
		} catch {
			// Cookies are unavailable for file:// pages and localStorage may also be blocked.
		}
	}
}

function deleteCookie(name) {
	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=lax`;
	try {
		localStorage.removeItem(name);
	} catch {
		// Ignore storage cleanup errors so reset can still update the page.
	}
}

function getCount(name) {
	const value = Number.parseInt(getStoredValue(name) || "0", 10);
	return Number.isFinite(value) && value >= 0 ? value : 0;
}

function getComments() {
	try {
		const comments = JSON.parse(getStoredValue(cookieNames.comments) || "[]");
		return Array.isArray(comments) ? comments.filter((comment) => typeof comment === "string") : [];
	} catch {
		return [];
	}
}

function renderComments() {
	const comments = getComments();
	commentsList.replaceChildren();
	noComments.hidden = comments.length > 0;

	comments.forEach((comment) => {
		const item = document.createElement("li");
		item.textContent = comment;
		commentsList.append(item);
	});
}

function updateVoteUI() {
	likeCount.textContent = getCount(cookieNames.likes);
	dislikeCount.textContent = getCount(cookieNames.dislikes);

	const vote = getStoredValue(cookieNames.vote);
	const hasVoted = vote === "like" || vote === "dislike";
	likeButton.disabled = hasVoted;
	dislikeButton.disabled = hasVoted;
	likeButton.classList.toggle("is-selected", vote === "like");
	dislikeButton.classList.toggle("is-selected", vote === "dislike");
	voteStatus.textContent = hasVoted
		? "Your vote has been recorded. Reset to vote again."
		: "Choose Like or Dislike to record your vote.";
}

function updateCommentUI() {
	const hasCommented = getStoredValue(cookieNames.commentSubmitted) === "true";
	commentInput.disabled = hasCommented;
	commentForm.querySelector("button").disabled = hasCommented;
	commentStatus.textContent = hasCommented
		? "Your comment has been recorded. Reset to comment again."
		: "";
	renderComments();
}

function recordVote(choice) {
	const existingVote = getStoredValue(cookieNames.vote);
	if (existingVote === "like" || existingVote === "dislike") {
		return;
	}

	const cookieName = choice === "like" ? cookieNames.likes : cookieNames.dislikes;
	setCookie(cookieName, String(getCount(cookieName) + 1));
	setCookie(cookieNames.vote, choice);
	updateVoteUI();
}

function submitComment(event) {
	event.preventDefault();

	if (getStoredValue(cookieNames.commentSubmitted)) {
		return;
	}

	const comment = commentInput.value.trim();
	if (!comment) {
		commentStatus.textContent = "Please enter a comment before posting.";
		return;
	}

	const comments = getComments();
	comments.push(comment);
	setCookie(cookieNames.comments, JSON.stringify(comments));
	setCookie(cookieNames.commentSubmitted, "true");
	commentInput.value = "";
	updateCommentUI();
}

function resetChoices() {
	Object.values(cookieNames).forEach(deleteCookie);
	updateVoteUI();
	updateCommentUI();
	commentStatus.textContent = "Your vote and comment have been reset.";
}

likeButton.addEventListener("click", () => recordVote("like"));
dislikeButton.addEventListener("click", () => recordVote("dislike"));
commentForm.addEventListener("submit", submitComment);
resetButton.addEventListener("click", resetChoices);

updateVoteUI();
updateCommentUI();
