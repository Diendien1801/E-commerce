import React, { useEffect, useState } from "react";
import YouTube from "react-youtube";

const YOUTUBE_API_KEY = "AIzaSyDC3DpoEmR6n8pCXJnAd7JMhKPzIiG8iUI";

export default function YouTubePreview({ songName }) {
  // Nếu tên chứa từ khóa cấm, không render gì cả
  if (!songName || /(áo|va|dây đeo|túi)/i.test(songName)) {
    return null;
  }

  const [videoId, setVideoId] = useState(null);

  useEffect(() => {
    if (!songName) return;
    const searchQuery = `${songName}`;
    fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
        searchQuery
      )}&key=${YOUTUBE_API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          const preferred = data.items.find((item) =>
            /official|audio|lyrics|mv|music video/i.test(item.snippet.title)
          );
          setVideoId((preferred || data.items[0]).id.videoId);
        } else {
          setVideoId("");
        }
      });
  }, [songName]);

  return (
    <div
      style={{
        width: 900,
        height: 540,
        margin: "24px auto",
        background: "#000",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        position: "relative",
      }}
    >
      {videoId === null ? (
        <span style={{ color: "#fff", fontSize: 20 }}>
          Đang tìm bản preview...
        </span>
      ) : videoId === "" ? (
        <span style={{ color: "#fff", fontSize: 20 }}>
          Không tìm thấy preview
        </span>
      ) : (
        <YouTube
          videoId={videoId}
          opts={{
            width: 900,
            height: 540,
            playerVars: {
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
            },
          }}
          style={{ borderRadius: 12 }}
        />
      )}
    </div>
  );
}
