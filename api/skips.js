export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { handle } = req.body;

    // --- contestid ---
    async function contestid(handle) {
      const url = `https://codeforces.com/api/user.status?handle=${handle}`;
      const deb = await fetch(url);
      const result = await deb.json();

      let arr = [];
      for (let i = 0; i < result.result.length; i++) {
        if (result.result[i].verdict == "SKIPPED") {
          if (!arr.includes(result.result[i].contestId)) {
            arr.push(result.result[i].contestId);
          }
        }
      }
      return arr;
    }

    async function usercon(handle) {
      const url = `https://codeforces.com/api/user.rating?handle=${handle}`;
      const res = await fetch(url);
      const data = await res.json();

      let arr = [];
      let posdel = 0,
        negdel = 0;

      let total = data.result.length;
      arr.push(total);

      for (let i = 0; i < data.result.length; i++) {
        if (data.result[i].oldRating <= data.result[i].newRating) {
          posdel++;
        } else {
          negdel++;
        }
      }
      arr.push(posdel);
      arr.push(negdel);

      return arr;
    }

    async function userinfo(handle) {
      const url = `https://codeforces.com/api/user.info?handles=${handle}`;
      const res = await fetch(url);
      const data = await res.json();

      let info = data.result[0];

      return {
        handle: info.handle || "",
        maxrank: info.maxRank || "",
        maxrating: info.maxRating || "",
        country: info.country || "",
        rank: info.rank || "",
        rating: info.rating || "",
        titlePhoto: info.titlePhoto || "",
      };
    }

    async function skipcontests(contestId, handle) {
      const url = `https://codeforces.com/api/contest.status?contestId=${contestId}&handle=${handle}`;
      let deb = await fetch(url);
      let result = await deb.json();
      for (let i = 0; i < result.result.length; i++) {
        if (
          result.result[i].verdict != "SKIPPED" &&
          result.result[i].author.participantType != "PRACTICE"
        ) {
          return false;
        }
      }
      return true;
    }

    // --- MAIN LOGIC ---
    const allcontests = await contestid(handle);
    let skipped = [];

    for (let i = 0; i < allcontests.length; i++) {
      let sus = await skipcontests(allcontests[i], handle);
      if (sus) {
        let actualcontest = await fetch(
          `https://codeforces.com/api/contest.standings?contestId=${allcontests[i]}&from=1&count=1`
        );
        let actualcontestres = await actualcontest.json();
        skipped.push({
          contestname: actualcontestres.result.contest.name,
          contestid: actualcontestres.result.contest.id,
        });
      }
    }

    const users = await userinfo(handle);
    const cons = await usercon(handle);

    const contestdata = [
      { name: "Positive Δ", value: cons[1] },
      { name: "Negative Δ", value: cons[2] },
      { name: "Skipped", value: skipped.length },
    ];

    return res.json({
      skipped,
      users,
      contestdata,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

