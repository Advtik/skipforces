import { useState } from 'react'
import { Contests } from './Contests';
import { UserInfo } from './userinfo';
import { ContestPieChart } from './ContestPieChart';

export function TakeInput() {
  const [handle, sethandle] = useState("");
  const [skippedcontests, setcontests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setdata]= useState(true);
  const [user,setuser]=useState({});
  const [contestdata,setcontestdata]=useState([]);

  function fetchSkippedContests() {
    setLoading(true);
    setdata(true);
    fetch("http://localhost:3000/skips", {
      method: "POST",
      body: JSON.stringify({
        handle: handle,
      }),
      headers: {
        "Content-type": "application/json",
      },
    })
      .then(async function (res){
        const json = await res.json();
        setcontests(json.skipped);
        setLoading(false);
        setdata(false);
        setuser(json.users);
        setcontestdata(json.contestdata);
      })
      .catch(function (err){
        console.error("Failed to fetch:", err);
      });
  }

  return (
    <div>
      {loading && data && <div id="loader"></div>}

      {!loading && data && (
        <>
        <div id="main">
          <div id="head">
            <h1 id="welcome">Welcome to Skipforces</h1>
            <h3 id="quote">Checks how suspicious you are in one click</h3>
          </div>
          <input 
            type="text"
            placeholder="Enter your username"
            onChange={(e) => sethandle(e.target.value)}
          />
          <br/>
          <button onClick={fetchSkippedContests}>Check</button>
        </div>
        </>
      )}

      {!loading && !data &&(
        <>
          <div className='bada'>
            <div className='parent'>
              <UserInfo user={user} skippedcontests={skippedcontests}></UserInfo> 
              <Contests skippedcontests={skippedcontests} handle={handle}></Contests>
            </div>
            <div >
              <div id="pie">
                <div id="stats">
                  <h2>{contestdata[0].name}  :   {contestdata[0].value}</h2>
                  <h2>{contestdata[1].name}  :   {contestdata[1].value}</h2>
                  <h2>{contestdata[2].name}  :   {contestdata[2].value}</h2>
                </div>
                <ContestPieChart data={contestdata}></ContestPieChart>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}