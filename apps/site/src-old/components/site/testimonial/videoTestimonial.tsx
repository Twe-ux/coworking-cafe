"use client";
import { useState } from "react";
// @ts-ignore - react-modal-video types not available
import ModalVideo from "react-modal-video";
const VideoTestimonial = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <div className="video">
        <h1 className="title text-center mb-5">
          Pourquoi venir à CoworKing Café ? <br />
          Pour ça !
        </h1>

        <div className="position-relative">
          <img
            src="/images/testimonail/anticafé-strasbourg.webp"
            alt="anticafé-strasbourg"
            className="video_thumb"
          />
          <div onClick={() => setOpen(true)} className="video_icon video-play">
            <img src="/images/testimonail/Frame_20.svg" alt="bouton play" />
          </div>
        </div>
      </div>
      <ModalVideo
        channel="youtube"
        youtube={{ mute: 0, autoplay: 0 }}
        isOpen={isOpen}
        videoId="cHfYLa7XE_0"
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default VideoTestimonial;
