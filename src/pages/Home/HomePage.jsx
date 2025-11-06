import React from "react";
import "./HomePage.css"; // we’ll add the CSS below

export default function HomePage() {
  return (
    <div className="homepage">
      <div className="glow-logo">
        <div className="circle">T</div>
        <h1 className="title">
          <span className="troll">Troll</span>
          <span className="city">City</span>
        </h1>
      </div>

      <p className="subtitle">Where Legends Are Born Live</p>
      <p className="description">
        Watch, stream, and connect with creators from around the world 🌍✨
      </p>

      <div className="stats">
        <button className="live">🔴 1 LIVE</button>
        <button className="watching">👁 0 Watching</button>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search streams, streamers, or tags..." />
      </div>

      <div className="categories">
        {["All", "Gaming", "Music", "Talk", "Creative", "Fitness", "Cooking", "Trolling"].map(
          (cat, i) => (
            <button key={i} className="category-btn">
              {cat}
            </button>
          )
        )}
      </div>

      <h2 className="section-title">🎥 All Live Streams</h2>
    </div>
  );
}
