const express=require("express");
const app=express();
app.use(express.json());
const cors = require("cors");
app.use(cors());
async function contestid(handle) {
    try{
        const url = `https://codeforces.com/api/user.status?handle=${handle}`;
        let arr = [];
        let deb= await fetch(url)  // ✅ RETURN the Promise
        let result=await deb.json();
        for(let i=0;i<result.result.length;i++){
            if(result.result[i].verdict=="SKIPPED"){
                if(!arr.includes(result.result[i].contestId)){
                    arr.push(result.result[i].contestId);
                }
            } 
        }
        return arr;
    }
    catch(err){
        console.error("Network error",err);
        return null;
    }
}

async function usercon(handle){
    try {
        const url = `https://codeforces.com/api/user.rating?handle=${handle}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== "OK") {
            throw new Error("User not found or API error");
        }

        let info = data.result; // API returns an array

        let arr=[];
        let posdel=0;
        let negdel=0;
        total=info.length;
        arr.push(total);
        for(let i=0;i<info.length;i++){
            if(info[i].oldRating<=info[i].newRating){
                posdel++;
            }
            else{
                negdel++;
            }
        }
        arr.push(posdel);
        arr.push(negdel);

        return arr;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null; // return null so frontend can handle error
    }
}

async function userinfo(handle) {
    try {
        const url = `https://codeforces.com/api/user.info?handles=${handle}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== "OK") {
            throw new Error("User not found or API error");
        }

        let info = data.result[0]; //API returns an array

        let user = {
            handle: info.handle || "",
            maxrank: info.maxRank || "",
            maxrating: info.maxRating || "",
            country: info.country || "",
            rank: info.rank || "",
            rating: info.rating || "",
            titlePhoto: info.titlePhoto|| ""
        };

        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null; // return null so frontend can handle error
    }
}

async function skipcontests(contestId,handle){
    const url=`https://codeforces.com/api/contest.status?contestId=${contestId}&handle=${handle}`;
    let deb=await fetch(url)
    let result= await deb.json();
    for(let i=0;i<result.result.length;i++){
        if(result.result[i].verdict!="SKIPPED" && result.result[i].author.participantType!="PRACTICE"){
            return false;
        }
    }
    return true;
}

// Now this will work properly
app.post("/skips",async function(req,res){
    let input=req.body.handle;
    let allcontests=await contestid(input);
    if(!contestid){
        res.status(502).json({error:"failed to fetch contests from codeforces"});
    }
    let skipped=[]
    for(let i=0;i<allcontests.length;i++){
        let skip={
            contestname: "",
            contestid: ""
        }
        let sus=await skipcontests(allcontests[i],input);
        if(sus){
            let actualcontest=await fetch(`https://codeforces.com/api/contest.standings?contestId=${allcontests[i]}&from=1&count=1`);
            let actualcontestres=await actualcontest.json();
            skip.contestname=actualcontestres.result.contest.name;
            skip.contestid=actualcontestres.result.contest.id;
            skipped.push(skip);
        }
    }
    let users=await userinfo(input);
    let cons=await usercon(input);
    let contestdata=[
        { name: "Positive Δ", value: cons[1] },
        { name: "Negative Δ", value: cons[2] },
        { name: "Skipped", value: skipped.length },
    ]
    res.json({
        skipped,
        users,
        contestdata
    })
    console.log(contestdata);
});


const PORT = process.env.PORT || 3000;  // Render provides PORT, fallback for local dev
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


