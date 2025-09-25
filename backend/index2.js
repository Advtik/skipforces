const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());

// Fetch all submissions for a user
async function getUserSubmissions(handle) {
    try {
        const url = `https://codeforces.com/api/user.status?handle=${handle}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status !== "OK") return null;
        return data.result || [];
    } catch (err) {
        console.error("Error fetching user submissions:", err);
        return null;
    }
}

// Fetch all contest list
async function getContestList() {
    try {
        const url = `https://codeforces.com/api/contest.list`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status !== "OK") return [];
        return data.result.filter(c => c.phase === "FINISHED") || [];
    } catch (err) {
        console.error("Error fetching contest list:", err);
        return [];
    }
}

// Fetch user info
async function getUserInfo(handle) {
    try {
        const url = `https://codeforces.com/api/user.info?handles=${handle}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status !== "OK") return null;
        const info = data.result[0] || {};
        return {
            handle: info.handle || "",
            maxRank: info.maxRank || "",
            maxRating: info.maxRating || "",
            country: info.country || "",
            rank: info.rank || "",
            rating: info.rating || "",
            titlePhoto: info.titlePhoto || ""
        };
    } catch (err) {
        console.error("Error fetching user info:", err);
        return null;
    }
}

// Fetch user rating changes
async function getUserRating(handle) {
    try {
        const url = `https://codeforces.com/api/user.rating?handle=${handle}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status !== "OK") return [0, 0, 0];

        const results = data.result || [];
        let pos = 0, neg = 0;
        results.forEach(r => {
            if (r.newRating >= r.oldRating) pos++;
            else neg++;
        });
        return [results.length, pos, neg];
    } catch (err) {
        console.error("Error fetching user rating:", err);
        return [0, 0, 0];
    }
}

// Main route
app.post("/skips", async (req, res) => {
    const handle = req.body.handle;
    if (!handle) return res.status(400).json({ error: "Handle is required" });

    const submissions = await getUserSubmissions(handle);
    if (!submissions) return res.status(502).json({ error: "Failed to fetch submissions" });

    const contestList = await getContestList();
    const contestMap = {};
    contestList.forEach(c => contestMap[c.id] = c.name || "Unknown");

    // Aggregate skipped contests
    const contestAggregates = {};
    submissions.forEach(sub => {
        const type = sub.author?.participantType;
        if (!type || (type !== "CONTESTANT" && type !== "OUT_OF_COMPETITION")) return;

        const cid = sub.contestId;
        if (!contestAggregates[cid]) contestAggregates[cid] = { Problems: 0, skipped: 0 };
        contestAggregates[cid].Problems++;
        if (sub.verdict === "SKIPPED") contestAggregates[cid].skipped++;
    });

    // Filter contests where all problems were skipped
    const skippedContests = [];
    Object.keys(contestAggregates).forEach(cid => {
        const c = contestAggregates[cid];
        if (c.Problems === c.skipped) {
            skippedContests.push({ contestId: cid, contestName: contestMap[cid] || "Unknown" });
        }
    });

    const userInfo = await getUserInfo(handle);
    const ratingStats = await getUserRating(handle);

    const contestData = [
        { name: "Positive Δ", value: ratingStats[1] },
        { name: "Negative Δ", value: ratingStats[2] },
        { name: "Skipped", value: skippedContests.length }
    ];

    res.json({
        skipped: skippedContests,
        users: userInfo,
        contestData
    });
    console.log(skipped);
});

app.get("/", (req, res) => {
    res.send("Backend is running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
