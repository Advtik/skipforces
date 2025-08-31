import { useState,useEffect } from "react";

export function UserInfo({user,skippedcontests}){
    const [skiplength, setskiplength] = useState(0);
    useEffect(() => {
        if (skippedcontests) {
        setskiplength(skippedcontests.length);
        }
    }, []);
    return (
        <div id="userinfo">
            <div>
                <h3 id="maxrank">
                    {user.maxrank.charAt(0).toUpperCase() + user.maxrank.slice(1)}
                </h3>
                {skiplength===0 && (
                    <h1 id="handle" style={{color:"lightgreen"}}>{user.handle}</h1>
                )}
                {skiplength>0 && (
                    <h1 id="handle" style={{color:"#FF7F7F"}}>{user.handle}</h1>
                )}

                <h3 id="maxrating">MaxRating: {user.maxrating}</h3>
                <h3 id="country">Country: {user.country}</h3>
                <h3 id="rating">CurrentRating: {user.rating}</h3>
            </div>
            <div>
                <img id="image" src={user.titlePhoto} alt="CF Profile"></img>
            </div>
        </div>
    )
}