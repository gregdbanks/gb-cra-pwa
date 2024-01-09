import React, { useState, useEffect } from "react";
import logo from "./blog.png";
import "./App.css";

function Blog() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installEvent, setInstallEvent] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");

  const handleInstallClick = () => {
    installEvent.prompt();

    installEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      setInstallEvent(null);
    });
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallEvent(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    function handleStatusChange() {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/posts")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((json) => {
        const augmentedData = json.map((post) => ({
          ...post,
          body: post.body.repeat(5),
        }));
        setData(augmentedData);
        setLastUpdated(new Date().toLocaleString());
      })
      .catch((error) => {
        console.error("Fetching error:", error);
        setError(error.toString());
      });
  }, []);

  const togglePost = (id) => {
    setExpandedPostId(expandedPostId === id ? null : id);
  };

  const renderPostBody = (post) => {
    const isExpanded = expandedPostId === post.id;
    const previewLength = 100;
    return (
      <>
        <p>
          {isExpanded
            ? post.body
            : `${post.body.substring(0, previewLength)}...`}
        </p>
        <button onClick={() => togglePost(post.id)} className="expand-btn">
          {isExpanded ? "Read less" : "Read more"}
        </button>
      </>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        {installEvent && (
          <button className="install-button" onClick={handleInstallClick}>
            Install Offline Mode
          </button>
        )}
        <p className="status" style={{ color: isOnline ? "#219B43" : "#DE3119" }}>
          Status: {isOnline ? "Online" : "Offline"}
        </p>
        <img src={logo} className="App-logo" alt="logo" />
        <main className="App-content">
          {lastUpdated && <p className="update-date" title={"Last updated on " + lastUpdated}>
            Last Updated: {lastUpdated}
          </p>}
          {error && <p>Error loading posts: {error}</p>}
          {data.length > 0 ? (
            data.map((post) => (
              <article key={post.id} className="blog-post">
                <h4>{post.title}</h4>
                {renderPostBody(post)}
              </article>
            ))
          ) : (
            <p>Loading blog posts...</p>
          )}
        </main>
      </header>
    </div>
  );
}

export default Blog;