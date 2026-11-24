const list = document.querySelector("#starred");
const status = document.querySelector("#status");

function isValidDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

async function loadStarredRepositories() {
  try {
    const response = await fetch("events.json");

    if (!response.ok) {
      throw new Error(`Unable to load repositories (${response.status})`);
    }

    const events = await response.json();

    if (!Array.isArray(events)) {
      throw new Error("Repository data has an invalid format");
    }

    const validEvents = events.filter(
      (event) =>
        event &&
        typeof event.name === "string" &&
        /^[^/\s]+\/[^/\s]+$/.test(event.name.trim()) &&
        typeof event.starred === "string" &&
        isValidDate(event.starred)
    );

    list.replaceChildren();

    if (validEvents.length === 0) {
      status.textContent = "No starred repositories found.";
      return;
    }

    validEvents.forEach((event) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const date = document.createElement("time");

      const [owner, repository] = event.name.trim().split("/");
      link.href = `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;
      link.textContent = event.name.trim();

      date.dateTime = event.starred;
      date.textContent = event.starred;

      item.append(link, " — starred ", date);
      list.appendChild(item);
    });

    status.textContent = `${validEvents.length} starred repositories loaded.`;
  } catch (error) {
    list.replaceChildren();
    status.textContent =
      error instanceof Error
        ? `Unable to load starred repositories: ${error.message}`
        : "Unable to load starred repositories.";
    console.error(error);
  }
}

loadStarredRepositories();
