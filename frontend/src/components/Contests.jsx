import { useState, useEffect } from 'react';

export function Contests({ skippedcontests , handle}) {
  const [skiplength, setskiplength] = useState(0);

  useEffect(() => {
    if (skippedcontests) {
      setskiplength(skippedcontests.length);
    }
  }, []);
  return (
    <div id="contests">
      {skiplength === 0 && (
        <div id="deserve">
          <h1>This person is Deserving</h1>
        </div>
      )}
      {skiplength>0 && (
        <div id="suspicious">
          <h1>This person was suspicious in</h1>
          {skippedcontests.map((contest, index)=>(
            <div key={index}>
              <h2>
                <a href={`https://codeforces.com/submissions/${handle}/contest/${contest.contestid}`} style={{color:"white"}}target="_blank" rel="noopener noreferrer"
                    onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                    onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                >
                  {contest.contestname}
                </a>
                </h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
